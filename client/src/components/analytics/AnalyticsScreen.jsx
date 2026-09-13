import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Flame, CheckCircle, Zap, Shield, Brain, Heart, Palette } from 'lucide-react';
import { api } from '../../services/api.js';

export default function AnalyticsScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await api.getAnalytics();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-16 text-center text-xs text-slate-400 font-orbitron">
        Computing analytics and attribute matrices...
      </div>
    );
  }

  if (!data) return null;

  const { character, attributes, categoryDistribution = [], xpTimeline = [], stats } = data;

  // Max XP for scale in 7-day bar chart
  const maxXp = Math.max(...xpTimeline.map(t => t.xp), 200);

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-500/40 shadow-glow-cyan">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-2xl text-cyan-400">
            📊
          </div>
          <div>
            <h1 className="font-orbitron font-black text-2xl text-slate-100">
              Progress & Mastery Analytics
            </h1>
            <p className="text-xs text-slate-400">Empirical metrics of your real-world habit ascension.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-orbitron font-bold text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300">
            RATE: {stats.completionRate}%
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-300">
            PWR: {character.lifePower}
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rpg-card p-4 border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current Streak</span>
          <div className="text-xl font-orbitron font-black text-amber-400 mt-1 flex items-center justify-center gap-1">
            <Flame className="w-5 h-5 fill-orange-500 text-orange-500" />
            <span>{character.streak} Days</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Record: {character.longestStreak} Days</span>
        </div>

        <div className="rpg-card p-4 border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Conquered</span>
          <div className="text-xl font-orbitron font-black text-emerald-400 mt-1 flex items-center justify-center gap-1">
            <CheckCircle className="w-5 h-5" />
            <span>{stats.totalCompleted}</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">{stats.totalCreated} Created</span>
        </div>

        <div className="rpg-card p-4 border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Character Level</span>
          <div className="text-xl font-orbitron font-black text-cyan-300 mt-1">
            LVL {character.level}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">{character.currentXp} / {character.nextLevelXp} XP</span>
        </div>

        <div className="rpg-card p-4 border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Life Power Score</span>
          <div className="text-xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-amber-300 mt-1">
            {character.lifePower}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Holistic Power</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* XP Over Time SVG Bar Chart */}
        <div className="rpg-card p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-orbitron font-bold text-sm text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Experience Timeline (Last 7 Days)</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Daily Yield</span>
          </div>

          {xpTimeline.length > 0 ? (
            <div className="h-56 flex items-end justify-between gap-2 pt-6 px-2">
              {xpTimeline.map((item, idx) => {
                const heightPercent = Math.max(12, Math.round((item.xp / maxXp) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[10px] font-mono font-bold text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      +{item.xp}
                    </div>
                    <div className="w-full max-w-[40px] bg-slate-800 rounded-t-lg overflow-hidden relative flex items-end h-full">
                      <div
                        className="w-full bg-gradient-to-t from-cyan-600 to-purple-500 rounded-t-lg transition-all duration-700 shadow-glow-cyan"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 truncate w-full text-center">
                      {item.date.split('-').slice(1).join('/')}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-xs text-slate-500">
              Complete quests across multiple days to generate timeline trajectories.
            </div>
          )}
        </div>

        {/* Category Breakdown & Distribution */}
        <div className="rpg-card p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-orbitron font-bold text-sm text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span>Category Focus Distribution</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">XP by Realm</span>
          </div>

          {categoryDistribution.length > 0 ? (
            <div className="space-y-3 pt-2">
              {categoryDistribution.map((cat) => {
                const totalCategoryXp = categoryDistribution.reduce((acc, c) => acc + (c.total_xp || 0), 0) || 1;
                const percent = Math.round(((cat.total_xp || 0) / totalCategoryXp) * 100);

                return (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-200">{cat.category} ({cat.completions} Quests)</span>
                      <span className="text-cyan-400 font-mono font-bold">+{cat.total_xp} XP ({percent}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full transition-all duration-700"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-xs text-slate-500">
              Complete quests in various categories to visualize your domain distribution.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
