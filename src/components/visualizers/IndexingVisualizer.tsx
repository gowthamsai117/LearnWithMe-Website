import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';

interface IndexingVisualizerProps {
  executionResult?: any;
  currentStep?: number;
}

export const IndexingVisualizer: React.FC<IndexingVisualizerProps> = () => {
  const [start, setStart] = useState<number>(1);
  const [stop, setStop] = useState<number>(5);
  const [step, setStep] = useState<number>(1);

  const text = "PYTHON";
  const length = text.length;

  // Resolve positive/negative index to standard positive index
  const resolveIndex = (idx: number) => {
    if (idx < 0) return Math.max(0, length + idx);
    return Math.min(length, idx);
  };

  const startResolved = resolveIndex(start);
  const stopResolved = resolveIndex(stop);

  // Compute matching indices of slice
  const getSlicedIndices = () => {
    const indices: number[] = [];
    if (step > 0) {
      for (let i = startResolved; i < stopResolved; i += step) {
        indices.push(i);
      }
    } else if (step < 0) {
      for (let i = startResolved; i > stopResolved; i += step) {
        indices.push(i);
      }
    }
    return indices;
  };

  const slicedIndices = getSlicedIndices();
  const slicedResult = slicedIndices.map((i) => text[i]).join('');

  const handleReset = () => {
    setStart(1);
    setStop(5);
    setStep(1);
  };

  return (
    <div className="flex flex-col w-full text-slate-200">
      {/* Slicing Formula Header */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 mb-4 text-xs font-mono">
        <div className="flex items-center gap-1">
          <span className="text-slate-400">EXPRESSION:</span>
          <span className="px-2 py-0.5 bg-slate-950 text-yellow-400 font-bold rounded border border-slate-800">
            text[{start === 0 ? '' : start}:{stop === length ? '' : stop}{step !== 1 ? `:${step}` : ''}]
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-slate-400">RESULT:</span>
          <span className="px-2 py-0.5 bg-slate-950 text-emerald-400 font-bold rounded border border-slate-800">
            "{slicedResult}"
          </span>
        </div>
      </div>

      {/* Interactive Grid Canvas */}
      <div className="flex flex-col items-center justify-center h-[200px] border border-slate-800 bg-slate-950/40 rounded-2xl p-4 gap-2 relative">
        <div className="flex gap-1.5 items-center">
          {text.split('').map((char, idx) => {
            const isSliced = slicedIndices.includes(idx);
            const negIdx = idx - length;

            return (
              <div key={idx} className="flex flex-col items-center">
                {/* Positive Index */}
                <span className="text-[10px] font-mono text-slate-500 font-bold mb-1">{idx}</span>

                {/* Character Block Box */}
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold font-mono text-lg border transition-all duration-300 ${
                    isSliced
                      ? 'bg-yellow-500/20 border-yellow-500 text-yellow-300 scale-105 shadow-md shadow-yellow-500/10'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {char}
                </div>

                {/* Negative Index */}
                <span className="text-[10px] font-mono text-slate-500 font-bold mt-1">{negIdx}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Sliders Panel */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-900 px-2 text-[10px] uppercase font-bold tracking-wider text-slate-500">
        {/* Start Slider */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between">
            <span>Start</span>
            <span className="text-slate-300 font-mono">{start}</span>
          </div>
          <input
            type="range"
            min="-6"
            max="6"
            value={start}
            onChange={(e) => setStart(Number(e.target.value))}
            className="w-full accent-yellow-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Stop Slider */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between">
            <span>Stop</span>
            <span className="text-slate-300 font-mono">{stop}</span>
          </div>
          <input
            type="range"
            min="-6"
            max="6"
            value={stop}
            onChange={(e) => setStop(Number(e.target.value))}
            className="w-full accent-yellow-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Reset Button Column */}
        <div className="flex flex-col justify-end">
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition text-xs font-bold cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
