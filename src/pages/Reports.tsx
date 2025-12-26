import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { mockStudents, mockPayments, mockSeats, getDashboardStats } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar, IndianRupee, Users, Armchair } from 'lucide-react';

export default function Reports() {
  const stats = getDashboardStats();
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  // Calculate monthly stats
  const thisMonthPayments = mockPayments.filter(
    (p) => p.paidDate >= monthStart && p.paidDate <= monthEnd
  );
  const thisMonthCollection = thisMonthPayments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  // Expected collection (all active students)
  const activeStudents = mockStudents.filter((s) => s.status === 'active');
  const expectedCollection = activeStudents.length * 1500; // Average fee

  // Occupancy breakdown
  const fullShiftSeats = mockSeats.filter(
    (s) => s.morningStudentId && s.morningStudentId === s.eveningStudentId
  ).length;
  const dualShiftSeats = mockSeats.filter(
    (s) => s.morningStudentId && s.eveningStudentId && s.morningStudentId !== s.eveningStudentId
  ).length;
  const morningOnlySeats = mockSeats.filter(
    (s) => s.morningStudentId && !s.eveningStudentId
  ).length;
  const eveningOnlySeats = mockSeats.filter(
    (s) => !s.morningStudentId && s.eveningStudentId
  ).length;
  const vacantSeats = mockSeats.filter(
    (s) => !s.morningStudentId && !s.eveningStudentId
  ).length;

  // Defaulters
  const defaulters = mockPayments.filter((p) => p.status === 'late');

  const reports = [
    {
      title: 'Daily Collection Report',
      description: 'Payments received today',
      icon: Calendar,
      action: 'Generate',
    },
    {
      title: 'Monthly Summary',
      description: 'Complete monthly financial overview',
      icon: FileText,
      action: 'Generate',
    },
    {
      title: 'Defaulters List',
      description: 'Students with overdue payments',
      icon: Users,
      action: 'Export',
    },
    {
      title: 'Seat Occupancy Report',
      description: 'Current allocation status',
      icon: Armchair,
      action: 'Generate',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">
            Generate and export management reports
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export All
        </Button>
      </div>

      {/* Monthly Summary Card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {format(today, 'MMMM yyyy')} Summary
            </h2>
            <p className="text-sm text-muted-foreground">Current month overview</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg bg-secondary/50 p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <IndianRupee className="h-4 w-4" />
              <span className="text-sm">Collected</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ₹{thisMonthCollection.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <IndianRupee className="h-4 w-4" />
              <span className="text-sm">Expected</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ₹{expectedCollection.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-4">
            <p className="text-sm text-muted-foreground mb-1">Collection Rate</p>
            <p className="text-2xl font-bold text-foreground">
              {Math.round((thisMonthCollection / expectedCollection) * 100)}%
            </p>
          </div>
          <div className="rounded-lg bg-status-late/10 p-4">
            <p className="text-sm text-muted-foreground mb-1">Pending</p>
            <p className="text-2xl font-bold text-status-late">
              {mockPayments.filter((p) => p.status === 'pending' || p.status === 'late').length}
            </p>
          </div>
        </div>
      </div>

      {/* Seat Occupancy Summary */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Seat Occupancy Summary</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="text-center p-4 rounded-lg bg-seat-full/10 border border-seat-full/20">
            <p className="text-3xl font-bold text-seat-full">{fullShiftSeats}</p>
            <p className="text-sm text-muted-foreground">Full Shift</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-seat-full/10 border border-seat-full/20">
            <p className="text-3xl font-bold text-seat-full">{dualShiftSeats}</p>
            <p className="text-sm text-muted-foreground">Dual Shift</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-seat-morning/10 border border-seat-morning/20">
            <p className="text-3xl font-bold text-seat-morning">{morningOnlySeats}</p>
            <p className="text-sm text-muted-foreground">Morning Only</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-seat-evening/10 border border-seat-evening/20">
            <p className="text-3xl font-bold text-seat-evening">{eveningOnlySeats}</p>
            <p className="text-sm text-muted-foreground">Evening Only</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-seat-vacant/10 border border-seat-vacant/20">
            <p className="text-3xl font-bold text-seat-vacant">{vacantSeats}</p>
            <p className="text-sm text-muted-foreground">Vacant</p>
          </div>
        </div>
      </div>

      {/* Defaulters List */}
      {defaulters.length > 0 && (
        <div className="rounded-xl border border-status-late/30 bg-status-late/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Defaulters List</h2>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
          <div className="space-y-3">
            {defaulters.map((payment) => {
              const student = mockStudents.find((s) => s.id === payment.studentId);
              return (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-status-late/20 text-status-late font-semibold">
                      {student?.name.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{student?.name}</p>
                      <p className="text-xs text-muted-foreground">{student?.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">₹{payment.amount}</p>
                    <p className="text-xs text-muted-foreground">
                      Due: {format(payment.periodEnd, 'dd MMM')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Report Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reports.map((report) => (
          <div
            key={report.title}
            className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 mb-4">
              <report.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">{report.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">{report.description}</p>
            <Button variant="outline" size="sm" className="w-full">
              {report.action}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
