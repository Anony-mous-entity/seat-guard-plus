import { format } from 'date-fns';
import { Student, Payment } from '@/types/library';
import { cn } from '@/lib/utils';
import { Phone, Mail, Calendar, MapPin } from 'lucide-react';

interface StudentCardProps {
  student: Student;
  payment?: Payment;
  seatInfo?: string;
}

export function StudentCard({ student, payment, seatInfo }: StudentCardProps) {
  const getStatusStyle = (status?: string) => {
    switch (status) {
      case 'paid':
        return 'status-paid';
      case 'pending':
        return 'status-pending';
      case 'late':
        return 'status-late';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:shadow-md animate-fade-in',
        student.status === 'left' && 'opacity-60'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-lg">
            {student.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{student.name}</h3>
            <p className="text-xs text-muted-foreground">ID: {student.id}</p>
          </div>
        </div>
        {payment && (
          <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', getStatusStyle(payment.status))}>
            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
          </span>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="h-4 w-4" />
          <span>{student.phone}</span>
        </div>
        {student.email && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span className="truncate">{student.email}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Joined {format(student.joinDate, 'dd MMM yyyy')}</span>
        </div>
        {seatInfo && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Seat {seatInfo}</span>
          </div>
        )}
      </div>

      {student.status === 'left' && student.leftReason && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-status-left">{student.leftReason}</p>
        </div>
      )}
    </div>
  );
}
