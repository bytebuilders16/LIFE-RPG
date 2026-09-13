import React, { useEffect } from 'react';
import { Award, Zap, Coins, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

export default function CelebrationModal({ data, onClose }) {
  if (!data) return null;

  const {
    questTitle = 'Quest Completed',
    rewards = {},
    progression = {},
    streak = {},
    unlockedAchievements = [],
    bossDefeated = false
  } = data;

  const isLevelUp = progression?.leveledUp;

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className={`w-full max-w-md bg-[#0d1322] border ${
          isLevelUp ? 'border-amber-400/80 shadow-glow-gold' : 'border-cyan-500/60 shadow-glow-cyan'
        } rounded-2xl p-6 relative overflow-hidden text-center transform transition-all duration-300 scale-100`}
      >
        {/* Background Aura */}
        <div className={`absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
          isLevelUp ? 'bg-amber-500/25' : 'bg-cyan-500/20'
        }`} />

        {/* Header Badge */}
        <div className="relative mb-3">
          {bossDefeated ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-950/80 border border-rose-500 text-rose-300 font-orbitron font-extrabold text-sm tracking-wider animate-bounce">
              👹 BOSS VANQUISHED!
            </div>
          ) : isLevelUp ? (
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-950/80 border border-amber-400 text-amber-300 font-orbitron font-black text-base tracking-widest animate-bounce shadow-glow-gold">
              ⚔️ LEVEL UP! ⚔️
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500 text-cyan-300 font-orbitron font-bold text-xs tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              QUEST COMPLETE!
            </div>
          )}
        </div>

        {/* Level Up Transition Display */}
        {isLevelUp ? (
          <div className="my-4">
            <div className="flex items-center justify-center gap-3 font-orbitron font-black text-2xl text-slate-100">
              <span className="text-slate-400">Level {progression.oldLevel}</span>
              <ChevronRight className="w-6 h-6 text-amber-400 animate-pulse" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500 text-3xl">
                Level {progression.newLevel}
              </span>
            </div>
            <p className="text-xs text-amber-300/90 font-medium mt-1">
              +{progression.statBonusEarned} Skill Points Granted!
            </p>
          </div>
        ) : (
          <h3 className="font-orbitron font-bold text-lg text-slate-100 my-2 line-clamp-2 px-2">
            {questTitle}
          </h3>
        )}

        {/* Rewards Earned Grid */}
        <div className="grid grid-cols-2 gap-2.5 my-4">
          {/* XP */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Experience</span>
            <div className="flex items-center gap-1.5 text-cyan-400 font-orbitron font-bold text-lg mt-0.5">
              <Zap className="w-4 h-4 fill-cyan-400" />
              <span>+{rewards.xp || 0} XP</span>
            </div>
          </div>

          {/* Coins */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Gold Coins</span>
            <div className="flex items-center gap-1.5 text-amber-400 font-orbitron font-bold text-lg mt-0.5">
              <Coins className="w-4 h-4 fill-amber-400" />
              <span>+{rewards.coins || 0}</span>
            </div>
          </div>
        </div>

        {/* Attribute Gains */}
        {rewards.attributes && Object.keys(rewards.attributes).length > 0 && (
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-2.5 mb-4">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium block mb-1">
              Attribute Growth
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {Object.entries(rewards.attributes).map(([attr, val]) => (
                <span key={attr} className="text-xs font-semibold px-2.5 py-1 rounded-md bg-purple-950/60 border border-purple-800/80 text-purple-300">
                  +{val} {attr}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Unlocked Achievements in this completion */}
        {unlockedAchievements.length > 0 && (
          <div className="bg-amber-950/40 border border-amber-500/60 rounded-xl p-3 mb-4 text-left">
            <div className="flex items-center gap-2 text-amber-300 font-orbitron font-bold text-xs uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              New Achievement Unlocked!
            </div>
            {unlockedAchievements.map(ach => (
              <div key={ach.id} className="flex items-center gap-2 text-sm text-slate-200">
                <span className="text-lg">{ach.icon}</span>
                <div>
                  <div className="font-bold text-amber-200">{ach.title}</div>
                  <div className="text-[11px] text-slate-400">{ach.description}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Streak Notice */}
        {streak?.streakShieldUsed && (
          <div className="mb-4 text-xs font-medium text-cyan-300 bg-cyan-950/60 border border-cyan-800 px-3 py-2 rounded-lg">
            🛡️ Your Streak Shield was activated to preserve your streak!
          </div>
        )}

        {/* Dismiss Button */}
        <button
          onClick={onClose}
          autoFocus
          className="w-full py-3 px-6 rounded-xl font-orbitron font-bold text-sm tracking-wider uppercase bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-glow-cyan transition-all transform active:scale-95 cursor-pointer"
        >
          CLAIM REWARDS
        </button>

      </div>
    </div>
  );
}
