-- LIFE RPG Database Schema (Relational Persistent Storage)
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS characters (
  user_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  current_xp INTEGER NOT NULL DEFAULT 0,
  next_level_xp INTEGER NOT NULL DEFAULT 100,
  coins INTEGER NOT NULL DEFAULT 50,
  streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_active_date TEXT,
  strength INTEGER NOT NULL DEFAULT 10,
  intelligence INTEGER NOT NULL DEFAULT 10,
  discipline INTEGER NOT NULL DEFAULT 10,
  vitality INTEGER NOT NULL DEFAULT 10,
  creativity INTEGER NOT NULL DEFAULT 10,
  equipped_title TEXT DEFAULT 'Novice Adventurer',
  equipped_frame TEXT DEFAULT 'default',
  equipped_theme TEXT DEFAULT 'cyber_dark',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- Coding, Study, Fitness, Health, Reading, Personal, Work, Other
  difficulty TEXT NOT NULL, -- Easy, Medium, Hard, Epic
  xp_reward INTEGER NOT NULL,
  coin_reward INTEGER NOT NULL,
  primary_attribute TEXT NOT NULL, -- Intelligence, Strength, Discipline, Vitality, Creativity
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, abandoned
  is_boss INTEGER NOT NULL DEFAULT 0,
  boss_health_max INTEGER DEFAULT 1,
  boss_health_current INTEGER DEFAULT 1,
  chain_id TEXT,
  chain_title TEXT,
  chain_step INTEGER DEFAULT 1,
  chain_total_steps INTEGER DEFAULT 1,
  due_date TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS task_completions (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  xp_awarded INTEGER NOT NULL,
  coins_awarded INTEGER NOT NULL,
  attributes_awarded TEXT NOT NULL, -- JSON string e.g. {"Intelligence": 10}
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  req_type TEXT NOT NULL, -- 'first_quest', 'streak', 'quest_count', 'attribute_xp', 'level', 'boss_kill'
  req_value INTEGER NOT NULL,
  reward_xp INTEGER NOT NULL DEFAULT 100,
  reward_coins INTEGER NOT NULL DEFAULT 50
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS shop_items (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  item_type TEXT NOT NULL, -- 'title', 'frame', 'theme', 'shield'
  cost_coins INTEGER NOT NULL,
  icon TEXT NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common', -- common, rare, epic, legendary
  effect_type TEXT,
  effect_value TEXT
);

CREATE TABLE IF NOT EXISTS user_inventory (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  is_equipped INTEGER NOT NULL DEFAULT 0,
  acquired_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES shop_items(id) ON DELETE CASCADE,
  UNIQUE(user_id, item_id)
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  activity_type TEXT NOT NULL, -- quest_complete, level_up, achievement, shop_purchase, streak_shield_used
  message TEXT NOT NULL,
  metadata_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indices for rapid queries
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_user_created ON tasks(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_completions_user ON task_completions(user_id);
