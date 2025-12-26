export type Shift = 'morning' | 'evening';
export type ShiftType = 'full' | 'dual' | 'morning' | 'evening';
export type PaymentStatus = 'paid' | 'pending' | 'late' | 'left';
export type SeatStatus = 'vacant' | 'full' | 'morning' | 'evening';

export interface Student {
  id: string;
  name: string;
  phone: string;
  email?: string;
  joinDate: Date;
  status: 'active' | 'left';
  leftDate?: Date;
  leftReason?: string;
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  periodStart: Date;
  periodEnd: Date;
  paidDate: Date;
  status: PaymentStatus;
  notes?: string;
}

export interface SeatAllocation {
  id: string;
  seatId: string;
  studentId: string;
  shift: Shift;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  closedReason?: string;
}

export interface Seat {
  id: string;
  number: number;
  morningStudentId?: string;
  eveningStudentId?: string;
}

export interface AdminOverride {
  id: string;
  studentId: string;
  reason: string;
  originalDueDate: Date;
  extendedDueDate: Date;
  createdAt: Date;
}

// Derived types for UI
export interface SeatWithDetails extends Seat {
  status: SeatStatus;
  shiftType: ShiftType | null;
  morningStudent?: Student;
  eveningStudent?: Student;
}

export interface StudentWithPayment extends Student {
  currentSeat?: Seat;
  currentShift?: Shift;
  currentPayment?: Payment;
  paymentStatus: PaymentStatus;
  daysUntilDue?: number;
  daysOverdue?: number;
}

export interface PendingPayment {
  student: Student;
  seatNumber: number;
  shift: Shift;
  dueDate: Date;
  daysPending: number;
  status: 'pending' | 'late';
}
