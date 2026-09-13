// Achievements Routes
import express from 'express';
import { dbService } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

// GET /api/achievements - Retrieve all achievements with user's unlock status
router.get('/', (req, res) => {
  try {
    const allAchievements = dbService.all(`SELECT * FROM achievements ORDER BY reward_xp ASC`);
    const userUnlocked = dbService.all(
      `SELECT achievement_id, unlocked_at FROM user_achievements WHERE user_id = ?`,
      [req.user.id]
    );

    const unlockMap = {};
    for (const u of userUnlocked) {
      unlockMap[u.achievement_id] = u.unlocked_at;
    }

    const achievements = allAchievements.map(ach => ({
      ...ach,
      isUnlocked: Boolean(unlockMap[ach.id]),
      unlockedAt: unlockMap[ach.id] || null
    }));

    const totalCount = achievements.length;
    const unlockedCount = achievements.filter(a => a.isUnlocked).length;

    return res.json({
      achievements,
      stats: {
        total: totalCount,
        unlocked: unlockedCount,
        percent: totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0
      }
    });
  } catch (err) {
    console.error('[Achievements GET Error]:', err);
    return res.status(500).json({ error: 'Server Error', message: 'Failed to retrieve achievements.' });
  }
});

export default router;
