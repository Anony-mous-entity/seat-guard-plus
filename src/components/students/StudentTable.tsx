import { format } from 'date-fns';
import { Student, Payment } from '@/types/library';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Phone, Mail, Calendar, AlertCircle } from 'lucide-react';

interface StudentTableProps {
  students: Student[];
  payments: Payment[];
  seats: { number: number; studentId: string; shift: string }[];
}

export function StudentTable({ students, payments, seats }: StudentTableProps) {
  const getPaymentStatus = (studentId: string) => {
    const payment = payments.find((p) => p.studentId === studentId);
    return payment?.status || 'none';
  };

  const getSeatInfo = (studentId: string) => {
    const seat = seats.find((s) => s.studentId === studentId);
    return seat ? `#${seat.number} (${seat.shift})` : '-';
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      paid: 'status-paid',
      pending: 'status-pending',
      late: 'status-late',
      left: 'status-left',
      none: 'bg-muted text-muted-foreground',
    };

    return (
      <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', styles[status])}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground font-semibold">Student</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Contact</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Seat</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Join Date</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Payment</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow
              key={student.id}
              className={cn(
                'border-border transition-colors',
                student.status === 'left' && 'opacity-60'
              )}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{student.name}</p>
                    <p className="text-xs text-muted-foreground">ID: {student.id}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    {student.phone}
                  </div>
                  {student.email && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      {student.email}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className="font-medium">{getSeatInfo(student.id)}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(student.joinDate, 'dd MMM yyyy')}
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(getPaymentStatus(student.id))}</TableCell>
              <TableCell>
                {student.status === 'active' ? (
                  <Badge variant="outline" className="border-status-paid/30 text-status-paid">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-status-left/30 text-status-left">
                    Left
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
