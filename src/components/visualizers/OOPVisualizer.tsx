import React, { useState } from 'react';
import { Plus, RotateCcw } from 'lucide-react';

interface CarInstance {
  id: string;
  address: string;
  brand: string;
  color: string;
  speed: number;
}

interface OOPVisualizerProps {
  executionResult?: any;
  currentStep?: number;
}

export const OOPVisualizer: React.FC<OOPVisualizerProps> = () => {
  const [instances, setInstances] = useState<CarInstance[]>([
    { id: '1', address: '0x3EA2', brand: 'Tesla', color: 'red', speed: 40 }
  ]);
  const [brandInput, setBrandInput] = useState('Tesla');
  const [colorInput, setColorInput] = useState('blue');

  const brands = ['Tesla', 'Ferrari', 'BMW'];
  const colors = ['red', 'blue', 'yellow', 'green'];

  const handleCreateInstance = () => {
    if (instances.length >= 3) {
      alert("Maximum of 3 object instances allowed in this visualization parking lot!");
      return;
    }
    const hex = Math.floor(10000 + Math.random() * 50000).toString(16).toUpperCase();
    const newCar: CarInstance = {
      id: Date.now().toString(),
      address: `0x${hex}`,
      brand: brandInput,
      color: colorInput,
      speed: 0
    };
    setInstances([...instances, newCar]);
  };

  const handleAccelerate = (id: string) => {
    setInstances(prev => prev.map(car => {
      if (car.id === id) {
        return { ...car, speed: Math.min(180, car.speed + 30) };
      }
      return car;
    }));
  };

  const handlePaint = (id: string) => {
    const colorCycle = ['red', 'blue', 'yellow', 'green'];
    setInstances(prev => prev.map(car => {
      if (car.id === id) {
        const nextIdx = (colorCycle.indexOf(car.color) + 1) % colorCycle.length;
        return { ...car, color: colorCycle[nextIdx] };
      }
      return car;
    }));
  };

  const handleReset = () => {
    setInstances([
      { id: '1', address: '0x3EA2', brand: 'Tesla', color: 'red', speed: 40 }
    ]);
  };

  const getColorHex = (colorName: string) => {
    switch (colorName) {
      case 'red': return '#f43f5e';
      case 'blue': return '#06b6d4';
      case 'yellow': return '#eab308';
      case 'green': return '#10b981';
      default: return '#cbd5e1';
    }
  };

  return (
    <div className="flex flex-col w-full text-slate-200">
      {/* Creation form */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 mb-4 text-xs font-semibold">
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 uppercase tracking-wider">Brand:</span>
            <select
              value={brandInput}
              onChange={(e) => setBrandInput(e.target.value)}
              className="bg-slate-950 text-slate-200 border border-slate-800 rounded px-2 py-1 focus:outline-none"
            >
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 uppercase tracking-wider">Color:</span>
            <select
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              className="bg-slate-950 text-slate-200 border border-slate-800 rounded px-2 py-1 focus:outline-none"
            >
              {colors.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={handleCreateInstance}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Instantiate object</span>
        </button>
      </div>

      {/* Vis workspace layout split */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[240px] items-stretch overflow-y-auto">
        {/* Left: Class Blueprint Card (4 cols) */}
        <div className="md:col-span-4 bg-slate-900/50 border border-slate-800 rounded-xl p-3 flex flex-col justify-between text-[10px] font-mono select-none">
          <div>
            <div className="text-amber-400 font-bold mb-1.5">class Car:</div>
            <div className="pl-4 text-slate-500">
              <div>def __init__(self, color, brand):</div>
              <div className="pl-4 text-slate-400">self.color = color</div>
              <div className="pl-4 text-slate-400">self.brand = brand</div>
              <div className="pl-4 text-slate-400">self.speed = 0</div>
            </div>
            <div className="pl-4 text-slate-500 mt-2">
              <div>def accelerate(self, amount):</div>
              <div className="pl-4 text-slate-400">self.speed += amount</div>
            </div>
          </div>
          <div className="text-slate-600 italic leading-snug border-t border-slate-800/80 pt-2 text-[9px]">
            Blueprint defines parameters and actions. Instantiation creates custom memory copies.
          </div>
        </div>

        {/* Right: Active Objects list (8 cols) */}
        <div className="md:col-span-8 border border-slate-800 bg-slate-950/40 rounded-xl p-4 flex gap-4 overflow-x-auto items-center">
          {instances.length === 0 ? (
            <div className="text-xs text-slate-600 italic w-full text-center">No objects created. Click 'Instantiate object' above!</div>
          ) : (
            instances.map((car) => (
              <div
                key={car.id}
                className="flex-shrink-0 w-44 rounded-xl border border-slate-800 bg-slate-900 p-3 shadow-lg flex flex-col gap-2 relative animate-fadeIn"
              >
                {/* Header Object ID */}
                <div className="flex justify-between items-center border-b border-slate-800 pb-1 text-[9px] font-mono text-slate-500">
                  <span className="font-bold text-rose-400">Car Instance</span>
                  <span>{car.address}</span>
                </div>

                {/* Visual Car graphic container representation */}
                <div className="h-10 w-full rounded bg-slate-950 flex items-center justify-center relative overflow-hidden border border-slate-800/60">
                  <div
                    className="h-4 w-12 rounded transition-all duration-300 relative"
                    style={{
                      backgroundColor: getColorHex(car.color),
                      transform: `translateX(${(car.speed / 180) * 10 - 5}px)`
                    }}
                  >
                    {/* Car wheels */}
                    <div className="absolute -bottom-1 left-1.5 h-2 w-2 rounded-full bg-black border border-slate-800" />
                    <div className="absolute -bottom-1 right-1.5 h-2 w-2 rounded-full bg-black border border-slate-800" />
                    <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold text-black select-none uppercase">
                      {car.brand[0]}
                    </span>
                  </div>
                </div>

                {/* Properties fields list */}
                <div className="flex flex-col gap-0.5 text-[10px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">self.brand:</span>
                    <span className="text-slate-300 font-bold">{car.brand}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">self.color:</span>
                    <span className="font-bold" style={{ color: getColorHex(car.color) }}>
                      {car.color}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">self.speed:</span>
                    <span className="text-cyan-400 font-bold">{car.speed} km/h</span>
                  </div>
                </div>

                {/* Call Methods buttons */}
                <div className="grid grid-cols-2 gap-1.5 mt-1 border-t border-slate-800 pt-2">
                  <button
                    onClick={() => handleAccelerate(car.id)}
                    className="py-1 px-1.5 rounded bg-slate-950 hover:bg-slate-800 text-[8px] font-bold border border-slate-800 text-slate-300 transition uppercase cursor-pointer"
                  >
                    accelerate()
                  </button>
                  <button
                    onClick={() => handlePaint(car.id)}
                    className="py-1 px-1.5 rounded bg-slate-950 hover:bg-slate-800 text-[8px] font-bold border border-slate-800 text-slate-300 transition uppercase cursor-pointer"
                  >
                    paint()
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reset footer control */}
      <div className="flex justify-end mt-4 pt-4 border-t border-slate-900 px-2">
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold transition cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Factory</span>
        </button>
      </div>
    </div>
  );
};
