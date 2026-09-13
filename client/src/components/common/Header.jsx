import React from 'react';
import { Shield, Zap, Flame, Coins, Sparkles, LogOut, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Header({ onOpenShop, onOpenInventory }) {
  const { user, character, logout, startDemo } = useAuth();

  const currentXp = character?.current_xp || 0;
  const nextLevelXp = character?.next_level_xp || 100;
  const xpPercent = Math.min(100, Math.round((currentXp / nextLevelXp) * 100));

  // Determine frame border styling
  let frameClass = 'border-slate-700';
  if (character?.equipped_frame === 'frame_cyber') frameClass = 'border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]';
  if (character?.equipped_frame === 'frame_dragon') frameClass = 'border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]';

  return (
    <header className="sticky top-0 z-40 bg-[#070b14]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-purple-600 flex items-center justify-center shadow-glow-cyan text-xl">
            ⚔️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-orbitron font-extrabold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-300 to-amber-300">
                LIFE RPG
              </span>
              {user?.isDemo && (
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  DEMO ACCOUNT
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-medium tracking-wide">
              Turn Your Real Life Into an RPG.
            </p>
          </div>
        </div>

        {/* Player Vital Stats Header Bar */}
        {character && (
          <div className="flex items-center flex-wrap gap-3 sm:gap-6 bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2 text-sm shadow-inner">
            
            {/* Level & XP bar */}
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-orbitron font-black text-xs px-2.5 py-1 rounded-md shadow-sm">
                LVL {character.level}
              </div>
              <div className="w-24 sm:w-36">
                <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono">
                  <span>{currentXp.toLocaleString()}</span>
                  <span>{nextLevelXp.toLocaleString()} XP</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60 relative">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full attr-bar-fill relative"
                    style={{ width: `${xpPercent}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs sm:text-sm" title="Active Daily Streak">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
              <span>{character.streak} DAY{character.streak === 1 ? '' : 'S'}</span>
            </div>

            {/* Coins */}
            <button
              onClick={onOpenShop}
              className="flex items-center gap-1.5 text-amber-300 font-semibold text-xs sm:text-sm hover:text-amber-200 transition-colors cursor-pointer"
              title="Click to visit Shop"
            >
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{character.coins.toLocaleString()}</span>
            </button>

            {/* Life Power */}
            <div className="hidden md:flex items-center gap-1.5 text-cyan-300 font-orbitron font-bold text-xs" title="Composite Life Power Score">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>PWR {character.lifePower || 847}</span>
            </div>
          </div>
        )}

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Re-Start Button */}
          <button
            onClick={startDemo}
            className="flex items-center gap-1.5 text-xs font-orbitron font-bold tracking-wider px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600/30 to-cyan-600/30 hover:from-purple-600/50 hover:to-cyan-600/50 border border-purple-500/40 text-purple-200 hover:text-white transition-all shadow-sm"
            title="Reset or enter Demo Hero walkthrough"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>🚀 DEMO</span>
          </button>

          {/* User Menu */}
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenInventory}
                className={`flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border ${frameClass} text-xs font-medium text-slate-200 hover:bg-slate-800 transition-all`}
                title="View Inventory & Profile"
              >
                <span className="font-bold text-cyan-400">{user.username}</span>
                {character?.equipped_title && (
                  <span className="hidden lg:inline text-[10px] text-purple-300 px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-800/60">
                    {character.equipped_title}
                  </span>
                )}
              </button>
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : null}
        </div>

      </div>
    </header>
  );
}
