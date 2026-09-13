// Seed script for LIFE RPG
import bcrypt from 'bcryptjs';
import { dbService } from './database.js';
import { getXpRequiredForLevel } from '../services/progressionEngine.js';

export async function runSeed() {
  console.log('[Seed] Seeding default achievements and shop items...');

  // 1. Achievements
  const achievements = [
    {
      id: 'ach_first_quest',
      code: 'first_quest',
      title: 'First Quest Complete',
      description: 'Complete your first ever real-life RPG quest.',
      icon: '🏆',
      category: 'General',
      req_type: 'first_quest',
      req_value: 1,
      reward_xp: 100,
      reward_coins: 50
    },
    {
      id: 'ach_7day_warrior',
      code: '7day_warrior',
      title: '7-Day Warrior',
      description: 'Maintain an unbroken 7-day activity streak.',
      icon: '🔥',
      category: 'Streak',
      req_type: 'streak',
      req_value: 7,
      reward_xp: 300,
      reward_coins: 100
    },
    {
      id: 'ach_quest_master',
      code: 'quest_master',
      title: 'Quest Master',
      description: 'Complete 50 productivity quests.',
      icon: '⚔️',
      category: 'Mastery',
      req_type: 'quest_count',
      req_value: 50,
      reward_xp: 1000,
      reward_coins: 300
    },
    {
      id: 'ach_scholar',
      code: 'scholar',
      title: 'Scholar of the Realm',
      description: 'Elevate your Intelligence attribute to 50 or beyond.',
      icon: '🧠',
      category: 'Attributes',
      req_type: 'intelligence_stat',
      req_value: 50,
      reward_xp: 400,
      reward_coins: 120
    },
    {
      id: 'ach_iron_will',
      code: 'iron_will',
      title: 'Iron Will',
      description: 'Complete 10 grueling physical fitness quests.',
      icon: '💪',
      category: 'Fitness',
      req_type: 'fitness_count',
      req_value: 10,
      reward_xp: 350,
      reward_coins: 150
    },
    {
      id: 'ach_level_10',
      code: 'level_10',
      title: 'Ascended Level 10',
      description: 'Reach Character Level 10 through relentless perseverance.',
      icon: '👑',
      category: 'Progression',
      req_type: 'level',
      req_value: 10,
      reward_xp: 800,
      reward_coins: 400
    },
    {
      id: 'ach_boss_slayer',
      code: 'boss_slayer',
      title: 'Boss Slayer',
      description: 'Vanquish a formidable weekly Boss Quest.',
      icon: '👹',
      category: 'Boss',
      req_type: 'boss_kill',
      req_value: 1,
      reward_xp: 1000,
      reward_coins: 250
    }
  ];

  for (const a of achievements) {
    dbService.run(
      `INSERT OR REPLACE INTO achievements (id, code, title, description, icon, category, req_type, req_value, reward_xp, reward_coins)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [a.id, a.code, a.title, a.description, a.icon, a.category, a.req_type, a.req_value, a.reward_xp, a.reward_coins]
    );
  }

  // 2. Shop Items
  const shopItems = [
    {
      id: 'item_streak_shield',
      code: 'streak_shield',
      name: 'Streak Shield',
      description: 'Protects your active streak if you miss a calendar day of quests.',
      item_type: 'shield',
      cost_coins: 150,
      icon: '🛡️',
      rarity: 'rare',
      effect_type: 'streak_save',
      effect_value: '1'
    },
    {
      id: 'item_frame_cyber',
      code: 'frame_cyber',
      name: 'Cyber Neon Frame',
      description: 'Pulsing cyan holo-border for your character profile.',
      item_type: 'frame',
      cost_coins: 200,
      icon: '💠',
      rarity: 'rare',
      effect_type: 'cosmetic',
      effect_value: 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
    },
    {
      id: 'item_frame_dragon',
      code: 'frame_dragon',
      name: 'Golden Dragon Frame',
      description: 'Majestic radiant gold dragon scales framing your avatar.',
      item_type: 'frame',
      cost_coins: 450,
      icon: '🐉',
      rarity: 'legendary',
      effect_type: 'cosmetic',
      effect_value: 'border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.6)]'
    },
    {
      id: 'item_theme_obsidian',
      code: 'theme_obsidian',
      name: 'Obsidian Void Theme',
      description: 'Ultra-deep void background with amethyst particle radiance.',
      item_type: 'theme',
      cost_coins: 300,
      icon: '🌌',
      rarity: 'epic',
      effect_type: 'theme',
      effect_value: 'obsidian'
    },
    {
      id: 'item_title_codewarlock',
      code: 'title_codewarlock',
      name: 'Code Warlock',
      description: 'Display your algorithmic sorcery to the realm.',
      item_type: 'title',
      cost_coins: 120,
      icon: '⚡',
      rarity: 'rare',
      effect_type: 'title',
      effect_value: 'Code Warlock'
    },
    {
      id: 'item_title_irontitan',
      code: 'title_irontitan',
      name: 'Iron Titan',
      description: 'Unbroken physique and unrelenting stamina.',
      item_type: 'title',
      cost_coins: 120,
      icon: '🛡️',
      rarity: 'rare',
      effect_type: 'title',
      effect_value: 'Iron Titan'
    },
    {
      id: 'item_title_grandarchitect',
      code: 'title_grandarchitect',
      name: 'Grand Architect',
      description: 'Master builder of real-life systems and intellect.',
      item_type: 'title',
      cost_coins: 350,
      icon: '🏛️',
      rarity: 'epic',
      effect_type: 'title',
      effect_value: 'Grand Architect'
    },
    {
      id: 'item_title_voidsovereign',
      code: 'title_voidsovereign',
      name: 'Void Sovereign',
      description: 'The pinnacle of discipline, intellect, and willpower.',
      item_type: 'title',
      cost_coins: 800,
      icon: '👑',
      rarity: 'legendary',
      effect_type: 'title',
      effect_value: 'Void Sovereign'
    }
  ];

  for (const s of shopItems) {
    dbService.run(
      `INSERT OR REPLACE INTO shop_items (id, code, name, description, item_type, cost_coins, icon, rarity, effect_type, effect_value)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [s.id, s.code, s.name, s.description, s.item_type, s.cost_coins, s.icon, s.rarity, s.effect_type, s.effect_value]
    );
  }

  // 3. Demo User Setup (for judges / instant walkthrough)
  const demoUserId = 'usr_demo_judge_hero_01';
  const demoUsername = 'DemoHero';
  const demoEmail = 'demo@liferpg.com';
  const passwordHash = await bcrypt.hash('demopassword123', 10);

  dbService.run(
    `INSERT OR REPLACE INTO users (id, username, email, password_hash, created_at)
     VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [demoUserId, demoUsername, demoEmail, passwordHash]
  );

  // Level 7, 1250 / 1852 XP, exactly matching the prompt character screen specification!
  const level7XpReq = getXpRequiredForLevel(7); // floor(100 * 7^1.5) = 1852
  dbService.run(
    `INSERT OR REPLACE INTO characters (
       user_id, name, level, current_xp, next_level_xp, coins, 
       streak, longest_streak, last_active_date, 
       strength, intelligence, discipline, vitality, creativity, 
       equipped_title, equipped_frame, equipped_theme
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      demoUserId,
      demoUsername,
      7,
      1750, // Only 102 XP needed to reach Level 8! Completing 1 Medium or Hard quest triggers LEVEL UP immediately!
      level7XpReq,
      450,
      7,
      12,
      new Date().toISOString().split('T')[0],
      72,
      91,
      83,
      64,
      58,
      'Code Warlock',
      'frame_cyber',
      'cyber_dark'
    ]
  );

  // Give Demo user inventory
  dbService.run(
    `INSERT OR IGNORE INTO user_inventory (id, user_id, item_id, quantity, is_equipped)
     VALUES ('ui_demo_shield', ?, 'item_streak_shield', 1, 0)`,
    [demoUserId]
  );
  dbService.run(
    `INSERT OR IGNORE INTO user_inventory (id, user_id, item_id, quantity, is_equipped)
     VALUES ('ui_demo_frame', ?, 'item_frame_cyber', 1, 1)`,
    [demoUserId]
  );
  dbService.run(
    `INSERT OR IGNORE INTO user_inventory (id, user_id, item_id, quantity, is_equipped)
     VALUES ('ui_demo_title', ?, 'item_title_codewarlock', 1, 1)`,
    [demoUserId]
  );

  // Seed user achievements for Demo Hero
  dbService.run(
    `INSERT OR IGNORE INTO user_achievements (id, user_id, achievement_id)
     VALUES ('ua_demo_1', ?, 'ach_first_quest')`,
    [demoUserId]
  );
  dbService.run(
    `INSERT OR IGNORE INTO user_achievements (id, user_id, achievement_id)
     VALUES ('ua_demo_2', ?, 'ach_7day_warrior')`,
    [demoUserId]
  );
  dbService.run(
    `INSERT OR IGNORE INTO user_achievements (id, user_id, achievement_id)
     VALUES ('ua_demo_3', ?, 'ach_scholar')`,
    [demoUserId]
  );

  // Seed Quests for Demo Hero
  const demoQuests = [
    {
      id: 'quest_demo_main',
      title: 'Complete 3 Algorithmic LeetCode Problems',
      description: 'Master binary search and two pointers to forge sharp intellect.',
      category: 'Coding',
      difficulty: 'Hard', // 250 XP -> will trigger level up!
      xp_reward: 250,
      coin_reward: 50,
      primary_attribute: 'Intelligence',
      status: 'pending',
      is_boss: 0,
      due_date: 'Today'
    },
    {
      id: 'quest_demo_side_1',
      title: '45-Minute Hypertrophy Gym Workout',
      description: 'High intensity compound lifts to build raw Strength and Vitality.',
      category: 'Fitness',
      difficulty: 'Medium',
      xp_reward: 100,
      coin_reward: 25,
      primary_attribute: 'Strength',
      status: 'pending',
      is_boss: 0,
      due_date: 'Today'
    },
    {
      id: 'quest_demo_mini_1',
      title: 'Read 15 Pages of System Design',
      description: 'Study scalable microservices and database caching patterns.',
      category: 'Reading',
      difficulty: 'Easy',
      xp_reward: 50,
      coin_reward: 10,
      primary_attribute: 'Intelligence',
      status: 'pending',
      is_boss: 0,
      due_date: 'Today'
    },
    {
      id: 'quest_demo_boss',
      title: '👹 DSA ALGORITHM OVERLORD',
      description: 'Weekly Boss Trial: Solve 10 Dynamic Programming and Graph challenges to conquer the algorithm realm!',
      category: 'Coding',
      difficulty: 'Epic',
      xp_reward: 1000,
      coin_reward: 250,
      primary_attribute: 'Intelligence',
      status: 'pending',
      is_boss: 1,
      boss_health_max: 3,
      boss_health_current: 1, // 1 strike left for instant demonstration!
      due_date: 'This Week'
    }
  ];

  for (const q of demoQuests) {
    dbService.run(
      `INSERT OR REPLACE INTO tasks (
         id, user_id, title, description, category, difficulty, 
         xp_reward, coin_reward, primary_attribute, status, is_boss, 
         boss_health_max, boss_health_current, due_date
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        q.id,
        demoUserId,
        q.title,
        q.description,
        q.category,
        q.difficulty,
        q.xp_reward,
        q.coin_reward,
        q.primary_attribute,
        q.status,
        q.is_boss,
        q.boss_health_max || 1,
        q.boss_health_current || 1,
        q.due_date
      ]
    );
  }

  // Seed sample Quest Chain
  const chainId = 'chain_dsa_mastery';
  const chainQuests = [
    {
      id: 'qc_1',
      title: 'Step 1: Arrays & Hashmaps Foundations',
      description: 'Master Two Sum and Valid Anagram algorithms.',
      chain_step: 1,
      chain_total: 4,
      difficulty: 'Easy',
      xp: 50,
      coins: 10,
      status: 'completed'
    },
    {
      id: 'qc_2',
      title: 'Step 2: Two Pointers & Sliding Window',
      description: 'Tackle Trapping Rain Water and Longest Substring.',
      chain_step: 2,
      chain_total: 4,
      difficulty: 'Medium',
      xp: 100,
      coins: 25,
      status: 'completed'
    },
    {
      id: 'qc_3',
      title: 'Step 3: Binary Tree Depth-First Search',
      description: 'Implement lowest common ancestor and maximum path sum.',
      chain_step: 3,
      chain_total: 4,
      difficulty: 'Hard',
      xp: 250,
      coins: 50,
      status: 'pending'
    },
    {
      id: 'qc_4',
      title: 'Step 4: Dynamic Programming Boss Challenge',
      description: 'Vanquish Coin Change and Longest Increasing Subsequence.',
      chain_step: 4,
      chain_total: 4,
      difficulty: 'Epic',
      xp: 500,
      coins: 100,
      status: 'pending'
    }
  ];

  for (const cq of chainQuests) {
    dbService.run(
      `INSERT OR REPLACE INTO tasks (
         id, user_id, title, description, category, difficulty, 
         xp_reward, coin_reward, primary_attribute, status, is_boss, 
         chain_id, chain_title, chain_step, chain_total_steps
       ) VALUES (?, ?, ?, ?, 'Coding', ?, ?, ?, 'Intelligence', ?, 0, ?, 'Master Data Structures & Algorithms', ?, ?)`,
      [
        cq.id,
        demoUserId,
        cq.title,
        cq.description,
        cq.difficulty,
        cq.xp,
        cq.coins,
        cq.status,
        chainId,
        cq.chain_step,
        cq.chain_total
      ]
    );
  }

  // Seed sample activity logs for Demo Hero
  const sampleActivities = [
    { type: 'quest_complete', msg: '⚔️ Completed Quest: 10km Morning Sprint (+100 XP, +25 Coins)' },
    { type: 'achievement', msg: '🏆 Unlocked Achievement: 7-Day Warrior (+300 XP, +100 Coins)' },
    { type: 'quest_complete', msg: '⚔️ Completed Quest: Read Chapter 4 of Clean Code (+50 XP, +10 Coins)' },
    { type: 'shop_purchase', msg: '🛍️ Purchased Cyber Neon Frame (-200 Coins)' }
  ];

  for (const act of sampleActivities) {
    dbService.run(
      `INSERT INTO activity_logs (id, user_id, activity_type, message)
       VALUES (?, ?, ?, ?)`,
      ['act_' + Math.random().toString(36).substring(2, 9), demoUserId, act.type, act.msg]
    );
  }

  console.log('[Seed] Seeding completed successfully!');
}

// Run directly if invoked from CLI
if (process.argv[1]?.endsWith('seed.js')) {
  runSeed();
}
