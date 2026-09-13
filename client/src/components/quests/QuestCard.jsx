import React, { useState } from 'react';
import { CheckCircle2, Trash2, Calendar, Zap, Coins, Brain, Flame, Sword, Heart, Palette, Shield } from 'lucide-react';
import { useGame } from '../../context/GameContext.jsx';

export const DIFFICULTY_COLORS = {
  Easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  Medium: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  Hard: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  Epic: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
};

export const CATEGORY_ICONS = {
  Coding: Brain,
  Study: Brain,
  Fitness: Sword,
  Health: Heart,
  Reading: Brain,
  Meditation: Flame,
  Personal: Flame,
  Work: Shield,
  Other: Palette
};

export default function QuestCard({ quest, onDelete }) {
  const { completeQuest } = useGame();
  const [completing, setCompleting] = useState(false);

  const isCompleted = quest.status === 'completed';
  const Icon = CATEGORY_ICONS[quest.category] || Shield;
  const diffClass = DIFFICULTY_COLORS[quest.difficulty] || DIFFICULTY_COLORS.Medium;

  const handleComplete = async () => {
    if (isCompleted || completing) return;
    setCompleting(true);
    try {
      await completeQuest(quest.id);
    } catch (err) {
      console.error(err);
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div
      className={`rpg-card p-4 sm:p-5 flex flex-col justify-between relative transition-all duration-200 ${
        isCompleted
          ? 'opacity-60 bg-slate-900/40 border-slate-800'
          : quest.difficulty === 'Epic'
          ? 'border-purple-500/40 shadow-glow-purple'
          : quest.difficulty === 'Hard'
          ? 'border-amber-500/30'
          : 'border-slate-800'
      }`}
    >
      {/* Top Header Row */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-cyan-400">
              <Icon className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-slate-300">
              {quest.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${diffClass}`}>
              {quest.difficulty}
            </span>
            {!isCompleted && onDelete && (
              <button
                onClick={() => onDelete(quest.id)}
                className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                title="Abandon quest"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <h3 className={`font-orbitron font-bold text-base sm:text-lg mb-1.5 ${isCompleted ? 'line-through text-slate-500' : 'text-slate-100'}`}>
          {quest.title}
        </h3>

        {quest.description && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
            {quest.description}
          </p>
        )}
      </div>

      {/* Footer: Rewards & Complete Action */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-auto">
        {/* Rewards Badges */}
        <div className="flex items-center flex-wrap gap-2 text-xs font-medium">
          <span className="flex items-center gap-1 text-cyan-400 font-bold bg-cyan-950/40 border border-cyan-800/60 px-2 py-0.5 rounded">
            <Zap className="w-3 h-3 fill-cyan-400" />
            +{quest.xp_reward} XP
          </span>
          <span className="flex items-center gap-1 text-amber-300 font-bold bg-amber-950/40 border border-amber-800/60 px-2 py-0.5 rounded">
            <Coins className="w-3 h-3 fill-amber-400" />
            +{quest.coin_reward}
          </span>
          {quest.primary_attribute && (
            <span className="hidden sm:inline text-purple-300 text-[11px] bg-purple-950/30 border border-purple-800/50 px-1.5 py-0.5 rounded">
              +{quest.primary_attribute}
            </span>
          )}
        </div>

        {/* Complete Action Button */}
        {isCompleted ? (
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2.5 py-1.5 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>CONQUERED</span>
          </div>
        ) : (
          <button
            onClick={handleComplete}
            disabled={completing}
            className="flex items-center gap-1.5 text-xs font-orbitron font-bold px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white shadow-sm hover:shadow-glow-cyan transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {completing ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            <span>COMPLETE</span>
          </button>
        )}
      </div>
    </div>
  );
}
