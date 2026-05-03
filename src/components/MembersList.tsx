import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, onSnapshot, query, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useSpaces } from '../hooks/useSpaces';
import { 
  Users, Mail, Crown, Shield, ShieldAlert, Trash2, 
  UserPlus, Search, X, Check, MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

interface Member {
  id: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: any;
}

export function MembersList() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'admin'>('member');
  const { spaces } = useSpaces();
  const currentSpace = spaces.find(s => s.id === spaceId);

  useEffect(() => {
    if (!spaceId) return;

    const q = query(collection(db, `spaces/${spaceId}/members`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const membersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Member[];
      setMembers(membersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [spaceId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !spaceId) return;

    try {
      // In a real app, this would use a temporary ID or lookup user by email
      // Here we'll just mock it as adding to members collection
      const dummyId = Math.random().toString(36).substring(7);
      await setDoc(doc(db, `spaces/${spaceId}/members`, dummyId), {
        email: inviteEmail,
        role: inviteRole,
        joinedAt: new Date().toISOString()
      });
      toast.success('Invitation sent (Simulated)');
      setInviteEmail('');
      setIsInviteOpen(false);
    } catch (error) {
      toast.error('Failed to invite member');
    }
  };

  const handleRoleChange = async (memberId: string, newRole: 'member' | 'admin') => {
    if (!spaceId) return;
    try {
      await setDoc(doc(db, `spaces/${spaceId}/members`, memberId), { role: newRole }, { merge: true });
      toast.success('Role updated');
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!spaceId) return;
    if (!confirm('Are you sure you want to remove this member?')) return;
    try {
      await deleteDoc(doc(db, `spaces/${spaceId}/members`, memberId));
      toast.success('Member removed');
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  if (loading) return <div className="p-8">Loading legion...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto pb-24">
      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-800 uppercase mb-2">Team Assembly</h1>
          <p className="text-slate-400 font-medium italic">Manage roles and workspace access.</p>
        </div>
        <button 
          onClick={() => setIsInviteOpen(true)}
          className="bg-indigo-600 text-white px-8 py-3 rounded-2xl hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Recruit Member
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <motion.div 
            layout
            key={member.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 -mr-16 -mt-16 rounded-full group-hover:bg-indigo-50 transition-colors"></div>
            
            <div className="relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-slate-100">
                  {member.role === 'owner' ? <Crown className="w-6 h-6 text-amber-500" /> : member.role === 'admin' ? <ShieldAlert className="w-6 h-6 text-indigo-600" /> : <Users className="w-6 h-6 text-slate-400" />}
                </div>
                <div>
                  <h3 className="font-black text-slate-800 tracking-tight text-lg mb-1 truncate max-w-[120px]">{member.email.split('@')[0]}</h3>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-100 w-fit">
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest",
                      member.role === 'owner' ? "text-amber-600" : member.role === 'admin' ? "text-indigo-600" : "text-slate-400"
                    )}>
                      {member.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-3 text-slate-400">
                  <Mail className="w-3 h-3" />
                  <span className="text-xs font-medium truncate">{member.email}</span>
                </div>
                
                {member.role !== 'owner' && (
                  <div className="flex items-center gap-2 pt-2">
                    <select 
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value as any)}
                      className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none hover:bg-slate-100 transition-all"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button 
                      onClick={() => handleRemove(member.id)}
                      className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isInviteOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsInviteOpen(false)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white p-10 rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden relative"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase mb-6 flex items-center gap-3">
                <UserPlus className="w-6 h-6 text-indigo-600" /> Member Recruit
              </h2>
              <form onSubmit={handleInvite} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
                  <input 
                    autoFocus
                    type="email"
                    placeholder="teammate@example.com"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Initial Role</label>
                  <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100">
                    {(['member', 'admin'] as const).map(role => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setInviteRole(role)}
                        className={cn(
                          "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                          inviteRole === role ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"
                        )}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsInviteOpen(false)} className="flex-1 px-8 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest">Abort</button>
                  <button type="submit" className="flex-1 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-200">Send Pulse</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
