import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, Compass } from 'lucide-react';
import QuestCard from './QuestCard.jsx';
import { api } from '../../services/api.js';
import { useGame } from '../../context/GameContext.jsx';

const CATEGORIES = ['All', 'Coding', 'Study', 'Fitness', 'Health', 'Reading', 'Personal', 'Work', 'Other'];

export default function QuestList({ onOpenCreate }) {
  const { quests, fetchQuests } = useGame();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('pending'); // pending, all, completed
  const [searchQuery, setSearchQuery] = useState('');

  const handleDelete = async (questId) => {
    if (!window.confirm('Are you certain you wish to abandon this quest?')) return;
    try {
      await api.deleteQuest(questId);
      await fetchQuests();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredQuests = useMemo(() => {
    return quests.filter(q => {
      if (q.is_boss === 1) return false; // Handled in Boss Section
      if (selectedStatus === 'pending' && q.status !== 'pending') return false;
      if (selectedStatus === 'completed' && q.status !== 'completed') return false;
      if (selectedCategory !== 'All' && q.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = q.title.toLowerCase().includes(query);
        const matchDesc = q.description && q.description.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc) return false;
      }
      return true;
    });
  }, [quests, selectedCategory, selectedStatus, searchQuery]);

  return (
    <div className="space-y-4">
      
      {/* Filters & Search Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search active quests or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950/80 border border-slate-700/80 rounded-lg text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-orbitron font-semibold">
          <button
            onClick={() => setSelectedStatus('pending')}
            className={`px-3 py-1 rounded-md transition-all ${
              selectedStatus === 'pending'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ACTIVE
          </button>
          <button
            onClick={() => setSelectedStatus('completed')}
            className={`px-3 py-1 rounded-md transition-all ${
              selectedStatus === 'completed'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            CONQUERED
          </button>
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-3 py-1 rounded-md transition-all ${
              selectedStatus === 'all'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ALL
          </button>
        </div>

      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500 shadow-glow-cyan'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Quests Grid or Empty State */}
      {filteredQuests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="rpg-card p-12 border-dashed border-slate-800 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-3xl">
            📜
          </div>
          <div>
            <h3 className="font-orbitron font-bold text-lg text-slate-200">
              Your adventure begins here.
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Create your first quest to forge XP, elevate attributes, and embark on your real-life RPG ascension.
            </p>
          </div>
          <button
            onClick={onOpenCreate}
            className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-orbitron font-bold text-xs tracking-wider shadow-glow-cyan transition-all transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>CREATE FIRST QUEST</span>
          </button>
        </div>
      )}

    </div>
  );
}
