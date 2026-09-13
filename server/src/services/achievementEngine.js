// Achievement Engine for LIFE RPG
import { dbService } from '../db/database.js';

export function checkAndUnlockAchievements(userId, character, context = {}) {
  // Fetch all achievements
  const allAchievements = dbService.all(`SELECT * FROM achievements`);
  
  // Fetch currently unlocked achievement IDs for user
  const userUnlocked = dbService.all(
    `SELECT achievement_id FROM user_achievements WHERE user_id = ?`,
    [userId]
  );
  const unlockedIdSet = new Set(userUnlocked.map(u => u.achievement_id));

  // Gather stats for evaluation
  const completedQuestCount = dbService.get(
    `SELECT COUNT(*) as count FROM task_completions WHERE user_id = ?`,
    [userId]
  )?.count || 0;

  const fitnessQuestCount = dbService.get(
    `SELECT COUNT(*) as count FROM task_completions tc 
     JOIN tasks t ON tc.task_id = t.id 
     WHERE tc.user_id = ? AND t.category = 'Fitness'`,
    [userId]
  )?.count || 0;

  const bossDefeats = dbService.get(
    `SELECT COUNT(*) as count FROM task_completions tc 
     JOIN tasks t ON tc.task_id = t.id 
     WHERE tc.user_id = ? AND t.is_boss = 1`,
    [userId]
  )?.count || 0;

  const newlyUnlocked = [];

  for (const ach of allAchievements) {
    if (unlockedIdSet.has(ach.id)) continue;

    let qualifies = false;

    switch (ach.req_type) {
      case 'first_quest':
        qualifies = completedQuestCount >= ach.req_value;
        break;
      case 'streak':
        qualifies = (character.streak || 0) >= ach.req_value;
        break;
      case 'quest_count':
        qualifies = completedQuestCount >= ach.req_value;
        break;
      case 'fitness_count':
        qualifies = fitnessQuestCount >= ach.req_value;
        break;
      case 'level':
        qualifies = (character.level || 1) >= ach.req_value;
        break;
      case 'boss_kill':
        qualifies = bossDefeats >= ach.req_value;
        break;
      case 'intelligence_stat':
        qualifies = (character.intelligence || 10) >= ach.req_value;
        break;
      case 'strength_stat':
        qualifies = (character.strength || 10) >= ach.req_value;
        break;
      case 'discipline_stat':
        qualifies = (character.discipline || 10) >= ach.req_value;
        break;
      default:
        break;
    }

    if (qualifies) {
      const uaId = 'ua_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      dbService.run(
        `INSERT OR IGNORE INTO user_achievements (id, user_id, achievement_id, unlocked_at)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
        [uaId, userId, ach.id]
      );

      // Award achievement bonus XP & Coins
      if (ach.reward_coins > 0) {
        dbService.run(
          `UPDATE characters SET coins = coins + ? WHERE user_id = ?`,
          [ach.reward_coins, userId]
        );
      }

      // Log achievement in activity log
      dbService.run(
        `INSERT INTO activity_logs (id, user_id, activity_type, message, metadata_json)
         VALUES (?, ?, 'achievement', ?, ?)`,
        [
          'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          userId,
          `🏆 Unlocked Achievement: ${ach.title}`,
          JSON.stringify({ achievementId: ach.id, title: ach.title, icon: ach.icon })
        ]
      );

      newlyUnlocked.push(ach);
    }
  }

  return newlyUnlocked;
}
