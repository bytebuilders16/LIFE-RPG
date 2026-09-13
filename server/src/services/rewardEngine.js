// Centralized Reward Engine for LIFE RPG
// Anti-Cheat: All calculations are deterministic and authoritative on the backend.

export const DIFFICULTY_REWARDS = {
  Easy: { xp: 50, coins: 10, attributeGain: 5 },
  Medium: { xp: 100, coins: 25, attributeGain: 10 },
  Hard: { xp: 250, coins: 50, attributeGain: 20 },
  Epic: { xp: 500, coins: 100, attributeGain: 35 },
  Boss: { xp: 1000, coins: 250, attributeGain: 60 }
};

export const CATEGORY_ATTRIBUTES = {
  Coding: { primary: 'Intelligence', secondary: 'Creativity' },
  Study: { primary: 'Intelligence', secondary: 'Discipline' },
  Fitness: { primary: 'Strength', secondary: 'Vitality' },
  Health: { primary: 'Vitality', secondary: 'Discipline' },
  Reading: { primary: 'Intelligence', secondary: 'Creativity' },
  Meditation: { primary: 'Discipline', secondary: 'Vitality' },
  Personal: { primary: 'Discipline', secondary: 'Creativity' },
  Work: { primary: 'Discipline', secondary: 'Intelligence' },
  Other: { primary: 'Creativity', secondary: null }
};

/**
 * Calculates authoritative rewards for a task based on its difficulty and category.
 * Client-submitted reward values are ignored to prevent cheating.
 */
export function calculateQuestRewards(difficulty = 'Medium', category = 'Personal', isBoss = false) {
  const tier = isBoss ? 'Boss' : (DIFFICULTY_REWARDS[difficulty] ? difficulty : 'Medium');
  const baseReward = DIFFICULTY_REWARDS[tier];

  const catMapping = CATEGORY_ATTRIBUTES[category] || CATEGORY_ATTRIBUTES.Other;
  const primaryAttr = catMapping.primary;
  const secondaryAttr = catMapping.secondary;

  const attributes = {};
  if (secondaryAttr) {
    // 70% to primary, 30% to secondary
    attributes[primaryAttr] = Math.max(1, Math.round(baseReward.attributeGain * 0.7));
    attributes[secondaryAttr] = Math.max(1, Math.round(baseReward.attributeGain * 0.3));
  } else {
    attributes[primaryAttr] = baseReward.attributeGain;
  }

  return {
    xp: baseReward.xp,
    coins: baseReward.coins,
    attributes,
    primaryAttribute: primaryAttr
  };
}
