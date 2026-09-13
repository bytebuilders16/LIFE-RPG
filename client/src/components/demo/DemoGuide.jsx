import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Check, ExternalLink } from 'lucide-react';
import { TABS } from '../common/Navigation.jsx';

export default function DemoGuide({ currentTab, setTab, onOpenCreate, onOpenShop, onOpenInventory }) {
  const [collapsed, setCollapsed] = useState(false);

  const steps = [
    { num: 1, text: "Character Overview & Life Power", tab: TABS.CHARACTER },
    { num: 2, text: "Complete Hard Quest (Triggers Level 7 → 8 Level Up!)", tab: TABS.ADVENTURE },
    { num: 3, text: "Inspect Unlocked Badges in Hall of Achievements", tab: TABS.ACHIEVEMENTS },
    { num: 4, text: "Visit Guild Bazaar & Acquire Frame / Streak Shield", action: onOpenShop },
    { num: 5, text: "Equip Cosmetic item in Inventory Vault", action: onOpenInventory },
    { num: 6, text: "Consult AI Game Master & [Accept Quest]", tab: TABS.GAMEMASTER },
    { num: 7, text: "Vanquish Weekly Boss Quest in Adventure log", tab: TABS.ADVENTURE },
    { num: 8, text: "Refresh Page (F5) to Prove Full Database Persistence!", tab: null }
  ];

  return (
    <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-cyan-950/80 border-b border-purple-500/50 px-4 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-orbitron font-extrabold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              JUDGE DEMO PROTOCOL (90-180s)
            </span>
            <span className="hidden sm:inline text-xs text-slate-300">
              Follow this sequence to test all 16 core requirements in real database persistence:
            </span>
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {!collapsed && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            {steps.map((s) => (
              <button
                key={s.num}
                onClick={() => {
                  if (s.action) s.action();
                  else if (s.tab) setTab(s.tab);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 whitespace-nowrap transition-colors cursor-pointer group"
              >
                <span className="w-4 h-4 rounded-full bg-cyan-950 border border-cyan-500 text-cyan-300 text-[10px] font-bold flex items-center justify-center font-orbitron">
                  {s.num}
                </span>
                <span className="group-hover:text-cyan-300 font-medium">{s.text}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
