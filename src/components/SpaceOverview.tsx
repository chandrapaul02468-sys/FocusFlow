import React, { useState } from 'react';
import { useSpaces } from '../hooks/useSpaces';
import { Plus, Users, Layout, Search, Filter, MoreVertical, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export function SpaceOverview() {
  const { spaces, loading, createSpace } = useSpaces();
  const [newSpaceName, setNewSpaceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpaceName.trim()) return;
    const id = await createSpace(newSpaceName);
    if (id) {
      setNewSpaceName('');
      setIsCreating(false);
      navigate(`/spaces/${id}`);
    }
  };

  if (loading) return <div className="p-8">Loading spaces...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">Workspaces</h1>
          <p className="text-gray-500">Select a workspace to start managing your team's tasks.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-semibold hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
        >
          <Plus className="w-5 h-5" />
          New Space
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {spaces.map((space, index) => (
          <motion.div
            key={space.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => navigate(`/spaces/${space.id}`)}
            className="group cursor-pointer bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            
            <div className="flex justify-between items-start mb-6 relative">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                <Layout className="w-6 h-6 text-gray-600 group-hover:text-white" />
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">{space.name}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>Team</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <span>Shared Space</span>
            </div>
          </motion.div>
        ))}

        {isCreating && (
          <motion.form 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onSubmit={handleCreate}
            className="bg-indigo-50 p-6 rounded-3xl border-2 border-dashed border-indigo-200"
          >
            <h3 className="font-bold text-indigo-900 mb-4 text-lg">Create new workspace</h3>
            <input 
              autoFocus
              type="text"
              placeholder="Workspace name..."
              className="w-full bg-white px-4 py-3 rounded-xl border border-indigo-100 mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={newSpaceName}
              onChange={(e) => setNewSpaceName(e.target.value)}
            />
            <div className="flex gap-2">
              <button 
                type="submit"
                className="flex-1 bg-indigo-600 text-white py-2 rounded-xl font-semibold shadow-md active:scale-95"
              >
                Create
              </button>
              <button 
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-gray-500 font-medium hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </div>

      {spaces.length === 0 && !isCreating && (
        <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-[3rem] mt-12 bg-white/50">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
            <Layout className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No workspaces yet</h2>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">Create your first workspace to start collaborating with your team on tasks.</p>
          <button 
            onClick={() => setIsCreating(true)}
            className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl hover:shadow-indigo-100 transition-all"
          >
            Create Your First Space
          </button>
        </div>
      )}
    </div>
  );
}
