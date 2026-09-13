// Streak Engine with Calendar Day Tracking & Streak Shield Consumption
import { dbService } from '../db/database.js';

/**
 * Returns YYYY-MM-DD for a given date in ISO format or timestamp
 */
export function getCalendarDateString(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates day difference between two YYYY-MM-DD strings
 */
export function getDaysDifference(dateStrA, dateStrB) {
  const dateA = new Date(dateStrA + 'T00:00:00Z');
  const dateB = new Date(dateStrB + 'T00:00:00Z');
  const diffTime = dateB.getTime() - dateA.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Evaluates streak on quest completion.
 * Handles same-day completions, consecutive days, missed days, and streak shields.
 */
export function evaluateStreakOnActivity(userId, character, userTodayDateStr = null) {
  const today = userTodayDateStr || getCalendarDateString();
  const lastActive = character.last_active_date;
  let streak = character.streak || 0;
  let longestStreak = character.longest_streak || 0;
  let streakShieldUsed = false;
  let streakIncreased = false;

  if (!lastActive) {
    // First ever activity
    streak = 1;
    longestStreak = Math.max(longestStreak, streak);
    streakIncreased = true;
  } else if (lastActive === today) {
    // Same-day multiple quests: streak does NOT increment again
    streakIncreased = false;
  } else {
    const dayDiff = getDaysDifference(lastActive, today);

    if (dayDiff === 1) {
      // Exactly consecutive day
      streak += 1;
      longestStreak = Math.max(longestStreak, streak);
      streakIncreased = true;
    } else if (dayDiff === 2) {
      // Missed exactly 1 day. Check for Streak Shield!
      const shield = dbService.get(
        `SELECT ui.id, ui.quantity, si.code 
         FROM user_inventory ui
         JOIN shop_items si ON ui.item_id = si.id
         WHERE ui.user_id = ? AND si.code = 'streak_shield' AND ui.quantity > 0`,
        [userId]
      );

      if (shield && shield.quantity > 0) {
        // Deduct 1 shield
        if (shield.quantity === 1) {
          dbService.run(`DELETE FROM user_inventory WHERE id = ?`, [shield.id]);
        } else {
          dbService.run(`UPDATE user_inventory SET quantity = quantity - 1 WHERE id = ?`, [shield.id]);
        }

        streakShieldUsed = true;
        streak += 1; // Preserved and continued!
        longestStreak = Math.max(longestStreak, streak);
        streakIncreased = true;

        // Log shield consumption in activity
        dbService.run(
          `INSERT INTO activity_logs (id, user_id, activity_type, message, metadata_json)
           VALUES (?, ?, 'streak_shield_used', '🛡 Streak Shield activated to save your streak!', ?)`,
          [
            'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
            userId,
            JSON.stringify({ savedStreak: streak })
          ]
        );
      } else {
        // No shield available, reset to 1
        streak = 1;
        streakIncreased = true;
      }
    } else {
      // Missed 2 or more days, reset to 1
      streak = 1;
      streakIncreased = true;
    }
  }

  longestStreak = Math.max(longestStreak, streak);

  return {
    streak,
    longestStreak,
    lastActiveDate: today,
    streakShieldUsed,
    streakIncreased
  };
}
