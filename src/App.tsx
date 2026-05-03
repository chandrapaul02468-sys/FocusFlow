import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navigation } from './components/Navigation';
import { CommandPalette } from './components/CommandPalette';
import { ActivitySidebar } from './components/ActivitySidebar';
import { Landing } from './components/Landing';
import { useParams, useLocation } from 'react-router-dom';
import { SpaceOverview } from './components/SpaceOverview';
import { TaskBoard } from './components/TaskBoard';
import { MembersList } from './components/MembersList';
import { Dashboard } from './components/Dashboard';
import { CalendarView } from './components/CalendarView';
import { Settings } from './components/Settings';
import { Toaster } from 'react-hot-toast';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { spaceId } = useParams<{ spaceId: string }>();
  const location = useLocation();

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-500 font-medium">Preparing your workspace...</p>
    </div>
  </div>;

  if (!user) return <Landing />;

  const showPulse = spaceId && (location.pathname.startsWith('/spaces/') || location.pathname.startsWith('/dashboard/'));

  return (
    <div className="flex h-screen bg-[#FDFCFB] overflow-hidden">
      <Navigation />
      <main className="flex-1 overflow-y-auto relative scrollbar-hide">
        {children}
        <Toaster position="bottom-right" />
      </main>
      {showPulse && <ActivitySidebar spaceId={spaceId} />}
      <CommandPalette />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <SpaceOverview />
            </ProtectedRoute>
          } />
          <Route path="/spaces/:spaceId" element={
            <ProtectedRoute>
              <TaskBoard />
            </ProtectedRoute>
          } />
          <Route path="/spaces/:spaceId/members" element={
            <ProtectedRoute>
              <MembersList />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/spaces/:spaceId" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/tasks" element={
            <ProtectedRoute>
              <TaskBoard />
            </ProtectedRoute>
          } />
          <Route path="/calendar" element={
            <ProtectedRoute>
              <CalendarView />
            </ProtectedRoute>
          } />
          <Route path="/calendar/spaces/:spaceId" element={
            <ProtectedRoute>
              <CalendarView />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
