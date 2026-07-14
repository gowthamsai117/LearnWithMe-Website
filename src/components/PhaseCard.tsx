import React from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import type { Phase } from '../curriculum/curriculumData';
import { ChevronRight, Lock } from 'lucide-react';

interface PhaseCardProps {
  phase: Phase;
}

export const PhaseCard: React.FC<PhaseCardProps> = ({ phase }) => {
  const { getPhaseProgress, completedTopics } = useProgress();

  const topicIds = phase.topics.map((t) => t.id);
  const progress = getPhaseProgress(topicIds);
  const completedCount = phase.topics.filter((t) => completedTopics.includes(t.id)).length;
  const isDsa = phase.id === 'dsa-track';

  const firstTopicId = phase.topics.length > 0 ? phase.topics[0].id : '';

  // Parse color mapping dynamically to harmonized token values
  const getPhaseColorClass = (phaseId: string) => {
    switch (phaseId) {
      case 'dsa-track': return 'text-signal bg-signal/10 border-signal/25';
      default: return 'text-mutate bg-mutate/10 border-mutate/25';
    }
  };

  const getProgressBarColor = (phaseId: string) => {
    switch (phaseId) {
      case 'dsa-track': return 'bg-signal';
      default: return 'bg-mutate';
    }
  };

  return (
    <div className="bg-panel border border-line rounded-md p-5 flex flex-col justify-between h-full font-mono text-xs select-none">
      <div>
        {/* Card Header */}
        <div className="flex justify-between items-start mb-4">
          <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border ${getPhaseColorClass(phase.id)}`}>
            {isDsa ? 'DSA Track' : `Phase ${phase.id.replace('phase-', '')}`}
          </span>
          <span className="text-[10px] text-paper/40 font-bold">
            {completedCount.toString().padStart(2, '0')}/{phase.topics.length.toString().padStart(2, '0')} Done
          </span>
        </div>

        {/* Phase Info */}
        <h3 className="text-lg font-display font-bold text-paper mb-1.5 tracking-tight">{phase.name}</h3>
        <p className="text-[11px] text-paper/50 font-sans leading-relaxed mb-6">{phase.description}</p>
      </div>

      {/* Progress Metrics */}
      <div>
        <div className="flex items-center justify-between text-[10px] text-paper/40 mb-1.5 font-bold uppercase">
          <span>Completion</span>
          <span className="text-paper">{progress}%</span>
        </div>
        <div className="w-full h-1.5 bg-ink rounded-sm overflow-hidden mb-6 border border-line">
          <div
            className={`h-full transition-all duration-500 ease-out ${getProgressBarColor(phase.id)}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Action Button */}
        {phase.topics.length > 0 ? (
          <Link
            to={isDsa ? `/dsa/${firstTopicId}` : `/phase/${phase.id}/${firstTopicId}`}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded bg-panel hover:bg-line text-paper hover:text-signal text-xs font-bold transition duration-150 border border-line cursor-pointer"
          >
            <span>{progress > 0 ? 'Resume Track' : 'Start learning'}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <div className="w-full flex items-center justify-center gap-1.5 py-2 rounded bg-[#12161E]/40 text-paper/20 border border-line/50 cursor-not-allowed">
            <Lock className="h-3.5 w-3.5" />
            <span>Locked</span>
          </div>
        )}
      </div>
    </div>
  );
};
export default PhaseCard;
