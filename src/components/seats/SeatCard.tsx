import { cn } from '@/lib/utils';
import { Seat, Student, SeatStatus, ShiftType } from '@/types/library';
import { User, Sun, Moon, AlertCircle } from 'lucide-react';

interface SeatCardProps {
  seat: Seat;
  status: SeatStatus;
  shiftType: ShiftType | null;
  morningStudent?: Student;
  eveningStudent?: Student;
  morningPaymentStatus?: 'paid' | 'pending' | 'late';
  eveningPaymentStatus?: 'paid' | 'pending' | 'late';
  onClick?: () => void;
}

const statusColors = {
  vacant: 'seat-vacant',
  full: 'seat-full',
  morning: 'seat-morning',
  evening: 'seat-evening',
};

const statusLabels = {
  vacant: 'Vacant',
  full: 'Occupied',
  morning: 'Morning Only',
  evening: 'Evening Only',
};

const shiftTypeLabels: Record<ShiftType, string> = {
  full: 'Full Shift',
  dual: 'Dual Shift (M+E)',
  morning: 'Half Shift – Morning',
  evening: 'Half Shift – Evening',
};

export function SeatCard({
  seat,
  status,
  shiftType,
  morningStudent,
  eveningStudent,
  morningPaymentStatus,
  eveningPaymentStatus,
  onClick,
}: SeatCardProps) {
  const hasPaymentIssue =
    (morningPaymentStatus && morningPaymentStatus !== 'paid') ||
    (eveningPaymentStatus && eveningPaymentStatus !== 'paid');

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative rounded-xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg animate-scale-in',
        statusColors[status]
      )}
    >
      {/* Seat Number */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl font-bold">#{seat.number}</span>
        {hasPaymentIssue && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-background/20">
            <AlertCircle className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Status Label */}
      <div className="mb-3">
        <span className="inline-block rounded-md bg-background/20 px-2 py-1 text-xs font-semibold uppercase tracking-wide">
          {shiftType ? shiftTypeLabels[shiftType] : statusLabels[status]}
        </span>
      </div>

      {/* Student Info */}
      <div className="space-y-2">
        {status !== 'vacant' && (
          <>
            {morningStudent && (
              <div className="flex items-center gap-2 text-sm">
                <Sun className="h-3.5 w-3.5" />
                <span className="font-medium truncate">{morningStudent.name}</span>
                {morningPaymentStatus && morningPaymentStatus !== 'paid' && (
                  <span className={cn(
                    'ml-auto text-xs px-1.5 py-0.5 rounded',
                    morningPaymentStatus === 'pending' ? 'bg-background/30' : 'bg-background/40'
                  )}>
                    {morningPaymentStatus}
                  </span>
                )}
              </div>
            )}
            {eveningStudent && eveningStudent.id !== morningStudent?.id && (
              <div className="flex items-center gap-2 text-sm">
                <Moon className="h-3.5 w-3.5" />
                <span className="font-medium truncate">{eveningStudent.name}</span>
                {eveningPaymentStatus && eveningPaymentStatus !== 'paid' && (
                  <span className={cn(
                    'ml-auto text-xs px-1.5 py-0.5 rounded',
                    eveningPaymentStatus === 'pending' ? 'bg-background/30' : 'bg-background/40'
                  )}>
                    {eveningPaymentStatus}
                  </span>
                )}
              </div>
            )}
          </>
        )}

        {status === 'vacant' && (
          <div className="flex items-center gap-2 text-sm opacity-80">
            <User className="h-3.5 w-3.5" />
            <span>Available for allocation</span>
          </div>
        )}
      </div>
    </div>
  );
}
