// Quests (Tasks) Management & Anti-Cheat Progression Route
import express from 'express';
import { dbService } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { calculateQuestRewards } from '../services/rewardEngine.js';
import { addXpToCharacter, calculateLifePower } from '../services/progressionEngine.js';
import { evaluateStreakOnActivity } from '../services/streakEngine.js';
import { checkAndUnlockAchievements } from '../services/achievementEngine.js';

const router = express.Router();

// Require auth for all quest actions
router.use(authenticateToken);

// GET /api/tasks - Retrieve all quests for authenticated user
router.get('/', (req, res) => {
  try {
    const { status, category, is_boss, chain_id } = req.query;
    let sql = `SELECT * FROM tasks WHERE user_id = ?`;
    const params = [req.user.id];

    if (status) {
      sql += ` AND status = ?`;
      params.push(status);
    }
    if (category) {
      sql += ` AND category = ?`;
      params.push(category);
    }
    if (is_boss !== undefined) {
      sql += ` AND is_boss = ?`;
      params.push(is_boss === '1' || is_boss === 'true' ? 1 : 0);
    }
    if (chain_id) {
      sql += ` AND chain_id = ?`;
      params.push(chain_id);
    }

    sql += ` ORDER BY CASE WHEN status = 'pending' THEN 0 ELSE 1 END, created_at DESC`;

    const tasks = dbService.all(sql, params);
    return res.json({ tasks });
  } catch (err) {
    console.error('[Quests GET Error]:', err);
    return res.status(500).json({ error: 'Server Error', message: 'Failed to fetch quests.' });
  }
});

// GET /api/tasks/:id - Retrieve single quest
router.get('/:id', (req, res) => {
  try {
    const task = dbService.get(
      `SELECT * FROM tasks WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (!task) {
      return res.status(404).json({ error: 'Not Found', message: 'Quest not found.' });
    }

    return res.json({ task });
  } catch (err) {
    console.error('[Quests GET ID Error]:', err);
    return res.status(500).json({ error: 'Server Error', message: 'Failed to retrieve quest.' });
  }
});

// POST /api/tasks - Create Quest with Backend Reward Determination (Anti-Cheat)
router.post('/', (req, res) => {
  try {
    const {
      title,
      description = '',
      category = 'Personal',
      difficulty = 'Medium',
      due_date = 'Today',
      is_boss = false,
      boss_health_max = 1,
      chain_id = null,
      chain_title = null,
      chain_step = 1,
      chain_total_steps = 1
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Validation Error', message: 'Quest title is required.' });
    }

    const validCategories = ['Coding', 'Study', 'Fitness', 'Health', 'Reading', 'Personal', 'Work', 'Other'];
    const questCategory = validCategories.includes(category) ? category : 'Personal';

    const validDifficulties = ['Easy', 'Medium', 'Hard', 'Epic'];
    const questDifficulty = validDifficulties.includes(difficulty) ? difficulty : 'Medium';

    const isBossQuest = Boolean(is_boss);

    // Authoritatively calculate rewards server-side
    const rewardData = calculateQuestRewards(questDifficulty, questCategory, isBossQuest);

    const taskId = 'quest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    dbService.run(
      `INSERT INTO tasks (
         id, user_id, title, description, category, difficulty,
         xp_reward, coin_reward, primary_attribute, status,
         is_boss, boss_health_max, boss_health_current,
         chain_id, chain_title, chain_step, chain_total_steps,
         due_date, created_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        taskId,
        req.user.id,
        title.trim(),
        description.trim(),
        questCategory,
        questDifficulty,
        rewardData.xp,
        rewardData.coins,
        rewardData.primaryAttribute,
        isBossQuest ? 1 : 0,
        isBossQuest ? Math.max(1, Number(boss_health_max)) : 1,
        isBossQuest ? Math.max(1, Number(boss_health_max)) : 1,
        chain_id,
        chain_title,
        chain_step,
        chain_total_steps,
        due_date
      ]
    );

    const createdTask = dbService.get(`SELECT * FROM tasks WHERE id = ?`, [taskId]);
    return res.status(201).json({
      message: 'Quest posted to adventure board!',
      task: createdTask
    });
  } catch (err) {
    console.error('[Quests POST Error]:', err);
    return res.status(500).json({ error: 'Server Error', message: 'Failed to create quest.' });
  }
});

// PUT /api/tasks/:id - Update Quest
router.put('/:id', (req, res) => {
  try {
    const existing = dbService.get(
      `SELECT * FROM tasks WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (!existing) {
      return res.status(404).json({ error: 'Not Found', message: 'Quest not found.' });
    }

    if (existing.status === 'completed') {
      return res.status(400).json({ error: 'Bad Request', message: 'Completed quests cannot be modified.' });
    }

    const {
      title = existing.title,
      description = existing.description,
      category = existing.category,
      difficulty = existing.difficulty,
      due_date = existing.due_date
    } = req.body;

    const rewardData = calculateQuestRewards(difficulty, category, existing.is_boss === 1);

    dbService.run(
      `UPDATE tasks SET
         title = ?, description = ?, category = ?, difficulty = ?,
         xp_reward = ?, coin_reward = ?, primary_attribute = ?, due_date = ?
       WHERE id = ? AND user_id = ?`,
      [
        title.trim(),
        description.trim(),
        category,
        difficulty,
        rewardData.xp,
        rewardData.coins,
        rewardData.primaryAttribute,
        due_date,
        req.params.id,
        req.user.id
      ]
    );

    const updated = dbService.get(`SELECT * FROM tasks WHERE id = ?`, [req.params.id]);
    return res.json({ message: 'Quest updated successfully.', task: updated });
  } catch (err) {
    console.error('[Quests PUT Error]:', err);
    return res.status(500).json({ error: 'Server Error', message: 'Failed to update quest.' });
  }
});

// DELETE /api/tasks/:id - Delete Quest
router.delete('/:id', (req, res) => {
  try {
    const existing = dbService.get(
      `SELECT * FROM tasks WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (!existing) {
      return res.status(404).json({ error: 'Not Found', message: 'Quest not found.' });
    }

    dbService.run(`DELETE FROM tasks WHERE id = ? AND user_id = ?`, [req.params.id, req.user.id]);
    return res.json({ message: 'Quest abandoned and removed from quest log.' });
  } catch (err) {
    console.error('[Quests DELETE Error]:', err);
    return res.status(500).json({ error: 'Server Error', message: 'Failed to delete quest.' });
  }
});

// POST /api/tasks/:id/complete - COMPLETE QUEST (Core Progression & Celebration)
router.post('/:id/complete', (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;
    const { localDate } = req.body; // YYYY-MM-DD from client's local timezone

    const task = dbService.get(
      `SELECT * FROM tasks WHERE id = ? AND user_id = ?`,
      [taskId, userId]
    );

    if (!task) {
      return res.status(404).json({ error: 'Not Found', message: 'Quest not found.' });
    }

    if (task.status === 'completed') {
      return res.status(400).json({ error: 'Conflict', message: 'This quest has already been conquered!' });
    }

    const character = dbService.get(`SELECT * FROM characters WHERE user_id = ?`, [userId]);
    if (!character) {
      return res.status(404).json({ error: 'Not Found', message: 'Character not found.' });
    }

    // Handle Boss Quest strike mechanics
    let bossDefeated = false;
    if (task.is_boss === 1) {
      const remainingHp = task.boss_health_current - 1;
      if (remainingHp > 0) {
        dbService.run(
          `UPDATE tasks SET boss_health_current = ? WHERE id = ?`,
          [remainingHp, taskId]
        );
        return res.json({
          message: 'Boss struck with critical damage!',
          bossHealthCurrent: remainingHp,
          bossHealthMax: task.boss_health_max,
          bossDefeated: false
        });
      }
      bossDefeated = true;
    }

    // Authoritative rewards calculation
    const isBoss = task.is_boss === 1;
    const rewardInfo = calculateQuestRewards(task.difficulty, task.category, isBoss);

    let completionResult = null;

    dbService.transaction(() => {
      // 1. Mark task completed
      dbService.run(
        `UPDATE tasks SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [taskId]
      );

      // 2. Insert into task_completions
      const completionId = 'tc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      dbService.run(
        `INSERT INTO task_completions (id, task_id, user_id, xp_awarded, coins_awarded, attributes_awarded, completed_at)
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [completionId, taskId, userId, rewardInfo.xp, rewardInfo.coins, JSON.stringify(rewardInfo.attributes)]
      );

      // 3. Evaluate Level-Up Progression
      const progression = addXpToCharacter(character, rewardInfo.xp);

      // 4. Evaluate Streak Progression
      const streakResult = evaluateStreakOnActivity(userId, character, localDate);

      // 5. Update Attributes
      let newStr = character.strength;
      let newInt = character.intelligence;
      let newDisc = character.discipline;
      let newVit = character.vitality;
      let newCre = character.creativity;

      if (rewardInfo.attributes.Strength) newStr += rewardInfo.attributes.Strength;
      if (rewardInfo.attributes.Intelligence) newInt += rewardInfo.attributes.Intelligence;
      if (rewardInfo.attributes.Discipline) newDisc += rewardInfo.attributes.Discipline;
      if (rewardInfo.attributes.Vitality) newVit += rewardInfo.attributes.Vitality;
      if (rewardInfo.attributes.Creativity) newCre += rewardInfo.attributes.Creativity;

      // Add stat bonus earned from level up
      if (progression.leveledUp) {
        // Distribute bonus points to primary attribute
        if (rewardInfo.primaryAttribute === 'Strength') newStr += progression.statBonusEarned;
        else if (rewardInfo.primaryAttribute === 'Intelligence') newInt += progression.statBonusEarned;
        else if (rewardInfo.primaryAttribute === 'Discipline') newDisc += progression.statBonusEarned;
        else if (rewardInfo.primaryAttribute === 'Vitality') newVit += progression.statBonusEarned;
        else newCre += progression.statBonusEarned;
      }

      // Update Character in Database
      dbService.run(
        `UPDATE characters SET
           level = ?, current_xp = ?, next_level_xp = ?, coins = coins + ?,
           streak = ?, longest_streak = ?, last_active_date = ?,
           strength = ?, intelligence = ?, discipline = ?, vitality = ?, creativity = ?,
           updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?`,
        [
          progression.newLevel,
          progression.newXp,
          progression.nextLevelXp,
          rewardInfo.coins,
          streakResult.streak,
          streakResult.longestStreak,
          streakResult.lastActiveDate,
          newStr,
          newInt,
          newDisc,
          newVit,
          newCre,
          userId
        ]
      );

      // 6. Log activity
      const activityMsg = isBoss
        ? `👹 Vanquished Boss: ${task.title} (+${rewardInfo.xp} XP, +${rewardInfo.coins} Coins)`
        : `⚔️ Completed Quest: ${task.title} (+${rewardInfo.xp} XP, +${rewardInfo.coins} Coins)`;

      dbService.run(
        `INSERT INTO activity_logs (id, user_id, activity_type, message, metadata_json)
         VALUES (?, ?, ?, ?, ?)`,
        [
          'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          userId,
          isBoss ? 'boss_defeated' : 'quest_complete',
          activityMsg,
          JSON.stringify({ taskId, xp: rewardInfo.xp, coins: rewardInfo.coins, attributes: rewardInfo.attributes })
        ]
      );

      if (progression.leveledUp) {
        dbService.run(
          `INSERT INTO activity_logs (id, user_id, activity_type, message, metadata_json)
           VALUES (?, ?, 'level_up', ?, ?)`,
          [
            'act_' + Date.now() + '_lvl',
            userId,
            `LEVEL UP! ⚔️ Ascended to Level ${progression.newLevel} (+${progression.statBonusEarned} Skill Points)!`,
            JSON.stringify({ oldLevel: progression.oldLevel, newLevel: progression.newLevel })
          ]
        );
      }

      // 7. Check & Unlock Achievements
      const updatedChar = dbService.get(`SELECT * FROM characters WHERE user_id = ?`, [userId]);
      const unlockedBadges = checkAndUnlockAchievements(userId, updatedChar, { isBoss });

      completionResult = {
        task: { ...task, status: 'completed' },
        character: {
          ...updatedChar,
          lifePower: calculateLifePower(updatedChar)
        },
        rewards: {
          xp: rewardInfo.xp,
          coins: rewardInfo.coins,
          attributes: rewardInfo.attributes,
          primaryAttribute: rewardInfo.primaryAttribute
        },
        progression: {
          leveledUp: progression.leveledUp,
          oldLevel: progression.oldLevel,
          newLevel: progression.newLevel,
          statBonusEarned: progression.statBonusEarned
        },
        streak: {
          current: streakResult.streak,
          longest: streakResult.longestStreak,
          streakShieldUsed: streakResult.streakShieldUsed,
          streakIncreased: streakResult.streakIncreased
        },
        unlockedAchievements: unlockedBadges,
        bossDefeated: isBoss
      };
    });

    return res.json({
      message: 'Quest Completed!',
      ...completionResult
    });
  } catch (err) {
    console.error('[Quest Complete Error]:', err);
    return res.status(500).json({ error: 'Server Error', message: 'Failed to complete quest.' });
  }
});

export default router;
