import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { curriculum, getAllTopicIds } from '../curriculum/curriculumData';
import { 
  Flame, 
  ArrowRight
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    completedTopics, 
    streak, 
    activityHistory, 
    unlockedAchievements 
  } = useProgress();

  const allTopicIds = getAllTopicIds();
  const totalTopicsCount = allTopicIds.length;
  const completedTopicsCount = completedTopics.length;
  const overallPercentage = totalTopicsCount > 0 
    ? Math.round((completedTopicsCount / totalTopicsCount) * 100) 
    : 0;

  // Find next topic to learn
  let nextTopicPath = '/phase/phase-1/variables-memory';
  
  // Find first uncompleted topic in core phases
  for (const phase of curriculum) {
    const uncompleted = phase.topics.find(t => !completedTopics.includes(t.id));
    if (uncompleted) {
      nextTopicPath = phase.id === 'dsa-track' 
        ? `/dsa/${uncompleted.id}` 
        : `/phase/${phase.id}/${uncompleted.id}`;
      break;
    }
  }

  // Radial progress constants
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallPercentage / 100) * circumference;

  // Activity chart parameters
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxActivityVal = Math.max(...Object.values(activityHistory), 10);

  // Phase Stepper logic
  const phases = curriculum.slice(0, 6); // First 6 phases for dashboard path

  // Map of static badges list
  const badges = [
    { id: 'first-code', name: 'First Code', desc: 'Run code in the sandbox', icon: '💻', color: 'border-accent text-accent bg-accent/5' },
    { id: 'quick-learner', name: 'Quick Learner', desc: 'Complete 5 core topics', icon: '⚡', color: 'border-warning text-warning bg-warning/5' },
    { id: 'problem-solver', name: 'Problem Solver', desc: 'Solve a DSA challenge', icon: '🛡️', color: 'border-success text-success bg-success/5' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto flex flex-col gap-8 select-none font-sans">
      
      {/* Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Welcome back, Gowtham! 👋
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Continue your learning journey. You've got this!
          </p>
        </div>
        
        <div className="relative">
          <select className="bg-panel border border-panel-border text-xs text-text-primary px-3 py-1.5 rounded-lg outline-none font-mono cursor-pointer">
            <option>This Week</option>
            <option>This Month</option>
            <option>All Time</option>
          </select>
        </div>
      </div>

      {/* Three-Card Stat Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Overall Progress */}
        <div className="glass-panel p-5 flex items-center justify-between gap-4 relative overflow-hidden">
          <div className="flex flex-col justify-between h-full min-w-0">
            <div>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-1">
                Overall Progress
              </span>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                You've completed <span className="text-text-primary font-bold font-mono">{overallPercentage}%</span> of your learning journey
              </p>
            </div>
            <div className="mt-4">
              <Link 
                to={nextTopicPath}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white text-[11px] font-bold rounded-lg hover:bg-accent-hover transition cursor-pointer"
              >
                <span>Continue Learning</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Large Radial Progress Widget */}
          <div className="relative flex-shrink-0 flex items-center justify-center">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-panel-border"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-accent transition-all duration-500"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-sm font-bold font-mono text-text-primary">
              {overallPercentage}%
            </span>
          </div>
        </div>

        {/* Card 2: Streak */}
        <div className="glass-panel p-5 flex flex-col justify-between gap-3">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                Day Streak
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <Flame className="h-5 w-5 text-warning fill-current animate-pulse" />
                <span className="text-2xl font-bold font-mono text-text-primary tabular-nums">{streak}</span>
              </div>
            </div>
            <span className="text-[10px] text-text-muted font-sans italic">Mon - Sun</span>
          </div>

          {/* Mini 7-Bar Chart */}
          <div className="flex justify-between items-end h-16 px-1">
            {weekdays.map((day) => {
              const val = activityHistory[day] || 0;
              const heightPct = val > 0 ? (val / maxActivityVal) * 100 : 8; // Small minimum block height
              return (
                <div key={day} className="flex flex-col items-center gap-1.5 flex-grow">
                  <div className="w-2.5 bg-panel-border rounded-t-sm h-full flex items-end">
                    <div 
                      className={`w-full rounded-t-sm transition-all duration-300 ${
                        val > 0 ? 'bg-accent' : 'bg-panel-border'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-text-muted">{day[0]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 3: Achievements */}
        <div className="glass-panel p-5 flex flex-col justify-between gap-3">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
              Achievements
            </span>
            <Link to="/achievements" className="text-[10px] font-bold text-accent hover:underline">
              View All
            </Link>
          </div>

          {/* Unlocked Badges widgets */}
          <div className="flex items-center gap-3">
            {badges.map((b) => {
              const isUnlocked = unlockedAchievements.includes(b.id);
              return (
                <div 
                  key={b.id}
                  className={`h-11 w-11 rounded-lg border flex flex-col items-center justify-center relative group ${
                    isUnlocked ? b.color : 'border-panel-border text-text-muted/40 bg-panel/30 grayscale opacity-45'
                  }`}
                  title={`${b.name}: ${b.desc}`}
                >
                  <span className="text-lg leading-none">{b.icon}</span>
                  <span className="text-[7px] text-center font-bold tracking-tight absolute bottom-0.5 truncate max-w-full scale-90 px-0.5">
                    {b.name.split(' ')[0]}
                  </span>
                </div>
              );
            })}
            
            {/* Overflow element */}
            <div className="h-10 w-10 rounded-full border border-dashed border-panel-border bg-panel-border/20 flex items-center justify-center text-[10px] font-mono font-bold text-text-muted">
              +12
            </div>
          </div>

          <p className="text-[10px] text-text-muted leading-relaxed font-sans italic">
            Keep completing curriculum topics to unlock more badges.
          </p>
        </div>

      </div>

      {/* Continue Learning row */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest">
          Continue Learning
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Card A: Variables */}
          <div className="glass-panel p-4 flex flex-col justify-between gap-3 hover:border-accent/40 transition duration-150 cursor-pointer"
               onClick={() => navigate('/phase/phase-1/variables-memory')}>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-bold text-accent uppercase font-mono tracking-wider">// core_phase_1</span>
                <h4 className="text-xs font-bold text-text-primary mt-1">Variables & Memory</h4>
              </div>
              <div className="h-6 w-6 rounded bg-[#2A233C] flex items-center justify-center text-accent text-xs">
                💻
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-text-muted mb-1 font-mono">
                <span>Completed</span>
                <span>{completedTopics.includes('variables-memory') ? '100%' : '75%'}</span>
              </div>
              <div className="w-full h-1 bg-panel-border rounded overflow-hidden">
                <div className="h-full bg-accent" style={{ width: completedTopics.includes('variables-memory') ? '100%' : '75%' }} />
              </div>
              <span className="text-[9px] text-text-muted font-mono block mt-2">Next: Dynamic Typing</span>
            </div>
          </div>

          {/* Card B: Lists */}
          <div className="glass-panel p-4 flex flex-col justify-between gap-3 hover:border-accent/40 transition duration-150 cursor-pointer"
               onClick={() => navigate('/phase/phase-4/lists-creation')}>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-bold text-accent uppercase font-mono tracking-wider">// core_phase_4</span>
                <h4 className="text-xs font-bold text-text-primary mt-1">Lists in Python</h4>
              </div>
              <div className="h-6 w-6 rounded bg-[#2A233C] flex items-center justify-center text-accent text-xs">
                📁
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-text-muted mb-1 font-mono">
                <span>Completed</span>
                <span>{completedTopics.includes('lists-creation') ? '100%' : '60%'}</span>
              </div>
              <div className="w-full h-1 bg-panel-border rounded overflow-hidden">
                <div className="h-full bg-accent" style={{ width: completedTopics.includes('lists-creation') ? '100%' : '60%' }} />
              </div>
              <span className="text-[9px] text-text-muted font-mono block mt-2">Next: List Methods</span>
            </div>
          </div>

          {/* Card C: Binary Search */}
          <div className="glass-panel p-4 flex flex-col justify-between gap-3 hover:border-accent/40 transition duration-150 cursor-pointer"
               onClick={() => navigate('/dsa/binary-search')}>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-bold text-accent uppercase font-mono tracking-wider">// dsa_searching</span>
                <h4 className="text-xs font-bold text-text-primary mt-1">Binary Search</h4>
              </div>
              <div className="h-6 w-6 rounded bg-[#2A233C] flex items-center justify-center text-accent text-xs">
                🔍
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-text-muted mb-1 font-mono">
                <span>Completed</span>
                <span>{completedTopics.includes('binary-search') ? '100%' : '40%'}</span>
              </div>
              <div className="w-full h-1 bg-panel-border rounded overflow-hidden">
                <div className="h-full bg-accent" style={{ width: completedTopics.includes('binary-search') ? '100%' : '40%' }} />
              </div>
              <span className="text-[9px] text-text-muted font-mono block mt-2">Next: Lower Bound</span>
            </div>
          </div>

          {/* Card D: Functions */}
          <div className="glass-panel p-4 flex flex-col justify-between gap-3 hover:border-accent/40 transition duration-150 cursor-pointer"
               onClick={() => navigate('/phase/phase-5/functions-def')}>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-bold text-accent uppercase font-mono tracking-wider">// core_phase_5</span>
                <h4 className="text-xs font-bold text-text-primary mt-1">Functions Basics</h4>
              </div>
              <div className="h-6 w-6 rounded bg-[#2A233C] flex items-center justify-center text-accent text-xs">
                ⚙️
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-text-muted mb-1 font-mono">
                <span>Completed</span>
                <span>{completedTopics.includes('functions-def') ? '100%' : '32%'}</span>
              </div>
              <div className="w-full h-1 bg-panel-border rounded overflow-hidden">
                <div className="h-full bg-accent" style={{ width: completedTopics.includes('functions-def') ? '100%' : '32%' }} />
              </div>
              <span className="text-[9px] text-text-muted font-mono block mt-2">Next: Scope Rules</span>
            </div>
          </div>
        </div>
      </div>

      {/* Your Learning Path Stepper */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-baseline">
          <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest">
            Your Learning Path
          </h2>
          <Link to="/python-course" className="text-[10px] font-bold text-accent hover:underline uppercase tracking-wider">
            View Full Roadmap
          </Link>
        </div>

        <div className="glass-panel p-6 overflow-x-auto">
          <div className="flex items-center min-w-[700px] justify-between relative py-2">
            
            {/* Background connecting line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-panel-border -translate-y-1/2 z-0" />
            
            {phases.map((p, idx) => {
              const doneCount = p.topics.filter(t => completedTopics.includes(t.id)).length;
              const isCompleted = doneCount === p.topics.length && p.topics.length > 0;
              const isCurrent = doneCount > 0 && doneCount < p.topics.length;
              
              return (
                <div 
                  key={p.id} 
                  className="flex flex-col items-center gap-2.5 relative z-10 w-24 text-center cursor-pointer"
                  onClick={() => navigate(idx === 5 ? '/python-course' : `/phase/${p.id}/${p.topics[0]?.id || ''}`)}
                >
                  {/* Stepper Node Circle */}
                  <div 
                    className={`h-9 w-9 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-accent border-accent text-white shadow shadow-accent/25' 
                        : isCurrent 
                        ? 'bg-panel border-accent text-accent scale-110 ring-4 ring-accent/10' 
                        : 'bg-panel border-panel-border text-text-muted/50'
                    }`}
                  >
                    {isCompleted ? '✓' : `0${idx + 1}`}
                  </div>
                  
                  {/* Label */}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-text-primary truncate max-w-[90px]">
                      {p.name.replace(/Phase \d+:\s*/, '')}
                    </span>
                    <span className="text-[9px] text-text-muted font-mono">
                      {doneCount}/{p.topics.length}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recommended For You */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest">
          Recommended For You
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Rec A */}
          <div className="glass-panel p-4 flex flex-col justify-between gap-4 hover:border-accent/40 transition duration-150 cursor-pointer"
               onClick={() => navigate('/dsa/two-pointers')}>
            <div>
              <div className="flex justify-between items-start">
                <span className="px-1.5 py-0.5 rounded bg-accent/15 text-accent text-[9px] font-bold uppercase font-mono tracking-wider">
                  Arrays
                </span>
                <span className="text-[10px] text-text-muted font-mono font-bold">★ 4.8</span>
              </div>
              <h4 className="text-xs font-bold text-text-primary mt-2">Two Pointers Technique</h4>
              <p className="text-[10px] text-text-muted mt-1 leading-relaxed font-sans">
                Master array searching optimizations with left/right indexing variables.
              </p>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold uppercase">
              <span className="text-text-muted">DSA Traversal</span>
              <span className="px-2 py-0.5 rounded bg-success/10 text-success text-[8px] font-bold">Beginner</span>
            </div>
          </div>

          {/* Rec B */}
          <div className="glass-panel p-4 flex flex-col justify-between gap-4 hover:border-accent/40 transition duration-150 cursor-pointer"
               onClick={() => navigate('/phase/phase-4/dict-comprehension')}>
            <div>
              <div className="flex justify-between items-start">
                <span className="px-1.5 py-0.5 rounded bg-accent/15 text-accent text-[9px] font-bold uppercase font-mono tracking-wider">
                  Core Python
                </span>
                <span className="text-[10px] text-text-muted font-mono font-bold">★ 4.9</span>
              </div>
              <h4 className="text-xs font-bold text-text-primary mt-2">List Comprehensions</h4>
              <p className="text-[10px] text-text-muted mt-1 leading-relaxed font-sans">
                Learn to compile list/dict creation operations in single inline lines.
              </p>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold uppercase">
              <span className="text-text-muted">Advanced Syntax</span>
              <span className="px-2 py-0.5 rounded bg-warning/10 text-warning text-[8px] font-bold">Intermediate</span>
            </div>
          </div>

          {/* Rec C */}
          <div className="glass-panel p-4 flex flex-col justify-between gap-4 hover:border-accent/40 transition duration-150 cursor-pointer"
               onClick={() => navigate('/dsa/recursion')}>
            <div>
              <div className="flex justify-between items-start">
                <span className="px-1.5 py-0.5 rounded bg-accent/15 text-accent text-[9px] font-bold uppercase font-mono tracking-wider">
                  Algorithms
                </span>
                <span className="text-[10px] text-text-muted font-mono font-bold">★ 4.7</span>
              </div>
              <h4 className="text-xs font-bold text-text-primary mt-2">Recursion Tree Traversal</h4>
              <p className="text-[10px] text-text-muted mt-1 leading-relaxed font-sans">
                Understand calls winding and stack memory allocations.
              </p>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold uppercase">
              <span className="text-text-muted">DSA - Recursion</span>
              <span className="px-2 py-0.5 rounded bg-danger/10 text-danger text-[8px] font-bold">Advanced</span>
            </div>
          </div>

          {/* Rec D */}
          <div className="glass-panel p-4 flex flex-col justify-between gap-4 hover:border-accent/40 transition duration-150 cursor-pointer"
               onClick={() => navigate('/phase/phase-7/file-io')}>
            <div>
              <div className="flex justify-between items-start">
                <span className="px-1.5 py-0.5 rounded bg-accent/15 text-accent text-[9px] font-bold uppercase font-mono tracking-wider">
                  Python Core
                </span>
                <span className="text-[10px] text-text-muted font-mono font-bold">★ 4.6</span>
              </div>
              <h4 className="text-xs font-bold text-text-primary mt-2">File Input & Output</h4>
              <p className="text-[10px] text-text-muted mt-1 leading-relaxed font-sans">
                Manage read and write buffers on local files using with context managers.
              </p>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold uppercase">
              <span className="text-text-muted">File Streams</span>
              <span className="px-2 py-0.5 rounded bg-success/10 text-success text-[8px] font-bold">Beginner</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
export default Dashboard;
