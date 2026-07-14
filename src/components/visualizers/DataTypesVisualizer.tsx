import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';

interface DataTypeItem {
  name: string;
  type: string;
  isMutable: boolean;
  initialValue: string;
  mutatedValue: string;
  initialAddress: string;
  mutatedAddress: string;
  description: string;
  actionLabel: string;
}

interface DataTypesVisualizerProps {
  executionResult?: any;
  currentStep?: number;
}

export const DataTypesVisualizer: React.FC<DataTypesVisualizerProps> = () => {
  const [selectedType, setSelectedType] = useState<'int' | 'str' | 'list' | 'dict'>('int');
  const [hasMutated, setHasMutated] = useState(false);

  const dataTypesInfo: Record<'int' | 'str' | 'list' | 'dict', DataTypeItem> = {
    int: {
      name: 'Integer',
      type: 'int (Immutable)',
      isMutable: false,
      initialValue: '42',
      mutatedValue: '43',
      initialAddress: '0x10A8',
      mutatedAddress: '0x24C0',
      description: 'Integers are immutable. Incrementing value (x = x + 1) creates a brand new integer object at a different memory address.',
      actionLabel: 'Increment (x += 1)',
    },
    str: {
      name: 'String',
      type: 'str (Immutable)',
      isMutable: false,
      initialValue: '"Python"',
      mutatedValue: '"Python!"',
      initialAddress: '0x3010',
      mutatedAddress: '0x5C42',
      description: 'Strings are immutable. Adding characters (s = s + "!") allocates new space and builds a new string elsewhere in RAM.',
      actionLabel: 'Append "!" (s += "!")',
    },
    list: {
      name: 'List',
      type: 'list (Mutable)',
      isMutable: true,
      initialValue: '[10, 20, 30]',
      mutatedValue: '[10, 20, 30, 40]',
      initialAddress: '0x88F0',
      mutatedAddress: '0x88F0', // SAME ADDRESS!
      description: 'Lists are mutable. Appending an item changes the list elements in-place. The reference address stays exactly the same.',
      actionLabel: 'Append 40 (lst.append(40))',
    },
    dict: {
      name: 'Dictionary',
      type: 'dict (Mutable)',
      isMutable: true,
      initialValue: '{"a": 1}',
      mutatedValue: '{"a": 1, "b": 2}',
      initialAddress: '0x99B4',
      mutatedAddress: '0x99B4', // SAME ADDRESS!
      description: 'Dictionaries are mutable key-value hash stores. Inserting keys directly updates the dictionary at its current memory address.',
      actionLabel: 'Add key "b" (d["b"] = 2)',
    },
  };

  const active = dataTypesInfo[selectedType];

  return (
    <div className="flex flex-col w-full text-slate-200">
      {/* Type Selector Header */}
      <div className="flex justify-center border-b border-slate-800 p-0.5 bg-slate-900/40 rounded-xl mb-4">
        {(Object.keys(dataTypesInfo) as Array<'int' | 'str' | 'list' | 'dict'>).map((key) => (
          <button
            key={key}
            onClick={() => {
              setSelectedType(key);
              setHasMutated(false);
            }}
            className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition duration-200 cursor-pointer ${
              selectedType === key
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {dataTypesInfo[key].name}
          </button>
        ))}
      </div>

      {/* Description */}
      <div className="text-xs text-slate-400 min-h-[36px] mb-4 text-center leading-relaxed px-2">
        {active.description}
      </div>

      {/* Main Container Display */}
      <div className="flex flex-col items-center justify-center h-[180px] border border-slate-800 bg-slate-950/40 rounded-2xl p-4 gap-4 relative">
        <div className="flex items-center gap-8">
          {/* Labeled variable reference */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Variable Name</span>
            <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl font-bold text-rose-400 text-sm">
              my_val
            </div>
          </div>

          {/* Reference Pointer Arrow */}
          <div className="text-slate-600 text-2xl font-bold font-mono">
            ➔
          </div>

          {/* Value Container */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Memory Object</span>
            <div
              className={`flex flex-col w-48 px-4 py-3 rounded-2xl shadow-2xl border transition-all duration-500 ${
                hasMutated
                  ? 'bg-rose-500/10 border-rose-500/40 scale-105'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 mb-1.5">
                <span className="text-cyan-400 font-bold">{active.type}</span>
                <span className="font-semibold">{hasMutated ? active.mutatedAddress : active.initialAddress}</span>
              </div>
              <div className="text-center font-bold font-mono text-slate-100 py-1.5 border border-slate-800/80 rounded bg-slate-950/80 text-sm">
                {hasMutated ? active.mutatedValue : active.initialValue}
              </div>
              <div className="flex justify-between items-center text-[8px] mt-1.5 font-bold uppercase tracking-wider">
                <span className={active.isMutable ? 'text-emerald-400' : 'text-amber-400'}>
                  {active.isMutable ? 'MUTABLE' : 'IMMUTABLE'}
                </span>
                <span className="text-slate-600">
                  Address: {hasMutated ? 'Changed!' : 'Unchanged'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer controls */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-900 px-2">
        <button
          onClick={() => setHasMutated(false)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 text-xs font-bold border border-slate-800 transition cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Value</span>
        </button>

        <button
          onClick={() => setHasMutated(true)}
          className="px-4 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition text-xs font-bold cursor-pointer"
        >
          {active.actionLabel}
        </button>
      </div>
    </div>
  );
};
