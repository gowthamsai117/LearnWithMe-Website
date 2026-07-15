const ctx = self;
let pyodide = null;
async function initPyodide() {
  try {
    if (!self.loadPyodide) {
      importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js");
    }
    pyodide = await self.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/"
    });
    self.sendStdout = (text) => {
      ctx.postMessage({ type: "stdout", content: text });
    };
    self.sendStderr = (text) => {
      ctx.postMessage({ type: "stderr", content: text });
    };
    await pyodide.runPythonAsync(`
import sys
import io
import js

class CustomStdout(io.StringIO):
    def write(self, s):
        super().write(s)
        js.sendStdout(s)

class CustomStderr(io.StringIO):
    def write(self, s):
        super().write(s)
        js.sendStderr(s)

sys.stdout = CustomStdout()
sys.stderr = CustomStderr()
`);
    ctx.postMessage({ type: "ready" });
  } catch (err) {
    ctx.postMessage({ type: "init_error", error: err.message || String(err) });
  }
}
ctx.addEventListener("message", async (event) => {
  const { code, action, visualizerId, stdin } = event.data;
  if (action === "run") {
    if (!pyodide) {
      ctx.postMessage({
        type: "result",
        success: false,
        error: "Python runtime is initializing. Please wait..."
      });
      return;
    }
    try {
      pyodide.globals.set("user_code", code);
      pyodide.globals.set("visualizer_id", visualizerId || "");
      pyodide.globals.set("stdin_data", stdin || "");
      await pyodide.runPythonAsync(`
import sys
import io
import js
import json
import ast
import traceback

# Clear trace logs and event databases
trace_log = []
dsa_events = []

# Mock standard input with user inputs
sys.stdin = io.StringIO(stdin_data)

# Truncate output buffers
sys.stdout.truncate(0)
sys.stdout.seek(0)
sys.stderr.truncate(0)
sys.stderr.seek(0)

# Custom Instrumented List to record array / sort operations
class InstrumentedList(list):
    def __init__(self, iterable=None):
        if iterable is not None:
            super().__init__(iterable)
        else:
            super().__init__()
            
    def __getitem__(self, index):
        val = super().__getitem__(index)
        if isinstance(index, slice):
            dsa_events.append({"step": "read", "index": str(index), "value": str(val)})
        else:
            dsa_events.append({"step": "read", "index": index, "value": val})
        return val

    def __setitem__(self, index, value):
        super().__setitem__(index, value)
        dsa_events.append({"step": "write", "index": index, "value": value})
        
    def append(self, item):
        super().append(item)
        dsa_events.append({"step": "append", "value": item})
        
    def pop(self, index=-1):
        val = super().pop(index)
        dsa_events.append({"step": "pop", "index": index, "value": val})
        return val

class InstrumentedDeque:
    def __init__(self, iterable=None):
        from collections import deque
        self._deque = deque(iterable) if iterable else deque()
        
    def append(self, item):
        self._deque.append(item)
        dsa_events.append({"step": "enqueue", "value": item})
        
    def popleft(self):
        val = self._deque.popleft()
        dsa_events.append({"step": "dequeue", "value": val})
        return val
        
    def appendleft(self, item):
        self._deque.appendleft(item)
        dsa_events.append({"step": "push", "value": item})
        
    def pop(self):
        val = self._deque.pop()
        dsa_events.append({"step": "pop", "value": val})
        return val
        
    def __len__(self):
        return len(self._deque)
        
    def __repr__(self):
        return repr(self._deque)

class InstrumentedNode:
    def __init__(self, data):
        self.data = data
        self._next = None
        dsa_events.append({"step": "create_node", "id": id(self), "value": data})
        
    @property
    def next(self):
        dsa_events.append({"step": "read_next", "id": id(self), "next_id": id(self._next) if self._next else None})
        return self._next
        
    @next.setter
    def next(self, value):
        self._next = value
        dsa_events.append({"step": "set_next", "id": id(self), "next_id": id(value) if value else None})

class InstrumentedTreeNode:
    def __init__(self, val):
        self.val = val
        self._left = None
        self._right = None
        dsa_events.append({"step": "create_tnode", "id": id(self), "value": val})
        
    @property
    def left(self):
        dsa_events.append({"step": "read_left", "id": id(self), "left_id": id(self._left) if self._left else None})
        return self._left
        
    @left.setter
    def left(self, value):
        self._left = value
        dsa_events.append({"step": "set_left", "id": id(self), "left_id": id(value) if value else None})
        
    @property
    def right(self):
        dsa_events.append({"step": "read_right", "id": id(self), "right_id": id(self._right) if self._right else None})
        return self._right
        
    @right.setter
    def right(self, value):
        self._right = value
        dsa_events.append({"step": "set_right", "id": id(self), "right_id": id(value) if value else None})

# AST Transformer to inject list wrappers
class ListWrapper(ast.NodeTransformer):
    def visit_Assign(self, node):
        self.generic_visit(node)
        is_instrumented = False
        for target in node.targets:
            if isinstance(target, ast.Name) and target.id in ('arr', 'stack', 'queue'):
                is_instrumented = True
        if is_instrumented:
            node.value = ast.Call(
                func=ast.Name(id='InstrumentedList', ctx=ast.Load()),
                args=[node.value],
                keywords=[]
            )
        return node

    def visit_AnnAssign(self, node):
        self.generic_visit(node)
        if isinstance(node.target, ast.Name) and node.target.id in ('arr', 'stack', 'queue'):
            if node.value:
                node.value = ast.Call(
                    func=ast.Name(id='InstrumentedList', ctx=ast.Load()),
                    args=[node.value],
                    keywords=[]
                )
        return node

# Pre-compile and intercept allocations
processed_code = user_code
try:
    if visualizer_id in ('dsa-arrays', 'dsa-sorting', 'dsa-stack-queue'):
        parsed = ast.parse(user_code)
        transformer = ListWrapper()
        transformer.visit(parsed)
        ast.fix_missing_locations(parsed)
        processed_code = compile(parsed, "<string>", "exec")
    else:
        processed_code = compile(user_code, "<string>", "exec")
except Exception as e:
    pass

# Line-by-line tracing function
def trace_calls(frame, event, arg):
    if event != 'line':
        return trace_calls
    if frame.f_code.co_filename != "<string>":
        return trace_calls
        
    line_no = frame.f_lineno
    locals_snapshot = {}
    
    for name, val in frame.f_locals.items():
        if name.startswith('__') or name in ('sys', 'io', 'js', 'trace_log', 'trace_calls', 'user_code', 'visualizer_id', 'InstrumentedList', 'InstrumentedNode', 'InstrumentedTreeNode', 'InstrumentedDeque', 'dsa_events', 'ListWrapper'):
            continue
        try:
            val_repr = repr(val)
        except Exception:
            val_repr = "<unrepresentable>"
        locals_snapshot[name] = {
            "value": val_repr,
            "type": type(val).__name__,
            "id": id(val)
        }
    trace_log.append({
        "line": line_no,
        "locals": locals_snapshot
    })
    return trace_calls

exec_globals = {
    "Node": InstrumentedNode,
    "TreeNode": InstrumentedTreeNode,
    "deque": InstrumentedDeque,
    "InstrumentedList": InstrumentedList,
}

should_trace_vars = True

exception_occurred = None
try:
    if should_trace_vars:
        sys.settrace(trace_calls)
    exec(processed_code, exec_globals)
except Exception as e:
    exception_occurred = str(e)
    sys.stderr.write(traceback.format_exc())
finally:
    if should_trace_vars:
        sys.settrace(None)
`);
      const traceLogPy = pyodide.globals.get("trace_log");
      const dsaEventsPy = pyodide.globals.get("dsa_events");
      const traceLog = traceLogPy ? traceLogPy.toJs({ depth: 10, dict_converter: Object.fromEntries }) : [];
      const dsaEvents = dsaEventsPy ? dsaEventsPy.toJs({ depth: 10, dict_converter: Object.fromEntries }) : [];
      const stdout = pyodide.runPython("sys.stdout.getvalue()");
      const stderr = pyodide.runPython("sys.stderr.getvalue()");
      const exceptionOccurred = pyodide.globals.get("exception_occurred");
      ctx.postMessage({
        type: "result",
        success: !exceptionOccurred,
        stdout,
        stderr,
        trace: traceLog,
        events: dsaEvents,
        error: exceptionOccurred || void 0
      });
    } catch (err) {
      ctx.postMessage({
        type: "result",
        success: false,
        error: err.message || String(err)
      });
    }
  }
});
initPyodide();
