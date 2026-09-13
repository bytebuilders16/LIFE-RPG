import React, { useState } from 'react';
import { X, Sparkles, Zap, Coins } from 'lucide-react';
import { api } from '../../services/api.js';

const CATEGORIES = ['Coding', 'Study', 'Fitness', 'Health', 'Reading', 'Personal', 'Work', 'Other'];
const DIFFICULTIES = [
  { level: 'Easy', xp: 50, coins: 10, desc: 'Casual habit or quick task' },
  { level: 'Medium', xp: 100, coins: 25, desc: 'Solid focus block or standard workout' },
  { level: 'Hard', xp: 250, coins: 50, desc: 'High intensity session or deep project work' },
  { level: 'Epic', xp: 500, coins: 100, desc: 'Milestone achievement or marathon effort' }
];

export default function CreateQuestModal({ isOpen, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Coding');
  const [difficulty, setDifficulty] = useState('Medium');
  const [dueDate, setDueDate] = useState('Today');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const currentDiff = DIFFICULTIES.find(d => d.level === difficulty) || DIFFICULTIES[1];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for your quest.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.createQuest({
        title: title.trim(),
        description: description.trim(),
        category,
        difficulty,
        due_date: dueDate
      });
      if (onCreated) onCreated(res.task);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create quest.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-[#0d1322] border border-cyan-500/40 rounded-2xl p-6 shadow-glow-cyan relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="mb-5">
          <div className="flex items-center gap-2 text-cyan-400 font-orbitron font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>New Real-Life Contract</span>
          </div>
          <h2 className="text-xl font-orbitron font-black text-slate-100">
            Create Custom Quest
          </h2>
        </div>

        {error && (
          <div className="mb-4 text-xs font-medium text-rose-300 bg-rose-950/60 border border-rose-800/80 p-2.5 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Quest Objective *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Solve 3 LeetCode Mediums or 45-min Gym Workout"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:border-cyan-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Quest Details (Optional)
            </label>
            <textarea
              rows="2"
              placeholder="Add specifics, target goals, or personal constraints..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:border-cyan-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Category & Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 text-xs sm:text-sm focus:border-cyan-500 focus:outline-none"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Horizon
              </label>
              <select
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 text-xs sm:text-sm focus:border-cyan-500 focus:outline-none"
              >
                <option value="Today">Today</option>
                <option value="Tomorrow">Tomorrow</option>
                <option value="This Week">This Week</option>
                <option value="Epic Milestone">Epic Milestone</option>
              </select>
            </div>
          </div>

          {/* Difficulty Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Difficulty Tier
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  type="button"
                  key={d.level}
                  onClick={() => setDifficulty(d.level)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    difficulty === d.level
                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-glow-cyan'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-orbitron font-bold text-xs">{d.level}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">+{d.xp} XP</div>
                </button>
              ))}
            </div>
          </div>

          {/* Live Reward Preview */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Authoritative Yield:</span>
            <div className="flex items-center gap-3 text-xs font-bold font-orbitron">
              <span className="flex items-center gap-1 text-cyan-400">
                <Zap className="w-3.5 h-3.5 fill-cyan-400" />
                +{currentDiff.xp} XP
              </span>
              <span className="flex items-center gap-1 text-amber-300">
                <Coins className="w-3.5 h-3.5 fill-amber-400" />
                +{currentDiff.coins} COINS
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-orbitron font-bold text-xs tracking-wider transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-orbitron font-bold text-xs tracking-wider shadow-glow-cyan transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'FORGING...' : 'POST QUEST'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
