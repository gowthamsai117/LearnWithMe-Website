import React, { useState, useEffect } from 'react';
import Editor, { type BeforeMount } from '@monaco-editor/react';
import { usePyodide } from '../hooks/usePyodide';
import { useProgress } from '../context/ProgressContext';
import { Play, Square, RotateCcw, CheckCircle, Terminal, AlertCircle, Loader2 } from 'lucide-react';
// @ts-ignore
import confetti from 'canvas-confetti';

// Module-level guard: Monaco completions only registered once
let _monacoRegistered = false;

const registerPythonCompletions: BeforeMount = (monaco) => {
  if (_monacoRegistered) return;
  _monacoRegistered = true;
  const KEYWORDS = ['False','None','True','and','as','assert','async','await','break','class','continue','def','del','elif','else','except','finally','for','from','global','if','import','in','is','lambda','nonlocal','not','or','pass','raise','return','try','while','with','yield'];
  const BUILTINS = ['print','input','len','range','int','str','float','bool','list','dict','set','tuple','type','isinstance','enumerate','zip','map','filter','sorted','reversed','sum','min','max','abs','round','pow','open','super'];
  const SNIPPETS = [
    { label: 'if', insert: 'if ${1:condition}:\n    ${2:pass}' },
    { label: 'elif', insert: 'elif ${1:condition}:\n    ${2:pass}' },
    { label: 'else', insert: 'else:\n    ${1:pass}' },
    { label: 'for', insert: 'for ${1:item} in ${2:iterable}:\n    ${3:pass}' },
    { label: 'while', insert: 'while ${1:condition}:\n    ${2:pass}' },
    { label: 'def', insert: 'def ${1:name}(${2:params}):\n    ${3:pass}' },
    { label: 'class', insert: 'class ${1:Name}:\n    def __init__(self):\n        ${2:pass}' },
    { label: 'try', insert: 'try:\n    ${1:pass}\nexcept ${2:Exception} as e:\n    ${3:pass}' },
    { label: 'print', insert: 'print(${1:value})' },
    { label: 'input', insert: 'input(${1:"prompt: "})' },
    { label: 'range', insert: 'range(${1:stop})' },
    { label: 'enumerate', insert: 'enumerate(${1:iterable})' },
  ];

  monaco.languages.registerCompletionItemProvider('python', {
    triggerCharacters: ['.', ' '],
    provideCompletionItems: (model: any, position: any) => {
      const word = model.getWordUntilPosition(position);
      const range = { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: word.startColumn, endColumn: word.endColumn };
      const suggestions: any[] = [
        ...KEYWORDS.map(kw => ({ label: kw, kind: monaco.languages.CompletionItemKind.Keyword, insertText: kw, range, detail: 'keyword' })),
        ...BUILTINS.map(fn => ({ label: fn, kind: monaco.languages.CompletionItemKind.Function, insertText: fn, range, detail: 'builtin' })),
        ...SNIPPETS.map(s => ({ label: s.label, kind: monaco.languages.CompletionItemKind.Snippet, insertText: s.insert, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range, detail: 'snippet' })),
      ];
      return { suggestions };
    },
  });

  monaco.editor.defineTheme('pypath-dark', {
    base: 'vs-dark', inherit: true,
    rules: [], // Empty to keep official default VS Code / Monaco Python syntax colors!
    colors: {
      'editor.background': '#0F172A',
      'editor.foreground': '#F6F6F6',
      'editor.lineHighlightBackground': '#1E293B',
      'editorLineNumber.foreground': '#475569',
      'editorLineNumber.activeForeground': '#FC8A15',
      'editorCursor.foreground': '#FC8A15',
      'editor.selectionBackground': '#FC8A1533',
      'editorSuggestWidget.background': '#0F172A',
      'editorSuggestWidget.border': '#334155',
      'editorSuggestWidget.selectedBackground': '#FC8A1533',
    },
  });
};

interface PracticePanelProps {
  topicId: string;
  visualizerId?: string;
  starterCode: string;
  onToggleComplete?: () => void;
  isCompleted?: boolean;
  onExecutionComplete?: (result: any) => void;
}

export const PracticePanel: React.FC<PracticePanelProps> = ({
  topicId,
  visualizerId,
  starterCode,
  onToggleComplete,
  isCompleted,
  onExecutionComplete,
}) => {
  const { runCode, isRunning, isReady, cancelExecution } = usePyodide();
  const { savedCode, saveTopicCode } = useProgress();
  
  const [code, setCode] = useState(savedCode[topicId] || starterCode);
  const [stdout, setStdout] = useState('');
  const [stderr, setStderr] = useState('');
  const [consoleError, setConsoleError] = useState('');
  const [stdin, setStdin] = useState('');

  // Sync state when topic changes
  useEffect(() => {
    setCode(savedCode[topicId] || starterCode);
    setStdout('');
    setStderr('');
    setConsoleError('');
    setStdin('');
  }, [topicId, starterCode, savedCode]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      saveTopicCode(topicId, value);
    }
  };

  const handleRun = async () => {
    setStdout('Running code in sandbox...');
    setStderr('');
    setConsoleError('');

    // If stdin is populated, we can inject it into Pyodide sys.stdin
    // Pyodide worker supports injecting values if required.
    const result = await runCode(code, visualizerId, stdin);

    if (result.error) {
      setStdout('');
      setConsoleError(result.error);
    } else {
      setStdout(result.stdout || 'Code executed successfully with no stdout output.');
      setStderr(result.stderr);
    }

    if (onExecutionComplete) {
      onExecutionComplete({ ...result, code });
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the editor to starter code? This will discard your current edits.")) {
      setCode(starterCode);
      saveTopicCode(topicId, starterCode);
      setStdout('');
      setStderr('');
      setConsoleError('');
      setStdin('');
      if (onExecutionComplete) {
        onExecutionComplete(null);
      }
    }
  };

  const handleMarkComplete = () => {
    if (onToggleComplete) {
      onToggleComplete();
      if (!isCompleted) {
        confetti({
          particleCount: 80,
          spread: 50,
          origin: { y: 0.8 },
          colors: ['#7C5CFC', '#22C55E', '#FBBF24']
        });
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-panel border border-panel-border rounded-xl overflow-hidden font-sans">
      
      {/* Editor Header Panel */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-panel border-b border-panel-border">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-accent" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
            # Code Editor
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Reset Code */}
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg border border-panel-border text-text-muted hover:text-text-primary hover:bg-panel-border/30 transition cursor-pointer"
            title="Reset code"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          {/* Run / Stop button */}
          {!isReady ? (
            <button
              disabled
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-panel-border text-text-muted text-xs font-mono font-bold select-none cursor-not-allowed"
            >
              <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
              <span>Booting...</span>
            </button>
          ) : isRunning ? (
            <button
              onClick={cancelExecution}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 border border-danger/25 text-xs font-mono font-bold transition cursor-pointer"
            >
              <Square className="h-3 w-3 fill-current" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              onClick={handleRun}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-mono font-bold transition shadow shadow-accent/10 cursor-pointer"
            >
              <Play className="h-3 w-3 fill-current" />
              <span>Run</span>
            </button>
          )}

          {/* Complete Checklist */}
          <button
            onClick={handleMarkComplete}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition ${
              isCompleted
                ? 'bg-success/15 text-success border-success/30'
                : 'bg-panel border-panel-border text-text-muted hover:text-text-primary hover:border-text-muted/30'
            } cursor-pointer`}
          >
            <CheckCircle className="h-3.5 w-3.5" />
            <span>{isCompleted ? 'Completed' : 'Mark Done'}</span>
          </button>
        </div>
      </div>

      {/* Editor Monaco Body */}
      <div className="flex-grow min-h-[220px] border-b border-panel-border relative">
        <Editor
          height="100%"
          language="python"
          theme="pypath-dark"
          value={code}
          onChange={handleEditorChange}
          beforeMount={registerPythonCompletions}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontLigatures: true,
            automaticLayout: true,
            tabSize: 4,
            padding: { top: 12, bottom: 12 },
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            lineNumbersMinChars: 3,
            scrollbar: { verticalScrollbarSize: 5, horizontalScrollbarSize: 5 },
            suggestOnTriggerCharacters: true,
            quickSuggestions: { other: true, comments: false, strings: false },
            snippetSuggestions: 'top',
            suggest: { showKeywords: true, showSnippets: true, showFunctions: true },
            wordBasedSuggestions: 'currentDocument',
            autoIndent: 'full',
            formatOnType: true,
            bracketPairColorization: { enabled: true },
            scrollBeyondLastLine: false,
          }}
        />
        {!isReady && (
          <div className="absolute inset-0 bg-[var(--code-bg)]/85 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 z-30">
            <Loader2 className="h-7 w-7 text-accent animate-spin" />
            <span className="text-xs font-mono text-text-muted">
              Initializing Python WASM Compiler...
            </span>
          </div>
        )}
      </div>

      {/* Output Console Log */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-panel-border h-[130px] bg-[var(--code-bg)] font-mono text-xs">
        
        {/* Left pane: Output logs */}
        <div className="flex flex-col h-full min-h-0">
          <div className="flex items-center justify-between px-3 py-1.5 bg-panel border-b border-panel-border text-[9px] uppercase font-bold text-text-muted font-mono tracking-wider select-none">
            <span># Output</span>
            {stdout && !consoleError && (
              <span className="text-success font-bold lowercase font-mono">✓ Success</span>
            )}
            {consoleError && (
              <span className="text-danger font-bold lowercase font-mono">✕ Error</span>
            )}
          </div>
          <div className="flex-grow p-3 overflow-y-auto select-text font-mono text-[11px] leading-relaxed">
            {stdout && (
              <pre className="text-[var(--code)] whitespace-pre-wrap">{stdout}</pre>
            )}
            {stderr && (
              <pre className="text-[#B45309] whitespace-pre-wrap mt-1">[STDERR] {stderr}</pre>
            )}
            {consoleError && (
              <div className="text-danger flex items-start gap-1.5 p-1 rounded font-mono">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                <pre className="whitespace-pre-wrap">{consoleError}</pre>
              </div>
            )}
            {!stdout && !stderr && !consoleError && (
              <span className="text-text-muted/40 italic"># Sandbox run logs will stream here...</span>
            )}
          </div>
        </div>

        {/* Right pane: Stdin inputs */}
        <div className="flex flex-col h-full min-h-0">
          <div className="flex items-center px-3 py-1.5 bg-panel border-b border-panel-border text-[9px] uppercase font-bold text-text-muted font-mono tracking-wider select-none">
            # Input (stdin)
          </div>
          <div className="flex-grow p-2">
            <input
              type="text"
              placeholder="Enter input if required..."
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              className="w-full h-full bg-[var(--code-bg)] border border-panel-border px-3 py-1 rounded-lg text-xs text-text-primary placeholder-text-muted/30 focus:outline-none focus:border-accent font-mono"
            />
          </div>
        </div>

      </div>

    </div>
  );
};
export default PracticePanel;
