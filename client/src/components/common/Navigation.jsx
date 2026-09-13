import React from 'react';
import { Compass, User, Bot, ShoppingBag, Trophy, BarChart3, Clock } from 'lucide-react';

export const TABS = {
  ADVENTURE: 'adventure',
  CHARACTER: 'character',
  GAMEMASTER: 'gamemaster',
  SHOP: 'shop',
  ACHIEVEMENTS: 'achievements',
  PROGRESS: 'progress',
  ACTIVITY: 'activity'
};

export default function Navigation({ currentTab, setTab, badgeCounts = {} }) {
  const navItems = [
    { id: TABS.ADVENTURE, label: 'Adventure', icon: Compass, badge: badgeCounts.quests },
    { id: TABS.CHARACTER, label: 'Character', icon: User },
    { id: TABS.GAMEMASTER, label: 'AI Game Master', icon: Bot, highlight: true },
    { id: TABS.SHOP, label: 'Inventory & Shop', icon: ShoppingBag },
    { id: TABS.ACHIEVEMENTS, label: 'Achievements', icon: Trophy, badge: badgeCounts.achievements },
    { id: TABS.PROGRESS, label: 'Progress', icon: BarChart3 },
    { id: TABS.ACTIVITY, label: 'History', icon: Clock }
  ];

  return (
    <nav className="bg-[#0b101d] border-b border-slate-800/80 px-4 py-2 sticky top-[57px] z-30 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar gap-1 sm:gap-2 py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium tracking-wide whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? item.highlight
                    ? 'bg-gradient-to-r from-purple-600/30 to-cyan-600/30 text-cyan-300 border border-cyan-500/50 shadow-glow-cyan font-semibold'
                    : 'bg-slate-800/90 text-cyan-300 border border-cyan-500/40 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
