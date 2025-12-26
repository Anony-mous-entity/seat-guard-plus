require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const seatRoutes = require('./routes/seats');
const paymentRoutes = require('./routes/payments');
const allocationRoutes = require('./routes/allocations');
const dashboardRoutes = require('./routes/dashboard');
const reportRoutes = require('./routes/reports');

const { processGracePeriodExpirations } = require('./services/paymentService');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/allocations', allocationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Cron job: Check grace period expirations daily at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily grace period check...');
  try {
    await processGracePeriodExpirations();
    console.log('Grace period check completed');
  } catch (error) {
    console.error('Grace period check failed:', error);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
