import React from 'react';
import { useActivities } from '../hooks/useActivities';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Clock, User, CheckCircle, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export function ActivitySidebar({ spaceId }: { spaceId: string }) {
  const { activities, loading } = useActivities(spaceId);
  const navigate = useNavigate();

  if (loading) return null;

  return (
    <aside className="w-80 border-l border-slate-100 bg-white/50 backdrop-blur-xl h-screen flex flex-col sticky top-0 overflow-hidden">
      <div className="p-8 border-b border-slate-100">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-600" /> Live Pulse
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        <AnimatePresence initial={false}>
          {activities.map((activity, i) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => {
                if (activity.type === 'task') {
                   // This is where we could trigger a task modal, but for now navigate to board
                   navigate(`/spaces/${spaceId}/tasks`);
                }
              }}
              className="relative pl-6 border-l border-slate-100 pb-2 group cursor-pointer"
            >
              <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white shadow-sm group-hover:scale-125 transition-transform"></div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-600 leading-relaxed group-hover:text-slate-900 transition-colors">
                  <span className="font-bold text-slate-900">{activity.userName}</span> 
                  {' '}{activity.action}{' '}
                  <span className="font-black text-indigo-600 tracking-tight">{activity.targetTitle}</span>
                </p>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300">
                  <Clock className="w-3 h-3" />
                  {activity.createdAt?.toDate ? format(activity.createdAt.toDate(), 'HH:mm') : 'Just now'}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="p-6 bg-slate-50/50 border-t border-slate-100">
        <div className="flex items-center gap-4 py-3 px-4 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md cursor-help">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
            <User className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase text-slate-400">Team Status</p>
            <p className="text-xs font-bold text-slate-800">4 Members Online</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        </div>
      </div>
    </aside>
  );
}
