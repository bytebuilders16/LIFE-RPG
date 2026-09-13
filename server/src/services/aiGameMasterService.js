// AI Game Master & Adaptive Coaching Service
import { dbService } from '../db/database.js';
import { calculateQuestRewards } from './rewardEngine.js';

/**
 * Gathers authentic metrics about the user's RPG journey
 */
export function getUserAdventureContext(userId) {
  const character = dbService.get(`SELECT * FROM characters WHERE user_id = ?`, [userId]);
  const totalCompleted = dbService.get(
    `SELECT COUNT(*) as count FROM task_completions WHERE user_id = ?`,
    [userId]
  )?.count || 0;

  const pendingQuests = dbService.all(
    `SELECT id, title, category, difficulty, is_boss FROM tasks WHERE user_id = ? AND status = 'pending'`,
    [userId]
  );

  // Category completion counts
  const categoryStats = dbService.all(
    `SELECT t.category, COUNT(tc.id) as completions 
     FROM tasks t 
     LEFT JOIN task_completions tc ON t.id = tc.task_id 
     WHERE t.user_id = ? 
     GROUP BY t.category`,
    [userId]
  );

  // Difficulty completion breakdown
  const difficultyStats = dbService.all(
    `SELECT t.difficulty, 
            COUNT(t.id) as total_created,
            SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as total_completed
     FROM tasks t 
     WHERE t.user_id = ? 
     GROUP BY t.difficulty`,
    [userId]
  );

  return {
    character,
    totalCompleted,
    pendingQuests,
    categoryStats,
    difficultyStats
  };
}

/**
 * Evaluates adaptive coaching advice based on actual user activity data
 */
export function generateAdaptiveCoachInsights(userId) {
  const ctx = getUserAdventureContext(userId);
  const character = ctx.character || {};
  const total = ctx.totalCompleted;
  const pending = ctx.pendingQuests;

  // Identify highest and lowest attributes
  const attrs = [
    { name: 'Strength', val: character.strength || 10 },
    { name: 'Intelligence', val: character.intelligence || 10 },
    { name: 'Discipline', val: character.discipline || 10 },
    { name: 'Vitality', val: character.vitality || 10 },
    { name: 'Creativity', val: character.creativity || 10 }
  ];
  attrs.sort((a, b) => b.val - a.val);
  const highestAttr = attrs[0];
  const lowestAttr = attrs[attrs.length - 1];

  // Completion rate analysis
  let mediumTotal = 0, mediumCompleted = 0;
  let hardTotal = 0, hardCompleted = 0;

  for (const ds of ctx.difficultyStats) {
    if (ds.difficulty === 'Medium') {
      mediumTotal = ds.total_created || 0;
      mediumCompleted = ds.total_completed || 0;
    } else if (ds.difficulty === 'Hard') {
      hardTotal = ds.total_created || 0;
      hardCompleted = ds.total_completed || 0;
    }
  }

  const mediumRate = mediumTotal > 0 ? (mediumCompleted / mediumTotal) : 0;
  const hardRate = hardTotal > 0 ? (hardCompleted / hardTotal) : 0;

  const insights = [];
  let recommendedDifficulty = 'Medium';

  if (mediumTotal >= 3 && mediumRate >= 0.8) {
    insights.push(`You have mastered Medium quests with an ${Math.round(mediumRate * 100)}% completion rate! You are ready for Hard challenges.`);
    recommendedDifficulty = 'Hard';
  } else if (hardTotal >= 2 && hardRate < 0.4) {
    insights.push(`Hard quests are currently proving grueling (${Math.round(hardRate * 100)}% completion). Pacing with Medium quests will rebuild your momentum.`);
    recommendedDifficulty = 'Medium';
  } else {
    insights.push(`Consistent rhythm detected. Keep tackling quests daily to empower your streak!`);
  }

  insights.push(`Your ${highestAttr.name} attribute is your greatest power (${highestAttr.val} pts).`);
  insights.push(`Consider bolstering your ${lowestAttr.name} attribute (${lowestAttr.val} pts) for a balanced Life Power.`);

  // Curate an AI Action Plan with 2 complementary quests
  const suggestedPlan = [
    {
      title: `Advance ${highestAttr.name}: Focus Session`,
      category: highestAttr.name === 'Intelligence' ? 'Coding' : (highestAttr.name === 'Strength' ? 'Fitness' : 'Study'),
      difficulty: recommendedDifficulty,
      description: `Targeted session designed by your AI Coach to capitalize on your ${highestAttr.name} momentum.`
    },
    {
      title: `Bolster ${lowestAttr.name}: Foundational Step`,
      category: lowestAttr.name === 'Discipline' ? 'Meditation' : (lowestAttr.name === 'Creativity' ? 'Personal' : 'Health'),
      difficulty: 'Easy',
      description: `A lighter quest to lift your lagging ${lowestAttr.name} without burning out.`
    }
  ];

  return {
    insights,
    highestAttr,
    lowestAttr,
    recommendedDifficulty,
    suggestedPlan,
    characterStats: {
      level: character.level,
      streak: character.streak,
      coins: character.coins
    }
  };
}

/**
 * Parses user prompt or goal into a structured quest proposal.
 */
export async function generateQuestFromPrompt(prompt, userId) {
  const lower = prompt.toLowerCase();
  let category = 'Personal';
  let difficulty = 'Medium';
  let title = prompt.trim();
  let description = `Quest initiated via AI Game Master guidance.`;

  // Context clues
  if (lower.includes('dsa') || lower.includes('code') || lower.includes('leetcode') || lower.includes('algorithm') || lower.includes('python') || lower.includes('react') || lower.includes('bug')) {
    category = 'Coding';
  } else if (lower.includes('workout') || lower.includes('gym') || lower.includes('run') || lower.includes('pushup') || lower.includes('fitness') || lower.includes('exercise')) {
    category = 'Fitness';
  } else if (lower.includes('read') || lower.includes('book') || lower.includes('chapter') || lower.includes('article')) {
    category = 'Reading';
  } else if (lower.includes('study') || lower.includes('exam') || lower.includes('math') || lower.includes('physics') || lower.includes('course')) {
    category = 'Study';
  } else if (lower.includes('meditat') || lower.includes('breath') || lower.includes('water') || lower.includes('sleep')) {
    category = 'Health';
  } else if (lower.includes('work') || lower.includes('meeting') || lower.includes('project') || lower.includes('client')) {
    category = 'Work';
  }

  // Difficulty clues
  if (lower.includes('hard') || lower.includes('difficult') || lower.includes('master') || lower.includes('5 hours') || lower.includes('10 problem')) {
    difficulty = 'Hard';
  } else if (lower.includes('epic') || lower.includes('boss') || lower.includes('hackathon') || lower.includes('marathon')) {
    difficulty = 'Epic';
  } else if (lower.includes('easy') || lower.includes('quick') || lower.includes('10 min') || lower.includes('1 problem') || lower.includes('light')) {
    difficulty = 'Easy';
  }

  // Format tailored RPG titles
  if (lower.includes('dsa') && lower.includes('better')) {
    title = 'Conquer 3 Algorithmic Array Problems';
    description = 'Sharpen your analytical intellect by mastering medium difficulty sliding window and array patterns.';
    difficulty = 'Medium';
  } else if (lower.includes('fit') || (lower.includes('workout') && lower.includes('miss'))) {
    title = '30-Minute Bodyweight Armor Circuit';
    description = 'Re-establish your kinetic discipline with an energetic 30-minute full body workout.';
    difficulty = 'Medium';
    category = 'Fitness';
  } else if (lower.includes('study 2 hour') || lower.includes('study two hour')) {
    title = 'Deep Cognitive Focus: 2-Hour Study Chamber';
    description = 'Lock down distractions and enter a flow state to absorb core curriculum concepts.';
    difficulty = 'Hard';
    category = 'Study';
  }

  // Calculate official backend rewards (Anti-Cheat)
  const rewards = calculateQuestRewards(difficulty, category, false);

  return {
    title,
    description,
    category,
    difficulty,
    xpReward: rewards.xp,
    coinReward: rewards.coins,
    primaryAttribute: rewards.primaryAttribute,
    attributes: rewards.attributes
  };
}

/**
 * Handles conversational queries with the AI Game Master
 */
export async function chatWithGameMaster(userMessage, userId) {
  const ctx = getUserAdventureContext(userId);
  const character = ctx.character || {};
  const lower = userMessage.toLowerCase();

  // Try external Gemini API if configured
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are the AI Game Master of 'LIFE RPG', a cyberpunk-fantasy RPG productivity app.
Character Context: Level ${character.level}, Streak ${character.streak} days, Coins: ${character.coins},
Attributes: STR ${character.strength}, INT ${character.intelligence}, DISC ${character.discipline}, VIT ${character.vitality}, CRE ${character.creativity}.
User says: "${userMessage}".
Respond as a thrilling, supportive RPG Game Master in 2-3 sentences. If proposing a quest, format with Quest: [Title], Difficulty: [Easy/Medium/Hard/Epic], Category: [Coding/Study/Fitness/Health/Reading/Personal/Work].`
            }]
          }]
        })
      });
      if (response.ok) {
        const data = await response.json();
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (aiText) {
          // Check if quest proposal can be extracted
          const questProposal = await generateQuestFromPrompt(userMessage, userId);
          return {
            reply: aiText,
            suggestedQuest: questProposal
          };
        }
      }
    } catch (e) {
      console.warn('[AI Game Master] Gemini API error, falling back to autonomous engine:', e.message);
    }
  }

  // Autonomous RPG Coach Engine
  let reply = '';
  let suggestedQuest = null;

  if (lower.includes('dsa') || lower.includes('coding') || lower.includes('algorithm')) {
    suggestedQuest = await generateQuestFromPrompt('Solve 3 Array & Two-Pointer Problems', userId);
    reply = `Greetings Adventurer! To forge your algorithmic blade, your mental dexterity must be tested in the arena. I have formulated an Intelligence trial for you. Will you accept the challenge?`;
  } else if (lower.includes('fit') || lower.includes('gym') || lower.includes('workout')) {
    suggestedQuest = await generateQuestFromPrompt('Complete 30-min HIIT Strength Circuit', userId);
    reply = `Your physical armor requires tempering! Regular kinetic exertion bolsters both Strength and Vitality. Let us break inertia with this mission.`;
  } else if (lower.includes('level up') || lower.includes('why am i not leveling')) {
    const xpNeeded = character.next_level_xp - character.current_xp;
    reply = `You currently stand at Level ${character.level} with ${character.current_xp} / ${character.next_level_xp} XP. You need ${xpNeeded} more XP to reach Level ${character.level + 1}. Complete Hard or Epic quests to accelerate your ascension!`;
  } else if (lower.includes('progress') || lower.includes('how am i doing') || lower.includes('stats')) {
    reply = `Current Status: Level ${character.level} hero with a 🔥 ${character.streak}-day streak! You possess ${character.coins} Coins. Your strongest stat is INT at ${character.intelligence}. Continue taking on daily contracts to expand your Life Power!`;
  } else if (lower.includes('what should i do') || lower.includes('today')) {
    suggestedQuest = await generateQuestFromPrompt('Conduct a 45-Minute Deep Focus Session', userId);
    reply = `The scrolls recommend an immediate focus sprint to lock in your daily streak bonus. Here is your primary directive for today:`;
  } else {
    suggestedQuest = await generateQuestFromPrompt(userMessage, userId);
    reply = `The Game Master acknowledges your request! Every intentional act in your mortal life yields tangible power in this realm. Here is a custom quest crafted from your decree:`;
  }

  return {
    reply,
    suggestedQuest
  };
}
