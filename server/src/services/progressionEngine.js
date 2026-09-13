// Non-linear RPG Progression Engine for LIFE RPG
// Anti-Cheat: Authoritative server-side leveling and power calculation

/**
 * Calculates XP required to advance from `level` to `level + 1`.
 * Formula: XP_REQUIRED = Math.floor(100 * Math.pow(level, 1.5))
 */
export function getXpRequiredForLevel(level) {
  if (level < 1) level = 1;
  return Math.floor(100 * Math.pow(level, 1.5));
}

/**
 * Evaluates XP addition and computes any level-ups.
 * Supports multi-level jumps if massive XP is granted.
 */
export function addXpToCharacter(character, xpToAdd) {
  let { level, current_xp } = character;
  let next_level_xp = getXpRequiredForLevel(level);

  let newXp = current_xp + xpToAdd;
  let leveledUp = false;
  let levelsGained = 0;
  let oldLevel = level;

  while (newXp >= next_level_xp) {
    newXp -= next_level_xp;
    level += 1;
    leveledUp = true;
    levelsGained += 1;
    next_level_xp = getXpRequiredForLevel(level);
  }

  // +5 stat points per level distributed across attributes or reserved
  const statBonusPerLevel = 5;
  const totalStatBonus = levelsGained * statBonusPerLevel;

  return {
    oldLevel,
    newLevel: level,
    newXp,
    nextLevelXp: next_level_xp,
    leveledUp,
    levelsGained,
    statBonusEarned: totalStatBonus
  };
}

/**
 * Computes composite Life Power score from character stats.
 * Deterministic formula based on character attributes, level, streak, and completed milestones.
 */
export function calculateLifePower(character) {
  const {
    level = 1,
    strength = 10,
    intelligence = 10,
    discipline = 10,
    vitality = 10,
    creativity = 10,
    streak = 0
  } = character;

  const attributeSum = strength + intelligence + discipline + vitality + creativity;
  const levelBonus = (level - 1) * 35;
  const streakBonus = Math.min(streak * 10, 200);

  return Math.floor(attributeSum * 1.5 + levelBonus + streakBonus);
}
