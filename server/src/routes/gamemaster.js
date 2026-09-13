// AI Game Master & Adaptive Coach Routes
import express from 'express';
import { dbService } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  chatWithGameMaster,
  generateQuestFromPrompt,
  generateAdaptiveCoachInsights
} from '../services/aiGameMasterService.js';
import { calculateQuestRewards } from '../services/rewardEngine.js';

const router = express.Router();
router.use(authenticateToken);

// POST /api/ai/game-master - Conversational AI Game Master Chat
router.post('/game-master', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Validation Error', message: 'Message is required.' });
    }

    const response = await chatWithGameMaster(message.trim(), req.user.id);
    return res.json(response);
  } catch (err) {
    console.error('[AI Game Master Error]:', err);
    return res.status(500).json({ error: 'Server Error', message: 'The Game Master was temporarily distracted.' });
  }
});

// POST /api/ai/generate-quest - Prompt to Structured Quest
router.post('/generate-quest', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Validation Error', message: 'Goal or prompt is required.' });
    }

    const questProposal = await generateQuestFromPrompt(prompt.trim(), req.user.id);
    return res.json({ quest: questProposal });
  } catch (err) {
    console.error('[AI Generate Quest Error]:', err);
    return res.status(500).json({ error: 'Server Error', message: 'Failed to synthesize quest.' });
  }
});

// GET /api/ai/coach-insights - Adaptive Insights & Recommendations
router.get('/coach-insights', (req, res) => {
  try {
    const insights = generateAdaptiveCoachInsights(req.user.id);
    return res.json(insights);
  } catch (err) {
    console.error('[AI Coach Insights Error]:', err);
    return res.status(500).json({ error: 'Server Error', message: 'Failed to generate coach insights.' });
  }
});

// POST /api/ai/accept-plan - Accept AI Plan and Insert Proposed Quests into Database
router.post('/accept-plan', (req, res) => {
  try {
    const { plan } = req.body;
    if (!Array.isArray(plan) || plan.length === 0) {
      return res.status(400).json({ error: 'Validation Error', message: 'Valid quest plan array is required.' });
    }

    const createdQuests = [];

    dbService.transaction(() => {
      for (const item of plan) {
        const difficulty = item.difficulty || 'Medium';
        const category = item.category || 'Personal';
        const rewards = calculateQuestRewards(difficulty, category, false);
        const taskId = 'quest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

        dbService.run(
          `INSERT INTO tasks (
             id, user_id, title, description, category, difficulty,
             xp_reward, coin_reward, primary_attribute, status, due_date
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'Today')`,
          [
            taskId,
            req.user.id,
            item.title,
            item.description || 'Devised by your AI Game Master Coach.',
            category,
            difficulty,
            rewards.xp,
            rewards.coins,
            rewards.primaryAttribute
          ]
        );

        createdQuests.push(dbService.get(`SELECT * FROM tasks WHERE id = ?`, [taskId]));
      }

      // Log activity
      dbService.run(
        `INSERT INTO activity_logs (id, user_id, activity_type, message)
         VALUES (?, ?, 'ai_plan_accepted', '🤖 Accepted customized AI Coach Training Plan!')`,
        ['act_' + Date.now() + '_plan', req.user.id]
      );
    });

    return res.status(201).json({
      message: 'AI Training Plan accepted and added to your Quests!',
      quests: createdQuests
    });
  } catch (err) {
    console.error('[AI Accept Plan Error]:', err);
    return res.status(500).json({ error: 'Server Error', message: 'Failed to accept AI plan.' });
  }
});

export default router;
