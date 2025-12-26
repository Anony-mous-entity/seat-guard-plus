require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const initDatabase = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 3306,
    multipleStatements: true
  });

  console.log('Connected to MySQL server');

  // Create database if not exists
  await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
  await connection.query(`USE ${process.env.DB_NAME}`);

  console.log('Database selected');

  // Create tables
  const createTables = `
    -- Admins table
    CREATE TABLE IF NOT EXISTS admins (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Students table
    CREATE TABLE IF NOT EXISTS students (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      email VARCHAR(255),
      join_date DATE NOT NULL,
      status ENUM('active', 'left') DEFAULT 'active',
      left_date DATE,
      left_reason TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    -- Seats table
    CREATE TABLE IF NOT EXISTS seats (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      seat_number INT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Seat allocations table
    CREATE TABLE IF NOT EXISTS seat_allocations (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      seat_id VARCHAR(36) NOT NULL,
      student_id VARCHAR(36) NOT NULL,
      shift ENUM('morning', 'evening') NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE,
      is_active BOOLEAN DEFAULT TRUE,
      closed_reason TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (seat_id) REFERENCES seats(id),
      FOREIGN KEY (student_id) REFERENCES students(id)
    );

    -- Payments table
    CREATE TABLE IF NOT EXISTS payments (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      student_id VARCHAR(36) NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      period_start DATE NOT NULL,
      period_end DATE NOT NULL,
      paid_date DATE NOT NULL,
      status ENUM('paid', 'pending', 'late', 'left') DEFAULT 'paid',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id)
    );

    -- Admin overrides table
    CREATE TABLE IF NOT EXISTS admin_overrides (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      student_id VARCHAR(36) NOT NULL,
      reason TEXT NOT NULL,
      original_due_date DATE NOT NULL,
      extended_due_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id)
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
    CREATE INDEX IF NOT EXISTS idx_allocations_active ON seat_allocations(is_active);
    CREATE INDEX IF NOT EXISTS idx_allocations_seat ON seat_allocations(seat_id);
    CREATE INDEX IF NOT EXISTS idx_allocations_student ON seat_allocations(student_id);
    CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_id);
    CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
    CREATE INDEX IF NOT EXISTS idx_payments_period ON payments(period_start, period_end);
  `;

  await connection.query(createTables);
  console.log('Tables created successfully');

  // Create default admin if not exists
  const [admins] = await connection.query('SELECT * FROM admins LIMIT 1');
  if (admins.length === 0) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await connection.query(
      'INSERT INTO admins (email, password, name) VALUES (?, ?, ?)',
      ['admin@library.com', hashedPassword, 'Admin']
    );
    console.log('Default admin created: admin@library.com / admin123');
  }

  // Create default seats (1-50) if not exists
  const [seats] = await connection.query('SELECT COUNT(*) as count FROM seats');
  if (seats[0].count === 0) {
    const seatValues = [];
    for (let i = 1; i <= 50; i++) {
      seatValues.push(`(UUID(), ${i})`);
    }
    await connection.query(`INSERT INTO seats (id, seat_number) VALUES ${seatValues.join(', ')}`);
    console.log('50 seats created');
  }

  await connection.end();
  console.log('Database initialization complete!');
};

initDatabase().catch(console.error);
