import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header.jsx';
import Navigation, { TABS } from '../components/common/Navigation.jsx';
import CelebrationModal from '../components/common/CelebrationModal.jsx';
import DemoGuide from '../components/demo/DemoGuide.jsx';

import DailyAdventure from '../components/quests/DailyAdventure.jsx';
import BossQuests from '../components/quests/BossQuests.jsx';
import QuestChains from '../components/quests/QuestChains.jsx';
import QuestList from '../components/quests/QuestList.jsx';
import CreateQuestModal from '../components/quests/CreateQuestModal.jsx';

import CharacterScreen from '../components/character/CharacterScreen.jsx';
import GameMasterChat from '../components/gamemaster/GameMasterChat.jsx';
import AchievementsScreen from '../components/achievements/AchievementsScreen.jsx';
import AnalyticsScreen from '../components/analytics/AnalyticsScreen.jsx';
import ActivityFeed from '../components/activity/ActivityFeed.jsx';

import ShopModal from '../components/shop/ShopModal.jsx';
import InventoryModal from '../components/shop/InventoryModal.jsx';

import { useGame } from '../context/GameContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function DashboardPage() {
  const { user, character } = useAuth();
  const { quests, fetchQuests, celebrationData, closeCelebration } = useGame();

  const [currentTab, setCurrentTab] = useState(TABS.ADVENTURE);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  const handleQuestCreated = (newQuest) => {
    fetchQuests();
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      
      {/* Top Header */}
      <Header
        onOpenShop={() => setIsShopOpen(true)}
        onOpenInventory={() => setIsInventoryOpen(true)}
      />

      {/* Judge Walkthrough Protocol Banner */}
      <DemoGuide
        currentTab={currentTab}
        setTab={setCurrentTab}
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenShop={() => setIsShopOpen(true)}
        onOpenInventory={() => setIsInventoryOpen(true)}
      />

      {/* RPG Tab Navigation */}
      <Navigation
        currentTab={currentTab}
        setTab={setCurrentTab}
        badgeCounts={{
          quests: quests.filter(q => q.status === 'pending').length
        }}
      />

      {/* Tab Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentTab === TABS.ADVENTURE && (
          <div className="space-y-8 animate-fadeIn">
            {/* 1. Today's Adventure (Main, Side, Mini Quests) */}
            <DailyAdventure
              onOpenCreate={() => setIsCreateOpen(true)}
              onSwitchToAllQuests={() => {}}
            />

            {/* 2. Boss Quests */}
            <BossQuests quests={quests} />

            {/* 3. Quest Chains */}
            <QuestChains quests={quests} />

            {/* 4. Full Quest Log */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-orbitron font-extrabold text-xl text-slate-100">
                  Quest Log
                </h2>
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="text-xs px-3.5 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 font-orbitron font-bold transition-all cursor-pointer"
                >
                  + Add Quest
                </button>
              </div>
              <QuestList onOpenCreate={() => setIsCreateOpen(true)} />
            </div>
          </div>
        )}

        {currentTab === TABS.CHARACTER && (
          <CharacterScreen
            onOpenInventory={() => setIsInventoryOpen(true)}
            onOpenShop={() => setIsShopOpen(true)}
          />
        )}

        {currentTab === TABS.GAMEMASTER && (
          <GameMasterChat onQuestAccepted={handleQuestCreated} />
        )}

        {currentTab === TABS.SHOP && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-orbitron font-black text-2xl text-slate-100">
                  Guild Bazaar & Vault
                </h1>
                <p className="text-xs text-slate-400">Shop for cosmetic rewards and equip your owned titles and frames.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsShopOpen(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-orbitron font-bold text-xs tracking-wider shadow-sm hover:shadow-glow-gold transition-all"
                >
                  Browse Bazaar Items
                </button>
                <button
                  onClick={() => setIsInventoryOpen(true)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-orbitron font-bold text-xs tracking-wider border border-slate-700 transition-all"
                >
                  Open Vault (Inventory)
                </button>
              </div>
            </div>

            {/* Directly render both Bazaar and Inventory on this tab */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="rpg-card p-6 border border-amber-500/40">
                <h3 className="font-orbitron font-bold text-lg text-amber-300 mb-2">🪙 Guild Bazaar</h3>
                <p className="text-xs text-slate-400 mb-4">Spend your hard-earned gold coins on prestige items, custom frames, and defensive streak shields.</p>
                <button
                  onClick={() => setIsShopOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-orbitron font-bold text-xs tracking-wider shadow-sm"
                >
                  ENTER SHOP
                </button>
              </div>

              <div className="rpg-card p-6 border border-cyan-500/40">
                <h3 className="font-orbitron font-bold text-lg text-cyan-300 mb-2">🎒 Vault & Equipment</h3>
                <p className="text-xs text-slate-400 mb-4">View your acquired gear, equip titles, and inspect your streak shield inventory.</p>
                <button
                  onClick={() => setIsInventoryOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-orbitron font-bold text-xs tracking-wider shadow-sm"
                >
                  MANAGE INVENTORY
                </button>
              </div>
            </div>
          </div>
        )}

        {currentTab === TABS.ACHIEVEMENTS && <AchievementsScreen />}

        {currentTab === TABS.PROGRESS && <AnalyticsScreen />}

        {currentTab === TABS.ACTIVITY && <ActivityFeed />}
      </main>

      {/* Modals */}
      <CreateQuestModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleQuestCreated}
      />

      <ShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        onOpenInventory={() => setIsInventoryOpen(true)}
      />

      <InventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        onOpenShop={() => setIsShopOpen(true)}
      />

      <CelebrationModal
        data={celebrationData}
        onClose={closeCelebration}
      />

    </div>
  );
}
