import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { usePyodide } from '../hooks/usePyodide';
import { useProgress } from '../context/ProgressContext';
import { Play, Square, RotateCcw, CheckCircle, Terminal, AlertCircle, Loader2 } from 'lucide-react';
// @ts-ignore
import confetti from 'canvas-confetti';

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
    const result = await runCode(code, visualizerId);

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
            className="p-1.5 rounded-lg border border-panel-border text-text-muted hover:text-text-primary hover:bg-[#1C223C] transition cursor-pointer"
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
          defaultLanguage="python"
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "var(--font-mono)",
            automaticLayout: true,
            tabSize: 4,
            padding: { top: 12, bottom: 12 },
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            lineNumbersMinChars: 3,
            scrollbar: {
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
            }
          }}
        />
        {!isReady && (
          <div className="absolute inset-0 bg-[#0A0D18]/85 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 z-30">
            <Loader2 className="h-7 w-7 text-accent animate-spin" />
            <span className="text-xs font-mono text-text-muted">
              Initializing Python WASM Compiler...
            </span>
          </div>
        )}
      </div>

      {/* Output Console Log */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-panel-border h-[130px] bg-[#0A0D18] font-mono text-xs">
        
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
              <pre className="text-text-primary whitespace-pre-wrap">{stdout}</pre>
            )}
            {stderr && (
              <pre className="text-warning whitespace-pre-wrap mt-1">[STDERR] {stderr}</pre>
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
              className="w-full h-full bg-[#0A0D18] border border-panel-border px-3 py-1 rounded-lg text-xs text-text-primary placeholder-text-muted/30 focus:outline-none focus:border-accent font-mono"
            />
          </div>
        </div>

      </div>

    </div>
  );
};
export default PracticePanel;
