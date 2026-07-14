import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

interface DijkstraStep {
  currentNode: string | null;
  distances: Record<string, number | string>;
  pq: { dist: number; node: string }[];
  visited: string[];
  activeEdges: string[]; // e.g. ["A-C", "A-B"]
  shortestPathEdges: string[]; // Final route edges
  description: string;
}

interface GraphsVisualizerProps {
  executionResult?: any;
  currentStep?: number;
}

export const GraphsVisualizer: React.FC<GraphsVisualizerProps> = () => {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1800);
  const intervalRef = useRef<any>(null);

  const steps: DijkstraStep[] = [
    {
      currentNode: null,
      distances: { A: 0, B: '∞', C: '∞', D: '∞', E: '∞' },
      pq: [{ dist: 0, node: 'A' }],
      visited: [],
      activeEdges: [],
      shortestPathEdges: [],
      description: 'Initialize: Start at Node A. Set distance to A to 0, all other nodes to Infinity. Push (0, A) to Priority Queue.',
    },
    {
      currentNode: 'A',
      distances: { A: 0, B: 4, C: 2, D: '∞', E: '∞' },
      pq: [{ dist: 2, node: 'C' }, { dist: 4, node: 'B' }],
      visited: ['A'],
      activeEdges: ['A-B', 'A-C'],
      shortestPathEdges: [],
      description: 'Pop (0, A): Visit A. Scan neighbors B (weight 4) and C (weight 2). Update distances and enqueue neighbors.',
    },
    {
      currentNode: 'C',
      distances: { A: 0, B: 3, C: 2, D: 10, E: 12 },
      pq: [{ dist: 3, node: 'B' }, { dist: 10, node: 'D' }, { dist: 12, node: 'E' }],
      visited: ['A', 'C'],
      activeEdges: ['C-B', 'C-D', 'C-E'],
      shortestPathEdges: [],
      description: 'Pop (2, C): Visit C. Relax B: Path A->C->B (2+1=3) is shorter than current A->B (4). Update B to 3! Enqueue D (10) and E (12).',
    },
    {
      currentNode: 'B',
      distances: { A: 0, B: 3, C: 2, D: 8, E: 12 },
      pq: [{ dist: 8, node: 'D' }, { dist: 12, node: 'E' }],
      visited: ['A', 'C', 'B'],
      activeEdges: ['B-D'],
      shortestPathEdges: [],
      description: 'Pop (3, B): Visit B. Relax D: Path A->C->B->D (3+5=8) is shorter than current A->C->D (10). Update D to 8!',
    },
    {
      currentNode: 'D',
      distances: { A: 0, B: 3, C: 2, D: 8, E: 10 },
      pq: [{ dist: 10, node: 'E' }],
      visited: ['A', 'C', 'B', 'D'],
      activeEdges: ['D-E'],
      shortestPathEdges: [],
      description: 'Pop (8, D): Visit D. Relax E: Path A->C->B->D->E (8+2=10) is shorter than current A->C->E (12). Update E to 10!',
    },
    {
      currentNode: 'E',
      distances: { A: 0, B: 3, C: 2, D: 8, E: 10 },
      pq: [],
      visited: ['A', 'C', 'B', 'D', 'E'],
      activeEdges: [],
      shortestPathEdges: ['A-C', 'C-B', 'B-D', 'D-E'],
      description: 'Pop (10, E): Target Node E visited. Priority Queue is empty. Shortest Path from A to E is found! Total cost = 10.',
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

  // Coordinates of nodes on visual SVG canvas (340 x 150)
  const nodes = {
    A: { cx: 40, cy: 75, label: 'A' },
    C: { cx: 130, cy: 125, label: 'C' },
    B: { cx: 130, cy: 25, label: 'B' },
    D: { cx: 230, cy: 75, label: 'D' },
    E: { cx: 300, cy: 75, label: 'E' },
  };

  const edges = [
    { from: 'A', to: 'B', weight: 4, id: 'A-B', labelX: 80, labelY: 40 },
    { from: 'A', to: 'C', weight: 2, id: 'A-C', labelX: 80, labelY: 110 },
    { from: 'C', to: 'B', weight: 1, id: 'C-B', labelX: 140, labelY: 75 },
    { from: 'C', to: 'D', weight: 8, id: 'C-D', labelX: 185, labelY: 110 },
    { from: 'B', to: 'D', weight: 5, id: 'B-D', labelX: 185, labelY: 40 },
    { from: 'D', to: 'E', weight: 2, id: 'D-E', labelX: 265, labelY: 65 },
    { from: 'C', to: 'E', weight: 10, id: 'C-E', labelX: 215, labelY: 120 }
  ];

  return (
    <div className="flex flex-col w-full text-slate-200">
      {/* State monitor header */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 mb-4 text-xs font-mono">
        <span className="font-bold text-slate-400">DIJKSTRA PATHFINDING</span>
        <span className="text-[10px] text-slate-500 font-bold">
          Step {step + 1} / {steps.length}
        </span>
      </div>

      {/* Description */}
      <div className="text-xs text-slate-400 min-h-[32px] mb-4 text-center leading-relaxed px-2">
        {active.description}
      </div>

      {/* Layout workspace */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[220px] items-center">
        {/* Left: SVG Network Graph (7 cols) */}
        <div className="md:col-span-7 border border-slate-800 bg-slate-950/40 rounded-xl p-2 h-full flex items-center justify-center relative overflow-hidden select-none">
          <svg viewBox="0 0 340 150" className="w-full h-full font-mono text-[8px]">
            {/* Draw road links edges */}
            {edges.map((e) => {
              const start = nodes[e.from as keyof typeof nodes];
              const end = nodes[e.to as keyof typeof nodes];
              
              const isPath = active.shortestPathEdges.includes(e.id);
              const isActive = active.activeEdges.includes(e.id);

              return (
                <g key={e.id}>
                  <line
                    x1={start.cx}
                    y1={start.cy}
                    x2={end.cx}
                    y2={end.cy}
                    strokeWidth={isPath ? 3.5 : isActive ? 2.5 : 1.5}
                    className={`transition-all duration-300 ${
                      isPath
                        ? 'stroke-emerald-400 filter drop-shadow-[0_0_4px_rgba(52,211,153,0.5)]'
                        : isActive
                        ? 'stroke-amber-400'
                        : 'stroke-slate-800'
                    }`}
                  />
                  {/* Edge Weight label */}
                  <rect x={e.labelX - 4} y={e.labelY - 5} width="8" height="8" rx="2" fill="#030712" stroke="#1e293b" strokeWidth="0.5" />
                  <text x={e.labelX} y={e.labelY + 1} textAnchor="middle" fill="#94a3b8" fontSize="6px">
                    {e.weight}
                  </text>
                </g>
              );
            })}

            {/* Draw city node circles */}
            {Object.entries(nodes).map(([name, coords]) => {
              const isVisited = active.visited.includes(name);
              const isActiveNode = active.currentNode === name;

              return (
                <g key={name} className="transition-all duration-300">
                  <circle
                    cx={coords.cx}
                    cy={coords.cy}
                    r="11"
                    className={`transition-all duration-300 stroke-2 ${
                      isActiveNode
                        ? 'fill-amber-500/25 stroke-amber-500 filter drop-shadow-[0_0_4px_rgba(245,158,11,0.3)]'
                        : isVisited
                        ? 'fill-emerald-500/20 stroke-emerald-500'
                        : 'fill-slate-900 stroke-slate-800'
                    }`}
                  />
                  <text
                    x={coords.cx}
                    y={coords.cy + 3}
                    textAnchor="middle"
                    fill={isActiveNode ? '#f59e0b' : isVisited ? '#34d399' : '#cbd5e1'}
                    className="text-[9px] font-bold select-none"
                  >
                    {name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right: Dijkstra Table and PQ list (5 cols) */}
        <div className="md:col-span-5 bg-slate-900/40 border border-slate-800 rounded-xl p-3 h-full flex flex-col justify-between text-[8px] font-mono">
          {/* Table of distances */}
          <div>
            <h4 className="text-[9px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-800 pb-1 mb-1.5">Distance Table</h4>
            <div className="grid grid-cols-5 gap-1 text-center font-bold">
              {Object.keys(nodes).map(n => (
                <div key={n} className="flex flex-col bg-slate-950/40 p-1 rounded border border-slate-900">
                  <span className="text-slate-500">{n}</span>
                  <span className={active.currentNode === n ? 'text-amber-400' : active.distances[n] !== '∞' ? 'text-cyan-400' : 'text-slate-600'}>
                    {active.distances[n]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Heap Queue buffer */}
          <div>
            <h4 className="text-[9px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-800 pb-1 mb-1.5">Min-Heap PQ</h4>
            <div className="flex flex-wrap gap-1 min-h-[22px] items-center">
              {active.pq.length === 0 ? (
                <span className="text-slate-700 italic">Empty</span>
              ) : (
                active.pq.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[7px]"
                  >
                    ({item.dist}, {item.node})
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
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
            min="500"
            max="3000"
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
