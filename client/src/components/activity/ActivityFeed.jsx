import React, { useState, useEffect } from 'react';
import { Clock, Shield, Award, Zap, ShoppingBag, Flame, Sparkles } from 'lucide-react';
import { api } from '../../services/api.js';

export default function ActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActivity() {
      try {
        const res = await api.getActivity(40);
        setActivities(res.activities || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadActivity();
  }, []);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'level_up':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'achievement':
        return <Award className="w-4 h-4 text-amber-300" />;
      case 'shop_purchase':
        return <ShoppingBag className="w-4 h-4 text-purple-400" />;
      case 'streak_shield_used':
        return <Shield className="w-4 h-4 text-cyan-400" />;
      case 'boss_defeated':
        return <span className="text-sm">👹</span>;
      default:
        return <Sparkles className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-3 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-orbitron font-black text-xl text-slate-100">
            Chronological Activity Log
          </h1>
          <p className="text-xs text-slate-400">Unbroken verifiable chronicle of your quests, promotions, and shop transactions.</p>
        </div>
      </div>

      {/* Feed List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400 font-orbitron">
          Unrolling the adventure parchment...
        </div>
      ) : activities.length > 0 ? (
        <div className="relative pl-6 border-l-2 border-slate-800 space-y-6">
          {activities.map((act) => {
            const date = new Date(act.created_at);
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

            return (
              <div key={act.id} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-[31px] top-1.5 w-6 h-6 rounded-full bg-slate-900 border-2 border-cyan-500/60 flex items-center justify-center shadow-glow-cyan">
                  {getActivityIcon(act.activity_type)}
                </div>

                <div className="rpg-card p-4 border border-slate-800 group-hover:border-cyan-500/40 transition-colors">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-orbitron uppercase tracking-widest font-bold text-cyan-400">
                      {act.activity_type.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {dateStr} at {timeStr}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-medium text-slate-200 leading-relaxed">
                    {act.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center text-slate-500 text-xs">
          No historical entries recorded yet. Complete a quest to start your timeline!
        </div>
      )}

    </div>
  );
}
