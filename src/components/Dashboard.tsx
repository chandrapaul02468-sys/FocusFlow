import React from 'react';
import { useParams } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { TrendingUp, Target, ListCheck, Clock, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export function Dashboard() {
  const { spaceId } = useParams<{ spaceId: string }>();
  // If no spaceId, we might show global stats or just return a message
  // For simplicity, we'll assume a dashboard for the selected space
  const { tasks } = useTasks(spaceId || null);

  const stats = [
    { label: 'Total Tasks', value: tasks.length, icon: ListCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Completed', value: tasks.filter(t => t.status === 'done').length, icon: Target, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Ongoing', value: tasks.filter(t => t.status === 'in_progress').length, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'High Priority', value: tasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length, icon: Zap, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  const completionRate = tasks.length > 0 ? (tasks.filter(t => t.status === 'done').length / tasks.length) * 100 : 0;

  const data = [
    { name: 'To Do', value: tasks.filter(t => t.status === 'todo').length },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length },
    { name: 'Done', value: tasks.filter(t => t.status === 'done').length },
  ];

  const COLORS = ['#94a3b8', '#fbbf24', '#4f46e5'];

  return (
    <div className="p-8 max-w-6xl mx-auto h-screen overflow-y-auto pb-20 scrollbar-hide">
      <header className="mb-12 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 uppercase">QuestFlow <span className="text-slate-400 font-normal">Dashboard</span></h1>
          <p className="text-slate-400 text-sm font-medium">Insights and team velocity</p>
        </div>
        <div className="flex -space-x-2">
          {[1,2,3].map(i => (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-indigo-400 flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-1 ring-slate-100">
              U{i}
            </div>
          ))}
          <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 shadow-sm ring-1 ring-slate-100">+5</div>
        </div>
      </header>

      {/* Grid Stats */}
      <div className="grid grid-cols-12 grid-rows-6 gap-6 h-[700px]">
        {/* Progress Tracking (Bento Large) */}
        <div className="col-span-12 lg:col-span-4 row-span-3 bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-medium opacity-90">Weekly Progress</h2>
            <div className="text-6xl font-black mt-2 leading-none">{Math.round(completionRate)}%</div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between text-sm font-bold tracking-tight uppercase opacity-80">
              <span>{tasks.filter(t => t.status === 'done').length}/{tasks.length} Tasks Completed</span>
              <span>+{Math.floor(Math.random() * 15)}% vs last week</span>
            </div>
            <div className="w-full bg-indigo-400/50 rounded-full h-4 relative overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                className="bg-white h-full rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Charts Container (Bento Medium) */}
        <div className="col-span-12 lg:col-span-8 row-span-3 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
            <BarChart2 className="w-4 h-4" /> Activity Distribution
          </h3>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" radius={[10, 10, 10, 10]} barSize={40}>
                  {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Real-time Collaboration (Bento Dark) */}
        <div className="col-span-12 lg:col-span-5 row-span-3 bg-slate-900 rounded-[2.5rem] p-8 text-white flex flex-col relative overflow-hidden">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" /> Collaboration
          </h2>
          <div className="space-y-6 flex-1 overflow-hidden">
            {[
              { user: 'Alex', action: 'is editing', target: 'Auth Middleware', time: 'Just now', color: 'bg-emerald-400' },
              { user: 'Sarah', action: 'commented on', target: 'UI Review', time: '12m ago', color: 'bg-indigo-400' },
              { user: 'Jamie', action: 'completed', target: 'Sprint Planning', time: '1h ago', color: 'bg-amber-400' },
            ].map((collab, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className={cn("w-2 h-2 rounded-full shrink-0 animate-pulse", collab.color)}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {collab.user} <span className="text-slate-500 font-normal">{collab.action}</span> <span className="text-indigo-300">{collab.target}</span>
                  </p>
                </div>
                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">{collab.time}</span>
              </div>
            ))}
          </div>
          <button className="mt-6 w-full py-3 bg-slate-800 rounded-2xl text-xs font-bold uppercase tracking-[0.1em] hover:bg-slate-700 transition-all">View History</button>
        </div>

        {/* Priority Breakdown (Bento Light) */}
        <div className="col-span-12 lg:col-span-7 row-span-3 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 p-8 flex flex-col">
          <h2 className="text-lg font-bold text-emerald-900 mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5" /> Priority Metrics
          </h2>
          <div className="grid grid-cols-3 gap-6 flex-1">
            {['High', 'Medium', 'Low'].map((p) => {
              const count = tasks.filter(t => t.priority === p.toLowerCase()).length;
              return (
                <div key={p} className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100 flex flex-col justify-between">
                  <div>
                    <div className={cn(
                      "text-[10px] font-black uppercase tracking-widest mb-1",
                      p === 'High' ? "text-rose-500" : p === 'Medium' ? "text-amber-500" : "text-emerald-500"
                    )}>{p}</div>
                    <div className="text-3xl font-black">{count}</div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden mt-4">
                    <div 
                      className={cn(
                        "h-full rounded-full",
                        p === 'High' ? "bg-rose-500" : p === 'Medium' ? "bg-amber-400" : "bg-emerald-400"
                      )} 
                      style={{ width: `${(count / (tasks.length || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
