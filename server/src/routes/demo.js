// Demo Account Setup & Judge Quick-Start Routes
import express from 'express';
import { dbService } from '../db/database.js';
import { generateToken } from '../middleware/auth.js';
import { runSeed } from '../db/seed.js';
import { calculateLifePower } from '../services/progressionEngine.js';

const router = express.Router();

// POST /api/demo/start - Resets/ensures Demo Hero exists and logs in directly
router.post('/start', async (req, res) => {
  try {
    // Re-run seed to ensure Demo Hero is in prime state for demonstration
    await runSeed();

    const demoUser = dbService.get(`SELECT id, username, email FROM users WHERE id = 'usr_demo_judge_hero_01'`);
    if (!demoUser) {
      return res.status(500).json({ error: 'Server Error', message: 'Failed to initialize demo account.' });
    }

    const token = generateToken(demoUser);
    const character = dbService.get(`SELECT * FROM characters WHERE user_id = ?`, [demoUser.id]);
    const lifePower = calculateLifePower(character);

    return res.json({
      message: 'Demo Mode Activated! Welcome, Judge.',
      token,
      user: { ...demoUser, isDemo: true },
      character: { ...character, lifePower }
    });
  } catch (err) {
    console.error('[Demo Start Error]:', err);
    return res.status(500).json({ error: 'Server Error', message: 'Failed to launch demo mode.' });
  }
});

export default router;
