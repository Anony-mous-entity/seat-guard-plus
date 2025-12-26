const db = require('../config/database');

/**
 * Process grace period expirations
 * This runs daily via cron job to:
 * 1. Mark students as 'left' if they haven't paid within 15 days after due date
 * 2. Close their seat allocations
 * 3. Update payment status to 'left'
 */
const processGracePeriodExpirations = async () => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Find students with expired grace periods (15 days past due, no active override)
    const [expiredStudents] = await connection.query(`
      SELECT DISTINCT s.id, s.name, p.id as payment_id
      FROM students s
      JOIN seat_allocations sa ON s.id = sa.student_id AND sa.is_active = TRUE
      LEFT JOIN payments p ON s.id = p.student_id 
        AND p.period_end = (SELECT MAX(p2.period_end) FROM payments p2 WHERE p2.student_id = s.id)
      LEFT JOIN admin_overrides ao ON s.id = ao.student_id 
        AND ao.extended_due_date >= CURDATE()
      WHERE s.status = 'active'
        AND p.period_end < DATE_SUB(CURDATE(), INTERVAL 15 DAY)
        AND ao.id IS NULL
    `);

    console.log(`Found ${expiredStudents.length} students with expired grace periods`);

    for (const student of expiredStudents) {
      // Mark student as left
      await connection.query(
        `UPDATE students 
         SET status = 'left', left_date = CURDATE(), left_reason = 'Left library due to non-payment (auto-removed after 15-day grace period)'
         WHERE id = ?`,
        [student.id]
      );

      // Close all active allocations
      await connection.query(
        `UPDATE seat_allocations 
         SET is_active = FALSE, end_date = CURDATE(), closed_reason = 'Auto-closed: Non-payment after grace period'
         WHERE student_id = ? AND is_active = TRUE`,
        [student.id]
      );

      // Update payment status
      if (student.payment_id) {
        await connection.query(
          'UPDATE payments SET status = ? WHERE id = ?',
          ['left', student.payment_id]
        );
      }

      console.log(`Processed expiration for student: ${student.name} (${student.id})`);
    }

    await connection.commit();
    return { processed: expiredStudents.length };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Create admin override to extend grace period
 */
const createAdminOverride = async (studentId, reason, originalDueDate, extendedDueDate) => {
  const [result] = await db.query(
    `INSERT INTO admin_overrides (student_id, reason, original_due_date, extended_due_date)
     VALUES (?, ?, ?, ?)`,
    [studentId, reason, originalDueDate, extendedDueDate]
  );
  
  return result;
};

/**
 * Get payment status for a student
 */
const getStudentPaymentStatus = async (studentId) => {
  const [[latestPayment]] = await db.query(`
    SELECT *, DATEDIFF(period_end, CURDATE()) as days_remaining
    FROM payments 
    WHERE student_id = ? 
    ORDER BY period_end DESC 
    LIMIT 1
  `, [studentId]);

  if (!latestPayment) {
    return { status: 'pending', daysRemaining: null };
  }

  const daysRemaining = latestPayment.days_remaining;

  if (daysRemaining >= 0) {
    return { status: 'paid', daysRemaining, payment: latestPayment };
  } else if (daysRemaining >= -15) {
    return { status: 'pending', daysOverdue: Math.abs(daysRemaining), payment: latestPayment };
  } else {
    return { status: 'late', daysOverdue: Math.abs(daysRemaining), payment: latestPayment };
  }
};

module.exports = {
  processGracePeriodExpirations,
  createAdminOverride,
  getStudentPaymentStatus
};
