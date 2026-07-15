import React, { useState, useRef, useEffect } from 'react';
import type { Topic, Phase } from '../curriculum/curriculumData';
import { useNavigate } from 'react-router-dom';
import { Play, ChevronRight, CheckCircle2, RotateCcw, Terminal } from 'lucide-react';
import gsap from 'gsap';

/* =========================================================
   Inline Markdown Renderer
   ========================================================= */
interface MarkdownRendererProps { content: string; }

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let codeBlockLang = '';
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = (key: string | number) => {
    if (listItems.length === 0 || !listType) return;
    if (listType === 'ul') {
      renderedElements.push(
        <ul key={`ul-${key}`} className="list-disc list-inside ml-5 my-3 text-sm text-text-muted space-y-2">
          {listItems.map((item, idx) => <li key={idx}>{renderInline(item)}</li>)}
        </ul>
      );
    } else {
      renderedElements.push(
        <ol key={`ol-${key}`} className="list-decimal list-inside ml-5 my-3 text-sm text-text-muted space-y-2">
          {listItems.map((item, idx) => <li key={idx}>{renderInline(item)}</li>)}
        </ol>
      );
    }
    listItems = [];
    listType = null;
  };

  const renderInline = (text: string): React.ReactNode[] =>
    text.split(/(\*\*.*?\*\*|`.*?`)/).map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**'))
        return <strong key={idx} className="font-bold text-text-primary">{part.slice(2, -2)}</strong>;
      if (part.startsWith('`') && part.endsWith('`'))
        return <code key={idx} className="bg-[var(--code-bg)] text-[var(--code-keyword)] px-1.5 py-0.5 rounded font-mono text-xs border border-panel-border">{part.slice(1, -1)}</code>;
      return part;
    });

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
        renderedElements.push(
          <div key={`code-${i}`} className="bg-[var(--code-bg)] p-4 rounded-xl border border-panel-border my-4 relative overflow-x-auto">
            <span className="absolute top-2 right-3 text-[7px] text-text-muted/40 font-mono uppercase tracking-widest">{codeBlockLang || 'code'}</span>
            <pre className="text-sm font-mono text-[var(--code)] leading-relaxed"><code>{codeBlockLines.join('\n')}</code></pre>
          </div>
        );
        codeBlockLines = [];
        codeBlockLang = '';
      } else {
        inCodeBlock = true;
        codeBlockLang = line.replace('```', '').trim();
        flushList(i);
      }
      continue;
    }
    if (inCodeBlock) { codeBlockLines.push(line); continue; }

    if (line.startsWith('### ') || line.startsWith('#### ')) {
      flushList(i);
      const level = line.startsWith('### ') ? 3 : 4;
      const text = line.replace(/^#{3,4}\s+/, '');
      renderedElements.push(
        level === 3
          ? <h3 key={i} className="text-base font-bold text-accent font-mono mt-5 mb-2.5 border-b border-panel-border pb-1.5">{renderInline(text)}</h3>
          : <h4 key={i} className="text-sm font-bold text-text-primary font-mono mt-4 mb-2">{renderInline(text)}</h4>
      );
      continue;
    }
    if (line.trim().startsWith('- ')) {
      if (listType !== 'ul') { flushList(i); listType = 'ul'; }
      listItems.push(line.trim().slice(2));
      continue;
    }
    const orderedMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
    if (orderedMatch) {
      if (listType !== 'ol') { flushList(i); listType = 'ol'; }
      listItems.push(orderedMatch[2]);
      continue;
    }
    if (line.trim() === '') { flushList(i); continue; }
    flushList(i);
    renderedElements.push(
      <p key={i} className="text-sm text-text-muted leading-relaxed font-sans mb-3">{renderInline(line)}</p>
    );
  }
  flushList(lines.length);
  return <div className="space-y-1">{renderedElements}</div>;
};

/* =========================================================
   Pyodide runner hook
   ========================================================= */
declare global { interface Window { loadPyodide?: (opts: { indexURL: string }) => Promise<{ runPythonAsync: (code: string) => Promise<unknown> }>; _pyodide?: Awaited<ReturnType<NonNullable<Window['loadPyodide']>>>; } }

async function runPythonCode(code: string): Promise<string> {
  try {
    if (!window._pyodide) {
      if (!window.loadPyodide) throw new Error('Pyodide not loaded. Please wait…');
      window._pyodide = await window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/' });
    }
    const py = window._pyodide;
    let output = '';
    // Capture stdout
    await py.runPythonAsync(`
import sys, io
_stdout_buf = io.StringIO()
sys.stdout = _stdout_buf
`);
    await py.runPythonAsync(code);
    output = String(await py.runPythonAsync('_stdout_buf.getvalue()'));
    await py.runPythonAsync('sys.stdout = sys.__stdout__');
    return output || '(no output)';
  } catch (e: unknown) {
    return `Error: ${e instanceof Error ? e.message : String(e)}`;
  }
}

/* =========================================================
   Props
   ========================================================= */
interface TopicPanelsProps {
  topic: Topic;
  phase: Phase;
  isCompleted: boolean;
  onToggleComplete: () => void;
  nextTopicPath: string | null;
}

/* =========================================================
   Component
   ========================================================= */
const DEFAULT_CODE = `# Write your Python code here
print("Hello, Python!")
`;

export const TopicPanels: React.FC<TopicPanelsProps> = ({
  topic,
  phase: _phase,
  isCompleted,
  onToggleComplete,
  nextTopicPath,
}) => {
  const navigate = useNavigate();
  const [code, setCode] = useState(topic.starterCode || DEFAULT_CODE);
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Resizable split ──────────────────────────────────────
  const [splitPct, setSplitPct] = useState(55); // left column %
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    const container = containerRef.current;
    if (!container) return;

    const onMove = (mv: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const raw = ((mv.clientX - rect.left) / rect.width) * 100;
      setSplitPct(Math.min(75, Math.max(25, raw)));
    };
    const onUp = () => {
      setDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Handle TAB key inside textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = e.currentTarget;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const newVal = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newVal);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 4;
      });
    }
  };

  const handleRun = async () => {
    setRunning(true);
    setOutput('Running…');
    const result = await runPythonCode(code);
    setOutput(result);
    setRunning(false);
  };

  const handleReset = () => {
    setCode(topic.starterCode || DEFAULT_CODE);
    setOutput('');
  };

  // GSAP entrance animation on topic change
  const leftColRef  = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(leftColRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }
      );
      gsap.fromTo(rightColRef.current,
        { opacity: 0, scale: 0.96 },
        { opacity: 1, scale: 1, duration: 0.55, delay: 0.1, ease: 'power3.out' }
      );
    });
    return () => ctx.revert();
  }, [topic.id]);

  return (
    <div
      ref={containerRef}
      className="flex flex-row w-full font-sans p-2 h-full min-h-0"
      style={{ userSelect: dragging ? 'none' : 'auto', cursor: dragging ? 'col-resize' : 'auto' }}
    >

      {/* LEFT COLUMN — Topic explanation */}
      <div ref={leftColRef} className="flex flex-col gap-3 min-w-0 h-full" style={{ width: `${splitPct}%` }}>

        {/* Content card — scrollable */}
        <div className="glass-panel flex flex-col flex-1 min-h-0 overflow-hidden">

          {/* Card header */}
          <div className="flex justify-between items-start px-5 pt-5 pb-3 border-b border-panel-border flex-shrink-0">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-accent uppercase font-mono tracking-wider">
                // explanation_view
              </span>
              <h2 className="text-lg font-bold text-text-primary mt-1 font-mono">{topic.name}</h2>
            </div>

            <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono border uppercase tracking-wider flex-shrink-0 ${
              isCompleted
                ? 'bg-success/15 text-success border-success/20'
                : 'bg-accent/15 text-accent border-accent/20 animate-pulse'
            }`}>
              {isCompleted ? '✓ Done' : '◐ In Progress'}
            </span>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
            <MarkdownRenderer content={topic.explanation || ''} />
          </div>
        </div>

        {/* Bottom action bar */}
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={onToggleComplete}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 cursor-pointer ${
              isCompleted
                ? 'bg-success/10 text-success border-success/30 hover:bg-success/15'
                : 'bg-panel border-panel-border text-text-primary hover:border-accent/50 hover:text-accent hover:bg-accent/5'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            {isCompleted ? 'Marked as Read' : 'Mark as Read'}
          </button>

          <button
            onClick={() => nextTopicPath && navigate(nextTopicPath)}
            disabled={!nextTopicPath}
            className="btn-accent flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer ml-auto"
          >
            Next Topic
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── DRAG HANDLE ── */}
      <div
        onMouseDown={startDrag}
        className="flex-shrink-0 w-1.5 rounded-full mx-1 cursor-col-resize relative group h-full"
        title="Drag to resize"
      >
        {/* Track */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-panel-border group-hover:bg-accent/50 transition-colors" />
        {/* Grip dots */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-1">
          {[0,1,2].map(i => (
            <span key={i} className="block w-1 h-1 rounded-full bg-text-muted/30 group-hover:bg-accent/60 transition-colors" />
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN — Python editor + output */}
      <div ref={rightColRef} className="flex flex-col gap-3 min-w-0 h-full" style={{ width: `${100 - splitPct}%` }}>

        {/* Editor card */}
        <div className="glass-panel flex flex-col flex-1 min-h-0 overflow-hidden">

          {/* Editor header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-panel-border flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28CA41]" />
              </div>
              <span className="text-[10px] font-mono text-text-muted/60 ml-1">practice.py</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-mono text-text-muted hover:text-text-primary hover:bg-[#1C223C] transition cursor-pointer"
                title="Reset code"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
              <button
                onClick={handleRun}
                disabled={running}
                className="btn-accent flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-mono font-bold text-white disabled:opacity-50 cursor-pointer"
              >
                <Play className="h-3 w-3" />
                {running ? 'Running…' : 'Run'}
              </button>
            </div>
          </div>

          {/* Code textarea */}
          <div className="flex-1 min-h-0 overflow-hidden relative bg-[var(--code-bg)] rounded-b-xl">
            {/* Line numbers */}
            <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col pt-3 pb-3 text-right pr-2 text-[11px] font-mono text-[var(--text-faint)] select-none pointer-events-none overflow-hidden z-10 bg-[var(--code-bg)] border-r border-panel-border/30">
              {code.split('\n').map((_, i) => (
                <span key={i} className="leading-[1.6rem]">{i + 1}</span>
              ))}
            </div>
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              className="absolute inset-0 w-full h-full pl-12 pr-3 pt-3 pb-3 bg-transparent text-[13px] font-mono text-[var(--code)] leading-[1.6rem] resize-none focus:outline-none caret-accent selection:bg-accent/20"
              style={{ tabSize: 4 }}
            />
          </div>
        </div>

        {/* Output box — fixed height, no scroll on outer page */}
        <div className="glass-panel flex flex-col flex-shrink-0 h-[180px]">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-panel-border flex-shrink-0">
            <Terminal className="h-3.5 w-3.5 text-accent/60" />
            <span className="text-[10px] font-mono text-text-muted/60 font-bold uppercase tracking-wider">Output</span>
            {output && (
              <button
                onClick={() => setOutput('')}
                className="ml-auto text-[9px] text-text-muted/40 hover:text-text-muted font-mono cursor-pointer"
              >
                clear
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
            {output ? (
              <pre className={`text-[12px] font-mono leading-relaxed whitespace-pre-wrap ${
                output.startsWith('Error:') ? 'text-danger' : 'text-[var(--code)]'
              }`}>{output}</pre>
            ) : (
              <span className="text-[11px] font-mono text-text-muted/30 italic">
                Press Run to execute your code…
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TopicPanels;
