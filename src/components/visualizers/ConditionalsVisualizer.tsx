import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

interface ConditionalsVisualizerProps {
  executionResult?: any;
  currentStep?: number;
}

export const ConditionalsVisualizer: React.FC<ConditionalsVisualizerProps> = () => {
  const [age, setAge] = useState(15);
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const intervalRef = useRef<any>(null);

  // We have 4 steps in this animation
  // Step 0: Setup, Age loaded.
  // Step 1: Check 'if age < 13'
  // Step 2: Check 'elif age < 20' (only if step 1 was false)
  // Step 3: Else path (only if step 1 and step 2 were false)

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setStep((prev) => {
          // Determine the terminal step based on age
          const maxStep = age < 13 ? 1 : age < 20 ? 2 : 3;
          if (prev >= maxStep) {
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
  }, [isPlaying, age, speed]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleStepForward = () => {
    setIsPlaying(false);
    const maxStep = age < 13 ? 1 : age < 20 ? 2 : 3;
    if (step < maxStep) setStep(step + 1);
  };
  const handleStepBackward = () => {
    setIsPlaying(false);
    if (step > 0) setStep(step - 1);
  };
  const handleReset = () => {
    setIsPlaying(false);
    setStep(0);
  };

  // Determine node states
  // node1: checking age < 13
  // node2: checking age < 20
  const node1State = step >= 1 ? (age < 13 ? 'TRUE' : 'FALSE') : 'PENDING';
  const node2State = step >= 2 ? (age < 20 ? 'TRUE' : 'FALSE') : 'PENDING';

  return (
    <div className="flex flex-col w-full text-slate-200">
      {/* Age Input Slider */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-400">INPUT VALUE:</span>
          <span className="px-2 py-0.5 bg-slate-950 text-amber-400 font-mono font-bold rounded border border-slate-800">
            age = {age}
          </span>
        </div>
        <input
          type="range"
          min="5"
          max="35"
          value={age}
          onChange={(e) => {
            setAge(Number(e.target.value));
            setStep(0);
            setIsPlaying(false);
          }}
          className="w-40 accent-amber-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Decision Tree Visual Area */}
      <div className="flex flex-col items-center justify-center h-[200px] border border-slate-800 bg-slate-950/40 rounded-2xl p-4 relative font-semibold">
        {/* Node 1: age < 13 */}
        <div className="flex flex-col items-center gap-1 z-10">
          <div
            className={`px-3 py-1.5 rounded-xl border text-xs text-center min-w-32 shadow-xl transition-all duration-300 ${
              step >= 1
                ? node1State === 'TRUE'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 scale-105 shadow-emerald-500/10'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400/80'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <div className="text-[9px] text-slate-500 font-bold">IF CHECK</div>
            <span>age &lt; 13 ?</span>
          </div>

          {/* Child Node result on True */}
          {node1State === 'TRUE' && (
            <div className="flex flex-col items-center mt-2 animate-bounce">
              <span className="text-emerald-400 text-xs">➔ True</span>
              <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-mono mt-1">
                Output: "Child"
              </div>
            </div>
          )}
        </div>

        {/* Vertical arrow pointer if false */}
        {step >= 1 && node1State === 'FALSE' && (
          <div className="text-[10px] text-rose-400 flex flex-col items-center my-0.5 animate-fadeIn">
            <span>False ➔</span>
          </div>
        )}

        {/* Node 2: age < 20 */}
        {step >= 1 && node1State === 'FALSE' && (
          <div className="flex flex-col items-center gap-1 z-10 animate-fadeIn">
            <div
              className={`px-3 py-1.5 rounded-xl border text-xs text-center min-w-32 shadow-xl transition-all duration-300 ${
                step >= 2
                  ? node2State === 'TRUE'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 scale-105 shadow-emerald-500/10'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400/80'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <div className="text-[9px] text-slate-500 font-bold">ELIF CHECK</div>
              <span>age &lt; 20 ?</span>
            </div>

            {/* Teenager Result node */}
            {node2State === 'TRUE' && (
              <div className="flex flex-col items-center mt-2 animate-bounce">
                <span className="text-emerald-400 text-xs">➔ True</span>
                <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-mono mt-1">
                  Output: "Teenager"
                </div>
              </div>
            )}
          </div>
        )}

        {/* Arrow pointer if False */}
        {step >= 2 && node2State === 'FALSE' && node1State === 'FALSE' && (
          <div className="text-[10px] text-rose-400 flex flex-col items-center my-0.5 animate-fadeIn">
            <span>False ➔</span>
          </div>
        )}

        {/* Node 3: else block */}
        {step >= 2 && node2State === 'FALSE' && node1State === 'FALSE' && (
          <div className="flex flex-col items-center gap-1 z-10 animate-fadeIn">
            <div
              className={`px-3 py-1.5 rounded-xl border text-xs text-center min-w-32 shadow-xl transition-all duration-300 ${
                step >= 3
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 scale-105'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <div className="text-[9px] text-slate-500 font-bold">ELSE PATH</div>
              <span>Catch All</span>
            </div>
            {step >= 3 && (
              <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-mono mt-1 animate-bounce">
                Output: "Adult"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Control Buttons */}
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
