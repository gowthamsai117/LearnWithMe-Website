import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';

interface ComplexityVisualizerProps {
  executionResult?: any;
  currentStep?: number;
}

export const ComplexityVisualizer: React.FC<ComplexityVisualizerProps> = () => {
  const [n, setN] = useState<number>(10);

  // Computations for operations counts
  const ops = {
    o1: 1,
    ologn: Math.round(Math.log2(n) * 10) / 10,
    on: n,
    onlogn: Math.round(n * Math.log2(n) * 10) / 10,
    on2: n * n,
    o2n: n > 30 ? Infinity : Math.pow(2, n),
  };

  const getPoints = (func: (x: number) => number) => {
    const points: string[] = [];
    const maxN = 50; // Plot points up to N=50
    const svgW = 340;

    for (let x = 1; x <= maxN; x += 1) {
      const yVal = func(x);
      
      // Map x to SVG coordinate space
      const svgX = 30 + ((x - 1) / (maxN - 1)) * (svgW - 50);
      
      // Map y to SVG coordinate space (clamped to graph limits)
      // Higher y values mean smaller SVG y (downwards from top)
      // Let standard height equal value 500
      const maxYVal = 500;
      const clampedY = Math.min(maxYVal, yVal);
      const svgY = 160 - (clampedY / maxYVal) * 140;
      
      points.push(`${svgX},${svgY}`);
    }
    return points.join(' ');
  };

  const o1Points = getPoints(() => 10);
  const olognPoints = getPoints((x) => Math.log2(x) * 15);
  const onPoints = getPoints((x) => x * 4);
  const onlognPoints = getPoints((x) => x * Math.log2(x) * 1.5);
  const on2Points = getPoints((x) => x * x * 0.4);
  const o2nPoints = getPoints((x) => Math.pow(2, x) * 0.1);

  // Compute active highlight position for selected N
  const getActiveCoordinates = (func: (x: number) => number) => {
    const svgW = 340;
    const svgX = 30 + ((n - 1) / (50 - 1)) * (svgW - 50);
    const yVal = func(n);
    const maxYVal = 500;
    const svgY = 160 - (Math.min(maxYVal, yVal) / maxYVal) * 140;
    return { cx: svgX, cy: svgY };
  };

  const o1Coords = getActiveCoordinates(() => 10);
  const olognCoords = getActiveCoordinates((x) => Math.log2(x) * 15);
  const onCoords = getActiveCoordinates((x) => x * 4);
  const onlognCoords = getActiveCoordinates((x) => x * Math.log2(x) * 1.5);
  const on2Coords = getActiveCoordinates((x) => x * x * 0.4);
  const o2nCoords = getActiveCoordinates((x) => Math.pow(2, x) * 0.1);

  return (
    <div className="flex flex-col w-full text-slate-200">
      {/* N Slider Header */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-400">INPUT SIZE:</span>
          <span className="px-2 py-0.5 bg-slate-950 text-cyan-400 font-mono font-bold rounded border border-slate-800">
            N = {n}
          </span>
        </div>
        <input
          type="range"
          min="2"
          max="50"
          value={n}
          onChange={(e) => setN(Number(e.target.value))}
          className="w-40 accent-cyan-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* SVG Canvas Plot and Metrics list */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[220px] items-center">
        {/* Left: Custom SVG plot (7 cols) */}
        <div className="md:col-span-7 border border-slate-800 bg-slate-950/40 rounded-xl p-2 h-full flex items-center justify-center relative overflow-hidden select-none">
          <svg viewBox="0 0 340 180" className="w-full h-full font-mono text-[7px] text-slate-500">
            {/* Grid Axes Lines */}
            <line x1="30" y1="160" x2="330" y2="160" stroke="#1e293b" strokeWidth="1.5" />
            <line x1="30" y1="20" x2="30" y2="160" stroke="#1e293b" strokeWidth="1.5" />
            
            {/* Axis Label details */}
            <text x="315" y="172" fill="#475569" fontWeight="bold">N</text>
            <text x="10" y="20" fill="#475569" fontWeight="bold">Ops</text>

            {/* Plot curves paths */}
            <polyline points={o1Points} fill="none" stroke="#64748b" strokeWidth="1.5" />
            <polyline points={olognPoints} fill="none" stroke="#10b981" strokeWidth="1.5" />
            <polyline points={onPoints} fill="none" stroke="#06b6d4" strokeWidth="1.5" />
            <polyline points={onlognPoints} fill="none" stroke="#3b82f6" strokeWidth="1.5" />
            <polyline points={on2Points} fill="none" stroke="#f59e0b" strokeWidth="1.5" />
            <polyline points={o2nPoints} fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />

            {/* Coordinates highlight pointers */}
            <circle cx={o1Coords.cx} cy={o1Coords.cy} r="3" fill="#64748b" />
            <circle cx={olognCoords.cx} cy={olognCoords.cy} r="3" fill="#10b981" />
            <circle cx={onCoords.cx} cy={onCoords.cy} r="3" fill="#06b6d4" />
            <circle cx={onlognCoords.cx} cy={onlognCoords.cy} r="3" fill="#3b82f6" />
            <circle cx={on2Coords.cx} cy={on2Coords.cy} r="3" fill="#f59e0b" />
            {n <= 15 && <circle cx={o2nCoords.cx} cy={o2nCoords.cy} r="3" fill="#ef4444" />}
          </svg>
        </div>

        {/* Right: Operations list items (5 cols) */}
        <div className="md:col-span-5 bg-slate-900/40 border border-slate-800 rounded-xl p-3 h-full flex flex-col justify-center gap-1.5 text-[10px] font-mono">
          <h4 className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mb-1 border-b border-slate-800 pb-1">Operations count</h4>
          <div className="flex justify-between items-center text-slate-400">
            <span>O(1) Constant:</span>
            <span className="text-slate-300 font-bold">{ops.o1}</span>
          </div>
          <div className="flex justify-between items-center text-emerald-400">
            <span>O(log N) Log:</span>
            <span className="font-bold">{ops.ologn}</span>
          </div>
          <div className="flex justify-between items-center text-cyan-400">
            <span>O(N) Linear:</span>
            <span className="font-bold">{ops.on}</span>
          </div>
          <div className="flex justify-between items-center text-blue-400">
            <span>O(N log N) Linearithmic:</span>
            <span className="font-bold">{ops.onlogn}</span>
          </div>
          <div className="flex justify-between items-center text-amber-500">
            <span>O(N²) Quadratic:</span>
            <span className="font-bold">{ops.on2}</span>
          </div>
          <div className="flex justify-between items-center text-rose-500">
            <span>O(2ⁿ) Exponential:</span>
            <span className="font-bold">{ops.o2n === Infinity ? 'Infinity' : ops.o2n}</span>
          </div>
        </div>
      </div>

      {/* Reset control footer */}
      <div className="flex justify-end mt-4 pt-4 border-t border-slate-900 px-2">
        <button
          onClick={() => setN(10)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold transition cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset N</span>
        </button>
      </div>
    </div>
  );
};
