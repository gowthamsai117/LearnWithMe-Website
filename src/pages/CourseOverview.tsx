import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { curriculum } from '../curriculum/curriculumData';
import { ChevronRight, Play, Lock, CheckCircle2, Circle, AlertCircle } from 'lucide-react';

interface CourseOverviewProps {
  courseType: 'python' | 'dsa';
}

export const CourseOverview: React.FC<CourseOverviewProps> = ({ courseType }) => {
  const navigate = useNavigate();
  const { completedTopics, getPhaseProgress } = useProgress();

  // Filter phases by course type
  const phases = courseType === 'python'
    ? curriculum.filter(p => p.id !== 'dsa-track')
    : curriculum.filter(p => p.id === 'dsa-track');

  const courseTitle = courseType === 'python' ? 'Python Course' : 'Data Structures & Algorithms';
  const courseDesc = courseType === 'python' 
    ? 'Master Python programming from absolute basics to advanced compiler internals.'
    : 'Master algorithmic problem solving, graph trees, and complexity optimization.';

  // State for active phase in details view
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>(phases[0]?.id || '');
  const activePhase = phases.find(p => p.id === selectedPhaseId) || phases[0];

  // State for active topic selected inside details view
  const [selectedTopicId, setSelectedTopicId] = useState<string>(activePhase?.topics[0]?.id || '');
  const activeTopic = activePhase?.topics.find(t => t.id === selectedTopicId) || activePhase?.topics[0];

  // Calculate course completion
  const courseTopicIds = phases.flatMap(p => p.topics.map(t => t.id));
  const totalTopics = courseTopicIds.length;
  const completedTopicsCount = courseTopicIds.filter(id => completedTopics.includes(id)).length;
  const coursePercentage = totalTopics > 0 
    ? Math.round((completedTopicsCount / totalTopics) * 100) 
    : 0;

  // Streak logic/unlocking: Phase N is unlocked if it is the first phase,
  // or if the previous phase has at least 1 completed topic.
  const isPhaseUnlocked = (phaseIndex: number) => {
    if (phaseIndex === 0) return true;
    const prevPhase = phases[phaseIndex - 1];
    const prevCompletedCount = prevPhase.topics.filter(t => completedTopics.includes(t.id)).length;
    return prevCompletedCount > 0;
  };

  // SVG Progress Ring metrics
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const courseDashoffset = circumference - (coursePercentage / 100) * circumference;

  return (
    <div className="p-6 max-w-6xl mx-auto flex flex-col gap-8 select-none font-sans">
      
      {/* Top Breadcrumb & Heading Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-panel-border pb-6">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted font-mono uppercase tracking-wider mb-2">
            <Link to="/" className="hover:text-text-primary">Dashboard</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-accent">{courseTitle}</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">{courseTitle}</h1>
          <p className="text-xs text-text-muted mt-1 leading-relaxed max-w-xl">{courseDesc}</p>
        </div>

        {/* Course Progress stats */}
        <div className="flex items-center gap-4 bg-panel border border-panel-border p-4 rounded-xl shadow-sm self-start md:self-auto">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest leading-none">
              Course Progress
            </span>
            <span className="text-xl font-bold font-mono text-text-primary mt-1.5 tabular-nums">
              {completedTopicsCount} / {totalTopics}
            </span>
            <span className="text-[10px] text-text-muted mt-1">Topics Completed</span>
          </div>

          <div className="relative flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r={radius}
                className="stroke-panel-border"
                strokeWidth="5"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r={radius}
                className="stroke-accent transition-all duration-300"
                strokeWidth="5"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={courseDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-[11px] font-bold font-mono text-text-primary">
              {coursePercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Phase Cards */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest">
          Course Phases
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {phases.map((phase, idx) => {
            const unlocked = isPhaseUnlocked(idx);
            const progress = getPhaseProgress(phase.topics.map(t => t.id));
            const isCurrentSelected = phase.id === selectedPhaseId;
            const phaseCircumference = 2 * Math.PI * 14;
            const phaseDashoffset = phaseCircumference - (progress / 100) * phaseCircumference;

            return (
              <div 
                key={phase.id}
                onClick={() => {
                  if (unlocked) {
                    setSelectedPhaseId(phase.id);
                    setSelectedTopicId(phase.topics[0]?.id || '');
                  }
                }}
                className={`glass-panel p-4 flex flex-col justify-between gap-4 transition duration-200 cursor-pointer relative overflow-hidden group ${
                  !unlocked ? 'opacity-40 grayscale pointer-events-none' : ''
                } ${
                  isCurrentSelected ? 'ring-2 ring-accent border-transparent' : 'hover:border-accent/40'
                }`}
              >
                {/* Header info */}
                <div className="flex justify-between items-start gap-2">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-text-muted uppercase font-mono tracking-wider">
                      Phase {idx + 1}
                    </span>
                    <h3 className="text-xs font-bold text-text-primary mt-1 line-clamp-1">
                      {phase.name.replace(/Phase \d+:\s*/, '')}
                    </h3>
                  </div>

                  {/* SVG mini ring for phase progress */}
                  {unlocked ? (
                    <div className="relative flex items-center justify-center w-8 h-8">
                      <svg className="w-8 h-8 transform -rotate-90">
                        <circle
                          cx="16"
                          cy="16"
                          r="14"
                          className="stroke-panel-border"
                          strokeWidth="3.5"
                          fill="transparent"
                        />
                        <circle
                          cx="16"
                          cy="16"
                          r="14"
                          className="stroke-accent"
                          strokeWidth="3.5"
                          fill="transparent"
                          strokeDasharray={phaseCircumference}
                          strokeDashoffset={phaseDashoffset}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-[8px] font-bold font-mono text-text-primary">
                        {progress}%
                      </span>
                    </div>
                  ) : (
                    <div className="h-6 w-6 rounded-lg bg-panel-border/30 flex items-center justify-center text-text-muted">
                      <Lock className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>

                {/* Subtext and progress bar */}
                <div>
                  <span className="text-[10px] text-text-muted font-sans font-medium block mb-2">
                    {phase.topics.length} topics • {phase.topics.filter(t => completedTopics.includes(t.id)).length} completed
                  </span>
                  
                  {/* Linear progress bar at bottom */}
                  <div className="w-full h-1 bg-panel-border rounded overflow-hidden">
                    <div 
                      className="h-full bg-accent transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Phase Detail Panel */}
      {activePhase && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest">
            {activePhase.name} Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Left Side: Topic Checklist */}
            <div className="md:col-span-5 glass-panel p-4 flex flex-col gap-2 max-h-[360px] overflow-y-auto">
              {activePhase.topics.map((t, idx) => {
                const isCompleted = completedTopics.includes(t.id);
                const isSelected = t.id === selectedTopicId;
                const isCurrent = !isCompleted && idx === activePhase.topics.findIndex(top => !completedTopics.includes(top.id));

                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTopicId(t.id)}
                    className={`w-full flex items-center justify-between text-left p-2.5 rounded-lg border transition duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-accent/15 border-accent text-text-primary'
                        : 'bg-transparent border-transparent hover:bg-[#1C223C]/50 text-text-muted hover:text-text-primary'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                      ) : isCurrent ? (
                        <Circle className="h-4 w-4 text-accent fill-accent/20 flex-shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-panel-border flex-shrink-0" />
                      )}
                      <span className="text-[11px] font-sans truncate pr-1">
                        {idx + 1}. {t.name}
                      </span>
                    </div>

                    {t.buildFirst ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" title="Interactive Module" />
                    ) : (
                      <span className="text-[8px] text-text-muted/40 font-mono uppercase">soon</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right Side: Topic Preview Card */}
            <div className="md:col-span-7 glass-panel p-5 flex flex-col justify-between gap-6 min-h-[300px]">
              {activeTopic ? (
                <>
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-bold text-text-muted uppercase font-mono tracking-wider">
                        Topic Preview
                      </span>
                      
                      {/* Status badge pill */}
                      {completedTopics.includes(activeTopic.id) ? (
                        <span className="px-2 py-0.5 rounded-full bg-success/10 border border-success/20 text-success text-[8px] font-bold uppercase tracking-wider">
                          Completed
                        </span>
                      ) : activePhase.topics.findIndex(top => top.id === activeTopic.id) === 
                          activePhase.topics.findIndex(top => !completedTopics.includes(top.id)) ? (
                        <span className="px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[8px] font-bold uppercase tracking-wider animate-pulse">
                          Next Up
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-panel-border text-text-muted text-[8px] font-bold uppercase tracking-wider">
                          Locked
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-text-primary mt-1 font-mono">
                      {activeTopic.name}
                    </h3>
                    
                    <p className="text-xs text-text-muted leading-relaxed mt-1 font-sans">
                      {activeTopic.explanation 
                        ? activeTopic.explanation.slice(0, 180).replace(/[#*`[\]]/g, '') + '...' 
                        : 'Explore detailed code scopes, dynamic memory heap tracing layouts, and practice panels for this curriculum module.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-panel-border pt-4">
                    <div className="flex flex-col text-[10px] font-mono text-text-muted">
                      <span>Interactive: {activeTopic.buildFirst ? 'Yes' : 'No'}</span>
                      <span className="mt-0.5">Complexity: O(1) / O(N)</span>
                    </div>

                    <button
                      onClick={() => {
                        const path = courseType === 'python'
                          ? `/phase/${activePhase.id}/${activeTopic.id}`
                          : `/dsa/${activeTopic.id}`;
                        navigate(path);
                      }}
                      className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>{completedTopics.includes(activeTopic.id) ? 'Review Module' : 'Resume / Start'}</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 h-full text-center py-12">
                  <AlertCircle className="h-8 w-8 text-text-muted/40" />
                  <span className="text-xs text-text-muted italic">Select a topic from the list to preview</span>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
export default CourseOverview;
