# ⚔️ LIFE RPG — Turn Your Real Life Into an RPG

[![Status](https://img.shields.io/badge/Status-Complete-emerald.svg)](#)
[![Stack](https://img.shields.io/badge/Stack-React_18_%7C_Node.js_%7C_SQLite_WAL_%7C_Tailwind-06b6d4.svg)](#)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](#)

> **"Your life is the game. Every action gives XP. Your character evolves from your real-world behavior."**

---

## 🌟 Vision & Executive Summary

**LIFE RPG** is a full-stack, production-ready gamified productivity system that transforms real-world habits, studying, training, and tasks into an authentic RPG adventure. 

Rather than another generic CRUD todo list or corporate SaaS dashboard, LIFE RPG merges modern dark-cyber RPG aesthetics with authoritative server-side anti-cheat game mathematics, persistent relational database storage, an adaptive AI Game Master coach, boss raids, quest chains, and a virtual shop economy.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18, Vite 6, Tailwind CSS 3, Lucide Icons, Canvas-Confetti, Web Audio API Sound Synthesizer.
- **Backend**: Node.js, Express, `node:sqlite` (Relational Persistent Storage with WAL mode & foreign keys) / PostgreSQL compatible schema, `jsonwebtoken` (JWT Session Persistence), `bcryptjs` (Salted Password Hashing).
- **Game Progression Engines**:
  - `progressionEngine`: Non-linear level curves ($XP = \lfloor 100 \times \text{Level}^{1.5} \rfloor$) and composite Life Power calculations.
  - `rewardEngine`: Authoritative server-side difficulty & attribute allocations.
  - `streakEngine`: Calendar-day consecutive tracking with Streak Shield consumable protection.
  - `achievementEngine`: Automatic milestone evaluation and badge unlocks.
  - `aiGameMasterService`: Adaptive coaching diagnostics and NLP quest proposal generation.

---

## 📊 Relational Database Schema

All user data is persistently stored in real relational tables surviving reloads, restarts, and logout/login cycles:

```
users (id, username, email, password_hash, created_at, updated_at)
  │
  ├── characters (user_id PK/FK, name, level, current_xp, next_level_xp, coins,
  │               streak, longest_streak, last_active_date, strength,
  │               intelligence, discipline, vitality, creativity,
  │               equipped_title, equipped_frame, equipped_theme)
  │
  ├── tasks (id PK, user_id FK, title, description, category, difficulty,
  │          xp_reward, coin_reward, primary_attribute, status,
  │          is_boss, boss_health_max, boss_health_current,
  │          chain_id, chain_title, chain_step, chain_total_steps, due_date)
  │
  ├── task_completions (id PK, task_id FK, user_id FK, xp_awarded,
  │                     coins_awarded, attributes_awarded, completed_at)
  │
  ├── user_achievements (id PK, user_id FK, achievement_id FK, unlocked_at)
  │
  ├── user_inventory (id PK, user_id FK, item_id FK, quantity, is_equipped)
  │
  └── activity_logs (id PK, user_id FK, activity_type, message, metadata_json)
```

---

## 🧮 RPG Progression Formulas (Anti-Cheat)

### 1. Non-Linear Leveling Curve
The XP needed to ascend from level $L$ to $L + 1$ is calculated authoritatively on the backend:
$$\text{XP\_REQUIRED}(L) = \lfloor 100 \times L^{1.5} \rfloor$$
- **Level 1 → 2**: 100 XP
- **Level 7 → 8**: 1,852 XP
- **Level 10 → 11**: 3,162 XP

*Each level-up automatically grants **+5 Skill Points** distributed to attributes, accompanied by an animated fanfare and confetti burst.*

### 2. Composite Life Power Score
$$\text{Life Power} = \lfloor (\text{STR} + \text{INT} + \text{DISC} + \text{VIT} + \text{CRE}) \times 1.5 + (\text{Level} - 1) \times 35 + \min(\text{Streak} \times 10, 200) \rfloor$$

### 3. Centralized Reward Matrix
| Difficulty | XP Awarded | Coins Awarded | Attribute Growth | Typical Objective |
|---|---|---|---|---|
| **Easy** | +50 XP | +10 Coins | +5 Pts | 15m reading, hydration |
| **Medium** | +100 XP | +25 Coins | +10 Pts | 45m workout, coding problem |
| **Hard** | +250 XP | +50 Coins | +20 Pts | 2hr deep focus, algorithm set |
| **Epic** | +500 XP | +100 Coins | +35 Pts | Milestone project release |
| **Boss** | +1,000 XP | +250 Coins | +60 Pts | Weekly Boss Trial completion |

---

## 🤖 AI Game Master & Adaptive Coach

- **Context-Aware Coaching**: Analyzes completion percentages by category and difficulty. If Medium quest completion exceeds 80%, the coach recommends stepping up to Hard. If Hard quests fail frequently, the coach eases pacing to restore momentum.
- **Natural Language Quest Synthesis**: Turn goals like *"I want to become better at DSA"* into structured quest contracts with one-click `[ ACCEPT QUEST ]` database insertion.
- **Curated AI Plans**: Press `[ ACCEPT AI PLAN ]` to instantiate multi-quest balanced training regiments.
- **Gemini 1.5 Flash Enabled**: Seamlessly uses `GEMINI_API_KEY` when configured; effortlessly falls back to the integrated heuristic RPG coach if no API key is provided.

---

## 🚀 Judge Walkthrough Protocol (90–180 Seconds)

1. Click **`🚀 START DEMO (Instant Hero)`** on the login page or top navigation bar.
2. View **Character Overview**: Level 7, 1,750 / 1,852 XP, 🔥 7-day streak, 450 Coins, 832 Life Power.
3. In **Today's Adventure**, click **COMPLETE** on the Hard LeetCode quest (+250 XP).
4. Watch the **LEVEL UP! ⚔️** celebration modal trigger, ascending the character from **Level 7 → Level 8** with confetti and sound effects!
5. Navigate to **Achievements** tab to verify badge milestones.
6. Open **The Guild Bazaar** (Shop) and acquire a **Streak Shield** or **Cosmetic Frame**.
7. Open **Inventory Vault** and equip your acquired gear.
8. Switch to **AI Game Master**, type *"I want to improve my fitness"*, and click `[ ACCEPT QUEST ]`. Notice the quest instantly appear in the Quest Log!
9. In **Adventure**, strike and vanquish the weekly **DSA Algorithm Overlord Boss Quest**.
10. **Press Refresh (F5)** or log out and log back in to prove **100% database persistence**!

---

## ⚙️ Local Setup Instructions

### Prerequisites
- Node.js >= v20 (Node v24 tested)
- npm >= v9

### Quick Start
```bash
# 1. Clone repository
git clone <repository_url>
cd "Web hackathon"

# 2. Install dependencies for root, server, and client
npm run install-all

# 3. Configure Environment Variables
cp .env.example .env

# 4. Start Full-Stack Application in Development
npm run dev

# Or build client and launch the production server:
npm run build:client
npm start
```
- Frontend dev server: `http://localhost:5173`
- Backend server + served production SPA: `http://localhost:5000`

---

## 📡 REST API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register player & create character | No |
| `POST` | `/api/auth/login` | Login & return JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated player & stats | Yes |
| `POST` | `/api/demo/start` | Reset & initialize Judge Demo Hero | No |
| `GET` | `/api/tasks` | Get user quests with category & status filters | Yes |
| `POST` | `/api/tasks` | Create quest (rewards calculated on server) | Yes |
| `PUT` | `/api/tasks/:id` | Update quest details | Yes |
| `DELETE` | `/api/tasks/:id` | Abandon quest | Yes |
| `POST` | `/api/tasks/:id/complete` | Authoritatively complete quest & grant XP | Yes |
| `GET` | `/api/character` | Inspect character attributes & Life Power | Yes |
| `POST` | `/api/character/equip` | Equip title, avatar frame, or theme | Yes |
| `GET` | `/api/shop` | List available shop items and pricing | Yes |
| `POST` | `/api/shop/:id/purchase` | Purchase shop item with anti-cheat coin check | Yes |
| `GET` | `/api/inventory` | View player owned items and quantities | Yes |
| `GET` | `/api/achievements` | View all achievements with unlock status | Yes |
| `GET` | `/api/activity` | Retrieve chronological adventure logs | Yes |
| `GET` | `/api/analytics` | Fetch XP timeline, radar, and category stats | Yes |
| `POST` | `/api/ai/game-master` | Chat with AI Game Master | Yes |
| `POST` | `/api/ai/generate-quest` | Synthesize quest from natural language prompt | Yes |
| `GET` | `/api/ai/coach-insights` | Adaptive coach diagnostics & recommendations | Yes |
| `POST` | `/api/ai/accept-plan` | Bulk-instantiate suggested AI training plan | Yes |

---

## 🔒 Security & Anti-Cheat Summary

- **Server-Authoritative Progression**: Clients never transmit XP, Coins, or Level values. The backend determines all rewards based on stored quest metadata.
- **Isolated User Context**: SQL queries strictly enforce `WHERE user_id = ?` from the verified JWT payload.
- **Sanitized Errors**: No raw stack traces or internal secrets are exposed to the browser.
- **Safe Persistence**: SQLite database uses Write-Ahead Logging (WAL) and strict foreign key integrity to eliminate race conditions and data corruption.

---

## 📜 License
MIT © LIFE RPG Team
