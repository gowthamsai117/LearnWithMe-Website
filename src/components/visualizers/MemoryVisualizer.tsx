import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

interface MemoryVisualizerProps {
  executionResult?: any;
  currentStep: number;
  onStepChange: (step: number) => void;
}

interface VarBinding {
  name: string;
  address: string;
}

interface HeapObject {
  address: string;
  type: string;
  value: string;
  refCount: number;
}

export const MemoryVisualizer: React.FC<MemoryVisualizerProps> = ({
  executionResult,
  currentStep,
  onStepChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000); // ms per step
  const [connections, setConnections] = useState<{ d: string }[]>([]);

  // Demo fallback steps
  const demoSteps = [
    { text: 'a = 10', line: 1 },
    { text: 'b = a', line: 2 },
    { text: 'a = 20', line: 3 },
  ];

  // Parse lines of code from editor run
  const codeLines = executionResult?.code ? executionResult.code.split('\n') : [];

  // Parse active trace log
  const hasTrace = !!(executionResult?.trace && executionResult.trace.length > 0);
  const trace = executionResult?.trace || [];
  const totalSteps = hasTrace ? trace.length : demoSteps.length;

  // Active step variables & heap state
  let variables: VarBinding[] = [];
  let heap: HeapObject[] = [];
  let executionSteps: { text: string; line: number; passed: boolean; active: boolean }[] = [];
  let nextStepDescription = 'Complete assignment';

  if (!executionResult) {
    // Demo mode: matches screenshot exactly
    variables = [
      { name: 'a', address: '0x7fff4a2c1' },
      { name: 'b', address: '0x7fff4a2c1' },
    ];
    heap = [
      { address: '0x7fff4a2c1', type: 'Integer', value: '20', refCount: 2 },
      { address: '0x7fff4a2c2', type: 'Integer', value: '10', refCount: 0 },
    ];
    executionSteps = demoSteps.map((s, idx) => ({
      text: s.text,
      line: s.line,
      passed: idx < currentStep,
      active: idx === currentStep,
    }));
    nextStepDescription = currentStep === 0 
      ? 'Assign 10 to variable a' 
      : currentStep === 1 
      ? 'Bind variable b to reference variable a' 
      : 'Reassign variable a to reference 20';
  } else {
    // Live Run mode: parse locals snapshot at currentStep
    const stepData = trace[currentStep];
    const locals = stepData?.locals || {};
    
    // Track unique value ids to build heap list
    const idToAddress: Record<number, string> = {};
    const heapMap: Record<string, HeapObject> = {};

    Object.entries(locals).forEach(([name, data]: [string, any]) => {
      const pyId = data.id;
      const addr = `0x7ff${pyId.toString(16).slice(-6)}`;
      idToAddress[pyId] = addr;

      variables.push({
        name,
        address: addr
      });

      const typeStr = data.type === 'int' 
        ? 'Integer' 
        : data.type === 'str' 
        ? 'String' 
        : data.type === 'list' 
        ? 'List' 
        : data.type === 'dict' 
        ? 'Dictionary' 
        : data.type;

      if (!heapMap[addr]) {
        heapMap[addr] = {
          address: addr,
          type: typeStr,
          value: data.value,
          refCount: 0
        };
      }
      heapMap[addr].refCount += 1;
    });

    // Display historical heap objects that are now unreferenced
    trace.forEach((step: any) => {
      Object.values(step.locals || {}).forEach((data: any) => {
        const addr = `0x7ff${data.id.toString(16).slice(-6)}`;
        if (!heapMap[addr]) {
          const typeStr = data.type === 'int' ? 'Integer' : data.type === 'str' ? 'String' : data.type;
          heapMap[addr] = {
            address: addr,
            type: typeStr,
            value: data.value,
            refCount: 0
          };
        }
      });
    });

    heap = Object.values(heapMap);

    // Build Execution steps from trace lines
    executionSteps = trace.map((step: any, idx: number) => {
      const lineNum = step.line;
      const rawText = codeLines[lineNum - 1] || `# Step ${idx + 1}`;
      return {
        text: rawText.trim(),
        line: lineNum,
        passed: idx < currentStep,
        active: idx === currentStep,
      };
    });

    // Predict next step
    const nextStepData = trace[currentStep + 1];
    if (nextStepData) {
      const nextLineNum = nextStepData.line;
      const nextRawText = codeLines[nextLineNum - 1] || '';
      nextStepDescription = nextRawText ? `Execute: ${nextRawText.trim()}` : 'Complete evaluation';
    } else {
      nextStepDescription = 'Execution trace completed';
    }
  }

  // Draw Curved connection lines
  const updatePaths = () => {
    const container = containerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();

    const newConns = variables.map((v) => {
      const varEl = document.getElementById(`var-dot-${v.name}`);
      const heapEl = document.getElementById(`heap-card-${v.address}`);
      if (varEl && heapEl) {
        const varRect = varEl.getBoundingClientRect();
        const heapRect = heapEl.getBoundingClientRect();

        // Calculate connector center points
        const x1 = varRect.right - containerRect.left;
        const y1 = varRect.top + varRect.height / 2 - containerRect.top;
        const x2 = heapRect.left - containerRect.left;
        const y2 = heapRect.top + heapRect.height / 2 - containerRect.top;

        const controlOffset = Math.max(50, Math.abs(x2 - x1) / 2);
        return {
          d: `M ${x1} ${y1} C ${x1 + controlOffset} ${y1}, ${x2 - controlOffset} ${y2}, ${x2} ${y2}`
        };
      }
      return null;
    }).filter(Boolean) as { d: string }[];

    setConnections(newConns);
  };

  // Trigger update multiple times to catch reflows and Framer Motion layout shifts
  const triggerPathsUpdate = () => {
    let frame = 0;
    const run = () => {
      updatePaths();
      frame++;
      if (frame < 15) {
        requestAnimationFrame(run);
      }
    };
    requestAnimationFrame(run);
  };

  // Re-run connection lines effect
  useEffect(() => {
    triggerPathsUpdate();
    window.addEventListener('resize', updatePaths);
    return () => {
      window.removeEventListener('resize', updatePaths);
    };
  }, [currentStep, executionResult, variables.length, heap.length]);

  // Autoplay intervals hook
  useEffect(() => {
    let intervalId: any = null;
    if (isPlaying) {
      intervalId = setInterval(() => {
        if (currentStep >= totalSteps - 1) {
          setIsPlaying(false);
        } else {
          onStepChange(currentStep + 1);
        }
      }, speed);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, currentStep, totalSteps, speed, onStepChange]);

  const handleStepBack = () => {
    setIsPlaying(false);
    if (currentStep > 0) {
      onStepChange(currentStep - 1);
    }
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    if (currentStep < totalSteps - 1) {
      onStepChange(currentStep + 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    onStepChange(0);
  };

  return (
    <div className="flex flex-col gap-4 w-full select-none" ref={containerRef}>
      
      {/* Visualizer playback panel header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-panel-border pb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-mono">
            Memory Visualization
          </h3>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
          </span>
          <span className="text-[9px] font-bold text-success uppercase tracking-widest font-mono">
            LIVE
          </span>
        </div>

        {/* Action controllers */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#0A0D18] border border-panel-border rounded-lg p-0.5">
            <button 
              onClick={handleReset}
              className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-[#1C223C] cursor-pointer"
              title="Reset"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button 
              onClick={handleStepBack}
              disabled={currentStep === 0}
              className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-[#1C223C] disabled:opacity-30 cursor-pointer"
              title="Step Back"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-2.5 py-1 rounded bg-accent hover:bg-accent-hover text-white text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
            >
              {isPlaying ? <Pause className="h-3 w-3 fill-current" /> : <Play className="h-3 w-3 fill-current" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button 
              onClick={handleStepForward}
              disabled={currentStep >= totalSteps - 1}
              className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-[#1C223C] disabled:opacity-30 cursor-pointer"
              title="Step Forward"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <select 
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="bg-[#0A0D18] border border-panel-border text-[10px] text-text-muted px-2 py-1 rounded-lg outline-none font-mono cursor-pointer"
          >
            <option value={1500}>0.5x</option>
            <option value={1000}>1.0x</option>
            <option value={500}>2.0x</option>
          </select>
        </div>
      </div>

      {/* Main visualization split view panels + Steps */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 relative">
        
        {/* SVG Bezier arrows canvas overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--accent)" />
            </marker>
          </defs>
          {connections.map((conn, idx) => (
            <path
              key={idx}
              d={conn.d}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.5"
              markerEnd="url(#arrow)"
              className="transition-all duration-300"
            />
          ))}
        </svg>

        {/* Variables column (Col span: 4) */}
        <div className="md:col-span-4 flex flex-col gap-2 z-20">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-1">
            Variables
          </span>
          <div className="flex flex-col gap-2 bg-[#0A0D18]/50 border border-panel-border p-3 rounded-xl min-h-[160px]">
            {variables.map((v) => (
              <div 
                key={v.name}
                id={`var-row-${v.name}`}
                className="flex items-center justify-between bg-panel border border-panel-border px-3 py-2 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-primary text-xs">{v.name}</span>
                </div>
                
                {/* Pointer indicator */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[9px] font-mono text-text-muted truncate">{v.address}</span>
                  <div 
                    id={`var-dot-${v.name}`}
                    className="h-2 w-2 rounded-full bg-accent flex-shrink-0"
                  />
                </div>
              </div>
            ))}

            {variables.length === 0 && (
              <div className="flex-grow flex items-center justify-center text-[10px] text-text-muted/40 italic text-center py-6">
                No variables active
              </div>
            )}
          </div>
        </div>

        {/* Heap Objects column (Col span: 5) */}
        <div className="md:col-span-5 flex flex-col gap-2 z-20">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-1">
            Heap Memory
          </span>
          <div className="flex flex-col gap-3 bg-[#0A0D18]/50 border border-panel-border p-3 rounded-xl min-h-[160px]">
            {heap.map((obj) => {
              const isGarbage = obj.refCount === 0;
              return (
                <div 
                  key={obj.address}
                  id={`heap-card-${obj.address}`}
                  className={`bg-panel border rounded-lg p-2.5 flex flex-col gap-1.5 transition-all duration-300 ${
                    isGarbage 
                      ? 'border-dashed border-panel-border bg-panel/30 opacity-30 grayscale' 
                      : 'border-panel-border'
                  }`}
                >
                  <div className="flex items-center justify-between text-[8px] font-mono text-text-muted">
                    <span>{obj.address}</span>
                    <span className="uppercase font-bold text-accent">{obj.type}</span>
                  </div>
                  
                  <div className="text-center py-1">
                    <span className="text-sm font-bold font-mono text-text-primary">
                      {obj.value}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[8px] font-mono text-text-muted/60 border-t border-panel-border/30 pt-1.5">
                    <span>References: {obj.refCount}</span>
                    {isGarbage && <span className="text-danger font-bold uppercase tracking-wider">Garbage Coll.</span>}
                  </div>
                </div>
              );
            })}

            {heap.length === 0 && (
              <div className="flex-grow flex items-center justify-center text-[10px] text-text-muted/40 italic text-center py-6">
                Heap memory empty
              </div>
            )}
          </div>
        </div>

        {/* Execution Steps column (Col span: 3) */}
        <div className="md:col-span-3 flex flex-col gap-2 z-20">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-1">
            Steps
          </span>
          <div className="flex flex-col gap-1 bg-[#0A0D18]/50 border border-panel-border p-2.5 rounded-xl min-h-[160px] max-h-[220px] overflow-y-auto">
            {executionSteps.map((step, idx) => (
              <div 
                key={idx}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-[10px] font-mono transition ${
                  step.active 
                    ? 'bg-accent/15 text-accent font-bold border border-accent/25' 
                    : 'text-text-muted border border-transparent'
                }`}
              >
                <span className="text-text-muted/40 font-mono">{idx + 1}.</span>
                <span className="truncate">{step.text}</span>
              </div>
            ))}
          </div>
          
          <div className="text-[9px] font-sans text-text-muted/70 italic border-t border-panel-border/40 pt-2 truncate mt-1">
            Next: {nextStepDescription}
          </div>
        </div>

      </div>

    </div>
  );
};
export default MemoryVisualizer;
