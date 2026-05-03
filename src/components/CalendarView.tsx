import React from 'react';
import { useParams } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { 
  format, addDays, startOfWeek, endOfWeek, 
  startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export function CalendarView() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const { tasks } = useTasks(spaceId || null);
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth)),
  });

  const nextMonth = () => setCurrentMonth(addDays(endOfMonth(currentMonth), 1));
  const prevMonth = () => setCurrentMonth(addDays(startOfMonth(currentMonth), -1));

  return (
    <div className="p-8 max-w-6xl mx-auto h-screen overflow-y-auto pb-20 scrollbar-hide">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-800 uppercase">Calendar</h1>
          <p className="text-slate-400 font-medium">Timeline and upcoming deadines</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><ChevronLeft className="w-5 h-5 text-slate-400" /></button>
          <span className="font-black text-sm min-w-32 text-center uppercase tracking-[0.1em] text-indigo-600">{format(currentMonth, 'MMMM yyyy')}</span>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><ChevronRight className="w-5 h-5 text-slate-400" /></button>
        </div>
      </header>

      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-100 divide-x divide-slate-100 bg-slate-50">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="py-5 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 border-collapse divide-x divide-slate-100">
          {days.map((day, i) => {
            const dayTasks = tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), day));
            const isTodayDay = isToday(day);
            return (
              <div 
                key={day.toString()} 
                className={cn(
                  "min-h-[160px] p-3 border-b border-slate-100 relative group transition-all hover:bg-slate-50/50",
                  !isSameDay(day, currentMonth) && "opacity-20"
                )}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-full text-xs font-black",
                    isTodayDay ? "bg-indigo-600 text-white" : "text-slate-400"
                  )}>
                    {format(day, 'd')}
                  </span>
                  {isTodayDay && <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce"></div>}
                </div>
                
                <div className="space-y-1.5 overflow-hidden">
                  {dayTasks.map(task => (
                    <motion.div 
                      key={task.id}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        "px-3 py-2 rounded-xl text-[10px] font-bold truncate border shadow-sm",
                        task.priority === 'high' ? "bg-rose-50 border-rose-100 text-rose-700" :
                        task.priority === 'urgent' ? "bg-rose-50 border-rose-100 text-rose-700" :
                        task.priority === 'medium' ? "bg-amber-50 border-amber-100 text-amber-700" :
                        "bg-slate-50 border-slate-100 text-slate-600"
                      )}
                    >
                      {task.title}
                    </motion.div>
                  ))}
                </div>
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all pointer-events-none translate-y-2 group-hover:translate-y-0">
                  <div className="p-3 bg-white rounded-full shadow-xl border border-slate-100 text-indigo-600"><Plus className="w-6 h-6" /></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
