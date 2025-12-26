# Library Seat & Payment Management System - Backend

Express.js backend for the Library Management System, designed for Hostinger deployment.

## Features

- **Authentication**: JWT-based admin authentication
- **Student Management**: Full CRUD with history preservation
- **Seat Allocation**: Morning/Evening shift management
- **Payment Tracking**: Advance monthly payment with grace period logic
- **Auto-removal**: Cron job for 15-day grace period enforcement
- **Admin Overrides**: Extend grace periods with audit trail
- **Reports**: Daily collection, monthly summary, defaulters, seat occupancy

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update with your Hostinger MySQL credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
DB_HOST=your_hostinger_mysql_host
DB_USER=your_database_username
DB_PASSWORD=your_database_password
DB_NAME=library_management
DB_PORT=3306
JWT_SECRET=your_super_secret_jwt_key_here
PORT=3000
FRONTEND_URL=https://your-frontend-domain.com
```

### 3. Initialize Database

```bash
npm run db:init
```

This creates all tables and a default admin account:
- Email: `admin@library.com`
- Password: `admin123`

⚠️ **Change the password immediately after first login!**

### 4. Run the Server

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current admin
- `PUT /api/auth/password` - Change password

### Students
- `GET /api/students` - List all students
- `GET /api/students/:id` - Get student with history
- `POST /api/students` - Create student
- `PUT /api/students/:id` - Update student
- `POST /api/students/:id/leave` - Mark as left (voluntary)

### Seats
- `GET /api/seats` - List all seats with occupancy
- `GET /api/seats/:id` - Get seat details
- `GET /api/seats/available/:shift` - Get available seats

### Payments
- `GET /api/payments` - List payments
- `GET /api/payments/pending` - Pending payments list
- `POST /api/payments` - Record payment
- `PUT /api/payments/:id` - Update payment

### Allocations
- `POST /api/allocations` - Allocate seat
- `POST /api/allocations/:id/close` - Close allocation
- `POST /api/allocations/change-shift` - Change shift

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/activity` - Recent activity

### Reports
- `GET /api/reports/daily-collection` - Daily collection
- `GET /api/reports/monthly-summary` - Monthly summary
- `GET /api/reports/defaulters` - Defaulters list
- `GET /api/reports/seat-occupancy` - Seat occupancy

### Admin Overrides
- `GET /api/overrides` - List overrides
- `POST /api/overrides` - Create override
- `DELETE /api/overrides/:id` - Delete override

## Hostinger Deployment

### Option 1: Node.js Hosting

1. Go to Hostinger hPanel → Hosting → Advanced → Node.js
2. Upload the `backend` folder
3. Set entry point to `src/index.js`
4. Configure environment variables in hPanel
5. Run `npm run db:init` via SSH

### Option 2: VPS Hosting

1. SSH into your VPS
2. Install Node.js 18+
3. Clone/upload the backend folder
4. Install PM2: `npm install -g pm2`
5. Configure `.env`
6. Run `npm run db:init`
7. Start with PM2: `pm2 start src/index.js --name library-api`

## Cron Job

The server automatically runs a daily job at midnight to:
- Check for expired grace periods (15+ days overdue)
- Mark students as "left" if no payment received
- Close their seat allocations
- Update payment status

## Security Notes

- Always use HTTPS in production
- Change default admin credentials immediately
- Use strong JWT_SECRET (32+ characters)
- Configure FRONTEND_URL for CORS protection
- Consider rate limiting for production
