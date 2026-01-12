
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Layout, ListTodo, BarChart2, Search, Plus, 
  ChevronRight, ChevronLeft, Menu, Code2, Edit2, 
  CheckCircle2, Flame, Download, Upload, Settings, ExternalLink,
  X, Wand2, ArrowUp, ArrowDown, Filter, CalendarClock
} from 'lucide-react';

// Components
import QuestionModal from './components/QuestionModal';
import Timer from './components/Timer';
import SidebarItem from './components/SidebarItem';
import MobileQuestionCard from './components/MobileQuestionCard';
import SettingsModal from './components/SettingsModal';
import ToastContainer from './components/ToastContainer';
import EfficiencyBadge from './components/EfficiencyBadge';
import StatusCell from './components/StatusCell';
import Analytics from './components/Analytics';
import { MiniHeatmap } from './components/Heatmap';
import AIQuestionGeneratorModal from './components/AIQuestionGeneratorModal';

// Types and Utilities
import { Question } from './types';
import { 
  formatTime, getDifficultyColor, safeUUID, formatTimeAgo 
} from './utils/helpers';

// --- Constants ---
const DATA_KEY = 'dsa-data-v48';
const GOAL_KEY = 'dsa-goal';
const API_KEY_STORAGE = 'dsa_api_key';

const INITIAL_DATA: Question[] = [
    {
        id: 'mock-1',
        title: 'Two Sum',
        url: 'https://leetcode.com/problems/two-sum/',
        difficulty: 'Easy',
        status: 'Solved',
        topics: ['Array', 'Hash Map'],
        description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.',
        notes: 'Used a hash map to store complements. O(n) time complexity.',
        hints: ['Trade space for time using a map'],
        solutions: [{ id: 's1', title: 'Optimal', code: 'function twoSum(nums, target) {\n  const map = new Map();\n  for(let i=0; i<nums.length; i++) {\n    const diff = target - nums[i];\n    if(map.has(diff)) return [map.get(diff), i];\n    map.set(nums[i], i);\n  }\n}', language: 'javascript', complexity: '**Time:** O(n) \n**Space:** O(n)' }],
        timeTaken: 450,
        lastAttempted: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), 
        mistakes: '',
        nextReviewDate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // Overdue
        reviewInterval: 2
    },
    {
        id: 'mock-2',
        title: 'Reverse Linked List',
        url: 'https://leetcode.com/problems/reverse-linked-list/',
        difficulty: 'Easy',
        status: 'Solved',
        topics: ['Linked List'],
        description: 'Reverse a singly linked list.',
        notes: 'Iterative approach using 3 pointers.',
        hints: [],
        solutions: [{ id: 's2', title: 'Iterative', code: 'function reverseList(head) {\n let prev = null;\n let curr = head;\n while(curr) {\n   let next = curr.next;\n   curr.next = prev;\n   prev = curr;\n   curr = next;\n }\n return prev;\n}', language: 'javascript' }],
        timeTaken: 300,
        lastAttempted: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        mistakes: '',
        nextReviewDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), // Future
        reviewInterval: 7
    },
    {
        id: 'mock-3',
        title: 'LRU Cache',
        url: 'https://leetcode.com/problems/lru-cache/',
        difficulty: 'Medium',
        status: 'Attempted',
        topics: ['Hash Map', 'Linked List', 'Design'],
        description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.',
        notes: 'Got stuck on the doubly linked list implementation.',
        hints: ['Use a Map for O(1) access and Doubly Linked List for O(1) removal/insertion'],
        solutions: [],
        timeTaken: 1200,
        lastAttempted: new Date(Date.now()).toISOString(),
        mistakes: 'Forgot to update head/tail pointers correctly on deletion.',
    },
    {
        id: 'mock-4',
        title: 'Median of Two Sorted Arrays',
        url: 'https://leetcode.com/problems/median-of-two-sorted-arrays/',
        difficulty: 'Hard',
        status: 'Todo',
        topics: ['Array', 'Binary Search', 'Divide and Conquer'],
        description: 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.',
        notes: '',
        hints: [],
        solutions: [],
        timeTaken: 0,
        lastAttempted: null,
        mistakes: '',
    },
    {
        id: 'mock-5',
        title: 'Valid Parentheses',
        url: 'https://leetcode.com/problems/valid-parentheses/',
        difficulty: 'Easy',
        status: 'Solved',
        topics: ['Stack', 'String'],
        description: 'Given a string s containing just the characters (, ), {, }, [ and ], determine if the input string is valid.',
        notes: 'Stack LIFO property matches perfectly.',
        hints: [],
        solutions: [{ id: 's5', title: 'Stack', code: '', language: 'python' }],
        timeTaken: 600,
        lastAttempted: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
        mistakes: '',
        nextReviewDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), // Overdue
        reviewInterval: 5
    }
];

const ToastContext = React.createContext<any>(null);

const TableRow = React.memo(({ q, index, view, onClick, onTagClick }: { q: Question, index: number, view: string, onClick: (q: Question) => void, onTagClick: (tag: string) => void }) => (
    <tr onClick={() => onClick(q)} className="hover:bg-white/5 cursor-pointer transition-colors group">
        <td className="p-5 text-white/30 font-mono text-xs">{index + 1}</td>
        <td className="p-5"><StatusCell status={q.status} lastAttempted={q.lastAttempted} /></td>
        <td className="p-5">
            <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-white truncate max-w-[240px] group-hover:text-indigo-300 transition-colors">{q.title}</span>
                {q.url && <a href={q.url} target="_blank" rel="noreferrer" className="text-white/20 hover:text-indigo-400 transition-colors p-1" onClick={(e) => e.stopPropagation()} title="Open Link"><ExternalLink size={12} /></a>}
            </div>
            <div className="flex flex-wrap gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                {q.topics.slice(0, 3).map((t: any) => (
                    <span 
                        key={t} 
                        onClick={(e) => { e.stopPropagation(); onTagClick(t); }}
                        className="px-1.5 py-0.5 bg-white/5 rounded text-[10px] text-indigo-100/70 border border-white/5 hover:bg-indigo-500/20 hover:text-indigo-200 cursor-pointer transition-colors"
                    >
                        {t}
                    </span>
                ))}
            </div>
        </td>
        <td className="p-5"><span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border shadow-sm ${getDifficultyColor(q.difficulty)}`}>{q.difficulty}</span></td>
        <td className="p-5 font-mono text-white/60">{formatTime(q.timeTaken)}</td>
        {view === 'dashboard' && <td className="p-5"><EfficiencyBadge difficulty={q.difficulty} timeTaken={q.timeTaken} /></td>}
    </tr>
), (prev, next) => prev.q === next.q && prev.index === next.index && prev.view === next.view);

const App = () => {
  const [questions, setQuestions] = useState<Question[]>(() => {
      try {
          const stored = localStorage.getItem(DATA_KEY);
          if (stored) return JSON.parse(stored);
          return INITIAL_DATA;
      } catch {
          return INITIAL_DATA;
      }
  });
  const [weeklyGoal, setWeeklyGoal] = useState(() => parseInt(localStorage.getItem(GOAL_KEY) || '5'));
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE) || '');
  
  const [view, setView] = useState('dashboard');
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAIGenOpen, setIsAIGenOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'lastAttempted', direction: 'descending' });
  const [toasts, setToasts] = useState<any[]>([]);
  const [tempGoal, setTempGoal] = useState(weeklyGoal);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const scrollContainerRef = useRef<any>(null);
  const lastScrollY = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Timer State
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [activeTimerTime, setActiveTimerTime] = useState(0);
  const [timeAdjustment, setTimeAdjustment] = useState<{value: number, id: string} | null>(null);

  useEffect(() => { localStorage.setItem(DATA_KEY, JSON.stringify(questions)); }, [questions]);
  useEffect(() => { localStorage.setItem(GOAL_KEY, weeklyGoal.toString()); }, [weeklyGoal]);
  useEffect(() => { localStorage.setItem(API_KEY_STORAGE, apiKey); }, [apiKey]);

  const addToast = useCallback((msg: string, type: string, undo: any) => { const id = Date.now(); setToasts(p => [...p, {id, message:msg, type, undoAction:undo?.type, undoData:undo?.data}]); setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000); }, []);
  const removeToast = (id: number) => setToasts(p => p.filter(t => t.id !== id));
  const handleUndo = (id: number) => { const t = toasts.find(x => x.id === id); if(t?.undoAction === 'DELETE_QUESTION') setQuestions((p: any) => [...p, t.undoData]); else if(t?.undoAction === 'UPDATE_QUESTION') setQuestions((p: any) => p.map((q: any) => q.id === t.undoData.id ? t.undoData : q)); removeToast(id); };

  const handleDelete = (id: string) => { const q = questions.find((x: any) => x.id === id); setQuestions((p: any) => p.filter((x: any) => x.id !== id)); addToast('Deleted', 'error', { type: 'DELETE_QUESTION', data: q }); };
  
  const addNewQuestion = () => { 
      const newQ: Question = { 
          id: safeUUID(), 
          title: '', 
          url: '', 
          description: '', 
          difficulty: 'Medium', 
          status: 'Todo', 
          timeTaken: 0, 
          lastAttempted: null, 
          topics: [], 
          mistakes: '', 
          notes: '', 
          hints: [], 
          solutions: [{
              id: Date.now().toString(),
              title: 'Solution 1',
              code: '',
              language: 'javascript'
          }] 
      }; 
      setActiveQuestion(newQ); 
  };

  const handleImportGenerated = (newQuestions: Question[]) => {
      setQuestions(prev => [...prev, ...newQuestions]);
      addToast(`Imported ${newQuestions.length} new questions!`, 'success', null);
  };

  const handleSaveQuestion = (q: any) => {
      setQuestions((prev: any) => {
          const exists = prev.find((item: any) => item.id === q.id);
          if (exists) {
              return prev.map((x: any) => x.id === q.id ? q : x);
          } else {
              return [...prev, q];
          }
      });
      setActiveQuestion(null);
      setIsTimerOpen(false); 
      addToast('Saved!', 'success', null);
  };

  const handleCloseQuestionModal = () => {
      setActiveQuestion(null);
      setIsTimerOpen(false);
  };

  const handleStartTimer = (startSeconds: number) => {
      setActiveTimerTime(startSeconds);
      setIsTimerOpen(true);
  };

  const handleTimerSave = (seconds: number) => {
      if (activeQuestion) {
          const updated = { ...activeQuestion, timeTaken: seconds }; // Update with absolute value from timer
          setQuestions((prev: any) => {
             const exists = prev.find((item: any) => item.id === updated.id);
             if (exists) return prev.map((x: any) => x.id === updated.id ? updated : x);
             return prev;
          });
          setActiveQuestion(updated); 
      }
      addToast(`Time updated: ${formatTime(seconds)}`, 'info', null);
  };

  const handleAddSessionTime = (seconds: number) => {
      if (isTimerOpen) {
          setTimeAdjustment({ value: seconds, id: Date.now().toString() });
      } else {
          // If timer not open, just update state directly
          setActiveTimerTime(prev => prev + seconds);
      }
  };
  
  const handleSaveApiKey = (key: string) => {
      setApiKey(key);
      addToast(key ? 'API Key saved' : 'API Key removed', 'success', null);
  };

  const handleBackup = () => {
    try {
      const dataStr = JSON.stringify({ questions, weeklyGoal, version: '1.0', timestamp: new Date().toISOString() }, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dsa_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      
      // Revoke URL after a small delay to ensure download starts
      setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
      }, 100);
      
      addToast('Backup downloaded!', 'success', null);
    } catch (e: any) {
      addToast('Export failed: ' + e.message, 'error', null);
    }
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Reset value immediately via onChange (though onClick handles pre-reset)
    e.target.value = '';

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const raw = event.target?.result as string;
            if (!raw) throw new Error("File is empty");
            
            const data = JSON.parse(raw);
            if (!data || !Array.isArray(data.questions)) throw new Error("Invalid backup: Missing 'questions' array");
            
            if(window.confirm(`Found backup with ${data.questions.length} questions.\n\nDo you want to REPLACE your current data with this backup?`)) {
                setQuestions(data.questions);
                if(typeof data.weeklyGoal === 'number') setWeeklyGoal(data.weeklyGoal);
                addToast(`Restored ${data.questions.length} questions successfully!`, 'success', null);
            }
        } catch (err: any) { 
            console.error("Import Error:", err);
            addToast(`Import Failed: ${err.message}`, 'error', null); 
        }
    };
    reader.onerror = () => {
        addToast("Error reading file", 'error', null);
    };
    reader.readAsText(file);
  };

  const handleExport = () => handleBackup();
  
  const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      const currentScrollY = scrollContainerRef.current.scrollTop;
      const diff = Math.abs(currentScrollY - lastScrollY.current);
      if (diff > 10) { 
          if (currentScrollY > lastScrollY.current && currentScrollY > 50) setShowHeader(false); 
          else setShowHeader(true); 
      }
      lastScrollY.current = currentScrollY;
  };

  const handleViewChange = (newView: string) => {
      setView(newView);
      setSearch('');
      setIsMobileMenuOpen(false);
  };

  const toggleDifficultyFilter = () => {
      const order: ('All' | 'Easy' | 'Medium' | 'Hard')[] = ['All', 'Easy', 'Medium', 'Hard'];
      const nextIndex = (order.indexOf(difficultyFilter) + 1) % order.length;
      setDifficultyFilter(order[nextIndex]);
  };

  const filtered = useMemo(() => {
    let d = questions.filter((q: any) => {
        if (view === 'todo') return q.status !== 'Solved'; 
        if (view === 'dashboard') return q.status === 'Solved'; 
        return true;
    });
    if (difficultyFilter !== 'All') d = d.filter((q: any) => q.difficulty === difficultyFilter);
    if(search) d = d.filter((q: any) => q.title.toLowerCase().includes(search.toLowerCase()) || q.topics.some((t: any) => t.toLowerCase().includes(search.toLowerCase())));
    return d.sort((a: any,b: any) => (sortConfig.direction==='ascending' ? 1 : -1) * (a[sortConfig.key] > b[sortConfig.key] ? 1 : -1));
  }, [questions, view, search, sortConfig, difficultyFilter]);

  const stats = useMemo(() => {
      const solved = questions.filter((q: any) => q.status === 'Solved').length;
      const solvedThisWeek = questions.filter((q: any) => (q.status === 'Solved' || q.status === 'Attempted') && new Date(q.lastAttempted).getTime() > new Date(Date.now() - 7*86400000).getTime()).length;
      return { solved, solvedThisWeek };
  }, [questions]);

  // Review Recommendation Logic
  const recommendedReviews = useMemo(() => {
      const now = new Date();
      return questions.filter(q => {
          if (q.status !== 'Solved') return false;
          // Check explicit review date
          if (q.nextReviewDate && new Date(q.nextReviewDate) <= now) return true;
          // Fallback: If no date but solved long ago (> 14 days)
          if (!q.nextReviewDate && q.lastAttempted) {
              const diff = now.getTime() - new Date(q.lastAttempted).getTime();
              return diff > 14 * 24 * 60 * 60 * 1000;
          }
          return false;
      }).slice(0, 3); // Limit to 3 for UI cleanliness
  }, [questions]);

  const requestSort = (key: string) => { const direction = sortConfig.key === key && sortConfig.direction === 'ascending' ? 'descending' : 'ascending'; setSortConfig({ key, direction }); };
  const getSortIcon = (key: string) => sortConfig.key !== key ? null : sortConfig.direction === 'ascending' ? <ArrowUp size={12} className="ml-1 inline" /> : <ArrowDown size={12} className="ml-1 inline" />;

  return (
    <ToastContext.Provider value={{ addToast, handleUndo }}>
      <div className="flex h-screen font-sans text-slate-200 overflow-hidden bg-transparent">
        
        {isMobileMenuOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />}
        
        <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-y-auto custom-scrollbar
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
            ${isSidebarCollapsed ? 'w-20' : 'w-64'}
            bg-slate-900/40 backdrop-blur-2xl border-r border-white/10 shadow-[4px_0_24px_rgba(0,0,0,0.2)]
        `}>
            {/* Sidebar content same as before ... */}
            <div className={`p-6 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} shrink-0 sticky top-0 z-10 bg-inherit/10 backdrop-blur-xl border-b border-white/5`}>
                {!isSidebarCollapsed && (
                    <div className="flex items-center gap-3 text-white overflow-hidden">
                        <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20 shrink-0 border border-white/10">
                            <Code2 size={24} className="text-white drop-shadow-sm" />
                        </div>
                        <div className="whitespace-nowrap">
                            <h1 className="font-bold text-lg tracking-tight text-white drop-shadow-md">DSA Master</h1>
                        </div>
                    </div>
                )}
                {isSidebarCollapsed && (
                     <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20 border border-white/10">
                        <Code2 size={24} className="text-white" />
                     </div>
                )}
                <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="hidden md:block text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10">
                    {isSidebarCollapsed ? <ChevronRight size={18}/> : <ChevronLeft size={18}/>}
                </button>
            </div>

            <nav className="flex-1 px-3 py-6 space-y-2">
                <SidebarItem icon={Layout} label="Dashboard" active={view === 'dashboard'} onClick={() => handleViewChange('dashboard')} count={questions.filter((q: any) => q.status === 'Solved').length} collapsed={isSidebarCollapsed} />
                <SidebarItem icon={ListTodo} label="To-Do List" active={view === 'todo'} onClick={() => handleViewChange('todo')} count={questions.filter((q: any) => q.status !== 'Solved').length} collapsed={isSidebarCollapsed} />
                <SidebarItem icon={BarChart2} label="Analytics" active={view === 'analytics'} onClick={() => handleViewChange('analytics')} collapsed={isSidebarCollapsed} />
                <div className="mt-6 pt-6 border-t border-white/10">
                    <SidebarItem icon={Settings} label="Settings" active={false} onClick={() => { setIsSettingsOpen(true); setIsMobileMenuOpen(false); }} collapsed={isSidebarCollapsed} />
                </div>
            </nav>

            {!isSidebarCollapsed && (
                <div className="p-4 border-t border-white/5 shrink-0 bg-black/10">
                    <div className="glass-card rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center justify-between text-indigo-100 mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 opacity-80">Weekly Goal {!isEditingGoal ? (<button onClick={() => { setTempGoal(weeklyGoal); setIsEditingGoal(true); }} className="hover:text-white transition-colors"><Edit2 size={10} /></button>) : (<button onClick={() => { setWeeklyGoal(tempGoal); setIsEditingGoal(false); addToast('Goal Updated', 'success', null); }} className="hover:text-emerald-400"><CheckCircle2 size={10} /></button>)}</span>
                            <Flame size={14} className="text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]" />
                        </div>
                        <div className="flex items-end justify-between text-white mb-3">
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold tracking-tight">{stats.solvedThisWeek}</span>
                                <span className="text-[10px] text-indigo-300/80 font-medium">/ {isEditingGoal ? (<input type="number" value={tempGoal} onChange={(e) => setTempGoal(parseInt(e.target.value) || 1)} className="w-8 bg-transparent border-b border-indigo-500 focus:outline-none text-white text-xs text-center p-0" autoFocus />) : weeklyGoal}</span>
                            </div>
                        </div>
                        <div className="w-full bg-black/30 h-1.5 rounded-full overflow-hidden mb-4 shadow-inner">
                            <div className="bg-gradient-to-r from-indigo-400 to-purple-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(99,102,241,0.6)]" style={{ width: `${Math.min((stats.solvedThisWeek / weeklyGoal) * 100, 100)}%` }}></div>
                        </div>
                        <div className="pt-3 border-t border-white/5">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[9px] text-indigo-200/60 font-bold uppercase tracking-wider">Activity (7d)</span>
                            </div>
                            <MiniHeatmap data={questions} />
                        </div>
                    </div>
                </div>
            )}
        </aside>

        <main className={`flex-1 flex flex-col h-screen overflow-hidden relative transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
            <header className={`absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 bg-slate-900/10 backdrop-blur-md border-b border-white/5 transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${showHeader ? 'translate-y-0' : '-translate-y-full'}`}>
                {/* Header content same as before */}
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-white/80"><Menu size={24} /></button>
                    <div><h2 className="text-xl font-bold text-white tracking-tight drop-shadow-md">{view === 'dashboard' ? 'Dashboard' : view === 'todo' ? 'To-Do List' : 'Analytics'}</h2></div>
                </div>
                
                <div className="flex items-center gap-3">
                    {view === 'todo' && (
                        <button onClick={addNewQuestion} className="hidden md:flex items-center gap-2 px-3 py-2 btn-glossy text-white text-xs font-bold rounded-lg transition-all"><Plus size={16} /><span className="hidden md:inline">Add</span></button>
                    )}

                    {view !== 'analytics' && (
                        <>
                            <button onClick={handleExport} className="hidden md:flex items-center gap-2 px-3 py-2 text-xs bg-white/5 text-indigo-100 font-bold rounded-lg hover:bg-white/10 transition-colors border border-white/10" title="Download backup"><Download size={14} /> Export</button>
                            <button onClick={() => fileInputRef.current?.click()} className="hidden md:flex items-center gap-2 px-3 py-2 text-xs bg-white/5 border border-white/10 text-indigo-100 font-bold rounded-lg hover:bg-white/10 transition-colors" title="Restore data"><Upload size={14} /> Import</button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleRestore} 
                                onClick={(e) => { (e.target as HTMLInputElement).value = '' }} 
                                className="hidden" 
                                accept=".json" 
                                data-testid="import-input" 
                            />
                            
                            <div className="relative group hidden md:block">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-indigo-400 transition-colors" size={16} />
                                <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-8 py-2 w-48 focus:w-64 bg-black/20 border border-white/5 rounded-xl text-sm text-white placeholder-white/30 focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all shadow-inner" />
                                {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white p-0.5"><X size={14} /></button>}
                            </div>
                        </>
                    )}
                </div>
            </header>

            <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto overflow-x-hidden pt-24 pb-8 px-4 md:px-8 custom-scrollbar">
                {view === 'todo' && (
                    <div className="flex items-center justify-between mb-6">
                         <button onClick={() => setIsAIGenOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-500/10 text-purple-200 font-bold rounded-xl hover:bg-purple-500/20 transition-colors border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]"><Wand2 size={16} /> Get More Questions</button>
                    </div>
                )}

                {view === 'analytics' ? (
                     <div className="max-w-7xl mx-auto">
                         <Analytics questions={questions} />
                     </div>
                ) : (
                    <>
                        {/* Recommended Reviews Section */}
                        {view === 'dashboard' && recommendedReviews.length > 0 && (
                             <div className="mb-8">
                                <div className="flex items-center gap-2 mb-3">
                                    <CalendarClock className="text-amber-400" size={18} />
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Recommended for Review</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {recommendedReviews.map(q => (
                                        <div key={q.id} onClick={() => setActiveQuestion(q)} className="glass-card p-4 rounded-xl cursor-pointer hover:bg-white/10 transition-colors group">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getDifficultyColor(q.difficulty)}`}>{q.difficulty}</span>
                                                <span className="text-[10px] text-amber-400 font-mono font-bold flex items-center gap-1"><ArrowUp size={10} className="rotate-45"/> Review</span>
                                            </div>
                                            <div className="font-bold text-white mb-2 line-clamp-1 group-hover:text-indigo-300 transition-colors">{q.title}</div>
                                            <div className="text-[10px] text-slate-400">Last Attempt: {formatTimeAgo(q.lastAttempted)}</div>
                                        </div>
                                    ))}
                                </div>
                             </div>
                        )}

                        <div className="md:hidden space-y-4">
                            {filtered.length === 0 ? <div className="text-center py-20 text-white/30 flex flex-col items-center gap-2"><div className="p-4 bg-white/5 rounded-full"><Search size={24} className="opacity-50"/></div><span>No questions found</span></div> : filtered.map((q: any) => <MobileQuestionCard key={q.id} question={q} onClick={() => setActiveQuestion(q)} view={view} onTagClick={(t) => setSearch(t)} />)}
                        </div>
                        
                        <div className="hidden md:block glass-card rounded-2xl overflow-hidden shadow-2xl">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-black/20 text-xs uppercase text-indigo-200/70 font-bold tracking-wider border-b border-white/5">
                                    <tr>
                                        <th className="p-5 text-center w-12">#</th>
                                        <th className="p-5 cursor-pointer hover:text-white transition-colors w-32" onClick={()=>requestSort('status')}>Status {getSortIcon('status')}</th>
                                        <th className="p-5 cursor-pointer hover:text-white transition-colors" onClick={()=>requestSort('title')}>Title {getSortIcon('title')}</th>
                                        <th className="p-5 cursor-pointer hover:text-white transition-colors w-32 select-none" onClick={toggleDifficultyFilter}>
                                            <div className="flex items-center gap-1 group">
                                                <span>Difficulty</span>
                                                {difficultyFilter === 'All' ? (
                                                     <Filter size={12} className="text-slate-500 group-hover:text-white transition-colors" />
                                                ) : (
                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded border flex items-center gap-1 ${getDifficultyColor(difficultyFilter)} bg-opacity-20`}>
                                                        {difficultyFilter} <X size={8} className="cursor-pointer hover:text-red-400" onClick={(e) => { e.stopPropagation(); setDifficultyFilter('All'); }} />
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                        <th className="p-5 cursor-pointer hover:text-white transition-colors w-32" onClick={()=>requestSort('timeTaken')}>Time {getSortIcon('timeTaken')}</th>
                                        {view === 'dashboard' && <th className="p-5 w-32">Efficiency</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm text-slate-200">
                                    {filtered.map((q: any, i: number) => (
                                        <TableRow key={q.id} q={q} index={i} view={view} onClick={setActiveQuestion} onTagClick={(t) => setSearch(t)} />
                                    ))}
                                </tbody>
                            </table>
                            {filtered.length === 0 && <div className="p-16 text-center text-white/30 flex flex-col items-center gap-2"><Search size={40} className="opacity-20 mb-2"/><p>No questions found.</p></div>}
                        </div>
                    </>
                )}
            </div>
        </main>
        
        <SettingsModal 
            isOpen={isSettingsOpen} 
            onClose={() => setIsSettingsOpen(false)} 
            showToast={addToast}
            apiKey={apiKey}
            onSave={handleSaveApiKey}
        />
        
        <AIQuestionGeneratorModal
            isOpen={isAIGenOpen}
            onClose={() => setIsAIGenOpen(false)}
            onImport={handleImportGenerated}
            showToast={addToast}
            apiKey={apiKey}
        />
        
        {activeQuestion && (
            <QuestionModal 
                key={activeQuestion.id}
                question={activeQuestion} 
                isOpen={!!activeQuestion} 
                onClose={handleCloseQuestionModal} 
                onSave={handleSaveQuestion} 
                onDelete={handleDelete} 
                onStartTimer={handleStartTimer}
                onAddSessionTime={handleAddSessionTime}
                showToast={addToast} 
                apiKey={apiKey}
                liveTime={isTimerOpen ? activeTimerTime : undefined} 
            />
        )}
        
        <Timer 
            initialTime={activeTimerTime}
            timeAdjustment={timeAdjustment}
            onTimeUpdate={setActiveTimerTime}
            onSave={handleTimerSave}
            isOpen={isTimerOpen} 
            onClose={() => setIsTimerOpen(false)} 
        />
        
        <ToastContainer toasts={toasts} removeToast={removeToast} handleUndo={handleUndo} />
      </div>
    </ToastContext.Provider>
  );
};

export default App;
