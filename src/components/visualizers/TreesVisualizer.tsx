import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

interface TreeStep {
  currentNode: number | null;
  visited: number[];
  buffer: number[];
  description: string;
}

interface TreesVisualizerProps {
  executionResult?: any;
  currentStep?: number;
}

export const TreesVisualizer: React.FC<TreesVisualizerProps> = () => {
  const [traversalMode, setTraversalMode] = useState<'bfs' | 'dfs'>('bfs');
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1500);
  const intervalRef = useRef<any>(null);

  // BFS Traversal steps
  // Visits: 1 -> 2 -> 3 -> 4 -> 5
  const bfsSteps: TreeStep[] = [
    { currentNode: null, visited: [], buffer: [1], description: 'Initialize Queue with Root Node(1).' },
    { currentNode: 1, visited: [1], buffer: [2, 3], description: 'Dequeue Node(1). Visit it and enqueue its children: Left Node(2), Right Node(3).' },
    { currentNode: 2, visited: [1, 2], buffer: [3, 4, 5], description: 'Dequeue Node(2). Visit it and enqueue its children: Left Node(4), Right Node(5).' },
    { currentNode: 3, visited: [1, 2, 3], buffer: [4, 5], description: 'Dequeue Node(3). It has no children to enqueue.' },
    { currentNode: 4, visited: [1, 2, 3, 4], buffer: [5], description: 'Dequeue Node(4). It has no children.' },
    { currentNode: 5, visited: [1, 2, 3, 4, 5], buffer: [], description: 'Dequeue Node(5). No more nodes in Queue. BFS complete!' }
  ];

  // DFS Preorder steps
  // Visits: 1 -> 2 -> 4 -> 5 -> 3
  const dfsSteps: TreeStep[] = [
    { currentNode: null, visited: [], buffer: [1], description: 'Initialize Stack with Root Node(1).' },
    { currentNode: 1, visited: [1], buffer: [3, 2], description: 'Pop Node(1). Visit it and push children in reverse order (Right Node 3, Left Node 2) so Left is popped first.' },
    { currentNode: 2, visited: [1, 2], buffer: [3, 5, 4], description: 'Pop Node(2). Visit it and push children in reverse order: Right Node 5, Left Node 4.' },
    { currentNode: 4, visited: [1, 2, 4], buffer: [3, 5], description: 'Pop Node(4). It has no children.' },
    { currentNode: 5, visited: [1, 2, 4, 5], buffer: [3], description: 'Pop Node(5). It has no children.' },
    { currentNode: 3, visited: [1, 2, 4, 5, 3], buffer: [], description: 'Pop Node(3). It has no children. Stack is empty. DFS complete!' }
  ];

  const currentSteps = traversalMode === 'bfs' ? bfsSteps : dfsSteps;

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setStep((prev) => {
          if (prev >= currentSteps.length - 1) {
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
  }, [isPlaying, traversalMode, speed]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleStepForward = () => {
    setIsPlaying(false);
    if (step < currentSteps.length - 1) setStep(step + 1);
  };
  const handleStepBackward = () => {
    setIsPlaying(false);
    if (step > 0) setStep(step - 1);
  };
  const handleReset = () => {
    setIsPlaying(false);
    setStep(0);
  };

  const active = currentSteps[step];

  // Tree nodes positioning on SVG canvas (340 x 160)
  const treeNodes = [
    { id: 1, cx: 170, cy: 25, label: '1' },
    { id: 2, cx: 100, cy: 75, label: '2' },
    { id: 3, cx: 240, cy: 75, label: '3' },
    { id: 4, cx: 60, cy: 125, label: '4' },
    { id: 5, cx: 140, cy: 125, label: '5' },
  ];

  return (
    <div className="flex flex-col w-full text-slate-200">
      {/* Mode Switcher */}
      <div className="flex justify-center border-b border-slate-800 p-0.5 bg-slate-900/40 rounded-xl mb-4">
        <button
          onClick={() => { setTraversalMode('bfs'); handleReset(); }}
          className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition duration-200 cursor-pointer ${
            traversalMode === 'bfs' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          BFS Traversal (Queue)
        </button>
        <button
          onClick={() => { setTraversalMode('dfs'); handleReset(); }}
          className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition duration-200 cursor-pointer ${
            traversalMode === 'dfs' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          DFS Preorder (Stack)
        </button>
      </div>

      {/* Description */}
      <div className="text-xs text-slate-400 min-h-[32px] mb-4 text-center leading-relaxed px-2">
        {active.description}
      </div>

      {/* Tree SVG and Buffer panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[200px] items-center">
        {/* Left: SVG tree (8 cols) */}
        <div className="md:col-span-8 border border-slate-800 bg-slate-950/40 rounded-xl p-2 h-full flex items-center justify-center relative overflow-hidden select-none">
          <svg viewBox="0 0 340 150" className="w-full h-full">
            {/* Links connecting nodes */}
            <line x1="170" y1="25" x2="100" y2="75" stroke="#1e293b" strokeWidth="2.5" />
            <line x1="170" y1="25" x2="240" y2="75" stroke="#1e293b" strokeWidth="2.5" />
            <line x1="100" y1="75" x2="60" y2="125" stroke="#1e293b" strokeWidth="2.5" />
            <line x1="100" y1="75" x2="140" y2="125" stroke="#1e293b" strokeWidth="2.5" />

            {/* Nodes */}
            {treeNodes.map((node) => {
              const isActive = active.currentNode === node.id;
              const isVisited = active.visited.includes(node.id);

              return (
                <g key={node.id} className="transition-all duration-300">
                  <circle
                    cx={node.cx}
                    cy={node.cy}
                    r="12"
                    className={`transition-all duration-300 stroke-2 ${
                      isActive
                        ? 'fill-amber-500/25 stroke-amber-500 filter drop-shadow-[0_0_4px_rgba(245,158,11,0.3)]'
                        : isVisited
                        ? 'fill-emerald-500/20 stroke-emerald-500'
                        : 'fill-slate-900 stroke-slate-800'
                    }`}
                  />
                  <text
                    x={node.cx}
                    y={node.cy + 3}
                    textAnchor="middle"
                    fill={isActive ? '#f59e0b' : isVisited ? '#34d399' : '#cbd5e1'}
                    className="text-[9px] font-mono font-bold select-none"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right: Queue/Stack buffer monitor (4 cols) */}
        <div className="md:col-span-4 bg-slate-900/40 border border-slate-800 rounded-xl p-3 h-full flex flex-col justify-center gap-2 text-[10px] font-mono">
          <h4 className="text-[9px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-800 pb-1 flex justify-between">
            <span>{traversalMode === 'bfs' ? 'Queue (FIFO)' : 'Stack (LIFO)'}</span>
            <span className="text-[8px] text-slate-600">{"IN -> OUT"}</span>
          </h4>
          <div className="flex items-center gap-1 bg-slate-950/60 p-2 rounded border border-slate-900 min-h-[38px] justify-center overflow-x-auto">
            {active.buffer.length === 0 ? (
              <span className="text-[9px] text-slate-700 italic">Empty</span>
            ) : (
              active.buffer.map((val) => (
                <span
                  key={val}
                  className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold"
                >
                  {val}
                </span>
              ))
            )}
          </div>
          <div className="flex flex-col gap-0.5 border-t border-slate-800/80 pt-2 text-[9px] text-slate-500">
            <div className="flex justify-between">
              <span>Visited order:</span>
              <span className="text-emerald-400 font-bold">
                {active.visited.length > 0 ? active.visited.join('➔') : 'None'}
              </span>
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
            min="300"
            max="2500"
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
