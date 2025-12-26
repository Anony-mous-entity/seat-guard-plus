import { Student, Seat, Payment, SeatAllocation, Shift } from '@/types/library';
import { addDays, subDays, addMonths, subMonths } from 'date-fns';

const today = new Date();

export const mockStudents: Student[] = [
  {
    id: 's1',
    name: 'Rahul Sharma',
    phone: '9876543210',
    email: 'rahul@email.com',
    joinDate: subMonths(today, 6),
    status: 'active',
  },
  {
    id: 's2',
    name: 'Priya Patel',
    phone: '9876543211',
    email: 'priya@email.com',
    joinDate: subMonths(today, 4),
    status: 'active',
  },
  {
    id: 's3',
    name: 'Amit Kumar',
    phone: '9876543212',
    joinDate: subMonths(today, 3),
    status: 'active',
  },
  {
    id: 's4',
    name: 'Neha Singh',
    phone: '9876543213',
    email: 'neha@email.com',
    joinDate: subMonths(today, 5),
    status: 'active',
  },
  {
    id: 's5',
    name: 'Vikram Reddy',
    phone: '9876543214',
    joinDate: subMonths(today, 2),
    status: 'active',
  },
  {
    id: 's6',
    name: 'Sneha Gupta',
    phone: '9876543215',
    email: 'sneha@email.com',
    joinDate: subMonths(today, 7),
    status: 'active',
  },
  {
    id: 's7',
    name: 'Rajesh Verma',
    phone: '9876543216',
    joinDate: subMonths(today, 8),
    status: 'left',
    leftDate: subDays(today, 20),
    leftReason: 'Left library due to non-payment',
  },
  {
    id: 's8',
    name: 'Anita Desai',
    phone: '9876543217',
    email: 'anita@email.com',
    joinDate: subMonths(today, 1),
    status: 'active',
  },
  {
    id: 's9',
    name: 'Karan Malhotra',
    phone: '9876543218',
    joinDate: subDays(today, 45),
    status: 'active',
  },
  {
    id: 's10',
    name: 'Deepika Joshi',
    phone: '9876543219',
    email: 'deepika@email.com',
    joinDate: subMonths(today, 3),
    status: 'left',
    leftDate: subDays(today, 10),
    leftReason: 'Left voluntarily before cycle end',
  },
];

export const mockSeats: Seat[] = Array.from({ length: 20 }, (_, i) => ({
  id: `seat-${i + 1}`,
  number: i + 1,
  morningStudentId: undefined,
  eveningStudentId: undefined,
}));

// Assign students to seats
mockSeats[0].morningStudentId = 's1';
mockSeats[0].eveningStudentId = 's1'; // Full shift

mockSeats[1].morningStudentId = 's2';
mockSeats[1].eveningStudentId = 's3'; // Dual shift

mockSeats[2].morningStudentId = 's4'; // Morning only

mockSeats[3].eveningStudentId = 's5'; // Evening only

mockSeats[4].morningStudentId = 's6';
mockSeats[4].eveningStudentId = 's6'; // Full shift

mockSeats[5].morningStudentId = 's8'; // Morning only

mockSeats[6].eveningStudentId = 's9'; // Evening only

export const mockPayments: Payment[] = [
  // Rahul - Paid (Full shift)
  {
    id: 'p1',
    studentId: 's1',
    amount: 2000,
    periodStart: subDays(today, 15),
    periodEnd: addDays(today, 15),
    paidDate: subDays(today, 16),
    status: 'paid',
  },
  // Priya - Pending (payment due in 5 days)
  {
    id: 'p2',
    studentId: 's2',
    amount: 1200,
    periodStart: subDays(today, 25),
    periodEnd: addDays(today, 5),
    paidDate: subDays(today, 26),
    status: 'pending',
  },
  // Amit - Late (overdue by 8 days, within grace)
  {
    id: 'p3',
    studentId: 's3',
    amount: 1200,
    periodStart: subDays(today, 38),
    periodEnd: subDays(today, 8),
    paidDate: subDays(today, 39),
    status: 'late',
  },
  // Neha - Paid
  {
    id: 'p4',
    studentId: 's4',
    amount: 1200,
    periodStart: subDays(today, 10),
    periodEnd: addDays(today, 20),
    paidDate: subDays(today, 11),
    status: 'paid',
  },
  // Vikram - Pending (due in 3 days)
  {
    id: 'p5',
    studentId: 's5',
    amount: 1200,
    periodStart: subDays(today, 27),
    periodEnd: addDays(today, 3),
    paidDate: subDays(today, 28),
    status: 'pending',
  },
  // Sneha - Paid
  {
    id: 'p6',
    studentId: 's6',
    amount: 2000,
    periodStart: subDays(today, 5),
    periodEnd: addDays(today, 25),
    paidDate: subDays(today, 6),
    status: 'paid',
  },
  // Anita - Paid
  {
    id: 'p8',
    studentId: 's8',
    amount: 1200,
    periodStart: subDays(today, 20),
    periodEnd: addDays(today, 10),
    paidDate: subDays(today, 21),
    status: 'paid',
  },
  // Karan - Late (overdue by 12 days, approaching removal)
  {
    id: 'p9',
    studentId: 's9',
    amount: 1200,
    periodStart: subDays(today, 42),
    periodEnd: subDays(today, 12),
    paidDate: subDays(today, 43),
    status: 'late',
  },
];

export const mockAllocations: SeatAllocation[] = [
  {
    id: 'a1',
    seatId: 'seat-1',
    studentId: 's1',
    shift: 'morning',
    startDate: subMonths(today, 6),
    isActive: true,
  },
  {
    id: 'a2',
    seatId: 'seat-1',
    studentId: 's1',
    shift: 'evening',
    startDate: subMonths(today, 6),
    isActive: true,
  },
  {
    id: 'a3',
    seatId: 'seat-2',
    studentId: 's2',
    shift: 'morning',
    startDate: subMonths(today, 4),
    isActive: true,
  },
  {
    id: 'a4',
    seatId: 'seat-2',
    studentId: 's3',
    shift: 'evening',
    startDate: subMonths(today, 3),
    isActive: true,
  },
  {
    id: 'a5',
    seatId: 'seat-3',
    studentId: 's4',
    shift: 'morning',
    startDate: subMonths(today, 5),
    isActive: true,
  },
  {
    id: 'a6',
    seatId: 'seat-4',
    studentId: 's5',
    shift: 'evening',
    startDate: subMonths(today, 2),
    isActive: true,
  },
  {
    id: 'a7',
    seatId: 'seat-5',
    studentId: 's6',
    shift: 'morning',
    startDate: subMonths(today, 7),
    isActive: true,
  },
  {
    id: 'a8',
    seatId: 'seat-5',
    studentId: 's6',
    shift: 'evening',
    startDate: subMonths(today, 7),
    isActive: true,
  },
  {
    id: 'a9',
    seatId: 'seat-6',
    studentId: 's8',
    shift: 'morning',
    startDate: subMonths(today, 1),
    isActive: true,
  },
  {
    id: 'a10',
    seatId: 'seat-7',
    studentId: 's9',
    shift: 'evening',
    startDate: subDays(today, 45),
    isActive: true,
  },
];

// Stats for dashboard
export const getDashboardStats = () => {
  const activeStudents = mockStudents.filter(s => s.status === 'active').length;
  const occupiedSeats = mockSeats.filter(s => s.morningStudentId || s.eveningStudentId).length;
  const totalSeats = mockSeats.length;
  const pendingPayments = mockPayments.filter(p => p.status === 'pending' || p.status === 'late').length;
  const thisMonthCollection = mockPayments
    .filter(p => p.paidDate >= subDays(today, 30))
    .reduce((sum, p) => sum + p.amount, 0);

  return {
    activeStudents,
    occupiedSeats,
    totalSeats,
    vacantSeats: totalSeats - occupiedSeats,
    pendingPayments,
    thisMonthCollection,
    occupancyRate: Math.round((occupiedSeats / totalSeats) * 100),
  };
};
