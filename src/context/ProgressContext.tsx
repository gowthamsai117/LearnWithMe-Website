import React, { createContext, useContext, useState, useEffect } from 'react';

interface ProgressContextType {
  completedTopics: string[];
  savedCode: Record<string, string>;
  toggleTopicCompletion: (topicId: string) => void;
  saveTopicCode: (topicId: string, code: string) => void;
  getPhaseProgress: (topicIds: string[]) => number;
  getTotalProgress: (allTopicIds: string[]) => number;
  isTopicCompleted: (topicId: string) => boolean;
  resetProgress: () => void;
  // Gamification properties
  xp: number;
  streak: number;
  activityHistory: Record<string, number>;
  solvedProblems: string[];
  bookmarkedProblems: string[];
  unlockedAchievements: string[];
  awardXP: (amount: number) => void;
  incrementStreak: () => void;
  solveProblem: (id: string) => void;
  toggleBookmarkProblem: (id: string) => void;
  isProblemSolved: (id: string) => boolean;
  isProblemBookmarked: (id: string) => boolean;
  registerActivity: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [savedCode, setSavedCode] = useState<Record<string, string>>({});
  const [xp, setXp] = useState<number>(2450); // Initial XP matching the star widget count
  const [streak, setStreak] = useState<number>(12); // Initial streak count matching the flame count
  const [lastActiveDate, setLastActiveDate] = useState<string>('');
  const [activityHistory, setActivityHistory] = useState<Record<string, number>>({
    'Mon': 8, 'Tue': 14, 'Wed': 3, 'Thu': 9, 'Fri': 12, 'Sat': 0, 'Sun': 4
  });
  const [solvedProblems, setSolvedProblems] = useState<string[]>([]);
  const [bookmarkedProblems, setBookmarkedProblems] = useState<string[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(['first-code', 'quick-learner']);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const storedCompleted = localStorage.getItem('pypath_completed_topics');
      const storedCode = localStorage.getItem('pypath_saved_code');
      const storedXP = localStorage.getItem('pypath_xp');
      const storedStreak = localStorage.getItem('pypath_streak');
      const storedLastDate = localStorage.getItem('pypath_last_active_date');
      const storedHistory = localStorage.getItem('pypath_activity_history');
      const storedSolved = localStorage.getItem('pypath_solved_problems');
      const storedBookmarks = localStorage.getItem('pypath_bookmarked_problems');
      const storedAchievements = localStorage.getItem('pypath_unlocked_achievements');

      if (storedCompleted) setCompletedTopics(JSON.parse(storedCompleted));
      if (storedCode) setSavedCode(JSON.parse(storedCode));
      if (storedXP) setXp(Number(storedXP));
      if (storedStreak) setStreak(Number(storedStreak));
      if (storedLastDate) setLastActiveDate(storedLastDate);
      if (storedHistory) setActivityHistory(JSON.parse(storedHistory));
      if (storedSolved) setSolvedProblems(JSON.parse(storedSolved));
      if (storedBookmarks) setBookmarkedProblems(JSON.parse(storedBookmarks));
      if (storedAchievements) setUnlockedAchievements(JSON.parse(storedAchievements));
    } catch (e) {
      console.error("Error loading progress context details from local storage", e);
    }
  }, []);

  // Update Streak & XP when a topic is completed
  const toggleTopicCompletion = (topicId: string) => {
    setCompletedTopics((prev) => {
      const isCompleting = !prev.includes(topicId);
      const updated = isCompleting
        ? [...prev, topicId]
        : prev.filter((id) => id !== topicId);
      
      localStorage.setItem('pypath_completed_topics', JSON.stringify(updated));

      if (isCompleting) {
        // Award XP
        awardXP(100);
        registerActivity();
        
        // Trigger achievements evaluation
        setUnlockedAchievements((prevBadge) => {
          const badgeList = [...prevBadge];
          if (updated.length >= 1 && !badgeList.includes('first-code')) {
            badgeList.push('first-code');
          }
          if (updated.length >= 5 && !badgeList.includes('quick-learner')) {
            badgeList.push('quick-learner');
          }
          localStorage.setItem('pypath_unlocked_achievements', JSON.stringify(badgeList));
          return badgeList;
        });
      }
      return updated;
    });
  };

  const saveTopicCode = (topicId: string, code: string) => {
    setSavedCode((prev) => {
      const updated = { ...prev, [topicId]: code };
      localStorage.setItem('pypath_saved_code', JSON.stringify(updated));
      return updated;
    });
  };

  const isTopicCompleted = (topicId: string) => {
    return completedTopics.includes(topicId);
  };

  const getPhaseProgress = (topicIds: string[]) => {
    if (topicIds.length === 0) return 0;
    const completedInPhase = topicIds.filter((id) => completedTopics.includes(id)).length;
    return Math.round((completedInPhase / topicIds.length) * 100);
  };

  const getTotalProgress = (allTopicIds: string[]) => {
    if (allTopicIds.length === 0) return 0;
    const completedCount = allTopicIds.filter((id) => completedTopics.includes(id)).length;
    return Math.round((completedCount / allTopicIds.length) * 100);
  };

  const awardXP = (amount: number) => {
    setXp((prev) => {
      const nextXP = prev + amount;
      localStorage.setItem('pypath_xp', String(nextXP));
      return nextXP;
    });
  };

  const incrementStreak = () => {
    setStreak((prev) => {
      const nextStreak = prev + 1;
      localStorage.setItem('pypath_streak', String(nextStreak));
      return nextStreak;
    });
  };

  const solveProblem = (id: string) => {
    setSolvedProblems((prev) => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      localStorage.setItem('pypath_solved_problems', JSON.stringify(updated));
      
      // Award XP
      awardXP(150);
      registerActivity();

      // Trigger problem-solving achievements evaluation
      setUnlockedAchievements((prevBadge) => {
        const badgeList = [...prevBadge];
        if (updated.length >= 1 && !badgeList.includes('problem-solver')) {
          badgeList.push('problem-solver');
        }
        localStorage.setItem('pypath_unlocked_achievements', JSON.stringify(badgeList));
        return badgeList;
      });

      return updated;
    });
  };

  const toggleBookmarkProblem = (id: string) => {
    setBookmarkedProblems((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((bookmarkId) => bookmarkId !== id)
        : [...prev, id];
      localStorage.setItem('pypath_bookmarked_problems', JSON.stringify(updated));
      return updated;
    });
  };

  const isProblemSolved = (id: string) => solvedProblems.includes(id);
  const isProblemBookmarked = (id: string) => bookmarkedProblems.includes(id);

  const registerActivity = () => {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0]; // "YYYY-MM-DD"
    const weekday = today.toLocaleDateString('en-US', { weekday: 'short' }); // "Mon", "Tue" etc.

    // 1. Log compiling activity
    setActivityHistory((prev) => {
      const currentCount = prev[weekday] || 0;
      const updated = { ...prev, [weekday]: currentCount + 1 };
      localStorage.setItem('pypath_activity_history', JSON.stringify(updated));
      return updated;
    });

    // 2. Check and update daily streak
    if (lastActiveDate !== dateString) {
      if (lastActiveDate) {
        const lastDate = new Date(lastActiveDate);
        const diffTime = Math.abs(today.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          // Increment streak
          incrementStreak();
        } else if (diffDays > 1) {
          // Reset streak to 1
          setStreak(1);
          localStorage.setItem('pypath_streak', '1');
        }
      } else {
        setStreak(1);
        localStorage.setItem('pypath_streak', '1');
      }
      setLastActiveDate(dateString);
      localStorage.setItem('pypath_last_active_date', dateString);
    }
  };

  const resetProgress = () => {
    setCompletedTopics([]);
    setSavedCode({});
    setXp(2450);
    setStreak(12);
    setSolvedProblems([]);
    setBookmarkedProblems([]);
    setUnlockedAchievements(['first-code', 'quick-learner']);
    setActivityHistory({
      'Mon': 8, 'Tue': 14, 'Wed': 3, 'Thu': 9, 'Fri': 12, 'Sat': 0, 'Sun': 4
    });

    localStorage.removeItem('pypath_completed_topics');
    localStorage.removeItem('pypath_saved_code');
    localStorage.setItem('pypath_xp', '2450');
    localStorage.setItem('pypath_streak', '12');
    localStorage.removeItem('pypath_last_active_date');
    localStorage.setItem('pypath_unlocked_achievements', JSON.stringify(['first-code', 'quick-learner']));
    localStorage.removeItem('pypath_solved_problems');
    localStorage.removeItem('pypath_bookmarked_problems');
    localStorage.setItem('pypath_activity_history', JSON.stringify({
      'Mon': 8, 'Tue': 14, 'Wed': 3, 'Thu': 9, 'Fri': 12, 'Sat': 0, 'Sun': 4
    }));
  };

  return (
    <ProgressContext.Provider
      value={{
        completedTopics,
        savedCode,
        toggleTopicCompletion,
        saveTopicCode,
        getPhaseProgress,
        getTotalProgress,
        isTopicCompleted,
        resetProgress,
        xp,
        streak,
        activityHistory,
        solvedProblems,
        bookmarkedProblems,
        unlockedAchievements,
        awardXP,
        incrementStreak,
        solveProblem,
        toggleBookmarkProblem,
        isProblemSolved,
        isProblemBookmarked,
        registerActivity,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
