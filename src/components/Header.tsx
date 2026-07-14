import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { curriculum } from '../curriculum/curriculumData';
import { Search, Flame, Star, Bell, ChevronDown, LogOut, Trophy, Target } from 'lucide-react';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { completedTopics, xp, streak } = useProgress();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const level = Math.floor(xp / 500) + 1;

  const allTopics = curriculum.flatMap((phase) =>
    phase.topics.map((t) => ({
      ...t,
      phaseId: phase.id,
      phaseName: phase.name,
    }))
  );

  const filteredTopics = allTopics.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-panel border-b border-panel-border px-6 flex items-center justify-between gap-4 z-40 select-none">
      {/* Left: Mobile wordmark / Breadcrumbs spacer */}
      <div className="flex items-center gap-3">
        <Link to="/" className="lg:hidden flex items-center gap-2">
          <div className="h-7 w-7 rounded bg-accent flex items-center justify-center font-bold text-white text-xs">
            Py
          </div>
          <span className="font-display font-bold text-sm text-text-primary">PyPath</span>
        </Link>
        <div className="hidden lg:block text-xs text-text-muted font-mono uppercase tracking-wider">
          // terminal_workspace_v2.0
        </div>
      </div>

      {/* Center: Search Autocomplete Bar */}
      <div ref={searchRef} className="relative w-full max-w-md mx-auto">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-muted">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          placeholder="Search topics, e.g. loops, lists, binary search..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsSearchOpen(true);
          }}
          onFocus={() => setIsSearchOpen(true)}
          className="w-full pl-10 pr-4 py-1.5 bg-[#0A0D18] text-xs text-text-primary border border-panel-border rounded-lg focus:outline-none focus:border-accent transition duration-150 font-mono placeholder-text-muted/50"
        />

        {isSearchOpen && searchQuery.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 max-h-72 overflow-y-auto bg-[#10142A] border border-panel-border rounded-xl shadow-2xl z-50 p-2 divide-y divide-panel-border">
            {filteredTopics.length > 0 ? (
              filteredTopics.map((topic) => {
                const isCompleted = completedTopics.includes(topic.id);
                const isDsa = topic.phaseId === 'dsa-track';

                return (
                  <button
                    key={topic.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                      if (isDsa) {
                        navigate(`/dsa/${topic.id}`);
                      } else {
                        navigate(`/phase/${topic.phaseId}/${topic.id}`);
                      }
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#1C223C]/50 flex items-center justify-between text-xs transition duration-150 font-mono"
                  >
                    <div className="flex flex-col gap-0.5 max-w-[70%]">
                      <span className="font-semibold text-text-primary truncate">{topic.name}</span>
                      <span className="text-[10px] text-text-muted truncate">
                        {topic.phaseName.toLowerCase().replace(/ /g, '_')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {isCompleted ? (
                        <span className="px-1.5 py-0.5 rounded bg-success/15 text-success border border-success/20 text-[9px] uppercase font-bold">
                          ✓ Completed
                        </span>
                      ) : topic.buildFirst ? (
                        <span className="px-1.5 py-0.5 rounded bg-accent/15 text-accent border border-accent/20 text-[9px] uppercase font-bold">
                          Interactive
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-panel-border text-text-muted text-[8px] uppercase">
                          Soon
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-4 text-xs text-text-muted text-center italic">
                No matching topics found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Gamification widgets and User Info */}
      <div className="flex items-center gap-3">
        {/* Streak Flame */}
        <div className="flex items-center gap-1.5 bg-[#1F1D2C] border border-warning/10 px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-warning shadow-sm">
          <Flame className="h-4 w-4 fill-current animate-pulse" />
          <span className="tabular-nums">{streak} Day Streak</span>
        </div>

        {/* XP Counter */}
        <div className="flex items-center gap-1.5 bg-[#2A2326] border border-gold/10 px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-gold shadow-sm">
          <Star className="h-4 w-4 fill-current" />
          <span className="tabular-nums">{xp} XP</span>
        </div>

        {/* Notification Bell */}
        <button className="h-8 w-8 rounded-lg border border-panel-border hover:bg-[#1C223C] flex items-center justify-center text-text-muted hover:text-text-primary relative cursor-pointer">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-danger border border-panel flex items-center justify-center text-[7px] text-white font-bold">
            3
          </span>
        </button>

        <div className="h-6 w-px bg-panel-border" />

        {/* User Card Avatar & Dropdown */}
        <div ref={profileRef} className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 hover:bg-[#1C223C] p-1.5 rounded-lg border border-transparent hover:border-panel-border transition cursor-pointer"
          >
            <img
              src="https://api.dicebear.com/7.x/pixel-art/svg?seed=Gowtham"
              alt="Gowtham Avatar"
              className="h-7 w-7 rounded bg-[#1F2540] border border-panel-border"
            />
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-text-primary leading-none">Gowtham</span>
              <span className="text-[9px] text-text-muted leading-none mt-1 font-mono">Level {level}</span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-text-muted" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-panel border border-panel-border rounded-xl shadow-2xl py-1 z-50 animate-fadeIn font-mono text-xs">
              <div className="px-3 py-2 border-b border-panel-border">
                <span className="block font-bold text-text-primary">Gowtham Sai</span>
                <span className="block text-[9px] text-text-muted">gowtham@pypath.io</span>
              </div>
              <button 
                onClick={() => { navigate('/explore'); setIsProfileOpen(false); }}
                className="w-full text-left px-3 py-2 hover:bg-[#1C223C]/50 text-text-primary flex items-center gap-2 cursor-pointer"
              >
                <Target className="h-3.5 w-3.5 text-accent" />
                <span>Explore Tracks</span>
              </button>
              <button 
                onClick={() => { navigate('/leaderboard'); setIsProfileOpen(false); }}
                className="w-full text-left px-3 py-2 hover:bg-[#1C223C]/50 text-text-primary flex items-center gap-2 cursor-pointer"
              >
                <Trophy className="h-3.5 w-3.5 text-gold" />
                <span>Leaderboard</span>
              </button>
              <button 
                onClick={() => { localStorage.clear(); window.location.reload(); }}
                className="w-full text-left px-3 py-2 hover:bg-danger/10 text-danger border-t border-panel-border flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Reset Account</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
export default Header;
