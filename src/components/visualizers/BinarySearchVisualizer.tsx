import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

interface BSearchStep {
  low: number;
  high: number;
  mid: number;
  description: string;
  found: boolean;
}

interface BinarySearchVisualizerProps {
  executionResult?: any;
  currentStep?: number;
}

export const BinarySearchVisualizer: React.FC<BinarySearchVisualizerProps> = () => {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1200);
  const intervalRef = useRef<any>(null);

  const arr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
  const target = 23;

  const steps: BSearchStep[] = [
    {
      low: 0,
      high: 9,
      mid: 4,
      description: 'Start: Low = 0 (2), High = 9 (91). Midpoint is 4 (16). Since 16 < 23, the target must be in the right half. Shift Low to Mid + 1 (5).',
      found: false,
    },
    {
      low: 5,
      high: 9,
      mid: 7,
      description: 'Step 2: Low = 5 (23), High = 9 (91). Midpoint is 7 (56). Since 56 > 23, the target must be in the left half. Shift High to Mid - 1 (6).',
      found: false,
    },
    {
      low: 5,
      high: 6,
      mid: 5,
      description: 'Step 3: Low = 5 (23), High = 6 (38). Midpoint is 5 (23). Mid value matches target (23)! Target found at index 5.',
      found: true,
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
      {/* Target Monitor */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 mb-4 text-xs font-mono">
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-bold">TARGET:</span>
            <span className="px-2 py-0.5 bg-slate-950 text-cyan-400 font-bold rounded border border-slate-800">
              {target}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <span>Low: {active.low}</span>
            <span>|</span>
            <span>High: {active.high}</span>
            <span>|</span>
            <span>Mid: {active.mid}</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 font-bold">
          Step {step + 1} / {steps.length}
        </div>
      </div>

      {/* Description */}
      <div className="text-xs text-slate-400 min-h-[32px] mb-4 text-center leading-relaxed px-2">
        {active.description}
      </div>

      {/* Sorted Array Display Grid */}
      <div className="flex flex-col items-center justify-center h-[200px] border border-slate-800 bg-slate-950/40 rounded-2xl p-4 gap-4 relative select-none">
        <div className="flex gap-1.5 relative">
          {arr.map((val, idx) => {
            const isInside = idx >= active.low && idx <= active.high;
            const isMid = idx === active.mid;
            const isL = idx === active.low;
            const isR = idx === active.high;
            const isFoundResult = active.found && isMid;

            return (
              <div key={idx} className="flex flex-col items-center relative">
                {/* Pointer tags */}
                <span className="absolute -top-4 text-[8px] font-bold font-mono text-cyan-400 text-center w-full">
                  {isMid ? 'M' : isL ? 'L' : isR ? 'H' : ''}
                </span>

                <div
                  className={`w-7 h-7 flex items-center justify-center rounded-lg font-bold font-mono text-[10px] border transition-all duration-300 ${
                    isFoundResult
                      ? 'bg-emerald-500/25 border-emerald-500 text-emerald-300 scale-110 shadow-md shadow-emerald-500/10'
                      : isMid
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : isInside
                      ? 'bg-slate-900 border-slate-800 text-slate-200'
                      : 'bg-slate-950 text-slate-700 border-slate-950/80 scale-95 opacity-20'
                  }`}
                >
                  {val}
                </div>
              </div>
            );
          })}
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
