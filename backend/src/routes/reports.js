const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// Daily collection report
router.get('/daily-collection', async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const [collections] = await db.query(`
      SELECT 
        p.id,
        s.name as student_name,
        p.amount,
        p.period_start,
        p.period_end,
        p.status,
        p.notes
      FROM payments p
      JOIN students s ON p.student_id = s.id
      WHERE DATE(p.paid_date) = ?
      ORDER BY p.created_at DESC
    `, [targetDate]);

    const [[{ total }]] = await db.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE DATE(paid_date) = ?',
      [targetDate]
    );

    res.json({
      date: targetDate,
      collections,
      total: parseFloat(total),
      count: collections.length
    });
  } catch (error) {
    console.error('Daily collection report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Monthly expected vs received
router.get('/monthly-summary', async (req, res) => {
  try {
    const { month, year } = req.query;
    const targetMonth = month || new Date().getMonth() + 1;
    const targetYear = year || new Date().getFullYear();

    // Total received
    const [[{ received }]] = await db.query(`
      SELECT COALESCE(SUM(amount), 0) as received
      FROM payments
      WHERE MONTH(paid_date) = ? AND YEAR(paid_date) = ?
    `, [targetMonth, targetYear]);

    // Count of payments by status
    const [statusBreakdown] = await db.query(`
      SELECT status, COUNT(*) as count, SUM(amount) as total
      FROM payments
      WHERE MONTH(paid_date) = ? AND YEAR(paid_date) = ?
      GROUP BY status
    `, [targetMonth, targetYear]);

    // Active students (expected payers)
    const [[{ activeStudents }]] = await db.query(
      'SELECT COUNT(*) as activeStudents FROM students WHERE status = ?',
      ['active']
    );

    res.json({
      month: targetMonth,
      year: targetYear,
      received: parseFloat(received),
      activeStudents,
      statusBreakdown
    });
  } catch (error) {
    console.error('Monthly summary error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Pending/defaulters list
router.get('/defaulters', async (req, res) => {
  try {
    const [defaulters] = await db.query(`
      SELECT 
        s.id,
        s.name,
        s.phone,
        st.seat_number,
        sa.shift,
        p.period_end as last_payment_end,
        DATEDIFF(CURDATE(), p.period_end) as days_overdue,
        ao.extended_due_date,
        ao.reason as override_reason
      FROM students s
      JOIN seat_allocations sa ON s.id = sa.student_id AND sa.is_active = TRUE
      JOIN seats st ON sa.seat_id = st.id
      LEFT JOIN payments p ON s.id = p.student_id 
        AND p.period_end = (SELECT MAX(p2.period_end) FROM payments p2 WHERE p2.student_id = s.id)
      LEFT JOIN admin_overrides ao ON s.id = ao.student_id 
        AND ao.extended_due_date >= CURDATE()
      WHERE s.status = 'active'
        AND (p.period_end < CURDATE() OR p.id IS NULL)
      ORDER BY days_overdue DESC
    `);

    res.json(defaulters);
  } catch (error) {
    console.error('Defaulters report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Seat occupancy summary
router.get('/seat-occupancy', async (req, res) => {
  try {
    const [summary] = await db.query(`
      SELECT 
        COUNT(*) as total_seats,
        COUNT(CASE WHEN morning_count = 0 AND evening_count = 0 THEN 1 END) as vacant,
        COUNT(CASE WHEN morning_count = 1 AND evening_count = 0 THEN 1 END) as morning_only,
        COUNT(CASE WHEN morning_count = 0 AND evening_count = 1 THEN 1 END) as evening_only,
        COUNT(CASE WHEN morning_count = 1 AND evening_count = 1 AND same_student = 1 THEN 1 END) as full_shift,
        COUNT(CASE WHEN morning_count = 1 AND evening_count = 1 AND same_student = 0 THEN 1 END) as dual_shift
      FROM (
        SELECT 
          s.id,
          COUNT(CASE WHEN sa.shift = 'morning' THEN 1 END) as morning_count,
          COUNT(CASE WHEN sa.shift = 'evening' THEN 1 END) as evening_count,
          CASE WHEN COUNT(DISTINCT sa.student_id) = 1 AND COUNT(sa.id) = 2 THEN 1 ELSE 0 END as same_student
        FROM seats s
        LEFT JOIN seat_allocations sa ON s.id = sa.seat_id AND sa.is_active = TRUE
        GROUP BY s.id
      ) as seat_status
    `);

    // Get detailed seat list
    const [seatDetails] = await db.query(`
      SELECT 
        s.seat_number,
        morning_s.name as morning_student,
        evening_s.name as evening_student
      FROM seats s
      LEFT JOIN seat_allocations morning ON s.id = morning.seat_id 
        AND morning.shift = 'morning' AND morning.is_active = TRUE
      LEFT JOIN students morning_s ON morning.student_id = morning_s.id
      LEFT JOIN seat_allocations evening ON s.id = evening.seat_id 
        AND evening.shift = 'evening' AND evening.is_active = TRUE
      LEFT JOIN students evening_s ON evening.student_id = evening_s.id
      ORDER BY s.seat_number
    `);

    res.json({
      summary: summary[0],
      details: seatDetails
    });
  } catch (error) {
    console.error('Seat occupancy report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

module.exports = router;
