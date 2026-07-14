import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { curriculum } from '../curriculum/curriculumData';
import { 
  LayoutDashboard, 
  Compass, 
  BookOpen, 
  Terminal, 
  FolderGit2, 
  HelpCircle, 
  FolderKanban, 
  FileCheck, 
  BookMarked, 
  MessageSquare, 
  Trophy, 
  Sparkles,
  Settings,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Workflow,
  CheckCircle2,
  Circle,
  ChevronDown
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { xp, completedTopics } = useProgress();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());

  const isCoursePage = 
    location.pathname.includes('/phase/') || 
    location.pathname.includes('/dsa/') ||
    location.pathname.includes('/python-course') ||
    location.pathname.includes('/dsa-course');

  const level = Math.floor(xp / 500) + 1;

  // Python course phases
  const pythonPhases = curriculum.filter(p => p.id !== 'dsa-track');

  const isActive = (path: string) => location.pathname === path;
  
  // Helper to determine if a specific phase is active
  const isPhaseActive = (phaseId: string) => {
    if (phaseId === 'dsa-track' && location.pathname.includes('/dsa/')) {
      return true;
    }
    return location.pathname.includes(`/phase/${phaseId}/`);
  };

  // Toggle phase expansion
  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      if (next.has(phaseId)) next.delete(phaseId);
      else next.add(phaseId);
      return next;
    });
  };

  // A phase shows topics if it's active OR manually expanded
  const isPhaseOpen = (phaseId: string) => isPhaseActive(phaseId) || expandedPhases.has(phaseId);

  return (
    <aside 
      className={`h-screen bg-panel border-r border-panel-border flex flex-col justify-between transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      } flex-shrink-0 z-30 select-none`}
    >
      {/* Upper Area */}
      <div className="flex-grow flex flex-col overflow-y-auto min-h-0">
        
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-panel-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center font-bold text-white text-sm shadow shadow-accent/20">
              Py
            </div>
            {!collapsed && (
              <span className="font-display text-lg font-bold text-text-primary">
                PyPath
              </span>
            )}
          </Link>
          
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-[#1C223C] cursor-pointer"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <ChevronRight className={`h-4 w-4 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>

        {isCoursePage ? (
          /* ========================================================================= */
          /* NESTED COURSE SIDEBAR VARIANT (matches screenshots)                      */
          /* ========================================================================= */
          <div className="p-3 flex flex-col gap-5">
            {/* Top Items Collapsed */}
            <div className="flex flex-col gap-1">
              <Link
                to="/"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  isActive('/') 
                    ? 'bg-accent/10 text-accent' 
                    : 'text-text-muted hover:text-text-primary hover:bg-[#1C223C]/50'
                }`}
              >
                <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>Dashboard</span>}
              </Link>
            </div>

            {/* PYTHON COURSE SECTION */}
            <div className="flex flex-col gap-1">
              {!collapsed && (
                <span className="text-[10px] font-bold text-text-muted/60 uppercase tracking-widest px-3 mb-1">
                  Python Course
                </span>
              )}
              {pythonPhases.map((phase) => {
                const active = isPhaseActive(phase.id);
                const open = isPhaseOpen(phase.id);
                const firstTopic = phase.topics[0]?.id || '';
                // Which topic is currently open
                const activeTopicId = location.pathname.split('/').pop() || '';
                return (
                  <div key={phase.id}>
                    {/* Phase header row — click to navigate to first topic OR toggle */}
                    <div
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition relative cursor-pointer ${
                        active 
                          ? 'bg-accent/10 text-accent font-semibold' 
                          : 'text-text-muted hover:text-text-primary hover:bg-[#1C223C]/50'
                      }`}
                      onClick={() => {
                        if (!active) {
                          // navigate to first topic handled by Link — just toggle open
                          togglePhase(phase.id);
                        }
                      }}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-accent rounded-r" />
                      )}
                      <Link
                        to={`/phase/${phase.id}/${firstTopic}`}
                        className="flex items-center gap-2 flex-1 min-w-0"
                        onClick={e => e.stopPropagation()}
                      >
                        <BookOpen className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && <span className="truncate flex-1">{phase.name.replace(/Phase \d+:\s*/, '')}</span>}
                      </Link>
                      {!collapsed && (
                        <button
                          onClick={(e) => { e.stopPropagation(); togglePhase(phase.id); }}
                          className="p-0.5 rounded hover:bg-[#1C223C] flex-shrink-0 cursor-pointer"
                        >
                          <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>

                    {/* Inline topic sub-links */}
                    {!collapsed && open && (
                      <div className="ml-5 mt-0.5 flex flex-col gap-0.5 border-l border-panel-border pl-2">
                        {phase.topics.map((t, idx) => {
                          const isTopicActive = activeTopicId === t.id || location.pathname.endsWith(t.id);
                          const done = completedTopics.includes(t.id);
                          return (
                            <Link
                              key={t.id}
                              to={`/phase/${phase.id}/${t.id}`}
                              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] transition ${
                                isTopicActive
                                  ? 'bg-accent/15 text-accent font-semibold'
                                  : 'text-text-muted hover:text-text-primary hover:bg-[#1C223C]/40'
                              }`}
                            >
                              {done
                                ? <CheckCircle2 className="h-3 w-3 text-success flex-shrink-0" />
                                : <Circle className="h-3 w-3 text-panel-border flex-shrink-0" />
                              }
                              <span className="truncate">{idx + 1}. {t.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
              
              <Link
                to="/python-course"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition ${
                  isActive('/python-course') 
                    ? 'bg-accent/10 text-accent' 
                    : 'text-text-muted hover:text-text-primary hover:bg-[#1C223C]/50'
                }`}
              >
                <Workflow className="h-4 w-4 flex-shrink-0 rotate-90" />
                {!collapsed && <span>All Phases</span>}
              </Link>
            </div>

            {/* DSA TRACK SECTION */}
            <div className="flex flex-col gap-1">
              {!collapsed && (
                <span className="text-[10px] font-bold text-text-muted/60 uppercase tracking-widest px-3 mb-1">
                  DSA Track
                </span>
              )}
              <Link
                to="/dsa-course"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition ${
                  isActive('/dsa-course') 
                    ? 'bg-accent/10 text-accent font-semibold' 
                    : 'text-text-muted hover:text-text-primary hover:bg-[#1C223C]/50'
                }`}
              >
                <BrainCircuit className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>DSA Roadmap</span>}
              </Link>
              <Link
                to="/dsa-problems"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition ${
                  location.pathname.startsWith('/dsa-problems') || location.pathname.includes('/dsa/')
                    ? 'bg-accent/10 text-accent font-semibold' 
                    : 'text-text-muted hover:text-text-primary hover:bg-[#1C223C]/50'
                }`}
              >
                <Terminal className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>Problems</span>}
              </Link>
              <Link
                to="/contest"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary hover:bg-[#1C223C]/50"
              >
                <Trophy className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>Contests</span>}
              </Link>
              <Link
                to="/visualizations"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary hover:bg-[#1C223C]/50"
              >
                <Compass className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>Visualizations</span>}
              </Link>
            </div>

            {/* EXTRA SECTION */}
            <div className="flex flex-col gap-1">
              {!collapsed && (
                <span className="text-[10px] font-bold text-text-muted/60 uppercase tracking-widest px-3 mb-1">
                  Extra
                </span>
              )}
              <Link
                to="/projects"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary hover:bg-[#1C223C]/50"
              >
                <FolderGit2 className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>Projects</span>}
              </Link>
              <Link
                to="/interview-prep"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary hover:bg-[#1C223C]/50"
              >
                <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>Interview Prep</span>}
              </Link>
              <Link
                to="/cheatsheets"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary hover:bg-[#1C223C]/50"
              >
                <BookMarked className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>Cheatsheets</span>}
              </Link>
            </div>

            {/* Unlock Pro Promo Widget */}
            {!collapsed && (
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-[#1A1E3A] to-[#14182E] border border-panel-border flex flex-col gap-3 relative overflow-hidden">
                <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-accent/20 blur-xl" />
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-[#FBBF24]/10 flex items-center justify-center text-[#FBBF24]">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-text-primary">Unlock Pro</span>
                </div>
                <p className="text-[10px] text-text-muted leading-relaxed">
                  Get unlimited access to all dynamic debug modules and problems.
                </p>
                <button className="w-full py-1.5 rounded-lg bg-accent text-white text-[10px] font-bold hover:bg-accent-hover transition cursor-pointer">
                  Upgrade Now
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* GENERAL DASHBOARD / EXPLORE SIDEBAR VARIANT                              */
          /* ========================================================================= */
          <div className="p-3 flex flex-col gap-5">
            {/* Top-Level Dashboard & Explore */}
            <div className="flex flex-col gap-1">
              <Link
                to="/"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                  isActive('/') 
                    ? 'bg-accent/10 text-accent' 
                    : 'text-text-muted hover:text-text-primary hover:bg-[#1C223C]/50'
                }`}
              >
                <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>Dashboard</span>}
              </Link>
              <Link
                to="/explore"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-text-muted hover:text-text-primary hover:bg-[#1C223C]/50"
              >
                <Compass className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>Explore</span>}
              </Link>
            </div>

            {/* LEARNING */}
            <div className="flex flex-col gap-1">
              {!collapsed && (
                <span className="text-[10px] font-bold text-text-muted/60 uppercase tracking-widest px-3 mb-1">
                  Learning
                </span>
              )}
              <Link
                to="/python-course"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary hover:bg-[#1C223C]/50"
              >
                <BookOpen className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>Python Course</span>}
              </Link>
              <Link
                to="/dsa-course"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary hover:bg-[#1C223C]/50"
              >
                <BrainCircuit className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>DSA Course</span>}
              </Link>
              <Link
                to="/projects"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary hover:bg-[#1C223C]/50"
              >
                <FolderKanban className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>Projects</span>}
              </Link>
              <Link
                to="/dsa-problems"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary hover:bg-[#1C223C]/50"
              >
                <Terminal className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>Practice Problems</span>}
              </Link>
              <Link
                to="/quizzes"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary hover:bg-[#1C223C]/50"
              >
                <FileCheck className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>Quizzes</span>}
              </Link>
              <Link
                to="/playground"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary hover:bg-[#1C223C]/50"
              >
                <Sparkles className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>Playground</span>}
              </Link>
            </div>

            {/* RESOURCES */}
            <div className="flex flex-col gap-1">
              {!collapsed && (
                <span className="text-[10px] font-bold text-text-muted/60 uppercase tracking-widest px-3 mb-1">
                  Resources
                </span>
              )}
              <Link
                to="/cheatsheets"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary hover:bg-[#1C223C]/50"
              >
                <BookMarked className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>Cheatsheets</span>}
              </Link>
              <Link
                to="/notes"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary hover:bg-[#1C223C]/50"
              >
                <FileCheck className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>Notes</span>}
              </Link>
              <Link
                to="/roadmaps"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary hover:bg-[#1C223C]/50"
              >
                <TrendingUp className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>Roadmaps</span>}
              </Link>
              <Link
                to="/blogs"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary hover:bg-[#1C223C]/50"
              >
                <Compass className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>Blogs</span>}
              </Link>
            </div>

            {/* COMMUNITY */}
            <div className="flex flex-col gap-1">
              {!collapsed && (
                <span className="text-[10px] font-bold text-text-muted/60 uppercase tracking-widest px-3 mb-1">
                  Community
                </span>
              )}
              <Link
                to="/contest"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary hover:bg-[#1C223C]/50"
              >
                <Trophy className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>Contests</span>}
              </Link>
              <Link
                to="/discussions"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary hover:bg-[#1C223C]/50"
              >
                <MessageSquare className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>Discussions</span>}
              </Link>
              <Link
                to="/leaderboard"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary hover:bg-[#1C223C]/50"
              >
                <TrendingUp className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>Leaderboard</span>}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Footer Area */}
      <div className="p-3 flex flex-col gap-1.5 border-t border-panel-border">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary hover:bg-[#1C223C]/50"
        >
          <Settings className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
        <Link
          to="/help"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary hover:bg-[#1C223C]/50"
        >
          <HelpCircle className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Help & Support</span>}
        </Link>
        
        {/* User Card */}
        {!collapsed && (
          <div className="mt-2 p-2.5 rounded-lg bg-[#141830] border border-panel-border flex items-center gap-2.5">
            <img
              src="https://api.dicebear.com/7.x/pixel-art/svg?seed=Gowtham"
              alt="Gowtham"
              className="h-8 w-8 rounded bg-[#1F2540] border border-panel-border"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-text-primary truncate">Gowtham Sai</span>
              <span className="text-[10px] text-accent font-semibold font-mono">Level {level}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;
