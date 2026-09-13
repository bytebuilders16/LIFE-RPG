import React from 'react';
import { Shield, Brain, Flame, Heart, Palette, Sword, Zap, Coins, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function CharacterScreen({ onOpenInventory, onOpenShop }) {
  const { user, character } = useAuth();

  if (!character) return null;

  const attributes = [
    {
      name: 'Strength',
      val: character.strength,
      icon: Sword,
      color: 'from-amber-500 to-red-600',
      textClr: 'text-amber-400',
      borderClr: 'border-amber-500/40',
      bgGlow: 'rgba(239, 68, 68, 0.15)',
      description: 'Physical prowess, workout resilience, and kinetic power.'
    },
    {
      name: 'Intelligence',
      val: character.intelligence,
      icon: Brain,
      color: 'from-cyan-400 to-blue-600',
      textClr: 'text-cyan-400',
      borderClr: 'border-cyan-500/40',
      bgGlow: 'rgba(6, 182, 212, 0.15)',
      description: 'Algorithmic logic, analytical depth, and rapid learning capacity.'
    },
    {
      name: 'Discipline',
      val: character.discipline,
      icon: Flame,
      color: 'from-purple-400 to-indigo-600',
      textClr: 'text-purple-400',
      borderClr: 'border-purple-500/40',
      bgGlow: 'rgba(139, 92, 246, 0.15)',
      description: 'Habit consistency, meditation depth, and focus persistence.'
    },
    {
      name: 'Vitality',
      val: character.vitality,
      icon: Heart,
      color: 'from-emerald-400 to-teal-600',
      textClr: 'text-emerald-400',
      borderClr: 'border-emerald-500/40',
      bgGlow: 'rgba(16, 185, 129, 0.15)',
      description: 'Rest, nutrition, cardiovascular energy, and longevity.'
    },
    {
      name: 'Creativity',
      val: character.creativity,
      icon: Palette,
      color: 'from-pink-400 to-rose-600',
      textClr: 'text-pink-400',
      borderClr: 'border-pink-500/40',
      bgGlow: 'rgba(244, 63, 94, 0.15)',
      description: 'Design elegance, divergent thinking, and architectural flair.'
    }
  ];

  const maxVal = Math.max(...attributes.map(a => a.val), 100);
  const currentXp = character.current_xp || 0;
  const nextXp = character.next_level_xp || 100;
  const xpPercent = Math.min(100, Math.round((currentXp / nextXp) * 100));

  // Determine frame
  let frameClass = 'border-slate-700';
  if (character.equipped_frame === 'frame_cyber') frameClass = 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]';
  if (character.equipped_frame === 'frame_dragon') frameClass = 'border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.5)]';

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      
      {/* Header Banner: PLAYER CHARACTER */}
      <div className="text-center">
        <div className="inline-block px-4 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-[11px] font-orbitron font-bold tracking-widest text-slate-400 uppercase mb-2">
          PLAYER CHARACTER SHEET
        </div>
        <h1 className="text-3xl sm:text-4xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-300 to-amber-300">
          {user?.username || character.name}
        </h1>
        {character.equipped_title && (
          <div className="mt-1 font-medium text-sm text-purple-300 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>« {character.equipped_title} »</span>
          </div>
        )}
      </div>

      {/* Hero Stats Card */}
      <div className={`rpg-card p-6 border-2 ${frameClass} relative overflow-hidden`}>
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Shield className="w-48 h-48 text-cyan-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          
          {/* Level Circle Display */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-900/90 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-orbitron font-bold tracking-widest text-slate-400">Current Rank</span>
            <div className="my-2 w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-1 flex items-center justify-center shadow-glow-cyan animate-float">
              <div className="w-full h-full bg-[#0b101d] rounded-full flex flex-col items-center justify-center">
                <span className="font-orbitron font-black text-2xl text-white">LVL</span>
                <span className="font-orbitron font-black text-xl text-cyan-300 leading-none">{character.level}</span>
              </div>
            </div>
            <span className="text-xs font-semibold text-purple-300">Ascended Hero</span>
          </div>

          {/* XP & Progression */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-xs font-orbitron uppercase text-slate-400">Experience Points</span>
                <div className="text-xl font-orbitron font-extrabold text-cyan-300">
                  {currentXp.toLocaleString()} <span className="text-slate-500 text-sm">/ {nextXp.toLocaleString()} XP</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">{xpPercent}%</span>
            </div>

            <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-700/80 relative shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 rounded-full attr-bar-fill relative"
                style={{ width: `${xpPercent}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
              </div>
            </div>

            {/* Streak and Coins Row */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-xl p-2.5">
                <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <Flame className="w-5 h-5 fill-orange-500" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Streak</div>
                  <div className="text-sm font-bold text-amber-400 font-orbitron">🔥 {character.streak} DAYS</div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-xl p-2.5">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Coins className="w-5 h-5 fill-amber-400" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Coin Vault</div>
                  <div className="text-sm font-bold text-amber-300 font-orbitron">🪙 {character.coins.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Life Power Showcase */}
          <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-b from-cyan-950/40 to-slate-900/90 rounded-2xl border border-cyan-500/30 text-center shadow-glow-cyan">
            <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-orbitron font-bold uppercase tracking-widest mb-1">
              <Zap className="w-4 h-4 fill-cyan-400" />
              <span>LIFE POWER</span>
            </div>
            <div className="font-orbitron font-black text-4xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-amber-300">
              {character.lifePower || 847}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Holistic rating calculated from your real-world progression.
            </p>
          </div>

        </div>
      </div>

      {/* Attributes Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-lg font-orbitron font-bold text-slate-100 flex items-center gap-2">
            <span>Attributes Breakdown</span>
            <span className="text-xs text-slate-400 font-normal">({attributes.reduce((acc, a) => acc + a.val, 0)} Total Pts)</span>
          </h2>
          <div className="flex gap-2">
            <button
              onClick={onOpenInventory}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              Equip Cosmetics
            </button>
            <button
              onClick={onOpenShop}
              className="text-xs px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 transition-colors"
            >
              Visit Shop
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {attributes.map((attr) => {
            const Icon = attr.icon;
            const barWidth = Math.min(100, Math.round((attr.val / maxVal) * 100));

            return (
              <div
                key={attr.name}
                className="rpg-card p-4 border border-slate-800 hover:border-slate-700 transition-all group relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg bg-slate-800 border ${attr.borderClr} flex items-center justify-center ${attr.textClr}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-orbitron font-bold text-sm text-slate-200">
                      {attr.name}
                    </span>
                  </div>
                  <span className={`font-orbitron font-black text-lg ${attr.textClr}`}>
                    {attr.val}
                  </span>
                </div>

                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 mb-2">
                  <div
                    className={`h-full bg-gradient-to-r ${attr.color} rounded-full attr-bar-fill`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {attr.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
