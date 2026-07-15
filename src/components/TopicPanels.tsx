import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Topic, Phase } from '../curriculum/curriculumData';
import { useNavigate } from 'react-router-dom';
import {
  Play, Square, ChevronRight, CheckCircle2, RotateCcw,
  AlertCircle, Loader2, ChevronDown, Zap,
} from 'lucide-react';
import Editor, { type BeforeMount } from '@monaco-editor/react';
import gsap from 'gsap';
import { usePyodide } from '../hooks/usePyodide';
import { useProgress } from '../context/ProgressContext';

/* ─────────────────────────────────────────────────────────
   Monaco — Python completions + Python-3.12 theme
   ───────────────────────────────────────────────────────── */
let _monacoRegistered = false;

const PYTHON_KEYWORDS = [
  'False','None','True','and','as','assert','async','await','break','class',
  'continue','def','del','elif','else','except','finally','for','from',
  'global','if','import','in','is','lambda','nonlocal','not','or','pass',
  'raise','return','try','while','with','yield',
];
const PYTHON_BUILTINS = [
  'print','input','len','range','int','str','float','bool','list','dict',
  'set','tuple','type','isinstance','issubclass','hasattr','getattr','setattr',
  'delattr','callable','iter','next','enumerate','zip','map','filter',
  'sorted','reversed','sum','min','max','abs','round','pow','divmod',
  'hex','oct','bin','chr','ord','repr','hash','id','open','super',
  'staticmethod','classmethod','property','object',
  'Exception','ValueError','TypeError','IndexError','KeyError',
  'AttributeError','NameError','RuntimeError','StopIteration',
  'FileNotFoundError','NotImplementedError','OSError','IOError',
];
const PYTHON_SNIPPETS = [
  { label:'if',    insert:'if ${1:condition}:\n    ${2:pass}' },
  { label:'elif',  insert:'elif ${1:condition}:\n    ${2:pass}' },
  { label:'else',  insert:'else:\n    ${1:pass}' },
  { label:'for',   insert:'for ${1:item} in ${2:iterable}:\n    ${3:pass}' },
  { label:'while', insert:'while ${1:condition}:\n    ${2:pass}' },
  { label:'def',   insert:'def ${1:name}(${2:params}):\n    ${3:pass}' },
  { label:'class', insert:'class ${1:Name}:\n    def __init__(self):\n        ${2:pass}' },
  { label:'try',   insert:'try:\n    ${1:pass}\nexcept ${2:Exception} as e:\n    ${3:pass}' },
  { label:'with',  insert:'with ${1:expr} as ${2:var}:\n    ${3:pass}' },
  { label:'print', insert:'print(${1:value})' },
  { label:'input', insert:'input(${1:"prompt: "})' },
  { label:'range', insert:'range(${1:stop})' },
  { label:'enumerate', insert:'enumerate(${1:iterable})' },
  { label:'zip',   insert:'zip(${1:a}, ${2:b})' },
  { label:'sorted',insert:'sorted(${1:iterable})' },
];

const beforeMonacoMount: BeforeMount = (monaco) => {
  if (_monacoRegistered) return;
  _monacoRegistered = true;

  monaco.languages.registerCompletionItemProvider('python', {
    triggerCharacters: ['.', ' '],
    provideCompletionItems: (model: any, position: any) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber:   position.lineNumber,
        startColumn: word.startColumn,
        endColumn:   word.endColumn,
      };
      const suggestions: any[] = [
        ...PYTHON_KEYWORDS.map(kw => ({
          label: kw, kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: kw, range, detail: 'keyword',
        })),
        ...PYTHON_BUILTINS.map(fn => ({
          label: fn, kind: monaco.languages.CompletionItemKind.Function,
          insertText: fn, range, detail: 'builtin',
        })),
        ...PYTHON_SNIPPETS.map(s => ({
          label: s.label, kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: s.insert,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range, detail: 'snippet',
        })),
      ];
      return { suggestions };
    },
  });

  // Python 3.12 color scheme — premium Light Theme
  monaco.editor.defineTheme('python312', {
    base: 'vs',
    inherit: true,
    rules: [
      // keywords: for, if, while, def, class, return …
      { token: 'keyword',              foreground: 'C2410C', fontStyle: 'bold' },
      // built-in functions: print, input, int, range …
      { token: 'support.function',     foreground: 'C2410C' },
      // strings
      { token: 'string',               foreground: '009378' },
      { token: 'string.escape',        foreground: '009378' },
      // numbers
      { token: 'number',               foreground: '009378' },
      { token: 'number.float',         foreground: '009378' },
      // comments
      { token: 'comment',              foreground: '64748B', fontStyle: 'italic' },
      // identifiers / types
      { token: 'type',                 foreground: '0F172A' },
      { token: 'entity.name.function', foreground: '0F172A' },
      // operators & punctuation
      { token: 'delimiter',            foreground: '64748B' },
      { token: 'operator',             foreground: '475569' },
      // variables
      { token: 'variable',             foreground: '0F172A' },
      { token: 'identifier',           foreground: '0F172A' },
    ],
    colors: {
      'editor.background':              '#F8FAFC',
      'editor.foreground':              '#0F172A',
      'editor.lineHighlightBackground': '#F1F5F9',
      'editorLineNumber.foreground':    '#94A3B8',
      'editorLineNumber.activeForeground': '#FC8A15',
      'editorCursor.foreground':        '#FC8A15',
      'editor.selectionBackground':     '#E2E8F0',
      'editorIndentGuide.background1':  '#E2E8F0',
      'editorBracketMatch.background':  '#FC8A1522',
      'editorBracketMatch.border':      '#FC8A15',
      // suggest widget
      'editorSuggestWidget.background': '#FFFFFF',
      'editorSuggestWidget.border':     '#E2E8F0',
      'editorSuggestWidget.selectedBackground': '#F1F5F9',
    },
  });
};

const highlightLineTokens = (line: string, lineKey: number) => {
  const tokens: React.ReactNode[] = [];
  let currentIdx = 0;
  const tokenRegex = /(\"[^\"]*\"|\'[^\']*\'|\b\d+\b|\b\w+\b|[+\-*/=%<>!&|^~]+|[^\"\'\w\s]+)/g;
  let match;

  while ((match = tokenRegex.exec(line)) !== null) {
    const start = match.index;
    if (start > currentIdx) {
      tokens.push(line.slice(currentIdx, start));
    }

    const token = match[0];
    if (token.startsWith('"') || token.startsWith("'")) {
      tokens.push(<span key={`${lineKey}-${start}`} className="text-[#1EE494]">{token}</span>);
    } else if (/^\d+$/.test(token)) {
      tokens.push(<span key={`${lineKey}-${start}`} className="text-[#1EE494]">{token}</span>);
    } else if (PYTHON_KEYWORDS.includes(token)) {
      tokens.push(<span key={`${lineKey}-${start}`} className="text-[#FC8A15] font-bold">{token}</span>);
    } else if (PYTHON_BUILTINS.includes(token)) {
      tokens.push(<span key={`${lineKey}-${start}`} className="text-[#FC8A15]">{token}</span>);
    } else {
      tokens.push(token);
    }
    currentIdx = tokenRegex.lastIndex;
  }

  if (currentIdx < line.length) {
    tokens.push(line.slice(currentIdx));
  }

  return tokens.length > 0 ? tokens : ' ';
};

/* ─────────────────────────────────────────────────────────
   Simple Python Syntax Highlighter for static explanation code blocks
   ───────────────────────────────────────────────────────── */
const highlightPython = (code: string): React.ReactNode[] => {
  const lines = code.split('\n');
  let inTripleDouble = false;
  let inTripleSingle = false;

  return lines.map((line, idx) => {
    // If we are currently inside a triple-quoted comment
    if (inTripleDouble) {
      const endIdx = line.indexOf('"""');
      if (endIdx !== -1) {
        inTripleDouble = false;
        const commentPart = line.slice(0, endIdx + 3);
        const rest = line.slice(endIdx + 3);
        return (
          <div key={idx} className="min-h-[1.5rem] whitespace-pre">
            <span className="text-[#009378] italic">{commentPart}</span>
            {highlightLineTokens(rest, idx)}
          </div>
        );
      } else {
        return (
          <div key={idx} className="min-h-[1.5rem] whitespace-pre text-[#009378] italic">
            {line}
          </div>
        );
      }
    }

    if (inTripleSingle) {
      const endIdx = line.indexOf("'''");
      if (endIdx !== -1) {
        inTripleSingle = false;
        const commentPart = line.slice(0, endIdx + 3);
        const rest = line.slice(endIdx + 3);
        return (
          <div key={idx} className="min-h-[1.5rem] whitespace-pre">
            <span className="text-[#009378] italic">{commentPart}</span>
            {highlightLineTokens(rest, idx)}
          </div>
        );
      } else {
        return (
          <div key={idx} className="min-h-[1.5rem] whitespace-pre text-[#009378] italic">
            {line}
          </div>
        );
      }
    }

    const trimmed = line.trim();
    if (trimmed.startsWith('"""')) {
      const secondTriple = line.indexOf('"""', line.indexOf('"""') + 3);
      if (secondTriple !== -1) {
        return (
          <div key={idx} className="min-h-[1.5rem] whitespace-pre text-[#009378] italic">
            {line}
          </div>
        );
      } else {
        inTripleDouble = true;
        return (
          <div key={idx} className="min-h-[1.5rem] whitespace-pre text-[#009378] italic">
            {line}
          </div>
        );
      }
    }

    if (trimmed.startsWith("'''")) {
      const secondTriple = line.indexOf("'''", line.indexOf("'''") + 3);
      if (secondTriple !== -1) {
        return (
          <div key={idx} className="min-h-[1.5rem] whitespace-pre text-[#009378] italic">
            {line}
          </div>
        );
      } else {
        inTripleSingle = true;
        return (
          <div key={idx} className="min-h-[1.5rem] whitespace-pre text-[#009378] italic">
            {line}
          </div>
        );
      }
    }

    if (trimmed.startsWith('#')) {
      return (
        <div key={idx} className="min-h-[1.5rem] whitespace-pre text-[#009378] italic">
          {line}
        </div>
      );
    }

    let codePart = line;
    let commentPart = '';
    const hashIndex = line.indexOf('#');
    if (hashIndex !== -1) {
      const before = line.slice(0, hashIndex);
      const doubleQuotes = (before.match(/"/g) || []).length;
      const singleQuotes = (before.match(/'/g) || []).length;
      if (doubleQuotes % 2 === 0 && singleQuotes % 2 === 0) {
        codePart = line.slice(0, hashIndex);
        commentPart = line.slice(hashIndex);
      }
    }

    return (
      <div key={idx} className="min-h-[1.5rem] whitespace-pre">
        {highlightLineTokens(codePart, idx)}
        {commentPart && <span className="text-[#009378] italic">{commentPart}</span>}
      </div>
    );
  });
};

/* ─────────────────────────────────────────────────────────
   Console line type
   ───────────────────────────────────────────────────────── */
type ConsoleLine = { id: number; type: 'out'|'err'|'error'|'info'; text: string };
let _lid = 0;
const mkLine = (type: ConsoleLine['type'], text: string): ConsoleLine =>
  ({ id: ++_lid, type, text });

/* ─────────────────────────────────────────────────────────
   Inline Markdown Renderer with styled Code & Output blocks
   ───────────────────────────────────────────────────────── */
interface MarkdownRendererProps { content: string }
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return null;
  const lines = content.split('\n');
  const out: React.ReactNode[] = [];
  let inCode = false, codeLines: string[] = [];
  let listItems: string[] = [], listType: 'ul'|'ol'|null = null;
  let nextBlockIsOutput = false;

  const flushList = (k: string|number) => {
    if (!listItems.length || !listType) return;
    out.push(listType === 'ul'
      ? <ul key={`ul-${k}`} className="list-disc list-inside ml-5 my-3 text-base text-text-muted space-y-2">{listItems.map((t,i)=><li key={i}>{ri(t)}</li>)}</ul>
      : <ol key={`ol-${k}`} className="list-decimal list-inside ml-5 my-3 text-base text-text-muted space-y-2">{listItems.map((t,i)=><li key={i}>{ri(t)}</li>)}</ol>
    );
    listItems = []; listType = null;
  };
  const ri = (t: string): React.ReactNode[] =>
    t.split(/(\*\*.*?\*\*|`.*?`)/).map((p,i) => {
      if (p.startsWith('**')&&p.endsWith('**')) return <strong key={i} className="font-bold text-text-primary">{p.slice(2,-2)}</strong>;
      if (p.startsWith('`')&&p.endsWith('`')) return <code key={i} className="bg-[var(--code-bg)] text-[var(--code-keyword)] px-1.5 py-0.5 rounded font-mono text-sm border border-panel-border">{p.slice(1,-1)}</code>;
      return p;
    });

  for (let i=0;i<lines.length;i++) {
    const l = lines[i];

    if (/^\*\*Output:?\*\*:?$/i.test(l.trim())) {
      flushList(i);
      nextBlockIsOutput = true;
      continue;
    }

    if (l.trim().startsWith('```')) {
      if (inCode) {
        inCode = false;
        if (nextBlockIsOutput) {
          out.push(
            <div key={`out-${i}`} className="my-5">
              <div className="text-base font-bold text-text-primary mb-2">Output</div>
              <div className="bg-[#080A12] text-[#F6F6F6] p-5 rounded-xl border border-[#1A1E30] overflow-x-auto font-mono text-[15px] leading-relaxed">
                <pre><code>{codeLines.join('\n')}</code></pre>
              </div>
            </div>
          );
          nextBlockIsOutput = false;
        } else {
          out.push(
            <div key={`c-${i}`} className="my-5">
              <div className="text-base font-bold text-text-primary mb-2">Code</div>
              <div className="bg-[#080A12] p-5 rounded-xl border border-panel-border/30 relative overflow-x-auto font-mono text-[15px] leading-relaxed">
                <span className="absolute top-3 right-4 bg-accent/80 text-white text-[10px] font-bold font-sans px-2.5 py-1 rounded-full uppercase tracking-wider">PYTHON</span>
                <pre className="text-text-primary">
                  <code>{highlightPython(codeLines.join('\n'))}</code>
                </pre>
              </div>
            </div>
          );
        }
        codeLines=[];
      } else {
        inCode=true;
        flushList(i);
      }
      continue;
    }

    if (inCode) {
      codeLines.push(l);
      continue;
    }

    if (l.startsWith('### ')||l.startsWith('#### ')) {
      flushList(i);
      const lv = l.startsWith('### ')?3:4, t=l.replace(/^#{3,4}\s+/,'');
      out.push(lv===3
        ? <h3 key={i} className="text-lg font-bold text-accent font-mono mt-6 mb-3 border-b border-panel-border pb-2">{ri(t)}</h3>
        : <h4 key={i} className="text-base font-bold text-text-primary font-mono mt-5 mb-2.5">{ri(t)}</h4>);
      continue;
    }
    if (l.trim().startsWith('- ')) { if (listType!=='ul'){flushList(i);listType='ul';} listItems.push(l.trim().slice(2)); continue; }
    const om = l.trim().match(/^(\d+)\.\s+(.*)/);
    if (om) { if (listType!=='ol'){flushList(i);listType='ol';} listItems.push(om[2]); continue; }
    if (!l.trim()) { flushList(i); continue; }
    flushList(i);
    out.push(<p key={i} className="text-base text-text-muted leading-relaxed font-sans mb-3.5">{ri(l)}</p>);
  }
  flushList(lines.length);
  return <div className="space-y-1">{out}</div>;
};

/* ─────────────────────────────────────────────────────────
   TopicPanels
   ───────────────────────────────────────────────────────── */
interface TopicPanelsProps {
  topic: Topic;
  phase: Phase;
  isCompleted: boolean;
  onToggleComplete: () => void;
  nextTopicPath: string | null;
}

const DEFAULT_CODE = `# Write your Python code here\nprint("Hello, Python!")\n`;

export const TopicPanels: React.FC<TopicPanelsProps> = ({
  topic, phase: _phase, isCompleted, onToggleComplete, nextTopicPath,
}) => {
  const navigate    = useNavigate();
  const { runCode, isRunning, isReady, cancelExecution } = usePyodide();
  const { savedCode, saveTopicCode } = useProgress();

  /* ── editor state ── */
  const [code, setCode] = useState(savedCode[topic.id] || topic.starterCode || DEFAULT_CODE);

  /* ── active tab: 'code' | 'io' ── */
  const [tab, setTab] = useState<'code'|'io'>('code');

  /* ── stdin / console ── */
  const [stdin, setStdin]           = useState('');
  const [consoleLines, setConsoleLines] = useState<ConsoleLine[]>([]);
  const consoleEndRef               = useRef<HTMLDivElement>(null);

  useEffect(() => { consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [consoleLines]);

  /* ── reset on topic change ── */
  useEffect(() => {
    setCode(savedCode[topic.id] || topic.starterCode || DEFAULT_CODE);
    setConsoleLines([]);
    setStdin('');
  }, [topic.id, topic.starterCode, savedCode]);

  const addLines = useCallback((type: ConsoleLine['type'], text: string) => {
    const ls = text.split('\n').filter((_,i,a)=>!(i===a.length-1&&_===''));
    setConsoleLines(prev => [...prev, ...ls.map(t => mkLine(type, t))]);
  }, []);

  const handleEditorChange = (val: string|undefined) => {
    if (val !== undefined) { setCode(val); saveTopicCode(topic.id, val); }
  };

  /* ── run handler ── */
  const handleRun = async () => {
    setConsoleLines([]);
    // switch to IO tab so user sees output
    setTab('io');
    const result = await runCode(code, undefined, stdin);
    if (result.error) {
      addLines('error', result.error);
    } else {
      if (result.stdout) addLines('out', result.stdout);
      if (result.stderr) addLines('err', result.stderr);
      if (!result.stdout && !result.stderr) addLines('info', '(no output)');
    }
  };

  const handleReset = () => {
    if (!window.confirm('Reset to starter code?')) return;
    const s = topic.starterCode || DEFAULT_CODE;
    setCode(s); saveTopicCode(topic.id, s); setConsoleLines([]); setStdin('');
  };

  /* ── horizontal split (left / right) ── */
  const [hPct, setHPct]     = useState(50);
  const [hDrag, setHDrag]   = useState(false);
  const containerRef         = useRef<HTMLDivElement>(null);

  const startHDrag = (e: React.MouseEvent) => {
    e.preventDefault(); setHDrag(true);
    const con = containerRef.current; if (!con) return;
    const onMove = (mv: MouseEvent) => {
      const r = con.getBoundingClientRect();
      setHPct(Math.min(72, Math.max(28, ((mv.clientX - r.left) / r.width) * 100)));
    };
    const onUp = () => { setHDrag(false); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  /* ── IO vertical split (input / output) ── */
  const [ioPct, setIoPct]   = useState(48);
  const [ioDrag, setIoDrag] = useState(false);
  const ioColRef             = useRef<HTMLDivElement>(null);

  const startIoDrag = (e: React.MouseEvent) => {
    e.preventDefault(); setIoDrag(true);
    const col = ioColRef.current; if (!col) return;
    const onMove = (mv: MouseEvent) => {
      const r = col.getBoundingClientRect();
      setIoPct(Math.min(80, Math.max(20, ((mv.clientY - r.top) / r.height) * 100)));
    };
    const onUp = () => { setIoDrag(false); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  /* ── GSAP entrance ── */
  const leftColRef  = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(leftColRef.current,  { opacity:0, y:20 }, { opacity:1, y:0, duration:0.5, ease:'power3.out' });
      gsap.fromTo(rightColRef.current, { opacity:0, scale:0.97 }, { opacity:1, scale:1, duration:0.5, delay:0.08, ease:'power3.out' });
    });
    return () => ctx.revert();
  }, [topic.id]);

  /* ── console line colours ── */
  const lineClr: Record<ConsoleLine['type'], string> = {
    out:   'text-[var(--code)]',
    err:   'text-[#B45309]',
    error: 'text-[#E11D48]',
    info:  'text-[#64748B]',
  };

  const anyDrag = hDrag || ioDrag;

  return (
    <div
      ref={containerRef}
      className="flex flex-row w-full font-sans p-2 h-full min-h-0"
      style={{ userSelect: anyDrag ? 'none' : 'auto', cursor: hDrag ? 'col-resize' : ioDrag ? 'row-resize' : 'auto' }}
    >
      {/* ═══════════ LEFT — explanation ═══════════ */}
      <div ref={leftColRef} className="flex flex-col gap-3 min-w-0 h-full" style={{ width: `${hPct}%` }}>
        <div className="glass-panel flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex justify-between items-start px-5 pt-5 pb-3 border-b border-panel-border flex-shrink-0">
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-text-primary mt-1 font-mono">{topic.name}</h2>
            </div>
            <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono border uppercase tracking-wider flex-shrink-0 ${
              isCompleted ? 'bg-success/15 text-success border-success/20' : 'bg-accent/15 text-accent border-accent/20 animate-pulse'
            }`}>
              {isCompleted ? '✓ Done' : '◐ In Progress'}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
            <MarkdownRenderer content={topic.explanation || ''} />
          </div>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={onToggleComplete}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-base font-semibold border transition-all cursor-pointer ${
              isCompleted ? 'bg-success/10 text-success border-success/30 hover:bg-success/15' : 'bg-panel border-panel-border text-text-primary hover:border-accent/50 hover:text-accent hover:bg-accent/5'
            }`}
          >
            <CheckCircle2 className="h-5 w-5" />
            {isCompleted ? 'Marked as Read' : 'Mark as Read'}
          </button>
          <button
            onClick={() => nextTopicPath && navigate(nextTopicPath)}
            disabled={!nextTopicPath}
            className="btn-accent flex items-center gap-2 px-6 py-3 rounded-xl text-base font-semibold text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer ml-auto"
          >
            Next Topic <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ═══════════ HORIZONTAL DRAG ═══════════ */}
      <div
        onMouseDown={startHDrag}
        className="flex-shrink-0 w-2 mx-0.5 cursor-col-resize relative group h-full flex items-center justify-center"
      >
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-panel-border group-hover:bg-accent/40 transition-colors" />
        <div className="relative z-10 flex flex-col gap-1">
          {[0,1,2,3].map(i => <span key={i} className="block w-1.5 h-1.5 rounded-full bg-text-muted/20 group-hover:bg-accent/60 transition-colors" />)}
        </div>
      </div>

      {/* ═══════════ RIGHT — tabbed editor ═══════════ */}
      <div
        ref={rightColRef}
        className="flex flex-col min-w-0 h-full"
        style={{ width: `${100 - hPct}%` }}
      >
        {/* ── Tab bar ── */}
        <div className="flex items-center gap-3 px-4 py-3 bg-panel border-b border-panel-border flex-shrink-0">
          <button
            onClick={() => setTab('code')}
            className={`px-5 py-2 rounded-full text-[14px] font-bold transition-all cursor-pointer ${
              tab === 'code'
                ? 'bg-accent text-white shadow shadow-accent/30'
                : 'text-text-muted hover:text-text-primary bg-transparent border border-panel-border hover:border-accent/40'
            }`}
          >
            Code
          </button>
          <button
            onClick={() => setTab('io')}
            className={`px-5 py-2 rounded-full text-[14px] font-bold transition-all cursor-pointer ${
              tab === 'io'
                ? 'bg-accent text-white shadow shadow-accent/30'
                : 'text-text-muted hover:text-text-primary bg-transparent border border-panel-border hover:border-accent/40'
            }`}
          >
            Input / Output
          </button>

          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs font-mono text-text-muted/40 select-none">Python 3.12</span>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs font-mono text-text-muted/40 hover:text-text-muted transition cursor-pointer p-1 hover:bg-text-muted/10 rounded"
              title="Reset code"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── CODE TAB ── */}
        <div className={`flex flex-col flex-1 min-h-0 ${tab !== 'code' ? 'hidden' : ''}`}>
          {/* Monaco editor */}
          <div className="flex-1 min-h-0 relative">
            <Editor
              height="100%"
              language="python"
              theme="python312"
              value={code}
              onChange={handleEditorChange}
              beforeMount={beforeMonacoMount}
              options={{
                minimap:            { enabled: false },
                fontSize:           15,
                fontFamily:         "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
                fontLigatures:      true,
                automaticLayout:    true,
                tabSize:            4,
                insertSpaces:       true,
                padding:            { top: 14, bottom: 14 },
                cursorBlinking:     'smooth',
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling:    true,
                lineNumbersMinChars: 3,
                scrollbar:          { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
                suggestOnTriggerCharacters: true,
                quickSuggestions:   { other: true, comments: false, strings: false },
                snippetSuggestions: 'top',
                suggest:            { showKeywords: true, showSnippets: true, showFunctions: true, showVariables: true },
                wordBasedSuggestions: 'currentDocument',
                acceptSuggestionOnEnter: 'smart',
                autoIndent:         'full',
                formatOnType:       true,
                bracketPairColorization: { enabled: true },
                guides:             { bracketPairs: true, indentation: true },
                renderLineHighlight:'all',
                scrollBeyondLastLine: false,
                overviewRulerLanes: 0,
              }}
            />
            {/* Pyodide boot overlay */}
            {!isReady && (
              <div className="absolute inset-0 bg-[var(--code-bg)]/95 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-30 pointer-events-none">
                <Loader2 className="h-8 w-8 text-accent animate-spin" />
                <span className="text-sm font-mono text-text-muted">Initializing Python 3.12 WASM…</span>
              </div>
            )}
          </div>

          {/* Bottom Run Code bar */}
          <div className="flex items-center justify-between px-5 py-3 bg-panel border-t border-panel-border flex-shrink-0">
            <div className="flex items-center gap-2">
              {/* stdin inline preview */}
              {stdin.trim() && (
                <span className="text-xs font-mono text-accent/60 truncate max-w-[200px]">
                  stdin: {stdin.split('\n').join(' ↵ ')}
                </span>
              )}
            </div>
            <div className="flex gap-3 items-center">
              {!isReady ? (
                <button disabled className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[var(--panel-2)] text-text-muted text-sm font-bold cursor-not-allowed select-none">
                  <Loader2 className="h-4 w-4 animate-spin text-accent" /> Booting…
                </button>
              ) : isRunning ? (
                <button
                  onClick={cancelExecution}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-danger/15 text-danger border border-danger/30 text-sm font-bold hover:bg-danger/25 transition cursor-pointer"
                >
                  <Square className="h-4 w-4 fill-current" /> Stop
                </button>
              ) : (
                <button
                  onClick={handleRun}
                  className="flex items-center gap-2 px-8 py-3 rounded-full bg-accent hover:bg-accent-hover text-white text-sm font-bold shadow-lg shadow-accent/30 transition-all duration-200 transform hover:scale-105 cursor-pointer"
                >
                  <Zap className="h-4 w-4 fill-current" /> Run Code
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── INPUT / OUTPUT TAB ── */}
        <div
          ref={ioColRef}
          className={`flex flex-col flex-1 min-h-0 ${tab !== 'io' ? 'hidden' : ''}`}
        >
          {/* ── INPUT pane ── */}
          <div
            className="flex flex-col min-h-0 overflow-hidden"
            style={{ height: `${ioPct}%` }}
          >
            {/* Input header */}
            <div className="flex items-center justify-between px-5 py-2.5 bg-panel border-b border-panel-border flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-text-primary">Input</span>
                <ChevronDown className="h-4 w-4 text-text-muted/40" />
              </div>
              {stdin.trim() && (
                <button
                  onClick={() => setStdin('')}
                  className="text-xs font-mono text-text-muted/30 hover:text-text-muted transition cursor-pointer"
                >
                  clear
                </button>
              )}
            </div>
            {/* Input textarea */}
            <textarea
              value={stdin}
              onChange={e => setStdin(e.target.value)}
              placeholder="Enter program input here (one value per line)..."
              spellCheck={false}
              className="flex-1 min-h-0 w-full bg-[var(--code-bg)] text-[var(--code)] font-mono text-[15px] leading-relaxed p-5 resize-none focus:outline-none placeholder-text-muted/30 border-0"
              style={{ fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace" }}
            />
          </div>

          {/* ── IO DRAG HANDLE ── */}
          <div
            onMouseDown={startIoDrag}
            className="flex-shrink-0 h-[12px] bg-[var(--panel-2)] cursor-row-resize relative group flex items-center justify-center border-y border-panel-border"
          >
            <div className="flex gap-1.5">
              {[0,1,2].map(i => (
                <span
                  key={i}
                  className="block w-2 h-2 rounded-full bg-text-muted/30 group-hover:bg-accent/60 transition-colors"
                />
              ))}
            </div>
          </div>

          {/* ── OUTPUT pane ── */}
          <div
            className="flex flex-col min-h-0 overflow-hidden"
            style={{ height: `${100 - ioPct}%` }}
          >
            {/* Output header */}
            <div className="flex items-center justify-between px-5 py-2.5 bg-panel border-b border-panel-border flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-text-primary">Output</span>
                <ChevronDown className="h-4 w-4 text-text-muted/40" />
              </div>
              <div className="flex items-center gap-3">
                {consoleLines.some(l => l.type === 'error') && (
                  <span className="flex items-center gap-1.5 text-xs text-danger font-mono font-bold">
                     <AlertCircle className="h-3.5 w-3.5" /> error
                  </span>
                )}
                {consoleLines.length > 0 && !consoleLines.some(l => l.type === 'error' || l.type === 'err') && (
                  <span className="text-xs text-success font-mono font-bold">✓ success</span>
                )}
                {consoleLines.length > 0 && (
                  <button
                    onClick={() => setConsoleLines([])}
                    className="text-xs font-mono text-text-muted/30 hover:text-text-muted transition cursor-pointer"
                  >
                    clear
                  </button>
                )}
                {/* Run button in IO tab too */}
                {isReady && !isRunning && (
                  <button
                    onClick={handleRun}
                    className="flex items-center gap-1.5 px-4 py-1 rounded-full bg-accent hover:bg-accent-hover text-white text-xs font-bold transition cursor-pointer ml-1"
                  >
                    <Play className="h-3 w-3 fill-current" /> Run
                  </button>
                )}
                {isRunning && (
                  <button
                    onClick={cancelExecution}
                    className="flex items-center gap-1.5 px-4 py-1 rounded-full bg-danger/15 text-danger border border-danger/30 text-xs font-bold transition cursor-pointer ml-1"
                  >
                    <Square className="h-3 w-3 fill-current" /> Stop
                  </button>
                )}
              </div>
            </div>

            {/* Console lines */}
            <div
              className="flex-1 min-h-0 overflow-y-auto px-5 py-4 bg-[var(--code-bg)]"
              style={{ fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace" }}
            >
              {consoleLines.length === 0 ? (
                <div className="text-text-muted/40 text-[14px] font-mono italic select-none space-y-0.5">
                  <div>$ python practice.py</div>
                  <div>  # output will appear here…</div>
                </div>
              ) : (
                consoleLines.map(line => (
                  <pre
                    key={line.id}
                    className={`text-[15px] leading-relaxed whitespace-pre-wrap break-words ${lineClr[line.type]}`}
                  >
                    {line.type === 'error' ? (
                      <span className="flex items-start gap-1.5">
                        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-danger" />
                        {line.text}
                      </span>
                    ) : line.text}
                  </pre>
                ))
              )}
              <div ref={consoleEndRef} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TopicPanels;
