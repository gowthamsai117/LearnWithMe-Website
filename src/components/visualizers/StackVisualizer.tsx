import React, { useState } from 'react';
import { Plus, Minus, RotateCcw } from 'lucide-react';

interface StackVisualizerProps {
  executionResult?: any;
  currentStep?: number;
}

export const StackVisualizer: React.FC<StackVisualizerProps> = () => {
  const [mode, setMode] = useState<'stack' | 'queue'>('stack');
  const [items, setItems] = useState<number[]>([10, 20, 30]);

  const handlePush = () => {
    if (items.length >= 5) {
      alert("Container is full! Remove elements before adding more.");
      return;
    }
    const val = (items[items.length - 1] || 0) + 10;
    setItems([...items, val]);
  };

  const handlePop = () => {
    if (items.length === 0) return;
    setItems(items.slice(0, -1)); // Stack LIFO pop from end
  };

  const handleEnqueue = () => {
    if (items.length >= 5) {
      alert("Container is full! Remove elements before adding more.");
      return;
    }
    const val = (items[items.length - 1] || 0) + 10;
    setItems([...items, val]); // Appends to back
  };

  const handleDequeue = () => {
    if (items.length === 0) return;
    setItems(items.slice(1)); // Queue FIFO remove from front
  };

  const handleReset = () => {
    setItems([10, 20, 30]);
  };

  return (
    <div className="flex flex-col w-full text-slate-200">
      {/* Mode Switcher */}
      <div className="flex justify-center border-b border-slate-800 p-0.5 bg-slate-900/40 rounded-xl mb-4">
        <button
          onClick={() => { setMode('stack'); handleReset(); }}
          className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition duration-200 cursor-pointer ${
            mode === 'stack' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Stack (LIFO)
        </button>
        <button
          onClick={() => { setMode('queue'); handleReset(); }}
          className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition duration-200 cursor-pointer ${
            mode === 'queue' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Queue (FIFO)
        </button>
      </div>

      {/* Description */}
      <div className="text-xs text-slate-400 min-h-[24px] mb-4 text-center leading-relaxed px-2">
        {mode === 'stack'
          ? 'Push adds to the top. Pop retrieves from the top. Last In, First Out (LIFO).'
          : 'Enqueue adds to the back. Dequeue retrieves from the front. First In, First Out (FIFO).'}
      </div>

      {/* Visual Canvas Box */}
      <div className="flex flex-col items-center justify-center h-[200px] border border-slate-800 bg-slate-950/40 rounded-2xl p-4 relative select-none">
        
        {/* Stack Mode: Vertical Beaker Container */}
        {mode === 'stack' && (
          <div className="flex flex-col-reverse items-center justify-start border-2 border-slate-700 border-t-0 w-32 h-[150px] p-2 gap-1.5 rounded-b-xl relative bg-slate-900/10">
            {items.length === 0 ? (
              <span className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-600 italic">Empty Stack</span>
            ) : (
              items.map((val, idx) => (
                <div
                  key={val}
                  className="w-full py-2 flex items-center justify-center font-mono font-bold text-xs bg-cyan-500/20 border border-cyan-500 text-cyan-300 rounded-lg animate-slideDown relative"
                >
                  {val}
                  {idx === items.length - 1 && (
                    <span className="absolute -right-16 text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 py-0.5 rounded font-sans">
                      Top
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Queue Mode: Horizontal tube pathway */}
        {mode === 'queue' && (
          <div className="flex items-center justify-center gap-1.5 border-y-2 border-slate-700 w-full h-[60px] max-w-sm px-4 relative bg-slate-900/10">
            {items.length === 0 ? (
              <span className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-600 italic">Empty Queue</span>
            ) : (
              items.map((val, idx) => (
                <div
                  key={val}
                  className="w-14 h-10 flex items-center justify-center font-mono font-bold text-xs bg-cyan-500/20 border border-cyan-500 text-cyan-300 rounded-lg animate-slideLeft relative"
                >
                  {val}
                  {idx === 0 && (
                    <span className="absolute -bottom-5 text-[8px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1 py-0.5 rounded font-sans">
                      Front
                    </span>
                  )}
                  {idx === items.length - 1 && (
                    <span className="absolute -top-5 text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 py-0.5 rounded font-sans">
                      Back
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Control Buttons Bar */}
      <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-900 px-2">
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold transition cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset</span>
        </button>

        <div className="flex gap-2">
          {mode === 'stack' ? (
            <>
              <button
                onClick={handlePush}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition text-xs font-bold cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Push()</span>
              </button>
              <button
                onClick={handlePop}
                disabled={items.length === 0}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 disabled:opacity-40 transition text-xs font-bold cursor-pointer"
              >
                <Minus className="h-3.5 w-3.5" />
                <span>Pop()</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleEnqueue}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition text-xs font-bold cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Enqueue()</span>
              </button>
              <button
                onClick={handleDequeue}
                disabled={items.length === 0}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 disabled:opacity-40 transition text-xs font-bold cursor-pointer"
              >
                <Minus className="h-3.5 w-3.5" />
                <span>Dequeue()</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
