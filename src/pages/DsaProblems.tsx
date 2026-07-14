import React, { useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { Search, Star, Play, CheckCircle2, Award, Sparkles, Check } from 'lucide-react';
// @ts-ignore
import confetti from 'canvas-confetti';

interface Problem {
  id: string;
  number: number;
  title: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  acceptance: string;
  topicId: string; // Navigates to this topic in the app
}

export const DsaProblems: React.FC = () => {
  const { 
    solveProblem, 
    toggleBookmarkProblem,
    isProblemSolved,
    isProblemBookmarked
  } = useProgress();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const problems: Problem[] = [
    { id: 'p1', number: 1, title: 'Two Sum', topic: 'Arrays', difficulty: 'Easy', acceptance: '52.1%', topicId: 'two-pointers' },
    { id: 'p2', number: 2, title: 'Best Time to Buy and Sell Stock', topic: 'Arrays', difficulty: 'Easy', acceptance: '56.7%', topicId: 'two-pointers' },
    { id: 'p3', number: 3, title: 'Longest Substring Without Repeating Characters', topic: 'Strings', difficulty: 'Medium', acceptance: '38.9%', topicId: 'strings-patterns' },
    { id: 'p4', number: 4, title: 'Reverse Linked List', topic: 'Linked List', difficulty: 'Easy', acceptance: '62.3%', topicId: 'linked-list' },
    { id: 'p5', number: 5, title: 'Binary Tree Inorder Traversal', topic: 'Trees', difficulty: 'Easy', acceptance: '67.8%', topicId: 'trees' },
    { id: 'p6', number: 6, title: 'Dijkstra\'s Algorithm', topic: 'Graphs', difficulty: 'Hard', acceptance: '41.2%', topicId: 'graphs' },
    { id: 'p7', number: 7, title: 'Climbing Stairs', topic: 'Dynamic Programming', difficulty: 'Easy', acceptance: '50.4%', topicId: 'dp' },
    { id: 'p8', number: 8, title: 'Valid Parentheses', topic: 'Stack', difficulty: 'Easy', acceptance: '40.8%', topicId: 'stack-queue' },
    { id: 'p9', number: 9, title: 'Merge K Sorted Lists', topic: 'Linked List', difficulty: 'Hard', acceptance: '49.1%', topicId: 'linked-list' },
  ];

  const filterChips = ['All', 'Arrays', 'Strings', 'Linked List', 'Trees', 'Graphs', 'Dynamic Programming'];

  const filteredProblems = problems.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || p.topic === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const handleSolveProblem = (id: string) => {
    const wasAlreadySolved = isProblemSolved(id);
    solveProblem(id);
    if (!wasAlreadySolved) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#7C5CFC', '#22C55E', '#FBBF24']
      });
    }
  };

  const handleSolveRandom = () => {
    const unsolved = problems.filter(p => !isProblemSolved(p.id));
    if (unsolved.length === 0) {
      alert("Amazing! You have solved all problems!");
      return;
    }
    const randomIdx = Math.floor(Math.random() * unsolved.length);
    const chosen = unsolved[randomIdx];
    handleSolveProblem(chosen.id);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto flex flex-col gap-6 select-none font-sans">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-panel-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">DSA Practice Problems</h1>
          <p className="text-xs text-text-muted mt-0.5">Solve algorithmic puzzles to earn XP and level up your software engineering logic.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleSolveRandom}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition shadow shadow-accent/20 cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Solve Random</span>
          </button>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search field */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-muted">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search problems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 bg-panel text-xs text-text-primary border border-panel-border rounded-lg focus:outline-none focus:border-accent transition duration-150 font-mono placeholder-text-muted/40"
          />
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {filterChips.map((chip) => (
            <button
              key={chip}
              onClick={() => setActiveFilter(chip)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap border transition duration-150 cursor-pointer ${
                activeFilter === chip
                  ? 'bg-accent/15 border-accent text-accent'
                  : 'bg-panel border-panel-border text-text-muted hover:text-text-primary hover:border-text-muted/30'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Problems Table Grid */}
      <div className="glass-panel overflow-hidden border border-panel-border">
        <table className="w-full border-collapse text-left text-xs text-text-muted">
          <thead className="bg-[#141830] border-b border-panel-border text-[10px] uppercase font-bold text-text-muted font-mono">
            <tr>
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-4">Problem</th>
              <th className="py-3 px-4">Topic</th>
              <th className="py-3 px-4 w-28">Difficulty</th>
              <th className="py-3 px-4 w-28">Acceptance</th>
              <th className="py-3 px-4 w-28 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-panel-border/60">
            {filteredProblems.map((p) => {
              const solved = isProblemSolved(p.id);
              const bookmarked = isProblemBookmarked(p.id);
              
              const diffColors = 
                p.difficulty === 'Easy' 
                  ? 'text-success bg-success/15 border border-success/20' 
                  : p.difficulty === 'Medium' 
                  ? 'text-warning bg-warning/15 border border-warning/20' 
                  : 'text-danger bg-danger/15 border border-danger/20';

              return (
                <tr 
                  key={p.id}
                  className="hover:bg-[#1C223C]/30 transition duration-150 group"
                >
                  {/* Problem Number */}
                  <td className="py-3 px-4 text-center font-mono text-[11px] text-text-muted/60">
                    {p.number}
                  </td>
                  
                  {/* Title & Link */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      {solved ? (
                        <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-accent/20 flex-shrink-0" />
                      )}
                      <span className="font-semibold text-text-primary hover:text-accent cursor-pointer">
                        {p.title}
                      </span>
                    </div>
                  </td>
                  
                  {/* Topic name */}
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-panel-border/30 text-text-muted font-mono text-[10px]">
                      {p.topic}
                    </span>
                  </td>
                  
                  {/* Difficulty Tag */}
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${diffColors}`}>
                      {p.difficulty}
                    </span>
                  </td>
                  
                  {/* Acceptance rate */}
                  <td className="py-3 px-4 font-mono font-medium tabular-nums text-[11px]">
                    {p.acceptance}
                  </td>
                  
                  {/* Bookmark and Solve Actions */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 justify-center">
                      {/* Bookmark Button */}
                      <button
                        onClick={() => toggleBookmarkProblem(p.id)}
                        className={`p-1.5 rounded-lg border transition cursor-pointer ${
                          bookmarked 
                            ? 'text-gold bg-gold/10 border-gold/30' 
                            : 'text-text-muted/40 border-panel-border hover:text-gold hover:border-gold/30'
                        }`}
                        title={bookmarked ? "Bookmarked" : "Add Bookmark"}
                      >
                        <Star className={`h-3.5 w-3.5 ${bookmarked ? 'fill-current' : ''}`} />
                      </button>

                      {/* Solve trigger button */}
                      <button
                        onClick={() => handleSolveProblem(p.id)}
                        className={`p-1.5 rounded-lg border transition flex items-center justify-center cursor-pointer ${
                          solved
                            ? 'text-success bg-success/5 border-success/20 hover:bg-success/15'
                            : 'text-accent bg-accent/5 border-accent/20 hover:bg-accent/15'
                        }`}
                        title={solved ? "Solved! Click to re-run solver" : "Solve Challenge"}
                      >
                        {solved ? <Check className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredProblems.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-text-muted italic">
                  No matching problems found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Info Callout */}
      <div className="glass-panel p-4 flex items-start gap-3 bg-[#131730]">
        <Award className="h-5 w-5 text-accent mt-0.5" />
        <div className="flex flex-col text-[11px]">
          <span className="font-bold text-text-primary">XP Rewards:</span>
          <p className="text-text-muted leading-relaxed mt-1 font-sans">
            Every solved DSA challenge yields <span className="text-gold font-bold font-mono">+150 XP</span>. You also trigger streak multipliers when solving problems consecutively day by day.
          </p>
        </div>
      </div>

    </div>
  );
};
export default DsaProblems;
