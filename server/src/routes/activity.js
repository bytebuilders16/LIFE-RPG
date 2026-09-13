// Activity Timeline Routes
import express from 'express';
import { dbService } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

// GET /api/activity - Retrieve user's chronological activity feed
router.get('/', (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 30, 100);
    const logs = dbService.all(
      `SELECT * FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
      [req.user.id, limit]
    );

    const formattedLogs = logs.map(l => {
      let meta = null;
      try {
        if (l.metadata_json) meta = JSON.parse(l.metadata_json);
      } catch (e) {}
      return { ...l, metadata: meta };
    });

    return res.json({ activities: formattedLogs });
  } catch (err) {
    console.error('[Activity GET Error]:', err);
    return res.status(500).json({ error: 'Server Error', message: 'Failed to retrieve activity log.' });
  }
});

export default router;
