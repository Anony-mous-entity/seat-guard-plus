const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// Get all students
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    
    let query = `
      SELECT s.*, 
        sa.seat_id, sa.shift,
        st.seat_number,
        p.id as payment_id, p.period_start, p.period_end, p.status as payment_status
      FROM students s
      LEFT JOIN seat_allocations sa ON s.id = sa.student_id AND sa.is_active = TRUE
      LEFT JOIN seats st ON sa.seat_id = st.id
      LEFT JOIN payments p ON s.id = p.student_id 
        AND p.period_end >= CURDATE()
        AND p.period_start <= CURDATE()
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND s.status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (s.name LIKE ? OR s.phone LIKE ? OR s.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY s.created_at DESC';

    const [students] = await db.query(query, params);
    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Get single student with full history
router.get('/:id', async (req, res) => {
  try {
    const [students] = await db.query('SELECT * FROM students WHERE id = ?', [req.params.id]);
    if (students.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const student = students[0];

    // Get all allocations
    const [allocations] = await db.query(`
      SELECT sa.*, st.seat_number 
      FROM seat_allocations sa
      JOIN seats st ON sa.seat_id = st.id
      WHERE sa.student_id = ?
      ORDER BY sa.start_date DESC
    `, [req.params.id]);

    // Get all payments
    const [payments] = await db.query(
      'SELECT * FROM payments WHERE student_id = ? ORDER BY period_start DESC',
      [req.params.id]
    );

    // Get overrides
    const [overrides] = await db.query(
      'SELECT * FROM admin_overrides WHERE student_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );

    res.json({
      ...student,
      allocations,
      payments,
      overrides
    });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// Create student
router.post('/', [
  body('name').trim().notEmpty(),
  body('phone').trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
  body('joinDate').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, email, joinDate } = req.body;

    const [result] = await db.query(
      'INSERT INTO students (name, phone, email, join_date) VALUES (?, ?, ?, ?)',
      [name, phone, email || null, joinDate]
    );

    const [newStudent] = await db.query('SELECT * FROM students WHERE id = LAST_INSERT_ID() OR name = ? ORDER BY created_at DESC LIMIT 1', [name]);
    res.status(201).json(newStudent[0]);
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ error: 'Failed to create student' });
  }
});

// Update student
router.put('/:id', [
  body('name').optional().trim().notEmpty(),
  body('phone').optional().trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, email } = req.body;
    const updates = [];
    const params = [];

    if (name) { updates.push('name = ?'); params.push(name); }
    if (phone) { updates.push('phone = ?'); params.push(phone); }
    if (email !== undefined) { updates.push('email = ?'); params.push(email || null); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(req.params.id);
    await db.query(`UPDATE students SET ${updates.join(', ')} WHERE id = ?`, params);

    const [updated] = await db.query('SELECT * FROM students WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// Mark student as left (voluntary leave)
router.post('/:id/leave', [
  body('reason').optional().trim()
], async (req, res) => {
  try {
    const { reason } = req.body;

    // Update student status
    await db.query(
      'UPDATE students SET status = ?, left_date = CURDATE(), left_reason = ? WHERE id = ?',
      ['left', reason || 'Left voluntarily before cycle end', req.params.id]
    );

    // Close all active allocations
    await db.query(
      'UPDATE seat_allocations SET is_active = FALSE, end_date = CURDATE(), closed_reason = ? WHERE student_id = ? AND is_active = TRUE',
      [reason || 'Student left voluntarily', req.params.id]
    );

    const [updated] = await db.query('SELECT * FROM students WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Leave student error:', error);
    res.status(500).json({ error: 'Failed to process student leave' });
  }
});

module.exports = router;
