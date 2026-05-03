import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Command, Zap, Layout, Calendar, Settings, Home, Plus, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '../lib/utils';

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { spaceId } = useParams();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const actions = [
    { id: 'home', title: 'Go to Overview', icon: Home, color: 'text-indigo-500', action: () => navigate('/') },
    { id: 'dashboard', title: 'View Analytics', icon: Zap, color: 'text-amber-500', action: () => navigate(spaceId ? `/dashboard/spaces/${spaceId}` : '/dashboard') },
    { id: 'board', title: 'Task Board', icon: Layout, color: 'text-emerald-500', action: () => navigate(spaceId ? `/spaces/${spaceId}` : '/tasks') },
    { id: 'calendar', title: 'Calendar View', icon: Calendar, color: 'text-rose-500', action: () => navigate(spaceId ? `/calendar/spaces/${spaceId}` : '/calendar') },
    { id: 'settings', title: 'System Settings', icon: Settings, color: 'text-slate-500', action: () => navigate('/settings') },
  ];

  const filteredActions = actions.filter(a => 
    a.title.toLowerCase().includes(query.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
      onClick={() => setIsOpen(false)}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: -20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: -20 }}
        className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 flex items-center gap-4">
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands or navigation..."
            className="flex-1 bg-transparent border-none outline-none text-slate-800 font-bold placeholder:text-slate-300"
          />
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
            <Command className="w-3 h-3 text-slate-400" />
            <span className="text-[10px] font-black text-slate-400">K</span>
          </div>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto scrollbar-hide">
          <div className="px-4 py-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Suggestions</span>
          </div>
          <div className="space-y-1">
            {filteredActions.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  item.action();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-4 p-4 rounded-3xl hover:bg-slate-50 transition-all group text-left"
              >
                <div className={cn("p-2.5 rounded-2xl bg-slate-50 group-hover:bg-white transition-colors border border-slate-100 group-hover:shadow-sm", item.color)}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-slate-700 tracking-tight">{item.title}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Zap className="w-3 h-3 text-slate-300" />
                </div>
              </button>
            ))}
            {filteredActions.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-sm font-bold text-slate-400">No results found for "{query}"</p>
              </div>
            )}
          </div>
        </div>

        <footer className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center px-8">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase">↑↓</span>
              <span className="text-[10px] font-black text-slate-400 uppercase">Navigate</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase">↵</span>
              <span className="text-[10px] font-black text-slate-400 uppercase">Select</span>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-[10px] font-black uppercase text-slate-300 tracking-widest hover:text-slate-500">Close</button>
        </footer>
      </motion.div>
    </motion.div>
  );
}
