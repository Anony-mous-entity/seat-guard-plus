const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// Get all seats with current occupancy
router.get('/', async (req, res) => {
  try {
    const [seats] = await db.query(`
      SELECT 
        s.id, 
        s.seat_number,
        morning.student_id as morning_student_id,
        morning_s.name as morning_student_name,
        morning_s.phone as morning_student_phone,
        evening.student_id as evening_student_id,
        evening_s.name as evening_student_name,
        evening_s.phone as evening_student_phone
      FROM seats s
      LEFT JOIN seat_allocations morning ON s.id = morning.seat_id 
        AND morning.shift = 'morning' 
        AND morning.is_active = TRUE
      LEFT JOIN students morning_s ON morning.student_id = morning_s.id
      LEFT JOIN seat_allocations evening ON s.id = evening.seat_id 
        AND evening.shift = 'evening' 
        AND evening.is_active = TRUE
      LEFT JOIN students evening_s ON evening.student_id = evening_s.id
      ORDER BY s.seat_number
    `);

    // Calculate status for each seat
    const seatsWithStatus = seats.map(seat => {
      let status = 'vacant';
      let shiftType = null;

      const hasMorning = !!seat.morning_student_id;
      const hasEvening = !!seat.evening_student_id;

      if (hasMorning && hasEvening) {
        status = 'full';
        shiftType = seat.morning_student_id === seat.evening_student_id ? 'full' : 'dual';
      } else if (hasMorning) {
        status = 'morning';
        shiftType = 'morning';
      } else if (hasEvening) {
        status = 'evening';
        shiftType = 'evening';
      }

      return {
        ...seat,
        status,
        shiftType
      };
    });

    res.json(seatsWithStatus);
  } catch (error) {
    console.error('Get seats error:', error);
    res.status(500).json({ error: 'Failed to fetch seats' });
  }
});

// Get single seat with allocation history
router.get('/:id', async (req, res) => {
  try {
    const [seats] = await db.query('SELECT * FROM seats WHERE id = ?', [req.params.id]);
    if (seats.length === 0) {
      return res.status(404).json({ error: 'Seat not found' });
    }

    const seat = seats[0];

    // Get current allocations
    const [currentAllocations] = await db.query(`
      SELECT sa.*, s.name as student_name, s.phone as student_phone
      FROM seat_allocations sa
      JOIN students s ON sa.student_id = s.id
      WHERE sa.seat_id = ? AND sa.is_active = TRUE
    `, [req.params.id]);

    // Get allocation history
    const [allocationHistory] = await db.query(`
      SELECT sa.*, s.name as student_name
      FROM seat_allocations sa
      JOIN students s ON sa.student_id = s.id
      WHERE sa.seat_id = ?
      ORDER BY sa.start_date DESC
      LIMIT 50
    `, [req.params.id]);

    res.json({
      ...seat,
      currentAllocations,
      allocationHistory
    });
  } catch (error) {
    console.error('Get seat error:', error);
    res.status(500).json({ error: 'Failed to fetch seat' });
  }
});

// Get available seats for a shift
router.get('/available/:shift', async (req, res) => {
  try {
    const { shift } = req.params;
    if (!['morning', 'evening'].includes(shift)) {
      return res.status(400).json({ error: 'Invalid shift' });
    }

    const [availableSeats] = await db.query(`
      SELECT s.id, s.seat_number
      FROM seats s
      WHERE NOT EXISTS (
        SELECT 1 FROM seat_allocations sa 
        WHERE sa.seat_id = s.id 
        AND sa.shift = ? 
        AND sa.is_active = TRUE
      )
      ORDER BY s.seat_number
    `, [shift]);

    res.json(availableSeats);
  } catch (error) {
    console.error('Get available seats error:', error);
    res.status(500).json({ error: 'Failed to fetch available seats' });
  }
});

module.exports = router;
