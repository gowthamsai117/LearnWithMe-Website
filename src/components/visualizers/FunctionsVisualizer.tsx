import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

interface StackFrame {
  name: string;
  variables: Record<string, any>;
  returnTarget?: string;
}

interface FunctionsState {
  codeLineHighlight: number;
  stack: StackFrame[];
  description: string;
}

interface FunctionsVisualizerProps {
  executionResult?: any;
  currentStep?: number;
}

export const FunctionsVisualizer: React.FC<FunctionsVisualizerProps> = () => {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1200);
  const intervalRef = useRef<any>(null);

  const steps: FunctionsState[] = [
    {
      codeLineHighlight: 6, // def main() or main() call
      stack: [],
      description: 'Program begins execution at the top level. No function frames exist yet.',
    },
    {
      codeLineHighlight: 7, // main() frame created
      stack: [{ name: 'main()', variables: { a: 5, b: 7 } }],
      description: 'Call main(): Pushes main stack frame. Variables a = 5 and b = 7 are loaded into main namespace.',
    },
    {
      codeLineHighlight: 1, // def add(x, y) call
      stack: [
        { name: 'main()', variables: { a: 5, b: 7 } },
        { name: 'add(x, y)', variables: { x: 5, y: 7 }, returnTarget: 'val' },
      ],
      description: 'Call add(a, b): Pushes add stack frame above main frame. Parameters x and y bind to a and b values (5, 7).',
    },
    {
      codeLineHighlight: 2, // result = x + y
      stack: [
        { name: 'main()', variables: { a: 5, b: 7 } },
        { name: 'add(x, y)', variables: { x: 5, y: 7, result: 12 }, returnTarget: 'val' },
      ],
      description: 'Inside add(x, y): Calculates result = x + y (5 + 7 = 12). Stores local variable result in active frame.',
    },
    {
      codeLineHighlight: 3, // return result
      stack: [
        { name: 'main()', variables: { a: 5, b: 7 } },
        { name: 'add(x, y)', variables: { x: 5, y: 7, result: 12, '[Return]': 12 }, returnTarget: 'val' },
      ],
      description: 'Return statement hit: Returns value 12. Preparing to destroy add() stack frame.',
    },
    {
      codeLineHighlight: 9, // val = add(a, b) result assigned in main
      stack: [{ name: 'main()', variables: { a: 5, b: 7, val: 12 } }],
      description: 'Pops add() frame off stack. Active execution returns to main(), assigning returned value 12 to variable val.',
    },
    {
      codeLineHighlight: 10, // print() call
      stack: [{ name: 'main()', variables: { a: 5, b: 7, val: 12 } }],
      description: 'Print result to stdout console. Program successfully completes.',
    },
    {
      codeLineHighlight: 0,
      stack: [],
      description: 'Popped main() frame off stack. Call stack is empty. Finished.',
    },
  ];

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setStep((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, speed]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleStepForward = () => {
    setIsPlaying(false);
    if (step < steps.length - 1) setStep(step + 1);
  };
  const handleStepBackward = () => {
    setIsPlaying(false);
    if (step > 0) setStep(step - 1);
  };
  const handleReset = () => {
    setIsPlaying(false);
    setStep(0);
  };

  const active = steps[step];

  return (
    <div className="flex flex-col w-full text-slate-200">
      {/* Step Info */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 mb-4 text-xs font-mono">
        <span className="font-bold text-slate-400">CALL STACK ACTIVITY</span>
        <span className="text-[10px] text-slate-500 font-bold">
          Step {step + 1} / {steps.length}
        </span>
      </div>

      {/* Description */}
      <div className="text-xs text-slate-400 min-h-[32px] mb-4 text-center leading-relaxed px-2">
        {active.description}
      </div>

      {/* Call Stack drawing canvas */}
      <div className="flex flex-col items-center justify-end h-[220px] border border-slate-800 bg-slate-950/45 rounded-2xl p-4 gap-2.5 overflow-hidden">
        {active.stack.length === 0 ? (
          <div className="text-xs text-slate-600 italic h-full flex items-center justify-center">
            Call Stack is Empty
          </div>
        ) : (
          [...active.stack].reverse().map((frame, idx) => (
            <div
              key={idx}
              className={`w-52 rounded-xl border p-2.5 flex flex-col shadow-lg transition-all duration-300 animate-fadeIn ${
                idx === 0
                  ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 scale-105 shadow-cyan-500/5'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-500 text-xs'
              }`}
            >
              {/* Frame Title */}
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider mb-1.5 border-b border-slate-800/60 pb-1">
                <span>{frame.name}</span>
                {idx === 0 && <span className="text-[8px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-1 rounded">Active</span>}
              </div>

              {/* Local Scopes variables */}
              <div className="flex flex-col gap-1 text-[10px] font-mono">
                {Object.entries(frame.variables).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center bg-slate-950/40 px-2 py-0.5 rounded border border-slate-900">
                    <span className="font-semibold text-slate-400">{key}:</span>
                    <span className={idx === 0 ? 'text-cyan-400 font-bold' : 'text-slate-500'}>
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Controls Footer */}
      <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-900 px-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            title="Reset"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={handleStepBackward}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            title="Step Back"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            onClick={handlePlayPause}
            className="px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Play</span>
              </>
            )}
          </button>
          <button
            onClick={handleStepForward}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            title="Step Forward"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Speed</span>
          <input
            type="range"
            min="300"
            max="2000"
            step="100"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-24 accent-cyan-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-[10px] font-mono text-slate-400 w-8">{speed}ms</span>
        </div>
      </div>
    </div>
  );
};
