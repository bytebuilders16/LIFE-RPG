// Character Routes
import express from 'express';
import { dbService } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { calculateLifePower } from '../services/progressionEngine.js';

const router = express.Router();
router.use(authenticateToken);

// GET /api/character - Get authenticated user's character sheet
router.get('/', (req, res) => {
  try {
    const character = dbService.get(`SELECT * FROM characters WHERE user_id = ?`, [req.user.id]);
    if (!character) {
      return res.status(404).json({ error: 'Not Found', message: 'Character sheet not located.' });
    }

    const lifePower = calculateLifePower(character);
    return res.json({ character: { ...character, lifePower } });
  } catch (err) {
    console.error('[Character GET Error]:', err);
    return res.status(500).json({ error: 'Server Error', message: 'Failed to retrieve character sheet.' });
  }
});

// POST /api/character/equip - Equip Title, Frame, or Theme
router.post('/equip', (req, res) => {
  try {
    const { itemType, itemCode, itemName } = req.body;

    if (!['title', 'frame', 'theme'].includes(itemType)) {
      return res.status(400).json({ error: 'Validation Error', message: 'Invalid equip item type.' });
    }

    // Verify user owns this item in inventory
    const owned = dbService.get(
      `SELECT ui.id, si.item_type, si.code, si.name, si.effect_value
       FROM user_inventory ui
       JOIN shop_items si ON ui.item_id = si.id
       WHERE ui.user_id = ? AND si.code = ?`,
      [req.user.id, itemCode]
    );

    if (!owned) {
      return res.status(403).json({ error: 'Forbidden', message: 'You do not own this item.' });
    }

    dbService.transaction(() => {
      // Unequip previous items of same type
      const itemsOfSameType = dbService.all(
        `SELECT ui.id FROM user_inventory ui
         JOIN shop_items si ON ui.item_id = si.id
         WHERE ui.user_id = ? AND si.item_type = ?`,
        [req.user.id, itemType]
      );
      for (const itm of itemsOfSameType) {
        dbService.run(`UPDATE user_inventory SET is_equipped = 0 WHERE id = ?`, [itm.id]);
      }

      // Equip this item
      dbService.run(`UPDATE user_inventory SET is_equipped = 1 WHERE id = ?`, [owned.id]);

      // Update character sheet
      if (itemType === 'title') {
        dbService.run(`UPDATE characters SET equipped_title = ? WHERE user_id = ?`, [owned.name, req.user.id]);
      } else if (itemType === 'frame') {
        dbService.run(`UPDATE characters SET equipped_frame = ? WHERE user_id = ?`, [owned.code, req.user.id]);
      } else if (itemType === 'theme') {
        dbService.run(`UPDATE characters SET equipped_theme = ? WHERE user_id = ?`, [owned.code, req.user.id]);
      }
    });

    const updatedChar = dbService.get(`SELECT * FROM characters WHERE user_id = ?`, [req.user.id]);
    return res.json({
      message: `Successfully equipped ${owned.name}!`,
      character: { ...updatedChar, lifePower: calculateLifePower(updatedChar) }
    });
  } catch (err) {
    console.error('[Character Equip Error]:', err);
    return res.status(500).json({ error: 'Server Error', message: 'Failed to equip item.' });
  }
});

export default router;
