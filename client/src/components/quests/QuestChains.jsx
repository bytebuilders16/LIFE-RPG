import React from 'react';
import { GitCommit, CheckCircle2, Lock, ArrowRight, Zap, Coins } from 'lucide-react';
import { useGame } from '../../context/GameContext.jsx';

export default function QuestChains({ quests }) {
  const { completeQuest } = useGame();

  // Group quests by chain_id
  const chainMap = {};
  for (const q of quests) {
    if (q.chain_id) {
      if (!chainMap[q.chain_id]) chainMap[q.chain_id] = [];
      chainMap[q.chain_id].push(q);
    }
  }

  const chainEntries = Object.entries(chainMap);
  if (chainEntries.length === 0) return null;

  return (
    <div className="space-y-4 my-6">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-600/60 flex items-center justify-center text-indigo-400">
          <GitCommit className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-orbitron font-extrabold text-slate-100 flex items-center gap-2">
            <span>Progressive Quest Chains</span>
            <span className="text-xs font-bold text-indigo-300 px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/80 uppercase">
              Campaigns
            </span>
          </h2>
          <p className="text-xs text-slate-400">Sequential pathways unlocking subsequent milestones.</p>
        </div>
      </div>

      {chainEntries.map(([chainId, steps]) => {
        // Sort by chain_step
        const sortedSteps = [...steps].sort((a, b) => (a.chain_step || 1) - (b.chain_step || 1));
        const chainTitle = sortedSteps[0]?.chain_title || 'Heroic Progression Campaign';
        const completedCount = sortedSteps.filter(s => s.status === 'completed').length;
        const percent = Math.round((completedCount / sortedSteps.length) * 100);

        return (
          <div key={chainId} className="rpg-card p-5 border border-indigo-500/30">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <span className="text-[10px] font-orbitron font-bold uppercase tracking-widest text-indigo-400">
                  QUEST CHAIN CAMPAIGN
                </span>
                <h3 className="font-orbitron font-black text-base sm:text-lg text-slate-100">
                  {chainTitle}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400">
                  {completedCount} / {sortedSteps.length} Steps ({percent}%)
                </span>
                <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Stepper Horizontal Flow */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {sortedSteps.map((step, idx) => {
                const isCompleted = step.status === 'completed';
                const isCurrent = !isCompleted && (idx === 0 || sortedSteps[idx - 1].status === 'completed');
                const isLocked = !isCompleted && !isCurrent;

                return (
                  <div
                    key={step.id}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between relative transition-all ${
                      isCompleted
                        ? 'bg-slate-900/60 border-emerald-600/40 text-slate-300'
                        : isCurrent
                        ? 'bg-indigo-950/40 border-indigo-500/80 shadow-glow-purple text-slate-100'
                        : 'bg-slate-900/20 border-slate-800/80 opacity-50 text-slate-500'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5 font-orbitron">
                        <span className="font-bold text-indigo-300">STEP {step.chain_step}</span>
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : isLocked ? (
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                        ) : (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 animate-pulse">
                            ACTIVE
                          </span>
                        )}
                      </div>

                      <h4 className="font-orbitron font-bold text-xs sm:text-sm line-clamp-1 mb-1">
                        {step.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                        {step.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-cyan-400 font-bold font-orbitron">+{step.xp_reward} XP</span>
                      {isCurrent && (
                        <button
                          onClick={() => completeQuest(step.id)}
                          className="px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-orbitron font-bold text-[10px] tracking-wider transition-all cursor-pointer"
                        >
                          CONQUER
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        );
      })}
    </div>
  );
}
