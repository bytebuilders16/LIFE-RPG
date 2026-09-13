// Main Express Server for LIFE RPG
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import './db/database.js'; // initialize SQLite database
import { runSeed } from './db/seed.js';

import authRoutes from './routes/auth.js';
import questRoutes from './routes/quests.js';
import characterRoutes from './routes/character.js';
import shopRoutes from './routes/shop.js';
import inventoryRoutes from './routes/inventory.js';
import achievementRoutes from './routes/achievements.js';
import activityRoutes from './routes/activity.js';
import gamemasterRoutes from './routes/gamemaster.js';
import analyticsRoutes from './routes/analytics.js';
import demoRoutes from './routes/demo.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Run seed on boot to ensure default achievements, shop items, and demo profile exist
runSeed().catch(err => console.error('[Bootstrap Seed Error]:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', questRoutes);
app.use('/api/character', characterRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/ai', gamemasterRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/demo', demoRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    game: 'LIFE RPG',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend production build if available
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint Not Found' });
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('LIFE RPG Server API is running. Build client or start Vite dev server.');
    }
  });
});

// Centralized error handler (no raw stack traces exposed)
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]:', err.stack || err.message);
  res.status(err.status || 500).json({
    error: 'Internal Error',
    message: err.message || 'An unexpected anomaly occurred within the RPG matrix.'
  });
});

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`⚔️  LIFE RPG SERVER IS ACTIVE ON PORT ${PORT}  ⚔️`);
  console.log(`   Real Persistent Database: SQLite (WAL enabled)`);
  console.log(`   Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=================================================`);
});
