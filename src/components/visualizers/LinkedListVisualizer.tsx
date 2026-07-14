import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

interface LLStep {
  slowIdx: number;
  fastIdx: number;
  description: string;
  isDone: boolean;
}

interface LinkedListVisualizerProps {
  executionResult?: any;
  currentStep?: number;
}

export const LinkedListVisualizer: React.FC<LinkedListVisualizerProps> = () => {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1500);
  const intervalRef = useRef<any>(null);

  const nodes = [10, 20, 30, 40, 50];

  const steps: LLStep[] = [
    {
      slowIdx: 0,
      fastIdx: 0,
      description: 'Start: Both Slow (S) and Fast (F) pointers are initialized at the head of the Linked List Node(10).',
      isDone: false,
    },
    {
      slowIdx: 1,
      fastIdx: 2,
      description: 'Step 1: Slow pointer moves 1 step to Node(20). Fast pointer moves 2 steps to Node(30).',
      isDone: false,
    },
    {
      slowIdx: 2,
      fastIdx: 4,
      description: 'Step 2: Slow pointer moves 1 step to Node(30). Fast pointer moves 2 steps to Node(50) (tail element).',
      isDone: false,
    },
    {
      slowIdx: 2,
      fastIdx: 5, // Null / past boundary
      description: 'Done: Fast pointer reaches the end. The slow pointer points to Node(30) which is the exact middle of the Linked List!',
      isDone: true,
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
      {/* State Monitor */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 mb-4 text-xs font-mono">
        <span className="font-bold text-slate-400">POINTER LOCATIONS</span>
        <div className="flex gap-4 text-[10px] text-slate-500">
          <span className="text-cyan-400 font-bold">Slow (S) Index: {active.slowIdx}</span>
          <span className="text-amber-400 font-bold">
            Fast (F) Index: {active.fastIdx >= nodes.length ? 'None (NULL)' : active.fastIdx}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="text-xs text-slate-400 min-h-[32px] mb-4 text-center leading-relaxed px-2">
        {active.description}
      </div>

      {/* Linked list visual canvas (custom SVG arrow lines + circles) */}
      <div className="flex items-center justify-center h-[200px] border border-slate-800 bg-slate-950/40 rounded-2xl p-4 gap-0 relative select-none overflow-x-auto">
        <div className="flex items-center">
          {nodes.map((val, idx) => {
            const isSlow = idx === active.slowIdx;
            const isFast = idx === active.fastIdx;
            const isMiddle = active.isDone && idx === active.slowIdx;

            return (
              <React.Fragment key={idx}>
                {/* Node Container */}
                <div className="flex flex-col items-center relative w-12">
                  
                  {/* Slow/Fast pointer indicators floating above */}
                  <div className="absolute -top-7 h-6 flex gap-1 justify-center items-center text-[8px] font-bold font-mono text-center w-full">
                    {isSlow && <span className="px-1 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">S</span>}
                    {isFast && <span className="px-1 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/25">F</span>}
                  </div>

                  {/* Circular Node representation */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border transition-all duration-300 ${
                      isMiddle
                        ? 'bg-emerald-500/25 border-emerald-500 text-emerald-300 scale-110 shadow-md shadow-emerald-500/10'
                        : isSlow || isFast
                        ? 'bg-slate-900 border-cyan-500/80 text-cyan-300'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    {val}
                  </div>
                </div>

                {/* Arrow pointers linking nodes (except for final tail node) */}
                {idx < nodes.length - 1 && (
                  <div className="w-6 flex items-center justify-center">
                    <svg className="w-full h-4 text-slate-700" viewBox="0 0 24 16">
                      <defs>
                        <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
                        </marker>
                      </defs>
                      <line x1="0" y1="8" x2="20" y2="8" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrow)" />
                    </svg>
                  </div>
                )}
              </React.Fragment>
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
