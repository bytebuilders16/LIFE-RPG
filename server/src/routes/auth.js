// Authentication Routes
import express from 'express';
import bcrypt from 'bcryptjs';
import { dbService } from '../db/database.js';
import { authenticateToken, generateToken } from '../middleware/auth.js';
import { getXpRequiredForLevel, calculateLifePower } from '../services/progressionEngine.js';

const router = express.Router();

// Register new player
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Validation Error', message: 'Username, email, and password are required.' });
    }

    if (username.length < 3 || username.length > 24) {
      return res.status(400).json({ error: 'Validation Error', message: 'Username must be between 3 and 24 characters.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Validation Error', message: 'Password must be at least 6 characters long.' });
    }

    // Check duplicate
    const existingUser = dbService.get(
      `SELECT id, username, email FROM users WHERE email = ? OR username = ?`,
      [email.toLowerCase(), username]
    );

    if (existingUser) {
      const isEmail = existingUser.email.toLowerCase() === email.toLowerCase();
      return res.status(409).json({
        error: 'Conflict',
        message: isEmail ? 'An adventurer with this email already exists.' : 'This username is already claimed.'
      });
    }

    const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const passwordHash = await bcrypt.hash(password, 10);

    dbService.transaction(() => {
      // 1. Create User
      dbService.run(
        `INSERT INTO users (id, username, email, password_hash, created_at)
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [userId, username, email.toLowerCase(), passwordHash]
      );

      // 2. Create Initial RPG Character
      const initialNextXp = getXpRequiredForLevel(1); // 100 XP
      dbService.run(
        `INSERT INTO characters (
           user_id, name, level, current_xp, next_level_xp, coins,
           streak, longest_streak, strength, intelligence, discipline, vitality, creativity,
           equipped_title, equipped_frame, equipped_theme
         ) VALUES (?, ?, 1, 0, ?, 50, 0, 0, 10, 10, 10, 10, 10, 'Novice Adventurer', 'default', 'cyber_dark')`,
        [userId, username, initialNextXp]
      );

      // 3. Grant starter quest
      dbService.run(
        `INSERT INTO tasks (
           id, user_id, title, description, category, difficulty,
           xp_reward, coin_reward, primary_attribute, status, due_date
         ) VALUES (?, ?, 'First Step on the Path', 'Explore the LIFE RPG interface and initiate your real-life adventure.', 'Personal', 'Easy', 50, 10, 'Discipline', 'pending', 'Today')`,
        ['quest_' + Date.now() + '_start', userId]
      );

      // 4. Initial Activity Log
      dbService.run(
        `INSERT INTO activity_logs (id, user_id, activity_type, message)
         VALUES (?, ?, 'character_created', '🌟 Your mortal existence transitioned into LIFE RPG!')`,
        ['act_' + Date.now() + '_init', userId]
      );
    });

    const userPayload = { id: userId, username, email: email.toLowerCase() };
    const token = generateToken(userPayload);
    const character = dbService.get(`SELECT * FROM characters WHERE user_id = ?`, [userId]);
    const lifePower = calculateLifePower(character);

    return res.status(201).json({
      message: 'Account and Character successfully created!',
      token,
      user: userPayload,
      character: { ...character, lifePower }
    });
  } catch (err) {
    console.error('[Auth Register Error]:', err);
    return res.status(500).json({ error: 'Server Error', message: 'Unable to complete registration. Please try again.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: 'Validation Error', message: 'Please provide both username/email and password.' });
    }

    const user = dbService.get(
      `SELECT * FROM users WHERE email = ? OR username = ?`,
      [emailOrUsername.toLowerCase(), emailOrUsername]
    );

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials. Player not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid password. Please verify your credentials.' });
    }

    const userPayload = { id: user.id, username: user.username, email: user.email };
    const token = generateToken(userPayload);
    const character = dbService.get(`SELECT * FROM characters WHERE user_id = ?`, [user.id]);
    const lifePower = calculateLifePower(character || {});

    return res.json({
      message: 'Welcome back, Adventurer!',
      token,
      user: userPayload,
      character: { ...character, lifePower }
    });
  } catch (err) {
    console.error('[Auth Login Error]:', err);
    return res.status(500).json({ error: 'Server Error', message: 'Login failed due to a server issue.' });
  }
});

// Get Current Authenticated User & Character
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = dbService.get(`SELECT id, username, email, created_at FROM users WHERE id = ?`, [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'Not Found', message: 'User record not located.' });
    }

    const character = dbService.get(`SELECT * FROM characters WHERE user_id = ?`, [req.user.id]);
    const lifePower = calculateLifePower(character || {});

    return res.json({
      user,
      character: { ...character, lifePower }
    });
  } catch (err) {
    console.error('[Auth Me Error]:', err);
    return res.status(500).json({ error: 'Server Error', message: 'Failed to retrieve user profile.' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  return res.json({ message: 'Logged out successfully.' });
});

export default router;
