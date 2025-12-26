import { mockStudents, mockPayments, mockSeats } from '@/data/mockData';
import { PendingPaymentTable } from '@/components/payments/PendingPaymentTable';
import { PendingPaymentCard } from '@/components/payments/PendingPaymentCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { AlertTriangle, Clock, Bell } from 'lucide-react';
import { differenceInDays } from 'date-fns';

export default function Pending() {
  const isMobile = useIsMobile();
  const today = new Date();

  const pendingPayments = mockPayments.filter(
    (p) => p.status === 'pending' || p.status === 'late'
  );

  const latePayments = pendingPayments.filter((p) => p.status === 'late');
  const criticalPayments = latePayments.filter((p) => {
    const daysPending = differenceInDays(today, p.periodEnd);
    return daysPending >= 10;
  });

  // Prepare data for cards
  const pendingItems = pendingPayments.map((payment) => {
    const student = mockStudents.find((s) => s.id === payment.studentId);
    if (!student) return null;

    const seat = mockSeats.find(
      (s) => s.morningStudentId === student.id || s.eveningStudentId === student.id
    );

    const shift =
      seat?.morningStudentId === student.id && seat?.eveningStudentId === student.id
        ? 'Full'
        : seat?.morningStudentId === student.id
        ? 'Morning'
        : 'Evening';

    return {
      student,
      payment,
      seatNumber: seat?.number || 0,
      shift,
    };
  }).filter(Boolean);

  // Sort by urgency
  pendingItems.sort((a, b) => {
    const aDays = differenceInDays(today, a!.payment.periodEnd);
    const bDays = differenceInDays(today, b!.payment.periodEnd);
    return bDays - aDays;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Pending Payments</h1>
        <p className="text-muted-foreground">
          Track overdue and upcoming payment dues
        </p>
      </div>

      {/* Alert Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-status-pending/10">
            <Clock className="h-6 w-6 text-status-pending" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{pendingPayments.length}</p>
            <p className="text-sm text-muted-foreground">Total Pending</p>
          </div>
        </div>
        <div className="rounded-xl border border-status-late/30 bg-status-late/5 p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-status-late/10">
            <Bell className="h-6 w-6 text-status-late" />
          </div>
          <div>
            <p className="text-2xl font-bold text-status-late">{latePayments.length}</p>
            <p className="text-sm text-muted-foreground">In Grace Period</p>
          </div>
        </div>
        <div className="rounded-xl border border-status-left/30 bg-status-left/5 p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-status-left/10">
            <AlertTriangle className="h-6 w-6 text-status-left" />
          </div>
          <div>
            <p className="text-2xl font-bold text-status-left">{criticalPayments.length}</p>
            <p className="text-sm text-muted-foreground">Removal Imminent</p>
          </div>
        </div>
      </div>

      {/* Grace Period Info */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Grace Period Policy</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Students have a 15-day grace period after their payment cycle ends. If payment is not
              received within this period, the student will be marked as "Left Library" and their
              seat will become vacant.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      {pendingPayments.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-status-paid/10 mx-auto mb-4">
            <Clock className="h-8 w-8 text-status-paid" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">All Caught Up!</h3>
          <p className="text-muted-foreground mt-1">
            No pending payments at the moment.
          </p>
        </div>
      ) : isMobile ? (
        <div className="space-y-4">
          {pendingItems.map((item) => (
            <PendingPaymentCard
              key={item!.payment.id}
              student={item!.student}
              payment={item!.payment}
              seatNumber={item!.seatNumber}
              shift={item!.shift}
            />
          ))}
        </div>
      ) : (
        <PendingPaymentTable
          students={mockStudents}
          payments={mockPayments}
          seats={mockSeats}
        />
      )}
    </div>
  );
}
