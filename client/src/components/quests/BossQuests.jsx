import React, { useState } from 'react';
import { Skull, Swords, Zap, Coins, CheckCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { useGame } from '../../context/GameContext.jsx';

export default function BossQuests({ quests }) {
  const { completeQuest } = useGame();
  const [strikingId, setStrikingId] = useState(null);

  const bossQuests = quests.filter(q => q.is_boss === 1);
  if (bossQuests.length === 0) return null;

  const handleStrike = async (questId) => {
    if (strikingId) return;
    setStrikingId(questId);
    try {
      await completeQuest(questId);
    } catch (err) {
      console.error('Boss strike error:', err);
    } finally {
      setStrikingId(null);
    }
  };

  return (
    <div className="space-y-4 my-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-950/80 border border-rose-600/60 flex items-center justify-center text-rose-400">
            <Skull className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-orbitron font-extrabold text-slate-100 flex items-center gap-2">
              <span>Weekly Boss Encounters</span>
              <span className="text-xs font-bold text-rose-400 px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/80 uppercase">
                High Danger
              </span>
            </h2>
            <p className="text-xs text-slate-400">Multi-strike trials yielding monumental XP and Boss Slayer prestige.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bossQuests.map((boss) => {
          const isVanquished = boss.status === 'completed';
          const maxHp = boss.boss_health_max || 1;
          const currentHp = isVanquished ? 0 : (boss.boss_health_current || 0);
          const hpPercent = isVanquished ? 0 : Math.round((currentHp / maxHp) * 100);

          return (
            <div
              key={boss.id}
              className={`rpg-card p-5 relative overflow-hidden border-2 ${
                isVanquished
                  ? 'border-slate-800 bg-slate-900/30 opacity-70'
                  : 'border-rose-600/50 shadow-[0_0_20px_rgba(225,29,72,0.25)]'
              }`}
            >
              {/* Top Row: Monster Icon & Title */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <span className="text-[10px] font-orbitron uppercase font-bold tracking-widest text-rose-400 flex items-center gap-1 mb-1">
                    <ShieldAlert className="w-3 h-3" />
                    BOSS LEVEL RAID
                  </span>
                  <h3 className="font-orbitron font-black text-lg text-slate-100 leading-tight">
                    {boss.title}
                  </h3>
                </div>
                <div className="text-3xl p-2 rounded-xl bg-rose-950/40 border border-rose-800/60">
                  👹
                </div>
              </div>

              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                {boss.description}
              </p>

              {/* Boss Health Bar */}
              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between text-xs font-orbitron font-bold">
                  <span className="text-rose-400">BOSS HEALTH</span>
                  <span className="text-slate-300 font-mono">
                    {isVanquished ? '0 / ' + maxHp : currentHp + ' / ' + maxHp + ' HP'}
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-rose-950">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isVanquished
                        ? 'bg-slate-700'
                        : 'bg-gradient-to-r from-orange-500 via-rose-500 to-red-600 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                    }`}
                    style={{ width: `${hpPercent}%` }}
                  />
                </div>
              </div>

              {/* Rewards & Action */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
                <div className="flex items-center gap-3 text-xs font-orbitron font-bold">
                  <span className="flex items-center gap-1 text-cyan-400">
                    <Zap className="w-3.5 h-3.5 fill-cyan-400" />
                    +{boss.xp_reward} XP
                  </span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <Coins className="w-3.5 h-3.5 fill-amber-400" />
                    +{boss.coin_reward}
                  </span>
                </div>

                {isVanquished ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-lg">
                    <CheckCircle className="w-4 h-4" />
                    <span>VANQUISHED</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStrike(boss.id)}
                    disabled={strikingId === boss.id}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-orbitron font-bold text-xs tracking-wider shadow-md hover:shadow-[0_0_15px_rgba(225,29,72,0.4)] transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <Swords className="w-4 h-4" />
                    <span>{strikingId === boss.id ? 'ATTACKING...' : 'DEAL STRIKE'}</span>
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
