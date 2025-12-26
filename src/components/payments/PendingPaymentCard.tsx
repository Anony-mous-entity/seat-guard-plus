import { format, differenceInDays } from 'date-fns';
import { Student, Payment } from '@/types/library';
import { cn } from '@/lib/utils';
import { Phone, Calendar, MapPin, AlertTriangle, Clock } from 'lucide-react';

interface PendingPaymentCardProps {
  student: Student;
  payment: Payment;
  seatNumber: number;
  shift: string;
}

export function PendingPaymentCard({
  student,
  payment,
  seatNumber,
  shift,
}: PendingPaymentCardProps) {
  const today = new Date();
  const daysPending = Math.max(0, differenceInDays(today, payment.periodEnd));
  const isLate = payment.status === 'late';
  const isCritical = isLate && daysPending >= 10;

  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-all duration-200 animate-fade-in',
        isCritical
          ? 'border-status-left/30 bg-status-left/5'
          : isLate
          ? 'border-status-late/30 bg-status-late/5'
          : 'border-status-pending/30 bg-status-pending/5'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full font-semibold text-lg',
              isCritical
                ? 'bg-status-left/20 text-status-left'
                : isLate
                ? 'bg-status-late/20 text-status-late'
                : 'bg-status-pending/20 text-status-pending'
            )}
          >
            {student.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{student.name}</h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              {student.phone}
            </div>
          </div>
        </div>
        <span
          className={cn(
            'px-2.5 py-1 rounded-full text-xs font-medium',
            payment.status === 'pending' ? 'status-pending' : 'status-late'
          )}
        >
          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>
            Seat #{seatNumber} ({shift})
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Due {format(payment.periodEnd, 'dd MMM')}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border/50">
        <div
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
            isCritical && 'bg-status-left/20 text-status-left',
            isLate && !isCritical && 'bg-status-late/20 text-status-late',
            !isLate && 'bg-status-pending/20 text-status-pending'
          )}
        >
          {isCritical ? (
            <>
              <AlertTriangle className="h-3 w-3" />
              {daysPending} days overdue - Removal imminent
            </>
          ) : daysPending > 0 ? (
            <>
              <Clock className="h-3 w-3" />
              {daysPending} days overdue
            </>
          ) : (
            <>
              <Clock className="h-3 w-3" />
              Payment due soon
            </>
          )}
        </div>
      </div>
    </div>
  );
}
