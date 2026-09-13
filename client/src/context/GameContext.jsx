import React, { createContext, useContext, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { api } from '../services/api.js';
import { useAuth } from './AuthContext.jsx';

const GameContext = createContext(null);

// Web Audio API Retro/Cyber Sound Synthesizer (Instant, 0 external assets)
function playSound(type) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'complete') {
      // Pleasant dual chime
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.setValueAtTime(880, now + 0.1); // A5
      osc2.frequency.setValueAtTime(440, now);
      osc2.frequency.setValueAtTime(659.25, now + 0.1);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.45);
      osc2.stop(now + 0.45);
    } else if (type === 'levelup') {
      // Grand ascending fanfare
      const now = ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.15, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.4);
      });
    } else if (type === 'boss_hit') {
      // Deep heavy bass hit
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch (e) {
    // Audio context may be restricted before user gesture
  }
}

export const GameProvider = ({ children }) => {
  const { updateCharacter } = useAuth();

  const [quests, setQuests] = useState([]);
  const [loadingQuests, setLoadingQuests] = useState(false);

  // Active Celebration Modal State
  const [celebrationData, setCelebrationData] = useState(null);

  // Trigger Confetti Celebration
  const triggerConfetti = useCallback((isLevelUp = false) => {
    if (isLevelUp) {
      // Massive multi-angle burst
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#06b6d4', '#8b5cf6', '#10b981', '#ffffff']
      });
      setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 250);
    } else {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#06b6d4', '#8b5cf6', '#10b981']
      });
    }
  }, []);

  // Fetch user quests
  const fetchQuests = useCallback(async (filters = {}) => {
    setLoadingQuests(true);
    try {
      const data = await api.getQuests(filters);
      setQuests(data.tasks || []);
      return data.tasks || [];
    } catch (err) {
      console.error('Failed to load quests:', err);
      return [];
    } finally {
      setLoadingQuests(false);
    }
  }, []);

  // Complete a quest with real server-side anti-cheat calculations
  const completeQuest = useCallback(async (questId) => {
    try {
      const localDate = new Date().toISOString().split('T')[0];
      const res = await api.completeQuest(questId, localDate);

      if (res.bossDefeated === false && res.bossHealthCurrent !== undefined) {
        // Boss strike but not dead yet
        playSound('boss_hit');
        // Update quest in state
        setQuests(prev => prev.map(q => q.id === questId ? { ...q, boss_health_current: res.bossHealthCurrent } : q));
        return res;
      }

      // Quest Complete Celebration!
      if (res.progression?.leveledUp) {
        playSound('levelup');
        triggerConfetti(true);
      } else {
        playSound('complete');
        triggerConfetti(false);
      }

      // Update character state in AuthContext
      if (res.character) {
        updateCharacter(res.character);
      }

      // Update quest state in local list
      setQuests(prev => prev.map(q => q.id === questId ? { ...q, status: 'completed' } : q));

      // Open celebration modal
      setCelebrationData({
        questTitle: res.task?.title,
        rewards: res.rewards,
        progression: res.progression,
        streak: res.streak,
        unlockedAchievements: res.unlockedAchievements || [],
        bossDefeated: res.bossDefeated
      });

      return res;
    } catch (err) {
      console.error('Quest completion failed:', err);
      throw err;
    }
  }, [updateCharacter, triggerConfetti]);

  const closeCelebration = () => setCelebrationData(null);

  return (
    <GameContext.Provider
      value={{
        quests,
        loadingQuests,
        fetchQuests,
        completeQuest,
        celebrationData,
        closeCelebration,
        triggerConfetti,
        playSound
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};
