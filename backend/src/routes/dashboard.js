const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Total active students
    const [[{ totalStudents }]] = await db.query(
      'SELECT COUNT(*) as totalStudents FROM students WHERE status = ?',
      ['active']
    );

    // Occupied seats count
    const [[{ occupiedSeats }]] = await db.query(
      'SELECT COUNT(DISTINCT seat_id) as occupiedSeats FROM seat_allocations WHERE is_active = TRUE'
    );

    // Total seats
    const [[{ totalSeats }]] = await db.query('SELECT COUNT(*) as totalSeats FROM seats');

    // Pending payments count
    const [[{ pendingPayments }]] = await db.query(`
      SELECT COUNT(DISTINCT s.id) as pendingPayments
      FROM students s
      JOIN seat_allocations sa ON s.id = sa.student_id AND sa.is_active = TRUE
      LEFT JOIN payments p ON s.id = p.student_id 
        AND p.period_end >= CURDATE()
      WHERE s.status = 'active' AND p.id IS NULL
    `);

    // Monthly revenue (current month)
    const [[{ monthlyRevenue }]] = await db.query(`
      SELECT COALESCE(SUM(amount), 0) as monthlyRevenue
      FROM payments
      WHERE MONTH(paid_date) = MONTH(CURDATE())
        AND YEAR(paid_date) = YEAR(CURDATE())
    `);

    // Late payments count
    const [[{ latePayments }]] = await db.query(`
      SELECT COUNT(DISTINCT s.id) as latePayments
      FROM students s
      JOIN seat_allocations sa ON s.id = sa.student_id AND sa.is_active = TRUE
      LEFT JOIN payments p ON s.id = p.student_id 
        AND p.period_end = (SELECT MAX(p2.period_end) FROM payments p2 WHERE p2.student_id = s.id)
      WHERE s.status = 'active'
        AND p.period_end < DATE_SUB(CURDATE(), INTERVAL 15 DAY)
    `);

    // Seat occupancy breakdown
    const [seatBreakdown] = await db.query(`
      SELECT 
        COUNT(CASE WHEN morning_count = 0 AND evening_count = 0 THEN 1 END) as vacant,
        COUNT(CASE WHEN morning_count = 1 AND evening_count = 0 THEN 1 END) as morningOnly,
        COUNT(CASE WHEN morning_count = 0 AND evening_count = 1 THEN 1 END) as eveningOnly,
        COUNT(CASE WHEN morning_count = 1 AND evening_count = 1 THEN 1 END) as fullOrDual
      FROM (
        SELECT 
          s.id,
          COUNT(CASE WHEN sa.shift = 'morning' THEN 1 END) as morning_count,
          COUNT(CASE WHEN sa.shift = 'evening' THEN 1 END) as evening_count
        FROM seats s
        LEFT JOIN seat_allocations sa ON s.id = sa.seat_id AND sa.is_active = TRUE
        GROUP BY s.id
      ) as seat_status
    `);

    res.json({
      totalStudents,
      occupiedSeats,
      totalSeats,
      vacantSeats: totalSeats - occupiedSeats,
      pendingPayments,
      latePayments,
      monthlyRevenue: parseFloat(monthlyRevenue),
      seatBreakdown: seatBreakdown[0]
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Get recent activity
router.get('/activity', async (req, res) => {
  try {
    // Recent payments
    const [recentPayments] = await db.query(`
      SELECT 'payment' as type, p.created_at, s.name as student_name, p.amount
      FROM payments p
      JOIN students s ON p.student_id = s.id
      ORDER BY p.created_at DESC
      LIMIT 5
    `);

    // Recent allocations
    const [recentAllocations] = await db.query(`
      SELECT 'allocation' as type, sa.created_at, s.name as student_name, st.seat_number, sa.shift
      FROM seat_allocations sa
      JOIN students s ON sa.student_id = s.id
      JOIN seats st ON sa.seat_id = st.id
      ORDER BY sa.created_at DESC
      LIMIT 5
    `);

    // Combine and sort
    const activity = [...recentPayments, ...recentAllocations]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10);

    res.json(activity);
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

module.exports = router;
