import React from 'react';
import * as d3 from 'd3';

interface SortingVisualizerProps {
  executionResult?: any;
  currentStep?: number;
}

export const SortingVisualizer: React.FC<SortingVisualizerProps> = ({
  executionResult,
  currentStep = 0,
}) => {
  const initialArray = [40, 15, 80, 25, 60, 10, 45];
  
  const hasEvents = !!(executionResult?.events && executionResult.events.length > 0);
  const events = executionResult?.events || [];

  // Reconstruct array state up to currentStep
  const arrayState = [...initialArray];
  let activeIndex: number | null = null;
  let activeType: 'read' | 'write' | null = null;

  if (hasEvents) {
    // Scan all events up to currentStep to compute the active state
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
      }
    }
  }

  // D3 layout math
  const width = 340;
  const height = 180;
  const margin = { top: 25, right: 10, bottom: 20, left: 10 };

  const xScale = d3.scaleBand()
    .domain(arrayState.map((_, i) => String(i)))
    .range([margin.left, width - margin.right])
    .padding(0.15);

  const maxVal = d3.max(arrayState as number[]) || 100;
  const yScale = d3.scaleLinear()
    .domain([0, maxVal])
    .range([height - margin.bottom, margin.top]);

  return (
    <div className="flex flex-col w-full text-paper select-none font-mono items-center">
      {/* Warning message if user ran code but didn't instrument any 'arr' operations */}
      {executionResult && !hasEvents && (
        <div className="w-full mb-3 text-xs text-immute bg-immute/5 border border-immute/15 rounded p-2 text-center font-sans">
          Visualizer expects a list named <code className="bg-ink px-1 rounded text-signal font-mono font-bold">arr</code> — rename your variable in the editor to see it animate!
        </div>
      )}

      {/* Visualizer header alert if using demo */}
      {!executionResult && (
        <div className="w-full mb-3 text-[10px] text-signal bg-signal/5 border border-signal/15 rounded p-1.5 text-center">
          # demo_mode: sorting starter code to show animation. run code in editor to trace yours!
        </div>
      )}

      {/* SVG Canvas box */}
      <div className="w-full flex items-center justify-center p-2 bg-[#12161E]/40 border border-line rounded">
        <svg width={width} height={height} className="overflow-visible">
          {arrayState.map((val, idx) => {
            const isComp = idx === activeIndex && activeType === 'read';
            const isSwap = idx === activeIndex && activeType === 'write';
            
            const x = xScale(String(idx)) || 0;
            const y = yScale(val) || 0;
            const w = xScale.bandwidth();
            const h = Math.max(2, height - margin.bottom - y);

            return (
              <g key={idx}>
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  fill={isSwap ? 'var(--mutate)' : isComp ? 'var(--signal)' : 'var(--panel)'}
                  stroke="var(--line)"
                  strokeWidth={1}
                  rx={2}
                />
                
                {/* Value labels */}
                <text
                  x={x + w / 2}
                  y={y - 6}
                  textAnchor="middle"
                  fill={isSwap ? 'var(--mutate)' : isComp ? 'var(--signal)' : 'var(--paper)'}
                  fontSize={9}
                  fontWeight="bold"
                >
                  {val}
                </text>
                
                {/* Index labels */}
                <text
                  x={x + w / 2}
                  y={height - 5}
                  textAnchor="middle"
                  fill="var(--paper)"
                  opacity={0.3}
                  fontSize={8}
                >
                  [{idx}]
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="w-full text-center mt-3 text-[10px] text-paper/40 italic">
        {activeIndex !== null 
          ? `# index [${activeIndex}] was ${activeType === 'write' ? 'written/swapped' : 'read/compared'}`
          : '# array in static watch state'}
      </div>
    </div>
  );
};
export default SortingVisualizer;
