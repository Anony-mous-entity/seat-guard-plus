import { format, differenceInDays } from 'date-fns';
import { Student, Payment, Seat } from '@/types/library';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertTriangle, Clock } from 'lucide-react';

interface PendingPaymentTableProps {
  students: Student[];
  payments: Payment[];
  seats: Seat[];
}

interface PendingItem {
  student: Student;
  payment: Payment;
  seatNumber: number;
  shift: string;
  daysPending: number;
}

export function PendingPaymentTable({ students, payments, seats }: PendingPaymentTableProps) {
  const today = new Date();

  const pendingItems: PendingItem[] = payments
    .filter((p) => p.status === 'pending' || p.status === 'late')
    .map((payment) => {
      const student = students.find((s) => s.id === payment.studentId);
      if (!student) return null;

      const seat = seats.find(
        (s) => s.morningStudentId === student.id || s.eveningStudentId === student.id
      );

      const shift =
        seat?.morningStudentId === student.id && seat?.eveningStudentId === student.id
          ? 'Full'
          : seat?.morningStudentId === student.id
          ? 'Morning'
          : 'Evening';

      const daysPending = differenceInDays(today, payment.periodEnd);

      return {
        student,
        payment,
        seatNumber: seat?.number || 0,
        shift,
        daysPending: Math.max(0, daysPending),
      };
    })
    .filter(Boolean) as PendingItem[];

  // Sort by days pending (most urgent first)
  pendingItems.sort((a, b) => b.daysPending - a.daysPending);

  const getUrgencyLevel = (days: number, status: string) => {
    if (status === 'late' && days >= 10) return 'critical';
    if (status === 'late') return 'warning';
    return 'info';
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground font-semibold">Student</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Seat</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Shift</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Due Date</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Days</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No pending payments
              </TableCell>
            </TableRow>
          ) : (
            pendingItems.map((item) => {
              const urgency = getUrgencyLevel(item.daysPending, item.payment.status);
              return (
                <TableRow key={item.payment.id} className="border-border">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                        {item.student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.student.name}</p>
                        <p className="text-xs text-muted-foreground">{item.student.phone}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">#{item.seatNumber}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">{item.shift}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">
                      {format(item.payment.periodEnd, 'dd MMM yyyy')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                        urgency === 'critical' && 'bg-status-left/15 text-status-left',
                        urgency === 'warning' && 'bg-status-late/15 text-status-late',
                        urgency === 'info' && 'bg-status-pending/15 text-status-pending'
                      )}
                    >
                      {urgency === 'critical' ? (
                        <AlertTriangle className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      {item.daysPending > 0 ? `${item.daysPending} days overdue` : 'Due soon'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'px-2.5 py-1 rounded-full text-xs font-medium',
                        item.payment.status === 'pending' ? 'status-pending' : 'status-late'
                      )}
                    >
                      {item.payment.status.charAt(0).toUpperCase() + item.payment.status.slice(1)}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
