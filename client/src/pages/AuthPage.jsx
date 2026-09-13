import React, { useState } from 'react';
import { Sparkles, Shield, Sword, Zap, Flame, Brain, ArrowRight, Lock, Mail, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthPage() {
  const { login, register, startDemo, error, setError } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register(username.trim(), email.trim(), password);
      } else {
        await login(email.trim() || username.trim(), password);
      }
    } catch (err) {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async () => {
    setLoading(true);
    try {
      await startDemo();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen cyber-grid-bg flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Ambience Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar Brand */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-xl shadow-glow-cyan">
            ⚔️
          </div>
          <div>
            <span className="font-orbitron font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-300">
              LIFE RPG
            </span>
            <p className="text-[11px] text-slate-400 hidden sm:block">Turn Your Real Life Into an RPG.</p>
          </div>
        </div>

        {/* Instant Judge Demo Launch */}
        <button
          onClick={handleDemoClick}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-orbitron font-extrabold text-xs sm:text-sm tracking-wider shadow-glow-cyan transition-all transform active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
          <span>🚀 START DEMO (Instant Hero)</span>
        </button>
      </div>

      {/* Main Auth Card */}
      <div className="max-w-md w-full mx-auto my-auto z-10 py-6">
        <div className="rpg-card p-6 sm:p-8 border border-cyan-500/40 shadow-glow-cyan relative">
          
          <div className="text-center mb-6">
            <div className="inline-block px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-[10px] font-orbitron font-bold uppercase tracking-widest text-cyan-300 mb-2">
              {isRegister ? 'RECRUITS ENLISTMENT' : 'HERO CREDENTIALS'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-orbitron font-black text-slate-100">
              {isRegister ? 'Forge Your Character' : 'Enter the Realm'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isRegister
                ? 'Every action will yield XP, Level progression, and real-world mastery.'
                : 'Resume your quest log and continue your unbroken streak.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 text-xs font-semibold text-rose-300 bg-rose-950/70 border border-rose-800 p-3 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Hero Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. CyberKnight"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                {isRegister ? 'Scroll Address (Email)' : 'Email or Username'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={isRegister ? 'email' : 'text'}
                  required
                  placeholder={isRegister ? 'adventurer@liferpg.com' : 'demo@liferpg.com or DemoHero'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Secret Cipher (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-orbitron font-extrabold text-xs sm:text-sm tracking-wider uppercase bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white shadow-glow-cyan transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer mt-2"
            >
              {loading ? 'AUTHENTICATING...' : isRegister ? 'BEGIN ADVENTURE' : 'LOGIN TO REALM'}
            </button>
          </form>

          {/* Switch Login / Register */}
          <div className="mt-5 text-center text-xs text-slate-400">
            {isRegister ? (
              <span>
                Already enlisted?{' '}
                <button
                  type="button"
                  onClick={() => { setIsRegister(false); setError(null); }}
                  className="text-cyan-400 hover:underline font-bold"
                >
                  Log in
                </button>
              </span>
            ) : (
              <span>
                New adventurer?{' '}
                <button
                  type="button"
                  onClick={() => { setIsRegister(true); setError(null); }}
                  className="text-cyan-400 hover:underline font-bold"
                >
                  Create Character
                </button>
              </span>
            )}
          </div>

          {/* Quick Demo Credentials Box for Judges */}
          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <div className="text-[11px] text-slate-400 mb-2">
              For Judges / Evaluators:
            </div>
            <button
              onClick={handleDemoClick}
              disabled={loading}
              className="w-full py-2.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-purple-500/50 text-purple-200 text-xs font-orbitron font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Launch Pre-configured Demo Hero (Lvl 7)</span>
            </button>
          </div>

        </div>
      </div>

      {/* Footer RPG Lore */}
      <div className="max-w-4xl mx-auto w-full text-center text-xs text-slate-500 z-10">
        <p className="font-mono">
          Studying → INT XP &nbsp;•&nbsp; Coding → INT / CRE XP &nbsp;•&nbsp; Gym → STR / VIT XP &nbsp;•&nbsp; Meditation → DISC XP
        </p>
      </div>

    </div>
  );
}
