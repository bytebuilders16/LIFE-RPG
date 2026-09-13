import React, { useState, useEffect } from 'react';
import { Trophy, Lock, CheckCircle2, Sparkles, Zap, Coins } from 'lucide-react';
import { api } from '../../services/api.js';

export default function AchievementsScreen() {
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({ total: 0, unlocked: 0, percent: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAchievements() {
      try {
        const res = await api.getAchievements();
        setAchievements(res.achievements || []);
        setStats(res.stats || { total: 0, unlocked: 0, percent: 0 });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAchievements();
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/20 border border-amber-500/40 shadow-glow-gold">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl text-amber-400">
            🏆
          </div>
          <div>
            <h1 className="font-orbitron font-black text-2xl text-slate-100 flex items-center gap-2">
              Hall of Achievements
            </h1>
            <p className="text-xs text-slate-400">
              Perseverance and discipline etched into immortal guild heraldry.
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-xl">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ascension Badges</div>
            <div className="text-sm font-bold font-orbitron text-amber-300">
              {stats.unlocked} / {stats.total} Unlocked ({stats.percent}%)
            </div>
          </div>
          <div className="w-20 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all"
              style={{ width: `${stats.percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400 font-orbitron">
          Examining guild records...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach) => {
            const isUnlocked = ach.isUnlocked;

            return (
              <div
                key={ach.id}
                className={`rpg-card p-5 border flex flex-col justify-between relative transition-all ${
                  isUnlocked
                    ? 'border-amber-500/40 bg-slate-900/80 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                    : 'border-slate-800/80 bg-slate-950/40 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-3xl p-2.5 rounded-xl border ${
                      isUnlocked
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-slate-900 border-slate-800 grayscale'
                    }`}>
                      {ach.icon}
                    </span>

                    {isUnlocked ? (
                      <span className="text-[10px] font-orbitron font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        UNLOCKED
                      </span>
                    ) : (
                      <span className="text-[10px] font-orbitron font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-500 border border-slate-800 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        LOCKED
                      </span>
                    )}
                  </div>

                  <h3 className={`font-orbitron font-bold text-base mb-1 ${
                    isUnlocked ? 'text-amber-200' : 'text-slate-400'
                  }`}>
                    {ach.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    {ach.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-orbitron font-semibold">
                  <span className="text-[10px] uppercase font-bold text-slate-500">
                    {ach.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-cyan-400">
                      <Zap className="w-3 h-3 fill-cyan-400" />
                      +{ach.reward_xp} XP
                    </span>
                    <span className="flex items-center gap-1 text-amber-300">
                      <Coins className="w-3 h-3 fill-amber-400" />
                      +{ach.reward_coins}
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
