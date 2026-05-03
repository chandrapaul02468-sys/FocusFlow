import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Layout, CheckSquare, BarChart2, Calendar, Settings, LogOut, Plus, Users, Shield } from 'lucide-react';
import { NavLink, useParams, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

export function Navigation() {
  const { user, logout } = useAuth();
  const { spaceId } = useParams();
  const location = useLocation();

  const baseNavItems = [
    { icon: Layout, label: 'All Spaces', path: '/' },
    { icon: BarChart2, label: 'Overview', path: '/dashboard' },
    { icon: CheckSquare, label: 'My Profile', path: '/tasks' },
  ];

  const spaceNavItems = spaceId ? [
    { icon: CheckSquare, label: 'Quest Board', path: `/spaces/${spaceId}` },
    { icon: Shield, label: 'Legion', path: `/spaces/${spaceId}/members` },
    { icon: BarChart2, label: 'Analytics', path: `/dashboard/spaces/${spaceId}` },
    { icon: Calendar, label: 'Campaign', path: `/calendar/spaces/${spaceId}` },
  ] : [];

  const footerNavItems = [
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 h-screen flex flex-col bg-white sticky top-0 font-sans">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100/50 text-white font-black">
            Q
          </div>
          <span className="font-black text-xl tracking-tighter text-slate-800 uppercase">QuestFlow</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-8 overflow-y-auto mt-4 scrollbar-hide">
        <div className="space-y-1">
          <p className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Command Center</p>
          {baseNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group",
                  isActive && location.pathname === item.path
                    ? "bg-slate-900 text-white font-bold shadow-xl shadow-slate-200" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )
              }
            >
              <item.icon className="w-4 h-4" />
              <span className="text-xs font-bold">{item.label}</span>
            </NavLink>
          ))}
        </div>

        {spaceId && (
          <div className="space-y-1 animate-in fade-in slide-in-from-left-4 duration-500">
             <p className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Active Space</p>
             {spaceNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group",
                    (isActive || location.pathname === item.path)
                      ? "bg-indigo-600 text-white font-bold shadow-xl shadow-indigo-100" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )
                }
              >
                <item.icon className="w-4 h-4" />
                <span className="text-xs font-bold">{item.label}</span>
              </NavLink>
            ))}
          </div>
        )}

        <div className="space-y-1">
           {footerNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group",
                  isActive
                    ? "bg-slate-900 text-white font-bold shadow-xl shadow-slate-200" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )
              }
            >
              <item.icon className="w-4 h-4" />
              <span className="text-xs font-bold">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-slate-100 flex flex-col gap-2">
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-100 rounded-3xl mb-2">
          <img 
            src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} 
            alt="User" 
            className="w-10 h-10 rounded-2xl border-2 border-white shadow-sm ring-1 ring-slate-100"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-slate-900 truncate leading-tight tracking-tight">{user?.displayName?.split(' ')[0]}</p>
            <p className="text-[9px] text-slate-400 font-black uppercase truncate tracking-widest">{user?.email}</p>
          </div>
        </div>
        <button 
          onClick={() => logout()}
          className="flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-rose-500 rounded-xl transition-all w-full text-left"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
