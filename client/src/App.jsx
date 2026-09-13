import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { GameProvider } from './context/GameContext.jsx';
import AuthPage from './pages/AuthPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center text-slate-200">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-3xl shadow-glow-cyan animate-float mb-4">
          ⚔️
        </div>
        <div className="font-orbitron font-bold text-base text-cyan-400 animate-pulse">
          AUTHENTICATING REALM ACCESS...
        </div>
        <div className="text-xs text-slate-500 mt-1">Connecting to persistent database</div>
      </div>
    );
  }

  return user ? (
    <GameProvider>
      <DashboardPage />
    </GameProvider>
  ) : (
    <AuthPage />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
