import { SeatCard } from './SeatCard';
import { Seat, Student, SeatStatus, ShiftType, Payment } from '@/types/library';
import { mockStudents, mockPayments } from '@/data/mockData';

interface SeatGridProps {
  seats: Seat[];
  onSeatClick?: (seat: Seat) => void;
}

function getSeatStatus(seat: Seat): SeatStatus {
  const hasMorning = !!seat.morningStudentId;
  const hasEvening = !!seat.eveningStudentId;

  if (!hasMorning && !hasEvening) return 'vacant';
  if (hasMorning && hasEvening) return 'full';
  if (hasMorning) return 'morning';
  return 'evening';
}

function getShiftType(seat: Seat): ShiftType | null {
  const hasMorning = !!seat.morningStudentId;
  const hasEvening = !!seat.eveningStudentId;

  if (!hasMorning && !hasEvening) return null;
  if (hasMorning && hasEvening) {
    return seat.morningStudentId === seat.eveningStudentId ? 'full' : 'dual';
  }
  if (hasMorning) return 'morning';
  return 'evening';
}

function getStudent(studentId?: string): Student | undefined {
  if (!studentId) return undefined;
  return mockStudents.find((s) => s.id === studentId);
}

function getPaymentStatus(studentId?: string): 'paid' | 'pending' | 'late' | undefined {
  if (!studentId) return undefined;
  const payment = mockPayments.find((p) => p.studentId === studentId);
  if (!payment) return undefined;
  return payment.status as 'paid' | 'pending' | 'late';
}

export function SeatGrid({ seats, onSeatClick }: SeatGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {seats.map((seat) => {
        const status = getSeatStatus(seat);
        const shiftType = getShiftType(seat);
        const morningStudent = getStudent(seat.morningStudentId);
        const eveningStudent = getStudent(seat.eveningStudentId);
        const morningPaymentStatus = getPaymentStatus(seat.morningStudentId);
        const eveningPaymentStatus = getPaymentStatus(seat.eveningStudentId);

        return (
          <SeatCard
            key={seat.id}
            seat={seat}
            status={status}
            shiftType={shiftType}
            morningStudent={morningStudent}
            eveningStudent={eveningStudent}
            morningPaymentStatus={morningPaymentStatus}
            eveningPaymentStatus={eveningPaymentStatus}
            onClick={() => onSeatClick?.(seat)}
          />
        );
      })}
    </div>
  );
}
