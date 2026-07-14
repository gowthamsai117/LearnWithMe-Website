import React from 'react';
import { motion } from 'framer-motion';

interface ExecutionTraceRibbonProps {
  currentStep: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
  activeLine: number | null;
  description: string;
}

export const ExecutionTraceRibbon: React.FC<ExecutionTraceRibbonProps> = ({
  currentStep,
  totalSteps,
  onStepChange,
  activeLine,
  description,
}) => {
  if (totalSteps <= 0) {
    return (
      <div className="w-full bg-[#12161E] border-b border-line py-2 px-6 flex items-center justify-between text-xs font-mono text-paper/30 select-none">
        <span># execution_trace: idle (run code in sandbox to begin trace)</span>
        <span>step 0/0</span>
      </div>
    );
  }

  // Calculate percentage along track
  const progressPercent = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 100;

  return (
    <div className="w-full bg-[#12161E] border-b border-line py-3 px-6 flex flex-col md:flex-row md:items-center gap-4 select-none font-mono text-xs text-paper/80">
      {/* Step details */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-[10px] uppercase font-bold text-signal px-1.5 py-0.5 rounded bg-signal/10 border border-signal/20 animate-pulse">
          Trace Active
        </span>
        <span className="font-bold text-paper font-mono">
          {activeLine !== null ? `Line ${activeLine}` : 'Execution'}
        </span>
        <span className="text-paper/40 font-mono">•</span>
        <span className="text-paper/70 font-sans italic truncate max-w-[200px]" title={description}>
          {description}
        </span>
      </div>

      {/* Slider Track Area */}
      <div className="flex-grow flex items-center gap-4 relative">
        <span className="text-[9px] text-paper/40 font-mono">0</span>
        
        <div className="relative flex-grow h-4 flex items-center">
          {/* Background track line */}
          <div 
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const clickPercent = clickX / rect.width;
              const targetStep = Math.round(clickPercent * (totalSteps - 1));
              onStepChange(Math.max(0, Math.min(totalSteps - 1, targetStep)));
            }}
            className="w-full h-0.5 bg-line rounded-full cursor-pointer relative"
          >
            {/* Active track path */}
            <div 
              className="absolute left-0 top-0 h-full bg-signal/30"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Sliding Glowing dot */}
          <motion.div
            className="absolute h-3.5 w-3.5 rounded-full bg-signal cursor-pointer border border-ink flex items-center justify-center shadow-lg shadow-signal/30"
            style={{ 
              left: `calc(${progressPercent}% - 7px)`,
            }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }} // Simple representation
          />
        </div>

        <span className="text-[9px] text-paper/40 font-mono">{totalSteps - 1}</span>
      </div>

      {/* Counter */}
      <div className="flex items-center gap-2 flex-shrink-0 justify-between md:justify-end text-[11px]">
        <button
          disabled={currentStep === 0}
          onClick={() => onStepChange(Math.max(0, currentStep - 1))}
          className="px-1.5 py-0.5 rounded bg-line hover:bg-line/80 text-paper/70 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          &lt;
        </button>
        <span className="font-mono text-signal font-bold min-w-[50px] text-center">
          step {currentStep}/{totalSteps - 1}
        </span>
        <button
          disabled={currentStep === totalSteps - 1}
          onClick={() => onStepChange(Math.min(totalSteps - 1, currentStep + 1))}
          className="px-1.5 py-0.5 rounded bg-line hover:bg-line/80 text-paper/70 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          &gt;
        </button>
      </div>
    </div>
  );
};
