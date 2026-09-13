import React from 'react';
import { Compass, CheckCircle2, Circle, Zap, Coins, Flame, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useGame } from '../../context/GameContext.jsx';
import QuestCard from './QuestCard.jsx';

export default function DailyAdventure({ onOpenCreate, onSwitchToAllQuests }) {
  const { character } = useAuth();
  const { quests, completeQuest } = useGame();

  // Filter today's quests (non-boss, non-chain or today's top priorities)
  const regularQuests = quests.filter(q => q.is_boss !== 1);
  const pendingQuests = regularQuests.filter(q => q.status === 'pending');
  const completedToday = regularQuests.filter(q => q.status === 'completed');

  // Categorize into Main Quest (Hard/Epic), Side Quest (Medium), Mini Quest (Easy)
  const mainQuest = pendingQuests.find(q => q.difficulty === 'Hard' || q.difficulty === 'Epic') || pendingQuests[0];
  const sideQuest = pendingQuests.find(q => q.difficulty === 'Medium' && q.id !== mainQuest?.id) || pendingQuests[1];
  const miniQuest = pendingQuests.find(q => q.difficulty === 'Easy' && q.id !== mainQuest?.id && q.id !== sideQuest?.id) || pendingQuests[2];

  const totalToday = (mainQuest ? 1 : 0) + (sideQuest ? 1 : 0) + (miniQuest ? 1 : 0) + completedToday.length;
  const completedCount = completedToday.length;
  const progressPercent = totalToday > 0 ? Math.round((completedCount / totalToday) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* TODAY'S ADVENTURE Header & Quick Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-orbitron font-bold uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4 animate-spin-slow" />
            <span>DAILY EXPEDITION</span>
          </div>
          <h2 className="text-2xl font-orbitron font-black text-slate-100 flex items-center gap-2">
            TODAY'S ADVENTURE ⚔️
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Conquer your prioritized objectives to advance level and sustain your 🔥 {character?.streak || 0}-day streak.
          </p>
        </div>

        {/* Circular Progress & Action */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5">
            <div className="w-12 h-12 rounded-full border-2 border-cyan-500/40 flex items-center justify-center font-orbitron font-black text-sm text-cyan-300">
              {progressPercent}%
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Today's Ratio</div>
              <div className="text-xs font-bold text-slate-200">
                {completedCount} Completed
              </div>
            </div>
          </div>

          <button
            onClick={onOpenCreate}
            className="px-4 py-2.5 rounded-xl font-orbitron font-bold text-xs tracking-wider uppercase bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white shadow-glow-cyan transition-all transform active:scale-95 cursor-pointer whitespace-nowrap"
          >
            + NEW QUEST
          </button>
        </div>
      </div>

      {/* Main / Side / Mini Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Main Quest Slot */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-orbitron font-bold text-slate-400 px-1">
            <span className="text-purple-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              MAIN QUEST (Priority)
            </span>
          </div>
          {mainQuest ? (
            <QuestCard quest={mainQuest} />
          ) : (
            <div className="rpg-card p-6 border-dashed border-slate-800 text-center flex flex-col items-center justify-center min-h-[160px]">
              <CheckCircle2 className="w-8 h-8 text-emerald-400/60 mb-2" />
              <p className="text-xs text-slate-400">All Main Quests conquered today!</p>
              <button
                onClick={onOpenCreate}
                className="mt-2 text-xs text-cyan-400 hover:underline font-semibold"
              >
                Assign New Main Quest
              </button>
            </div>
          )}
        </div>

        {/* Side Quest Slot */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-orbitron font-bold text-slate-400 px-1">
            <span className="text-cyan-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
              SIDE QUEST (Habit)
            </span>
          </div>
          {sideQuest ? (
            <QuestCard quest={sideQuest} />
          ) : (
            <div className="rpg-card p-6 border-dashed border-slate-800 text-center flex flex-col items-center justify-center min-h-[160px]">
              <CheckCircle2 className="w-8 h-8 text-emerald-400/60 mb-2" />
              <p className="text-xs text-slate-400">Side Quest slot cleared!</p>
              <button
                onClick={onOpenCreate}
                className="mt-2 text-xs text-cyan-400 hover:underline font-semibold"
              >
                Assign Side Quest
              </button>
            </div>
          )}
        </div>

        {/* Mini Quest Slot */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-orbitron font-bold text-slate-400 px-1">
            <span className="text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              MINI QUEST (Micro-Win)
            </span>
          </div>
          {miniQuest ? (
            <QuestCard quest={miniQuest} />
          ) : (
            <div className="rpg-card p-6 border-dashed border-slate-800 text-center flex flex-col items-center justify-center min-h-[160px]">
              <CheckCircle2 className="w-8 h-8 text-emerald-400/60 mb-2" />
              <p className="text-xs text-slate-400">Mini Quest completed!</p>
              <button
                onClick={onOpenCreate}
                className="mt-2 text-xs text-cyan-400 hover:underline font-semibold"
              >
                Assign Mini Quest
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
