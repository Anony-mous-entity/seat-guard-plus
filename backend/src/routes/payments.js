const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// Get all payments
router.get('/', async (req, res) => {
  try {
    const { studentId, status, startDate, endDate } = req.query;
    
    let query = `
      SELECT p.*, s.name as student_name, s.phone as student_phone
      FROM payments p
      JOIN students s ON p.student_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (studentId) {
      query += ' AND p.student_id = ?';
      params.push(studentId);
    }

    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }

    if (startDate) {
      query += ' AND p.paid_date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND p.paid_date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY p.paid_date DESC';

    const [payments] = await db.query(query, params);
    res.json(payments);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Get pending payments (for admin tracking)
router.get('/pending', async (req, res) => {
  try {
    const [pendingPayments] = await db.query(`
      SELECT 
        s.id as student_id,
        s.name as student_name,
        s.phone as student_phone,
        st.seat_number,
        sa.shift,
        p.period_end as due_date,
        DATEDIFF(CURDATE(), p.period_end) as days_pending,
        CASE 
          WHEN DATEDIFF(CURDATE(), p.period_end) > 15 THEN 'late'
          ELSE 'pending'
        END as status,
        ao.extended_due_date,
        ao.reason as override_reason
      FROM students s
      JOIN seat_allocations sa ON s.id = sa.student_id AND sa.is_active = TRUE
      JOIN seats st ON sa.seat_id = st.id
      LEFT JOIN payments p ON s.id = p.student_id 
        AND p.period_end = (
          SELECT MAX(p2.period_end) 
          FROM payments p2 
          WHERE p2.student_id = s.id
        )
      LEFT JOIN admin_overrides ao ON s.id = ao.student_id 
        AND ao.extended_due_date >= CURDATE()
      WHERE s.status = 'active'
        AND (p.period_end < CURDATE() OR p.id IS NULL)
      ORDER BY days_pending DESC
    `);

    res.json(pendingPayments);
  } catch (error) {
    console.error('Get pending payments error:', error);
    res.status(500).json({ error: 'Failed to fetch pending payments' });
  }
});

// Record new payment
router.post('/', [
  body('studentId').notEmpty(),
  body('amount').isFloat({ min: 0 }),
  body('periodStart').isISO8601(),
  body('periodEnd').isISO8601(),
  body('paidDate').isISO8601(),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { studentId, amount, periodStart, periodEnd, paidDate, notes } = req.body;

    // Determine status based on payment timing
    const dueDate = new Date(periodStart);
    const payDate = new Date(paidDate);
    let status = 'paid';

    // If paying after period started, mark as late
    if (payDate > dueDate) {
      const daysDiff = Math.floor((payDate - dueDate) / (1000 * 60 * 60 * 24));
      if (daysDiff > 0) {
        status = 'late';
      }
    }

    const [result] = await db.query(
      'INSERT INTO payments (student_id, amount, period_start, period_end, paid_date, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [studentId, amount, periodStart, periodEnd, paidDate, status, notes || null]
    );

    const [newPayment] = await db.query(`
      SELECT p.*, s.name as student_name 
      FROM payments p 
      JOIN students s ON p.student_id = s.id 
      WHERE p.id = LAST_INSERT_ID() OR (p.student_id = ? AND p.period_start = ?) 
      ORDER BY p.created_at DESC LIMIT 1
    `, [studentId, periodStart]);

    res.status(201).json(newPayment[0]);
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Failed to record payment' });
  }
});

// Update payment
router.put('/:id', [
  body('amount').optional().isFloat({ min: 0 }),
  body('status').optional().isIn(['paid', 'pending', 'late', 'left']),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, status, notes } = req.body;
    const updates = [];
    const params = [];

    if (amount !== undefined) { updates.push('amount = ?'); params.push(amount); }
    if (status) { updates.push('status = ?'); params.push(status); }
    if (notes !== undefined) { updates.push('notes = ?'); params.push(notes); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(req.params.id);
    await db.query(`UPDATE payments SET ${updates.join(', ')} WHERE id = ?`, params);

    const [updated] = await db.query('SELECT * FROM payments WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ error: 'Failed to update payment' });
  }
});

module.exports = router;
