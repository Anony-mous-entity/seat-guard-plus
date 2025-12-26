const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// Allocate seat to student
router.post('/', [
  body('studentId').notEmpty(),
  body('seatId').notEmpty(),
  body('shift').isIn(['morning', 'evening']),
  body('startDate').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { studentId, seatId, shift, startDate } = req.body;

    // Check if seat is available for this shift
    const [existing] = await db.query(
      'SELECT * FROM seat_allocations WHERE seat_id = ? AND shift = ? AND is_active = TRUE',
      [seatId, shift]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Seat is already occupied for this shift' });
    }

    // Check if student already has an active allocation for this shift
    const [studentAllocation] = await db.query(
      'SELECT * FROM seat_allocations WHERE student_id = ? AND shift = ? AND is_active = TRUE',
      [studentId, shift]
    );

    if (studentAllocation.length > 0) {
      return res.status(400).json({ error: 'Student already has a seat for this shift' });
    }

    // Create allocation
    await db.query(
      'INSERT INTO seat_allocations (student_id, seat_id, shift, start_date) VALUES (?, ?, ?, ?)',
      [studentId, seatId, shift, startDate]
    );

    const [newAllocation] = await db.query(`
      SELECT sa.*, s.name as student_name, st.seat_number
      FROM seat_allocations sa
      JOIN students s ON sa.student_id = s.id
      JOIN seats st ON sa.seat_id = st.id
      WHERE sa.student_id = ? AND sa.seat_id = ? AND sa.shift = ? AND sa.is_active = TRUE
    `, [studentId, seatId, shift]);

    res.status(201).json(newAllocation[0]);
  } catch (error) {
    console.error('Create allocation error:', error);
    res.status(500).json({ error: 'Failed to create allocation' });
  }
});

// Close allocation (deallocate seat)
router.post('/:id/close', [
  body('reason').optional().trim()
], async (req, res) => {
  try {
    const { reason } = req.body;

    await db.query(
      'UPDATE seat_allocations SET is_active = FALSE, end_date = CURDATE(), closed_reason = ? WHERE id = ?',
      [reason || 'Manually closed', req.params.id]
    );

    const [updated] = await db.query('SELECT * FROM seat_allocations WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Close allocation error:', error);
    res.status(500).json({ error: 'Failed to close allocation' });
  }
});

// Change shift (within same seat or different seat)
router.post('/change-shift', [
  body('studentId').notEmpty(),
  body('newSeatId').notEmpty(),
  body('newShift').isIn(['morning', 'evening']),
  body('reason').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { studentId, newSeatId, newShift, reason } = req.body;

    // Check if new seat/shift is available
    const [existing] = await db.query(
      'SELECT * FROM seat_allocations WHERE seat_id = ? AND shift = ? AND is_active = TRUE',
      [newSeatId, newShift]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'New seat/shift is not available' });
    }

    // Close current allocations for this student
    await db.query(
      'UPDATE seat_allocations SET is_active = FALSE, end_date = CURDATE(), closed_reason = ? WHERE student_id = ? AND is_active = TRUE',
      [reason || 'Shift change', studentId]
    );

    // Create new allocation
    await db.query(
      'INSERT INTO seat_allocations (student_id, seat_id, shift, start_date) VALUES (?, ?, ?, CURDATE())',
      [studentId, newSeatId, newShift]
    );

    const [newAllocation] = await db.query(`
      SELECT sa.*, s.name as student_name, st.seat_number
      FROM seat_allocations sa
      JOIN students s ON sa.student_id = s.id
      JOIN seats st ON sa.seat_id = st.id
      WHERE sa.student_id = ? AND sa.is_active = TRUE
    `, [studentId]);

    res.json(newAllocation);
  } catch (error) {
    console.error('Change shift error:', error);
    res.status(500).json({ error: 'Failed to change shift' });
  }
});

module.exports = router;
