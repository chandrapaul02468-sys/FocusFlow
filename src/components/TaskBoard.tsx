import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTasks, Task } from '../hooks/useTasks';
import { useSpaces } from '../hooks/useSpaces';
import { 
  Plus, Search, Filter, Calendar, Clock, AlertCircle, 
  CheckCircle, Circle, MoreHorizontal, ChevronRight,
  TrendingUp, Star, Flag, Trash2, Edit2, CheckSquare, Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatDate } from '../lib/utils';
import { format } from 'date-fns';

import { TaskModal } from './TaskModal';
import { useCategories } from '../hooks/useCategories';

export function TaskBoard() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const { spaces } = useSpaces();
  const { tasks, loading, addTask, updateTask, deleteTask, bulkUpdateStatus, bulkDelete } = useTasks(spaceId || null);
  const { categories, addCategory } = useCategories(spaceId || null);
  const [filter, setFilter] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const currentSpace = spaces.find(s => s.id === spaceId);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    await addCategory(newCatName, '#4f46e5');
    setNewCatName('');
    setIsAddingCategory(false);
  };

  const filteredTasks = tasks.filter(t => {
    const matchesFilter = filter === 'all' || t.status === filter;
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || t.categoryId === categoryFilter;
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesPriority && matchesCategory && matchesSearch;
  });

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await addTask({
      title: newTaskTitle,
      status: 'todo',
      priority: 'medium',
    });
    setNewTaskTitle('');
    setIsAddingTask(false);
  };

  const toggleSelectTask = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedTaskIds(prev => 
      prev.includes(id) ? prev.filter(taskId => taskId !== id) : [...prev, id]
    );
  };

  const toggleStatus = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    const nextStatus: Record<string, 'todo' | 'in_progress' | 'done'> = {
      'todo': 'in_progress',
      'in_progress': 'done',
      'done': 'todo'
    };
    updateTask(task.id, { status: nextStatus[task.status] });
  };

  const handleDelete = async (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    await deleteTask(taskId);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[calc(100vh-100px)]">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto h-screen flex flex-col pb-20">
      <header className="mb-12">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-800 uppercase mb-2">{currentSpace?.name || 'Workspace'}</h1>
            <p className="text-slate-400 font-medium">Manage your objectives and team velocity.</p>
          </div>
          <div className="flex gap-4">
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button 
                onClick={() => setViewMode('list')}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  viewMode === 'list' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-500"
                )}
              >
                List
              </button>
              <button 
                onClick={() => setViewMode('kanban')}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  viewMode === 'kanban' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-500"
                )}
              >
                Board
              </button>
            </div>
             <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search quests..." 
                className="pl-12 pr-6 py-3 bg-white border border-slate-100 rounded-2xl w-64 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
             <button 
              onClick={() => setIsAddingTask(true)}
              className="bg-indigo-600 text-white px-8 py-3 rounded-2xl hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New Quest
            </button>
          </div>
        </div>

        {/* Filter Bento */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div className="bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm flex gap-1">
            {(['all', 'todo', 'in_progress', 'done'] as const).map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "flex-1 py-2 rounded-2xl text-[9px] font-black uppercase tracking-wider transition-all",
                  filter === f ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Priority Filter */}
          <div className="bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm flex gap-1">
            {(['all', 'urgent', 'high'] as const).map(p => (
              <button 
                key={p}
                onClick={() => setPriorityFilter(p as any)}
                className={cn(
                  "flex-1 py-2 rounded-2xl text-[9px] font-black uppercase tracking-wider transition-all",
                  priorityFilter === p ? "bg-rose-500 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex gap-1">
            <button 
              onClick={() => setCategoryFilter('all')}
              className={cn(
                "px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-wider transition-all",
                categoryFilter === 'all' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400"
              )}
            >
              All Types
            </button>
            <div className="flex-1 flex gap-1 overflow-x-auto scrollbar-hide">
              {categories.map(c => (
                <button 
                  key={c.id}
                  onClick={() => setCategoryFilter(c.id)}
                  className={cn(
                    "whitespace-nowrap px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-wider transition-all",
                    categoryFilter === c.id ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400"
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={() => setIsAddingCategory(true)}
            className="bg-slate-50 border border-slate-100 rounded-[2rem] p-2 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 transition-all"
          >
            <Tag className="w-3 h-3" /> Manage Categories
          </button>
        </div>
      </header>

      {/* Task Content */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode='wait'>
          {viewMode === 'list' ? (
            <motion.div 
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full overflow-y-auto space-y-4 pb-20 scrollbar-hide"
            >
              <AnimatePresence mode='popLayout'>
                {isAddingTask && (
                  <motion.form 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onSubmit={handleAddTask}
                    className="bg-white p-6 rounded-3xl border border-indigo-200 shadow-xl shadow-indigo-100/50"
                  >
                    <input 
                      autoFocus
                      type="text"
                      placeholder="What needs to be done?"
                      className="w-full text-lg font-bold outline-none mb-6 placeholder:text-slate-300"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                    />
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <button type="button" className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 rounded-xl"><Calendar className="w-5 h-5" /></button>
                        <button type="button" className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 rounded-xl"><Flag className="w-5 h-5" /></button>
                      </div>
                      <div className="flex gap-3">
                        <button type="button" onClick={() => setIsAddingTask(false)} className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">Cancel</button>
                        <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200">Create Task</button>
                      </div>
                    </div>
                  </motion.form>
                )}

                {filteredTasks.map((task) => (
                  <motion.div
                    layout
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => setSelectedTask(task)}
                    className={cn(
                      "group flex items-center gap-5 p-5 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all cursor-pointer",
                      task.status === 'done' && "bg-slate-50/50 border-slate-100 shadow-none grayscale-[0.3]",
                      selectedTaskIds.includes(task.id) && "ring-2 ring-indigo-500 border-indigo-500"
                    )}
                  >
                    <div className="flex items-center gap-3 shrink-0">
                      <button 
                        onClick={(e) => toggleSelectTask(e, task.id)}
                        className={cn(
                          "w-4 h-4 rounded-md border-2 transition-all opacity-0 group-hover:opacity-100",
                          selectedTaskIds.includes(task.id) ? "bg-indigo-500 border-indigo-500 text-white opacity-100" : "border-slate-200"
                        )}
                      >
                        {selectedTaskIds.includes(task.id) && <div className="text-[8px] font-black">✓</div>}
                      </button>
                      <button 
                        onClick={(e) => toggleStatus(e, task)}
                        className={cn(
                          "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0",
                          task.status === 'done' 
                            ? "bg-indigo-600 border-indigo-600 text-white" 
                            : "border-indigo-400 hover:bg-indigo-50"
                        )}
                      >
                        {task.status === 'done' && <div className="text-[10px] font-black">✓</div>}
                      </button>
                    </div>

                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <div className="min-w-0">
                        <h3 className={cn("font-bold text-slate-800 text-lg mb-1 truncate", task.status === 'done' && "line-through text-slate-300 font-medium")}>
                          {task.title}
                        </h3>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full",
                            task.priority === 'high' || task.priority === 'urgent' ? "bg-rose-100 text-rose-600" :
                            task.priority === 'medium' ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-400"
                          )}>
                            {task.priority}
                          </span>
                          {task.categoryId && (
                            <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full">
                              <Tag className="w-3 h-3" />
                              <span>{categories.find(c => c.id === task.categoryId)?.name}</span>
                            </div>
                          )}
                          {task.dueDate && (
                            <div className="flex items-center gap-1.5 grayscale opacity-70">
                              <Clock className="w-3 h-3" />
                              <span>{formatDate(task.dueDate)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-opacity shrink-0">
                      <button 
                        onClick={(e) => handleDelete(e, task.id)}
                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div 
              key="kanban"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex gap-8 overflow-x-auto pb-8 scrollbar-hide"
            >
              {(['todo', 'in_progress', 'done'] as const).map(status => (
                <div key={status} className="w-96 flex flex-col gap-6 shrink-0">
                  <div className="flex items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        status === 'todo' ? "bg-slate-400" : 
                        status === 'in_progress' ? "bg-amber-400" : "bg-emerald-500"
                      )}></div>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{status.replace('_', ' ')}</h3>
                      <span className="bg-slate-100 text-slate-400 px-2 py-0.5 rounded-lg text-[9px] font-black tracking-widest">
                        {filteredTasks.filter(t => t.status === status).length}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 overflow-y-auto scrollbar-hide px-1">
                    {filteredTasks.filter(t => t.status === status).map(task => (
                      <motion.div
                        layout
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all cursor-pointer group"
                      >
                        <div className="flex justify-between items-start mb-4">
                           <span className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                            task.priority === 'urgent' ? "bg-rose-100 text-rose-600" :
                            task.priority === 'high' ? "bg-rose-50 text-rose-500" :
                            task.priority === 'medium' ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-400"
                          )}>
                            {task.priority}
                          </span>
                          <button onClick={(e) => toggleStatus(e, task)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-indigo-600 transition-opacity">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                        <h4 className="font-bold text-slate-800 tracking-tight leading-tight mb-4">{task.title}</h4>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                          <div className="flex -space-x-2">
                             <div className="w-6 h-6 rounded-lg bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-indigo-600">P</div>
                          </div>
                          {task.dueDate && (
                            <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-300">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(task.dueDate), 'MMM d')}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    <button 
                       onClick={() => setIsAddingTask(true)}
                       className="w-full py-4 border-2 border-dashed border-slate-100 rounded-[2rem] text-[9px] font-black uppercase tracking-widest text-slate-300 hover:bg-slate-50 hover:border-slate-200 transition-all"
                    >
                      + Add Task
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bulk Action Bar */}
        <AnimatePresence>
          {selectedTaskIds.length > 0 && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-8 z-50 border border-slate-800"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center text-xs font-black text-white">{selectedTaskIds.length}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selected Tasks</span>
              </div>
              <div className="h-4 w-px bg-slate-800"></div>
              <div className="flex gap-4">
                <button 
                  onClick={async () => {
                    await bulkUpdateStatus(selectedTaskIds, 'done');
                    setSelectedTaskIds([]);
                  }}
                  className="text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Mark Done
                </button>
                <button 
                  onClick={async () => {
                    await bulkDelete(selectedTaskIds);
                    setSelectedTaskIds([]);
                  }}
                  className="text-[10px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-300 transition-colors"
                >
                  Delete Selected
                </button>
              </div>
              <button 
                onClick={() => setSelectedTaskIds([])}
                className="p-2 text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedTask && (
          <TaskModal 
            task={selectedTask}
            allTasks={tasks}
            categories={categories}
            onClose={() => setSelectedTask(null)}
            onUpdate={updateTask}
            onDelete={deleteTask}
          />
        )}
      </AnimatePresence>

      {isAddingCategory && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddingCategory(false)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-10 rounded-[3rem] w-full max-w-md shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase mb-6 flex items-center gap-3">
                <Tag className="w-6 h-6 text-indigo-600" /> New Category
              </h2>
              <form onSubmit={handleAddCategory} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Name</label>
                  <input 
                    autoFocus
                    placeholder="E.g. Creative, Logic"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                  />
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setIsAddingCategory(false)} className="flex-1 px-8 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest">Cancel</button>
                  <button type="submit" className="flex-1 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100">Create</button>
                </div>
              </form>
            </motion.div>
         </div>
      )}
    </div>
  );
}
