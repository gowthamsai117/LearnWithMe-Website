import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

interface DPStep {
  i: number;
  dpState: (number | null)[];
  dependencies: number[];
  description: string;
}

interface DPVisualizerProps {
  executionResult?: any;
  currentStep?: number;
}

export const DPVisualizer: React.FC<DPVisualizerProps> = () => {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1200);
  const intervalRef = useRef<any>(null);

  const steps: DPStep[] = [
    {
      i: 1,
      dpState: [0, 1, null, null, null, null, null],
      dependencies: [],
      description: 'Base Cases: Initialize dp[0] = 0 and dp[1] = 1. These require no computations.',
    },
    {
      i: 2,
      dpState: [0, 1, 1, null, null, null, null],
      dependencies: [0, 1],
      description: 'Compute dp[2]: dp[2] = dp[1] + dp[0] = 1 + 0 = 1. Cell depends on previous two answers.',
    },
    {
      i: 3,
      dpState: [0, 1, 1, 2, null, null, null],
      dependencies: [1, 2],
      description: 'Compute dp[3]: dp[3] = dp[2] + dp[1] = 1 + 1 = 2. Notice how we reuse the cached values in O(1).',
    },
    {
      i: 4,
      dpState: [0, 1, 1, 2, 3, null, null],
      dependencies: [2, 3],
      description: 'Compute dp[4]: dp[4] = dp[3] + dp[2] = 2 + 1 = 3. Dynamic programming saves us from resolving subsets.',
    },
    {
      i: 5,
      dpState: [0, 1, 1, 2, 3, 5, null],
      dependencies: [3, 4],
      description: 'Compute dp[5]: dp[5] = dp[4] + dp[3] = 3 + 2 = 5.',
    },
    {
      i: 6,
      dpState: [0, 1, 1, 2, 3, 5, 8],
      dependencies: [4, 5],
      description: 'Compute dp[6]: dp[6] = dp[5] + dp[4] = 5 + 3 = 8. Tabulation completed up to N=6.',
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
      {/* Formula monitor header */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 mb-4 text-xs font-mono">
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-bold">RECURRENCE:</span>
            <span className="px-2 py-0.5 bg-slate-950 text-cyan-400 font-bold rounded border border-slate-800">
              dp[i] = dp[i-1] + dp[i-2]
            </span>
          </div>
          {active.dependencies.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
              <span>dp[{active.i}] = dp[{active.i-1}] + dp[{active.i-2}]</span>
            </div>
          )}
        </div>
        <div className="text-[10px] text-slate-500 font-bold">
          Step {step + 1} / {steps.length}
        </div>
      </div>

      {/* Description */}
      <div className="text-xs text-slate-400 min-h-[32px] mb-4 text-center leading-relaxed px-2">
        {active.description}
      </div>

      {/* DP Grid visual canvas */}
      <div className="flex flex-col items-center justify-center h-[200px] border border-slate-800 bg-slate-950/40 rounded-2xl p-4 gap-4 relative select-none">
        
        {/* Tabulation Cells row */}
        <div className="flex gap-1.5 items-center relative py-2">
          {active.dpState.map((val, idx) => {
            const isActiveCalculated = idx === active.i && val !== null;
            const isDependency = active.dependencies.includes(idx);
            const isCalculatedBefore = val !== null && idx < active.i;

            return (
              <div key={idx} className="flex flex-col items-center relative">
                {/* Index label */}
                <span className="text-[8px] font-mono text-slate-600 font-bold mb-1">dp[{idx}]</span>

                {/* Grid cell */}
                <div
                  className={`w-9 h-9 flex items-center justify-center rounded-lg font-bold font-mono text-xs border transition-all duration-300 ${
                    isActiveCalculated
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 scale-105 shadow-md shadow-amber-500/10'
                      : isDependency
                      ? 'bg-cyan-500/25 border-cyan-500 text-cyan-300'
                      : isCalculatedBefore
                      ? 'bg-slate-900/80 border-slate-800/80 text-slate-400'
                      : 'bg-slate-950/40 border-slate-900/60 text-slate-700 border-dashed'
                  }`}
                >
                  {val !== null ? val : '-'}
                </div>

                {/* Sub-arrows or flags representing calculation dependencies */}
                {isDependency && (
                  <span className="absolute -bottom-4 text-[7px] font-bold text-cyan-400 font-sans">
                    Ref
                  </span>
                )}
                {isActiveCalculated && (
                  <span className="absolute -bottom-4 text-[7px] font-bold text-amber-400 font-sans">
                    Calc
                  </span>
                )}
              </div>
            );
          })}
        </div>
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
