// Shop Routes
import express from 'express';
import { dbService } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { calculateLifePower } from '../services/progressionEngine.js';

const router = express.Router();
router.use(authenticateToken);

// GET /api/shop - Retrieve available shop items with purchase status
router.get('/', (req, res) => {
  try {
    const items = dbService.all(`SELECT * FROM shop_items ORDER BY cost_coins ASC`);
    const userInventory = dbService.all(
      `SELECT item_id, quantity, is_equipped FROM user_inventory WHERE user_id = ?`,
      [req.user.id]
    );

    const inventoryMap = {};
    for (const inv of userInventory) {
      inventoryMap[inv.item_id] = inv;
    }

    const itemsWithStatus = items.map(item => ({
      ...item,
      isOwned: Boolean(inventoryMap[item.id]),
      isEquipped: Boolean(inventoryMap[item.id]?.is_equipped),
      ownedQuantity: inventoryMap[item.id]?.quantity || 0
    }));

    return res.json({ items: itemsWithStatus });
  } catch (err) {
    console.error('[Shop GET Error]:', err);
    return res.status(500).json({ error: 'Server Error', message: 'Failed to load shop items.' });
  }
});

// POST /api/shop/:id/purchase - Server-side Anti-Cheat Purchase Validation
router.post('/:id/purchase', (req, res) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.id;

    const item = dbService.get(`SELECT * FROM shop_items WHERE id = ?`, [itemId]);
    if (!item) {
      return res.status(404).json({ error: 'Not Found', message: 'Item not found in shop catalog.' });
    }

    const character = dbService.get(`SELECT coins FROM characters WHERE user_id = ?`, [userId]);
    if (!character) {
      return res.status(404).json({ error: 'Not Found', message: 'Character not found.' });
    }

    // Check balance
    if (character.coins < item.cost_coins) {
      return res.status(400).json({
        error: 'Insufficient Coins',
        message: `You need ${item.cost_coins} Coins, but currently only hold ${character.coins} Coins.`
      });
    }

    // Prevent duplicate cosmetic purchases (shield can be stacked)
    const existingInv = dbService.get(
      `SELECT id, quantity FROM user_inventory WHERE user_id = ? AND item_id = ?`,
      [userId, itemId]
    );

    if (existingInv && item.item_type !== 'shield') {
      return res.status(400).json({
        error: 'Already Owned',
        message: `You already own ${item.name}. Cosmetics cannot be repurchased.`
      });
    }

    dbService.transaction(() => {
      // 1. Deduct coins authoritatively
      dbService.run(
        `UPDATE characters SET coins = coins - ? WHERE user_id = ?`,
        [item.cost_coins, userId]
      );

      // 2. Add or update user inventory
      if (existingInv) {
        dbService.run(
          `UPDATE user_inventory SET quantity = quantity + 1 WHERE id = ?`,
          [existingInv.id]
        );
      } else {
        const invId = 'inv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
        dbService.run(
          `INSERT INTO user_inventory (id, user_id, item_id, quantity, is_equipped)
           VALUES (?, ?, ?, 1, 0)`,
          [invId, userId, itemId]
        );
      }

      // 3. Log activity
      dbService.run(
        `INSERT INTO activity_logs (id, user_id, activity_type, message, metadata_json)
         VALUES (?, ?, 'shop_purchase', ?, ?)`,
        [
          'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          userId,
          `🛍️ Acquired ${item.name} from the Shop (-${item.cost_coins} Coins)`,
          JSON.stringify({ itemId: item.id, name: item.name, cost: item.cost_coins })
        ]
      );
    });

    const updatedChar = dbService.get(`SELECT * FROM characters WHERE user_id = ?`, [userId]);

    return res.json({
      message: `Successfully purchased ${item.name}!`,
      item,
      remainingCoins: updatedChar.coins,
      character: { ...updatedChar, lifePower: calculateLifePower(updatedChar) }
    });
  } catch (err) {
    console.error('[Shop Purchase Error]:', err);
    return res.status(500).json({ error: 'Server Error', message: 'Failed to process transaction.' });
  }
});

export default router;
