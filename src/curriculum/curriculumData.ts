import { phase1Topics, phase2Topics, phase3Topics, phase4Topics, phase5Topics } from './pythonCoreCurriculum';
import { phase6Topics, phase7Topics, phase8Topics, phase9Topics, phase10Topics, phase11Topics } from './pythonAdvancedCurriculum';
import { dsaTopics } from './dsaCurriculum';

export interface Topic {
  id: string;
  name: string;
  buildFirst: boolean;
  explanation?: string;
  starterCode?: string;
  visualizerId?: string;
  // For DSA problems
  isDSAProblem?: boolean;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  dsaTabs?: {
    title: string;
    explanation: string;
    code: string;
    complexity: string;
  }[];
}

export interface Phase {
  id: string;
  name: string;
  description: string;
  accentColor: string; // Tailwind text and border color classes
  hoverAccent: string;
  bgAccent: string;
  topics: Topic[];
}

export const curriculum: Phase[] = [
  {
    id: 'phase-1',
    name: 'Phase 1: Python Fundamentals',
    description: 'Master variables, memory allocation, primary data types, and standard input/output.',
    accentColor: 'text-rose-500 border-rose-500/20',
    hoverAccent: 'hover:border-rose-500/40',
    bgAccent: 'bg-rose-500/10',
    topics: phase1Topics
  },
  {
    id: 'phase-2',
    name: 'Phase 2: Control Flow',
    description: 'Learn conditional branching decisions, while/for loops, and line-by-line executions.',
    accentColor: 'text-amber-500 border-amber-500/20',
    hoverAccent: 'hover:border-amber-500/40',
    bgAccent: 'bg-amber-500/10',
    topics: phase2Topics
  },
  {
    id: 'phase-3',
    name: 'Phase 3: Strings',
    description: 'Manipulate text strings with indexing, slicing, regex patterns, and string utilities.',
    accentColor: 'text-yellow-500 border-yellow-500/20',
    hoverAccent: 'hover:border-yellow-500/40',
    bgAccent: 'bg-yellow-500/10',
    topics: phase3Topics
  },
  {
    id: 'phase-4',
    name: 'Phase 4: Collections',
    description: 'Explore core python collections: Lists, Tuples, Sets, and Dictionaries.',
    accentColor: 'text-emerald-500 border-emerald-500/20',
    hoverAccent: 'hover:border-emerald-500/40',
    bgAccent: 'bg-emerald-500/10',
    topics: phase4Topics
  },
  {
    id: 'phase-5',
    name: 'Phase 5: Functions',
    description: 'Understand function parameters, stack frames, closures, decorators, and recursion.',
    accentColor: 'text-cyan-500 border-cyan-500/20',
    hoverAccent: 'hover:border-cyan-500/40',
    bgAccent: 'bg-cyan-500/10',
    topics: phase5Topics
  },
  {
    id: 'phase-6',
    name: 'Phase 6: Modules & Packages',
    description: 'Organize code across multiple files with imports, packages, and namespaces.',
    accentColor: 'text-sky-500 border-sky-500/20',
    hoverAccent: 'hover:border-sky-500/40',
    bgAccent: 'bg-sky-500/10',
    topics: phase6Topics
  },
  {
    id: 'phase-7',
    name: 'Phase 7: File Handling',
    description: 'Read and write local files, directories, formats like JSON and CSV.',
    accentColor: 'text-violet-500 border-violet-500/20',
    hoverAccent: 'hover:border-violet-500/40',
    bgAccent: 'bg-violet-500/10',
    topics: phase7Topics
  },
  {
    id: 'phase-8',
    name: 'Phase 8: Exception Handling',
    description: 'Handle errors gracefully using try, except, finally, and custom exception triggers.',
    accentColor: 'text-fuchsia-500 border-fuchsia-500/20',
    hoverAccent: 'hover:border-fuchsia-500/40',
    bgAccent: 'bg-fuchsia-500/10',
    topics: phase8Topics
  },
  {
    id: 'phase-9',
    name: 'Phase 9: OOP',
    description: 'Deep dive into Classes, inheritance, polymorphism, encapsulation, and magic methods.',
    accentColor: 'text-rose-400 border-rose-400/20',
    hoverAccent: 'hover:border-rose-400/40',
    bgAccent: 'bg-rose-400/10',
    topics: phase9Topics
  },
  {
    id: 'phase-10',
    name: 'Phase 10: Advanced Python',
    description: 'Learn context managers, dataclasses, typing annotations, and async concurrency.',
    accentColor: 'text-indigo-400 border-indigo-400/20',
    hoverAccent: 'hover:border-indigo-400/40',
    bgAccent: 'bg-indigo-400/10',
    topics: phase10Topics
  },
  {
    id: 'phase-11',
    name: 'Phase 11: Python Internals',
    description: 'Discover compiled Bytecode, reference counts, and the CPython garbage collector.',
    accentColor: 'text-zinc-400 border-zinc-400/20',
    hoverAccent: 'hover:border-zinc-400/40',
    bgAccent: 'bg-zinc-400/10',
    topics: phase11Topics
  },
  {
    id: 'dsa-track',
    name: 'DSA TRACK',
    description: 'Detailed Data Structures & Algorithms training path with dynamic visual problem solvers.',
    accentColor: 'text-cyan-400 border-cyan-400/20',
    hoverAccent: 'hover:border-cyan-400/40',
    bgAccent: 'bg-cyan-400/10',
    topics: dsaTopics
  }
];

// Helper to get flat topics list for overall progress calculations
export const getAllTopicIds = () => {
  return curriculum.flatMap(p => p.topics.map(t => t.id));
};

export const getTopicById = (id: string) => {
  for (const phase of curriculum) {
    const topic = phase.topics.find(t => t.id === id);
    if (topic) return { topic, phase };
  }
  return null;
};
