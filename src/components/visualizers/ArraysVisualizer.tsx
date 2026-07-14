import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ArraysVisualizerProps {
  executionResult?: any;
  currentStep?: number;
}

export const ArraysVisualizer: React.FC<ArraysVisualizerProps> = ({
  executionResult,
  currentStep = 0,
}) => {
  const [activeTab, setActiveTab] = useState<'ops' | 'window' | 'pointers'>('ops');
  
  // Fallbacks if no execution result
  const fallbackArray = [12, 24, 36, 48, 60, 72];
  
  const hasEvents = !!(executionResult?.events && executionResult.events.length > 0);
  const events = executionResult?.events || [];
  const trace = executionResult?.trace || [];
  const hasTrace = trace.length > 0;

  // Reconstruct array state at currentStep
  const arrayState = [...fallbackArray];
  let activeIndex: number | null = null;
  let activeType: 'read' | 'write' | null = null;

  if (hasEvents) {
    // Determine the array elements up to currentStep
    for (let idx = 0; idx <= currentStep; idx++) {
      const ev = events[idx];
      if (!ev) continue;
      
      if (ev.step === 'write') {
        const i = typeof ev.index === 'number' ? ev.index : parseInt(ev.index);
        if (!isNaN(i)) {
          arrayState[i] = ev.value;
          if (idx === currentStep) {
            activeIndex = i;
            activeType = 'write';
          }
        }
      } else if (ev.step === 'read') {
        const i = typeof ev.index === 'number' ? ev.index : parseInt(ev.index);
        if (!isNaN(i) && idx === currentStep) {
          activeIndex = i;
          activeType = 'read';
        }
      } else if (ev.step === 'append') {
        arrayState.push(ev.value);
      } else if (ev.step === 'pop') {
        arrayState.pop();
      }
    }
  }

  // Parse local variables at current step to extract pointers
  const pointers: { label: string; index: number }[] = [];
  if (hasTrace && trace[currentStep]) {
    const locals = trace[currentStep].locals || {};
    Object.entries(locals).forEach(([name, valObj]: [string, any]) => {
      const val = parseInt(valObj.value);
      if (!isNaN(val) && val >= 0 && val < arrayState.length) {
        const lowerName = name.toLowerCase();
        if (lowerName === 'l' || lowerName === 'left' || lowerName === 'low') {
          pointers.push({ label: 'L', index: val });
        } else if (lowerName === 'r' || lowerName === 'right' || lowerName === 'high') {
          pointers.push({ label: 'R', index: val });
        } else if (lowerName === 'mid' || lowerName === 'middle' || lowerName === 'm') {
          pointers.push({ label: 'MID', index: val });
        } else if (lowerName === 'i') {
          pointers.push({ label: 'i', index: val });
        } else if (lowerName === 'j') {
          pointers.push({ label: 'j', index: val });
        }
      }
    });
  }

  // Fallback demo static animations
  const windowArray = [2, 1, 5, 1, 3, 2];
  const windowSize = 3;
  const staticStep = currentStep % 4;

  const pointerArray = [1, 2, 4, 5, 8, 10];
  const staticPointerStep = currentStep % 2;
  const staticPointers = [
    { L: 0, R: 5, sum: 11, desc: 'L=0 (1), R=5 (10). Sum = 11. Decrement R.' },
    { L: 0, R: 4, sum: 9, desc: 'L=0 (1), R=4 (8). Sum = 9. Match found!' },
  ];

  return (
    <div className="flex flex-col w-full text-paper select-none font-mono items-center">
      {/* Warning message if user ran code but didn't instrument any 'arr' operations */}
      {executionResult && !hasEvents && (
        <div className="w-full mb-3 text-xs text-immute bg-immute/5 border border-immute/15 rounded p-2 text-center font-sans">
          Visualizer expects a list named <code className="bg-ink px-1 rounded text-signal font-mono font-bold">arr</code> — rename your variable in the editor to see it animate!
        </div>
      )}

      {/* Mode navigation */}
      {!executionResult ? (
        <div className="flex w-full justify-center bg-ink border border-line rounded p-0.5 mb-4 text-[10px]">
          <button
            onClick={() => setActiveTab('ops')}
            className={`flex-1 py-1 text-center rounded transition ${
              activeTab === 'ops' ? 'bg-panel text-signal font-bold' : 'text-paper/40 hover:text-paper'
            }`}
          >
            Array Ops
          </button>
          <button
            onClick={() => setActiveTab('window')}
            className={`flex-1 py-1 text-center rounded transition ${
              activeTab === 'window' ? 'bg-panel text-signal font-bold' : 'text-paper/40 hover:text-paper'
            }`}
          >
            Sliding Window
          </button>
          <button
            onClick={() => setActiveTab('pointers')}
            className={`flex-1 py-1 text-center rounded transition ${
              activeTab === 'pointers' ? 'bg-panel text-signal font-bold' : 'text-paper/40 hover:text-paper'
            }`}
          >
            Two Pointers
          </button>
        </div>
      ) : (
        <div className="mb-4 text-[10px] text-mutate bg-mutate/5 border border-mutate/15 rounded p-1.5 text-center w-full">
          # live_mode: rendering array variable values and pointer positions detected in trace
        </div>
      )}

      {/* Main Canvas Workspace */}
      <div className="w-full flex items-center justify-center min-h-[170px] border border-line bg-[#12161E]/40 rounded p-4 relative">
        {executionResult ? (
          /* Live Array Canvas */
          <div className="flex flex-col items-center gap-6 w-full">
            <div className="flex gap-2 flex-wrap justify-center relative py-4">
              <AnimatePresence>
                {arrayState.map((val, idx) => {
                  const isRead = idx === activeIndex && activeType === 'read';
                  const isWrite = idx === activeIndex && activeType === 'write';
                  
                  // Find if any pointer variables are currently indexing this slot
                  const activePointers = pointers.filter(p => p.index === idx);

                  return (
                    <motion.div
                      key={idx}
                      layout
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex flex-col items-center relative"
                    >
                      {/* Pointers mapping labels above the slot */}
                      <div className="absolute -top-6 flex flex-col gap-0.5 items-center justify-end h-5 z-20">
                        {activePointers.map((p, pidx) => (
                          <span
                            key={pidx}
                            className="px-1 py-0.2 text-[8px] font-bold rounded bg-signal text-ink leading-none shadow"
                          >
                            {p.label}
                          </span>
                        ))}
                      </div>

                      {/* Element Block */}
                      <div
                        className={`w-10 h-10 flex flex-col items-center justify-center rounded border transition-all duration-300 font-mono ${
                          isWrite
                            ? 'bg-mutate/20 border-mutate text-mutate scale-105 shadow'
                            : isRead
                            ? 'bg-signal/20 border-signal text-signal scale-105 shadow'
                            : 'bg-panel border-line text-paper'
                        }`}
                      >
                        <span className="text-xs font-bold">{val !== null ? val : '-'}</span>
                      </div>
                      
                      {/* Array Index */}
                      <span className="text-[8px] text-paper/30 mt-1">[{idx}]</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          /* Fallback Demo modes */
          <div>
            {activeTab === 'ops' && (
              <div className="flex flex-col items-center gap-3">
                <span className="text-[10px] text-paper/40 uppercase">Static Array Elements</span>
                <div className="flex gap-2">
                  {fallbackArray.map((val, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div className="w-10 h-10 flex items-center justify-center bg-panel border border-line rounded text-xs font-bold">
                        {val}
                      </div>
                      <span className="text-[8px] text-paper/30 mt-1">[{idx}]</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'window' && (
              <div className="flex flex-col items-center gap-3">
                <span className="text-[10px] text-paper/40 uppercase">
                  Sliding Window (Size K=3) | Index {staticStep} to {staticStep + windowSize - 1}
                </span>
                <div className="flex gap-2">
                  {windowArray.map((val, idx) => {
                    const inWindow = idx >= staticStep && idx < staticStep + windowSize;
                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <div
                          className={`w-9 h-9 flex items-center justify-center rounded border text-xs font-bold transition-all duration-300 ${
                            inWindow ? 'bg-signal/20 border-signal text-signal scale-105' : 'bg-panel border-line text-paper/40'
                          }`}
                        >
                          {val}
                        </div>
                        <span className="text-[8px] text-paper/30 mt-1">[{idx}]</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'pointers' && (
              <div className="flex flex-col items-center gap-3">
                <span className="text-[10px] text-paper/40 uppercase">
                  {staticPointers[staticPointerStep].desc}
                </span>
                <div className="flex gap-2 relative py-4">
                  {pointerArray.map((val, idx) => {
                    const isL = idx === staticPointers[staticPointerStep].L;
                    const isR = idx === staticPointers[staticPointerStep].R;
                    const isMatch = staticPointerStep === 1 && (isL || isR);
                    
                    return (
                      <div key={idx} className="flex flex-col items-center relative">
                        <span className="absolute -top-4 text-[8px] font-bold text-signal">
                          {isL ? 'L ➔' : isR ? 'R ➔' : ''}
                        </span>
                        <div
                          className={`w-9 h-9 flex items-center justify-center rounded border text-xs font-bold transition-all duration-300 ${
                            isMatch
                              ? 'bg-mutate/20 border-mutate text-mutate'
                              : isL || isR
                              ? 'bg-signal/20 border-signal text-signal'
                              : 'bg-panel border-line text-paper/40'
                          }`}
                        >
                          {val}
                        </div>
                        <span className="text-[8px] text-paper/30 mt-1">[{idx}]</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default ArraysVisualizer;
