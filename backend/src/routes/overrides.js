const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { createAdminOverride } = require('../services/paymentService');

const router = express.Router();
router.use(authenticateToken);

// Get all overrides
router.get('/', async (req, res) => {
  try {
    const { active } = req.query;
    
    let query = `
      SELECT ao.*, s.name as student_name, s.phone as student_phone
      FROM admin_overrides ao
      JOIN students s ON ao.student_id = s.id
    `;

    if (active === 'true') {
      query += ' WHERE ao.extended_due_date >= CURDATE()';
    }

    query += ' ORDER BY ao.created_at DESC';

    const [overrides] = await db.query(query);
    res.json(overrides);
  } catch (error) {
    console.error('Get overrides error:', error);
    res.status(500).json({ error: 'Failed to fetch overrides' });
  }
});

// Create override (extend grace period)
router.post('/', [
  body('studentId').notEmpty(),
  body('reason').trim().notEmpty(),
  body('originalDueDate').isISO8601(),
  body('extendedDueDate').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { studentId, reason, originalDueDate, extendedDueDate } = req.body;

    await createAdminOverride(studentId, reason, originalDueDate, extendedDueDate);

    const [newOverride] = await db.query(`
      SELECT ao.*, s.name as student_name
      FROM admin_overrides ao
      JOIN students s ON ao.student_id = s.id
      WHERE ao.student_id = ?
      ORDER BY ao.created_at DESC
      LIMIT 1
    `, [studentId]);

    res.status(201).json(newOverride[0]);
  } catch (error) {
    console.error('Create override error:', error);
    res.status(500).json({ error: 'Failed to create override' });
  }
});

// Delete override
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM admin_overrides WHERE id = ?', [req.params.id]);
    res.json({ message: 'Override deleted' });
  } catch (error) {
    console.error('Delete override error:', error);
    res.status(500).json({ error: 'Failed to delete override' });
  }
});

module.exports = router;
