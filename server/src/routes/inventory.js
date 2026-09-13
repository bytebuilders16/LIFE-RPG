// Inventory Routes
import express from 'express';
import { dbService } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

// GET /api/inventory - Retrieve user's owned inventory items
router.get('/', (req, res) => {
  try {
    const inventory = dbService.all(
      `SELECT ui.id as inventory_id, ui.quantity, ui.is_equipped, ui.acquired_at,
              si.id as item_id, si.code, si.name, si.description, si.item_type,
              si.cost_coins, si.icon, si.rarity, si.effect_type, si.effect_value
       FROM user_inventory ui
       JOIN shop_items si ON ui.item_id = si.id
       WHERE ui.user_id = ?
       ORDER BY ui.is_equipped DESC, si.rarity DESC`,
      [req.user.id]
    );

    return res.json({ inventory });
  } catch (err) {
    console.error('[Inventory GET Error]:', err);
    return res.status(500).json({ error: 'Server Error', message: 'Failed to retrieve inventory.' });
  }
});

export default router;
