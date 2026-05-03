import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task } from '../hooks/useTasks';
import { Category } from '../hooks/useCategories';
import { useSubtasks } from '../hooks/useSubtasks';
import { useComments } from '../hooks/useComments';
import { useParams } from 'react-router-dom';
import { 
  X, Calendar, Flag, Tag, AlignLeft, 
  Clock, Trash2, CheckCircle, Save,
  Plus, MessageSquare, Paperclip, Repeat,
  Send, Circle, CheckSquare, Link as LinkIcon
} from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface TaskModalProps {
  task: Task;
  allTasks?: Task[];
  categories: Category[];
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

export function TaskModal({ task, allTasks = [], categories, onClose, onUpdate, onDelete }: TaskModalProps) {
  const { spaceId } = useParams<{ spaceId: string }>();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate || '');
  const [categoryId, setCategoryId] = useState(task.categoryId || '');
  const [recurringRule, setRecurringRule] = useState(task.recurringRule || '');
  const [dependencies, setDependencies] = useState<string[]>(task.dependencies || []);
  const [isSaving, setIsSaving] = useState(false);

  // Subtasks & Comments
  const { subtasks, addSubtask, toggleSubtask, deleteSubtask } = useSubtasks(spaceId || null, task.id);
  const { comments, addComment } = useComments(spaceId || null, task.id);
  
  const [newSubtask, setNewSubtask] = useState('');
  const [newComment, setNewComment] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    await onUpdate(task.id, {
      title,
      description,
      priority,
      dueDate: dueDate || undefined,
      categoryId: categoryId || undefined,
      recurringRule: recurringRule || undefined,
      dependencies: dependencies,
    });
    setIsSaving(false);
    onClose();
  };

  const toggleDependency = (id: string) => {
    if (id === task.id) return;
    setDependencies(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    addSubtask(newSubtask);
    setNewSubtask('');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addComment(newComment);
    setNewComment('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 40 }}
        className="bg-white w-full max-w-4xl h-[85vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-2.5 h-2.5 rounded-full",
              task.status === 'done' ? "bg-emerald-500" : "bg-indigo-500 animate-pulse"
            )}></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Project Workspace / <span className="text-slate-900">{task.id.slice(0, 8)}</span></span>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-white rounded-2xl transition-all shadow-sm border border-slate-100">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </header>

        <div className="flex-1 overflow-hidden flex">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-12 space-y-12 scrollbar-hide border-r border-slate-50">
            <div className="space-y-4">
              <input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-4xl font-black text-slate-900 w-full outline-none placeholder:text-slate-200 border-none bg-transparent"
                placeholder="Nameless Quest"
              />
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                  <Repeat className="w-4 h-4 text-slate-400" />
                  <select 
                    value={recurringRule}
                    onChange={(e) => setRecurringRule(e.target.value)}
                    className="bg-transparent text-xs font-bold uppercase tracking-widest text-slate-600 outline-none cursor-pointer"
                  >
                    <option value="">One Time</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                  <Tag className="w-4 h-4 text-slate-400" />
                  <select 
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="bg-transparent text-xs font-bold uppercase tracking-widest text-slate-600 outline-none cursor-pointer"
                  >
                    <option value="">No Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <AlignLeft className="w-4 h-4" /> Description
              </label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details of the quest..."
                className="w-full h-32 bg-slate-50/50 hover:bg-slate-50 border border-slate-50 hover:border-slate-100 rounded-[2rem] p-6 text-sm font-medium leading-relaxed text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-300 resize-none"
              />
            </div>

            {/* Subtasks */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <CheckSquare className="w-4 h-4" /> Sub-Objectives ({subtasks.filter(s => s.completed).length}/{subtasks.length})
                </label>
                <div className="h-1 w-32 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(subtasks.length ? (subtasks.filter(s => s.completed).length / subtasks.length) * 100 : 0)}%` }}
                    className="h-full bg-indigo-500"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                {subtasks.map(s => (
                  <motion.div 
                    key={s.id}
                    layout
                    className="flex items-center gap-4 group p-3 rounded-2xl hover:bg-slate-50 transition-colors"
                  >
                    <button 
                      onClick={() => toggleSubtask(s.id, !s.completed)}
                      className={cn(
                        "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                        s.completed ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-200 hover:border-indigo-400"
                      )}
                    >
                      {s.completed && <div className="text-[10px] font-black">✓</div>}
                    </button>
                    <span className={cn("flex-1 text-sm font-medium", s.completed && "line-through text-slate-300")}>{s.title}</span>
                    <button onClick={() => deleteSubtask(s.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
                <form onSubmit={handleAddSubtask} className="flex items-center gap-4 p-3 border-2 border-dashed border-slate-100 rounded-2xl">
                  <Plus className="w-4 h-4 text-slate-300" />
                  <input 
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    placeholder="Add step..."
                    className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-slate-300"
                  />
                  <button type="submit" className="text-xs font-bold text-indigo-500 uppercase tracking-widest hidden sm:block">Add Step</button>
                </form>
              </div>
            </div>

            {/* Dependencies */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <LinkIcon className="w-4 h-4" /> Blocked By ({dependencies.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {allTasks.filter(t => t.id !== task.id).map(t => (
                  <button
                    key={t.id}
                    onClick={() => toggleDependency(t.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all border",
                      dependencies.includes(t.id)
                        ? "bg-rose-50 border-rose-100 text-rose-600 shadow-sm"
                        : "bg-slate-50 border-slate-50 text-slate-400 opacity-60 hover:opacity-100"
                    )}
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Attachments (Mock) */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <Paperclip className="w-4 h-4" /> Embedded Visuals
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div className="aspect-square bg-slate-50 border border-slate-100 rounded-[2rem] flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-100 transition-all">
                  <Plus className="w-6 h-6 text-slate-300" />
                  <span className="text-[10px] font-black uppercase text-slate-400">Upload</span>
                </div>
                <div className="aspect-square bg-indigo-50 rounded-[2rem] p-4 flex flex-col justify-end group cursor-pointer relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/20 to-transparent"></div>
                  <span className="text-[10px] font-black uppercase text-indigo-600 relative z-10">Spec_v1.pdf</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Settings & Comments */}
          <div className="w-96 bg-slate-50/30 border-l border-slate-50 flex flex-col">
            <div className="p-10 space-y-8 flex-1 overflow-y-auto scrollbar-hide">
              {/* Metadata */}
              <div className="space-y-6">
                <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                   <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Priority Rank</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => setPriority(p)}
                          className={cn(
                            "px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all",
                            priority === p 
                              ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200" 
                              : "bg-slate-50 text-slate-400 border-slate-50 hover:border-slate-100"
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 pt-4 border-t border-slate-50">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Deadline</label>
                    <input 
                      type="date"
                      value={dueDate ? dueDate.split('T')[0] : ''}
                      onChange={(e) => setDueDate(e.target.value ? new Date(e.target.value).toISOString() : '')}
                      className="w-full bg-slate-50 border border-slate-50 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-6">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <MessageSquare className="w-4 h-4" /> Discussion ({comments.length})
                </label>
                <div className="space-y-6">
                  {comments.map(c => (
                    <div key={c.id} className="flex gap-4">
                      <img src={c.authorPhoto} className="w-8 h-8 rounded-full border border-slate-100" alt={c.authorName} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="text-xs font-bold text-slate-800">{c.authorName}</span>
                          <span className="text-[9px] font-black text-slate-300 uppercase">
                            {c.createdAt?.toDate ? format(c.createdAt.toDate(), 'HH:mm') : 'now'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Comment Input */}
            <div className="p-8 border-t border-slate-50 bg-white">
              <form onSubmit={handleAddComment} className="flex gap-3">
                <input 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Drop a note..."
                  className="flex-1 bg-slate-50 px-4 py-3 rounded-2xl text-sm outline-none border border-slate-50 focus:border-indigo-100 transition-colors"
                />
                <button type="submit" className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>

        <footer className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <button 
            onClick={() => onDelete(task.id)}
            className="flex items-center gap-2 px-6 py-3 text-rose-500 hover:bg-rose-50 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
          >
            <Trash2 className="w-4 h-4" /> Terminate Quest
          </button>
          
          <div className="flex gap-4">
            <button 
              onClick={onClose}
              className="px-6 py-3 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]"
            >
              Discard
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {isSaving ? 'Syncing...' : 'Confirm Sync'}
            </button>
          </div>
        </footer>
      </motion.div>
    </motion.div>
  );
}
