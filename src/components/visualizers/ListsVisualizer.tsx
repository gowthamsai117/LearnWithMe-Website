import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

interface ListState {
  size: number;
  capacity: number;
  array: (number | null)[];
  description: string;
  isResizing: boolean;
}

interface ListsVisualizerProps {
  executionResult?: any;
  currentStep?: number;
}

export const ListsVisualizer: React.FC<ListsVisualizerProps> = () => {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1200);
  const intervalRef = useRef<any>(null);

  const steps: ListState[] = [
    {
      size: 0,
      capacity: 0,
      array: [],
      description: 'Initial state. The list is empty, with capacity 0 and size 0.',
      isResizing: false,
    },
    {
      size: 1,
      capacity: 4,
      array: [10, null, null, null],
      description: 'Append 10: Python allocates a dynamic array of capacity 4 (standard overallocation) and inserts 10 at index 0.',
      isResizing: false,
    },
    {
      size: 2,
      capacity: 4,
      array: [10, 20, null, null],
      description: 'Append 20: Array has free slots. Insert 20 at index 1. Capacity remains 4.',
      isResizing: false,
    },
    {
      size: 3,
      capacity: 4,
      array: [10, 20, 30, null],
      description: 'Append 30: Insert 30 at index 2. Size becomes 3/4. No resizing needed.',
      isResizing: false,
    },
    {
      size: 4,
      capacity: 4,
      array: [10, 20, 30, 40],
      description: 'Append 40: Insert 40 at index 3. Size is now 4. Array is completely full.',
      isResizing: false,
    },
    {
      size: 4,
      capacity: 8,
      array: [10, 20, 30, 40, null, null, null, null],
      description: 'Resizing Triggered! Python allocates a new contiguous memory space of capacity 8 and copies all 4 values over.',
      isResizing: true,
    },
    {
      size: 5,
      capacity: 8,
      array: [10, 20, 30, 40, 50, null, null, null],
      description: 'Append 50: Insert 50 at index 4 of the new resized array. Size becomes 5/8.',
      isResizing: false,
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
      {/* Metrics Row */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 mb-4 text-xs font-mono">
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-bold">SIZE:</span>
            <span className="px-2 py-0.5 bg-slate-950 text-cyan-400 font-bold rounded border border-slate-800">
              {active.size}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-bold">CAPACITY:</span>
            <span className="px-2 py-0.5 bg-slate-950 text-emerald-400 font-bold rounded border border-slate-800">
              {active.capacity}
            </span>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 font-bold">
          Step {step + 1} / {steps.length}
        </div>
      </div>

      {/* Description text */}
      <div className="text-xs text-slate-400 min-h-[32px] mb-4 text-center leading-relaxed px-2">
        {active.description}
      </div>

      {/* Dynamic Array visualizer canvas */}
      <div className="flex items-center justify-center h-[200px] border border-slate-800 bg-slate-950/40 rounded-2xl p-4 gap-1 relative">
        {active.capacity === 0 ? (
          <div className="text-xs text-slate-600 italic">No Memory Allocated yet. (Capacity: 0)</div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-1.5">
              {active.array.map((val, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  {/* Array Index */}
                  <span className="text-[9px] font-mono text-slate-600 font-bold mb-1">[{idx}]</span>
                  
                  {/* Element Slot */}
                  <div
                    className={`w-9 h-9 flex items-center justify-center rounded-lg font-bold font-mono text-xs border transition-all duration-300 ${
                      val !== null
                        ? active.isResizing
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300 scale-105 animate-pulse'
                          : 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-600 border-dashed'
                    }`}
                  >
                    {val !== null ? val : '-'}
                  </div>
                </div>
              ))}
            </div>

            {/* Overallocation Indicator label */}
            {active.isResizing && (
              <span className="text-[9px] uppercase font-extrabold text-rose-500 tracking-wider animate-bounce mt-2">
                Memory Reallocation & Array Copy!
              </span>
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
            className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
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
            className="w-24 accent-emerald-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-[10px] font-mono text-slate-400 w-8">{speed}ms</span>
        </div>
      </div>
    </div>
  );
};
