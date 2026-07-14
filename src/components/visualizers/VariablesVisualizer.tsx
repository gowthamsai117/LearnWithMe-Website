import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VariablesVisualizerProps {
  executionResult?: any;
  currentStep?: number;
  onStepChange?: (step: number) => void;
}

export const VariablesVisualizer: React.FC<VariablesVisualizerProps> = ({
  executionResult,
  currentStep: externalStep,
  onStepChange: externalOnStepChange,
}) => {
  const [internalStep, setInternalStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const intervalRef = useRef<any>(null);

  // Fallback static demo steps if no executionResult is available
  const demoSteps = [
    {
      code: 'a = 10',
      description: 'Python creates an integer object 10 at 0x1A4F and binds the variable a to it.',
      bindings: [{ name: 'a', target: '0x1A4F' }],
      heap: [{ address: '0x1A4F', type: 'int', value: '10', refCount: 1 }],
    },
    {
      code: 'b = a',
      description: 'Python points b to the SAME object. No memory is duplicated.',
      bindings: [
        { name: 'a', target: '0x1A4F' },
        { name: 'b', target: '0x1A4F' },
      ],
      heap: [{ address: '0x1A4F', type: 'int', value: '10', refCount: 2 }],
    },
    {
      code: 'a = 20',
      description: 'Python creates a new integer object 20 at 0x3E2B, re-binding a. b remains pointing to 10.',
      bindings: [
        { name: 'a', target: '0x3E2B' },
        { name: 'b', target: '0x1A4F' },
      ],
      heap: [
        { address: '0x1A4F', type: 'int', value: '10', refCount: 1 },
        { address: '0x3E2B', type: 'int', value: '20', refCount: 1 },
      ],
    },
  ];

  const hasTrace = !!(executionResult?.trace && executionResult.trace.length > 0);
  const trace = executionResult?.trace || [];
  const totalSteps = hasTrace ? trace.length : demoSteps.length;
  
  const activeStepIdx = externalStep !== undefined ? externalStep : internalStep;
  const setActiveStepIdx = externalOnStepChange !== undefined ? externalOnStepChange : setInternalStep;

  // Auto-play hook
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        if (activeStepIdx >= totalSteps - 1) {
          setIsPlaying(false);
        } else {
          setActiveStepIdx(activeStepIdx + 1);
        }
      }, speed);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, speed, totalSteps, activeStepIdx, setActiveStepIdx]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleStepForward = () => {
    setIsPlaying(false);
    if (activeStepIdx < totalSteps - 1) {
      setActiveStepIdx(activeStepIdx + 1);
    }
  };
  const handleStepBackward = () => {
    setIsPlaying(false);
    if (activeStepIdx > 0) {
      setActiveStepIdx(activeStepIdx - 1);
    }
  };
  const handleReset = () => {
    setIsPlaying(false);
    setActiveStepIdx(0);
  };

  // Reconstruct current frame snapshot
  let currentBindings: { name: string; target: string }[] = [];
  let currentHeap: { address: string; type: string; value: string; refCount: number }[] = [];
  let currentDesc = '';

  if (hasTrace) {
    const stepData = trace[activeStepIdx];
    if (stepData && stepData.locals) {
      const locals = stepData.locals;
      const bindingsList: typeof currentBindings = [];
      const heapMap = new Map<string, typeof currentHeap[0]>();

      Object.entries(locals).forEach(([name, info]: [string, any]) => {
        const address = '0x' + info.id.toString(16).toUpperCase();
        bindingsList.push({ name, target: address });
        
        if (!heapMap.has(address)) {
          heapMap.set(address, {
            address,
            type: info.type,
            value: info.value,
            refCount: 0
          });
        }
      });

      // Calculate reference counts
      bindingsList.forEach(b => {
        const item = heapMap.get(b.target);
        if (item) item.refCount += 1;
      });

      currentBindings = bindingsList;
      currentHeap = Array.from(heapMap.values());
      currentDesc = `Line ${stepData.line} execution snapshot. Watch bindings and memory slots update.`;
    }
  } else {
    const stepData = demoSteps[activeStepIdx];
    currentBindings = stepData.bindings;
    currentHeap = stepData.heap;
    currentDesc = stepData.description;
  }

  const getColorHex = (typeName: string) => {
    switch (typeName) {
      case 'int': case 'float': return '#F5A623'; // --signal
      case 'str': return '#3FA796'; // --mutate
      default: return '#E8604C'; // --immute
    }
  };

  return (
    <div className="flex flex-col w-full text-paper select-none font-mono">
      {/* Visualizer header alert if using demo */}
      {!hasTrace && (
        <div className="mb-4 text-[10px] text-signal bg-signal/5 border border-signal/15 rounded p-2 text-center">
          # demo_mode: showing static trace. run your own code in the practice panel to animate live!
        </div>
      )}

      {/* Description text */}
      <div className="text-xs text-paper/60 min-h-[36px] mb-4 text-center leading-relaxed px-2 font-sans italic">
        {currentDesc}
      </div>

      {/* Memory Visual canvas */}
      <div className="grid grid-cols-2 gap-6 h-[200px] items-center px-4 py-2 border border-line bg-panel/30 rounded-md relative overflow-y-auto">
        {/* Name Space Stack Variables */}
        <div className="flex flex-col gap-2 items-center h-full pt-2">
          <h4 className="text-[9px] uppercase font-bold text-paper/40 tracking-wider mb-2">Variables (Stack Names)</h4>
          <div className="flex flex-col gap-2 w-full max-w-[150px] justify-start overflow-y-auto max-h-[140px] pr-1">
            <AnimatePresence mode="popLayout">
              {currentBindings.length === 0 ? (
                <div className="text-[10px] text-paper/30 text-center italic border border-dashed border-line p-3 rounded bg-panel/10">
                  No variables
                </div>
              ) : (
                currentBindings.map((b) => (
                  <motion.div
                    key={b.name}
                    layoutId={`var-${b.name}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center justify-between px-2.5 py-1 rounded bg-[#1C222E] border border-line shadow text-xs font-mono"
                  >
                    <span className="font-bold text-mutate">{b.name}</span>
                    <span className="text-[9px] text-paper/30">{b.target}</span>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Object Space / Heap Memory */}
        <div className="flex flex-col gap-2 items-center h-full pt-2 border-l border-line/60">
          <h4 className="text-[9px] uppercase font-bold text-paper/40 tracking-wider mb-2">Objects (Heap RAM)</h4>
          <div className="flex flex-col gap-2 w-full max-w-[170px] justify-start overflow-y-auto max-h-[140px] pr-1">
            <AnimatePresence mode="popLayout">
              {currentHeap.length === 0 ? (
                <div className="text-[10px] text-paper/30 text-center italic border border-dashed border-line p-3 rounded bg-panel/10">
                  Heap is empty
                </div>
              ) : (
                currentHeap.map((h) => (
                  <motion.div
                    key={h.address}
                    layoutId={`heap-${h.address}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col px-2.5 py-1.5 rounded bg-[#1C222E] border border-line shadow text-xs relative"
                  >
                    <div className="flex justify-between items-center text-[8px] text-paper/30 mb-0.5">
                      <span>{h.address}</span>
                      <span style={{ color: getColorHex(h.type) }} className="font-bold uppercase">
                        {h.type}
                      </span>
                    </div>
                    <div className="text-center font-bold text-paper text-xs py-1 border border-line/40 rounded bg-ink/50">
                      {h.value}
                    </div>
                    <div className="text-[8px] text-paper/30 text-right mt-0.5">
                      ref_count: {h.refCount}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Control Buttons Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-line px-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="p-1.5 rounded bg-panel hover:bg-line text-paper/60 hover:text-paper border border-line cursor-pointer"
            title="Reset"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleStepBackward}
            className="p-1.5 rounded bg-panel hover:bg-line text-paper/60 hover:text-paper border border-line cursor-pointer"
            title="Step Back"
          >
            <SkipBack className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handlePlayPause}
            className="px-3 py-1.5 rounded bg-signal/10 text-signal border border-signal/20 hover:bg-signal/25 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="h-3 w-3 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-3 w-3 fill-current" />
                <span>Play</span>
              </>
            )}
          </button>
          <button
            onClick={handleStepForward}
            className="p-1.5 rounded bg-panel hover:bg-line text-paper/60 hover:text-paper border border-line cursor-pointer"
            title="Step Forward"
          >
            <SkipForward className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Speed Control Slider */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-paper/40 font-bold uppercase tracking-wider">Speed</span>
          <input
            type="range"
            min="300"
            max="2000"
            step="100"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-20 accent-signal h-1 bg-line rounded cursor-pointer appearance-none"
          />
          <span className="text-[9px] text-paper/50 w-8">{speed}ms</span>
        </div>
      </div>
    </div>
  );
};
