// Analytics & Progression Metrics Routes
import express from 'express';
import { dbService } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { calculateLifePower } from '../services/progressionEngine.js';

const router = express.Router();
router.use(authenticateToken);

// GET /api/analytics - Aggregate user metrics
router.get('/', (req, res) => {
  try {
    const userId = req.user.id;
    const character = dbService.get(`SELECT * FROM characters WHERE user_id = ?`, [userId]);

    if (!character) {
      return res.status(404).json({ error: 'Not Found', message: 'Character not found.' });
    }

    // 1. Category Distribution
    const categoryDistribution = dbService.all(
      `SELECT t.category, COUNT(tc.id) as completions, SUM(tc.xp_awarded) as total_xp
       FROM task_completions tc
       JOIN tasks t ON tc.task_id = t.id
       WHERE tc.user_id = ?
       GROUP BY t.category`,
      [userId]
    );

    // 2. XP over past 7 days
    const xpTimeline = dbService.all(
      `SELECT DATE(completed_at) as date, SUM(xp_awarded) as xp, SUM(coins_awarded) as coins, COUNT(id) as quests_completed
       FROM task_completions
       WHERE user_id = ? AND completed_at >= DATE('now', '-7 days')
       GROUP BY DATE(completed_at)
       ORDER BY date ASC`,
      [userId]
    );

    // 3. Overall Completion Rate
    const totalCreated = dbService.get(
      `SELECT COUNT(*) as count FROM tasks WHERE user_id = ?`,
      [userId]
    )?.count || 0;

    const totalCompleted = dbService.get(
      `SELECT COUNT(*) as count FROM task_completions WHERE user_id = ?`,
      [userId]
    )?.count || 0;

    const completionRate = totalCreated > 0 ? Math.round((totalCompleted / totalCreated) * 100) : 0;

    // 4. Attribute Radar
    const attributes = {
      Strength: character.strength,
      Intelligence: character.intelligence,
      Discipline: character.discipline,
      Vitality: character.vitality,
      Creativity: character.creativity
    };

    const lifePower = calculateLifePower(character);

    return res.json({
      character: {
        level: character.level,
        currentXp: character.current_xp,
        nextLevelXp: character.next_level_xp,
        streak: character.streak,
        longestStreak: character.longest_streak,
        coins: character.coins,
        lifePower
      },
      attributes,
      categoryDistribution,
      xpTimeline,
      stats: {
        totalCreated,
        totalCompleted,
        completionRate
      }
    });
  } catch (err) {
    console.error('[Analytics GET Error]:', err);
    return res.status(500).json({ error: 'Server Error', message: 'Failed to compute analytics.' });
  }
});

export default router;
