import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

interface LoopState {
  i: number;
  total: number;
  block: 'INIT' | 'COND' | 'BODY' | 'INC' | 'DONE';
  description: string;
}

interface LoopsVisualizerProps {
  executionResult?: any;
  currentStep?: number;
}

export const LoopsVisualizer: React.FC<LoopsVisualizerProps> = () => {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const intervalRef = useRef<any>(null);

  const loopSteps: LoopState[] = [
    { i: 0, total: 0, block: 'INIT', description: 'Initialize total = 0. Range starts i at 0.' },
    { i: 0, total: 0, block: 'COND', description: 'Check condition: Is i (0) < 4? Yes (True).' },
    { i: 0, total: 0, block: 'BODY', description: 'Execute body: total = 0 + 0 = 0. Print value.' },
    { i: 1, total: 0, block: 'INC', description: 'Increment: Move to next index in range. i is now 1.' },
    { i: 1, total: 0, block: 'COND', description: 'Check condition: Is i (1) < 4? Yes (True).' },
    { i: 1, total: 1, block: 'BODY', description: 'Execute body: total = 0 + 1 = 1. Print value.' },
    { i: 2, total: 1, block: 'INC', description: 'Increment: Move to next index in range. i is now 2.' },
    { i: 2, total: 1, block: 'COND', description: 'Check condition: Is i (2) < 4? Yes (True).' },
    { i: 2, total: 3, block: 'BODY', description: 'Execute body: total = 1 + 2 = 3. Print value.' },
    { i: 3, total: 3, block: 'INC', description: 'Increment: Move to next index in range. i is now 3.' },
    { i: 3, total: 3, block: 'COND', description: 'Check condition: Is i (3) < 4? Yes (True).' },
    { i: 3, total: 6, block: 'BODY', description: 'Execute body: total = 3 + 3 = 6. Print value.' },
    { i: 4, total: 6, block: 'INC', description: 'Increment: Move to next index in range. i is now 4.' },
    { i: 4, total: 6, block: 'COND', description: 'Check condition: Is i (4) < 4? No (False).' },
    { i: 4, total: 6, block: 'DONE', description: 'Loop conditions failed. Program completes.' },
  ];

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setStep((prev) => {
          if (prev >= loopSteps.length - 1) {
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
    if (step < loopSteps.length - 1) setStep(step + 1);
  };
  const handleStepBackward = () => {
    setIsPlaying(false);
    if (step > 0) setStep(step - 1);
  };
  const handleReset = () => {
    setIsPlaying(false);
    setStep(0);
  };

  const active = loopSteps[step];

  return (
    <div className="flex flex-col w-full text-slate-200">
      {/* State Monitor Row */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 mb-4 text-xs font-mono">
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-bold">i:</span>
            <span className="px-2 py-0.5 bg-slate-950 text-cyan-400 font-bold rounded border border-slate-800">
              {active.i}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-bold">total:</span>
            <span className="px-2 py-0.5 bg-slate-950 text-emerald-400 font-bold rounded border border-slate-800">
              {active.total}
            </span>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 font-bold">
          Step {step + 1} / {loopSteps.length}
        </div>
      </div>

      {/* Description text */}
      <div className="text-xs text-slate-400 min-h-[32px] mb-4 text-center leading-relaxed px-2">
        {active.description}
      </div>

      {/* Loop Flowchart representation */}
      <div className="flex items-center justify-around h-[200px] border border-slate-800 bg-slate-950/40 rounded-2xl p-4 gap-2 relative text-xs">
        {/* Step 1: Initializer Block */}
        <div
          className={`px-3 py-2 rounded-xl border text-center transition-all duration-300 ${
            active.block === 'INIT'
              ? 'bg-amber-500/20 border-amber-500 text-amber-300 scale-105 shadow-lg shadow-amber-500/5'
              : 'bg-slate-900 border-slate-800/80 text-slate-500'
          }`}
        >
          <div className="font-bold text-[9px] uppercase tracking-wider mb-0.5">Initializer</div>
          <span>total = 0, i = 0</span>
        </div>

        {/* Pointer Arrow */}
        <span className="text-slate-700 text-lg font-mono">➔</span>

        {/* Step 2: Loop condition check */}
        <div
          className={`px-3 py-2 rounded-xl border text-center transition-all duration-300 relative ${
            active.block === 'COND'
              ? 'bg-amber-500/20 border-amber-500 text-amber-300 scale-105 shadow-lg shadow-amber-500/5'
              : 'bg-slate-900 border-slate-800/80 text-slate-500'
          }`}
        >
          <div className="font-bold text-[9px] uppercase tracking-wider mb-0.5">Check</div>
          <span>i &lt; 4 ?</span>
          {active.block === 'COND' && (
            <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-bold px-1 rounded ${
              active.i < 4 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' : 'bg-rose-500/10 text-rose-400 border border-rose-500/25'
            }`}>
              {active.i < 4 ? 'True' : 'False'}
            </span>
          )}
        </div>

        {/* Pointer Arrow */}
        <span className="text-slate-700 text-lg font-mono">➔</span>

        {/* Step 3: Loop body */}
        <div
          className={`px-3 py-2 rounded-xl border text-center transition-all duration-300 ${
            active.block === 'BODY'
              ? 'bg-amber-500/20 border-amber-500 text-amber-300 scale-105 shadow-lg shadow-amber-500/5'
              : 'bg-slate-900 border-slate-800/80 text-slate-500'
          }`}
        >
          <div className="font-bold text-[9px] uppercase tracking-wider mb-0.5">Body</div>
          <span>total += i</span>
        </div>

        {/* Pointer Arrow */}
        <span className="text-slate-700 text-lg font-mono">➔</span>

        {/* Step 4: Increment */}
        <div
          className={`px-3 py-2 rounded-xl border text-center transition-all duration-300 ${
            active.block === 'INC'
              ? 'bg-amber-500/20 border-amber-500 text-amber-300 scale-105 shadow-lg shadow-amber-500/5'
              : 'bg-slate-900 border-slate-800/80 text-slate-500'
          }`}
        >
          <div className="font-bold text-[9px] uppercase tracking-wider mb-0.5">Step</div>
          <span>i += 1</span>
        </div>
      </div>

      {/* Control Panel Buttons */}
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
            className="px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
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
            className="w-24 accent-amber-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-[10px] font-mono text-slate-400 w-8">{speed}ms</span>
        </div>
      </div>
    </div>
  );
};
