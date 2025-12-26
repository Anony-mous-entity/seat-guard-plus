import { Users, Armchair, CreditCard, TrendingUp, AlertCircle, IndianRupee } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { SeatGrid } from '@/components/seats/SeatGrid';
import { SeatLegend } from '@/components/seats/SeatLegend';
import { mockSeats, mockStudents, mockPayments, getDashboardStats } from '@/data/mockData';
import { format } from 'date-fns';

export default function Dashboard() {
  const stats = getDashboardStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your library seat management • {format(new Date(), 'EEEE, dd MMMM yyyy')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Students"
          value={stats.activeStudents}
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Occupied Seats"
          value={`${stats.occupiedSeats}/${stats.totalSeats}`}
          subtitle={`${stats.occupancyRate}% occupancy`}
          icon={Armchair}
          variant="success"
        />
        <StatCard
          title="Pending Payments"
          value={stats.pendingPayments}
          icon={AlertCircle}
          variant={stats.pendingPayments > 0 ? 'warning' : 'default'}
        />
        <StatCard
          title="This Month"
          value={`₹${stats.thisMonthCollection.toLocaleString()}`}
          icon={IndianRupee}
          variant="default"
        />
      </div>

      {/* Seats Overview */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-foreground">Seat Overview</h2>
          <SeatLegend />
        </div>
        <SeatGrid seats={mockSeats} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Full Shift Students</span>
              <span className="font-semibold text-foreground">
                {mockSeats.filter(s => s.morningStudentId && s.morningStudentId === s.eveningStudentId).length}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Dual Shift Seats</span>
              <span className="font-semibold text-foreground">
                {mockSeats.filter(s => s.morningStudentId && s.eveningStudentId && s.morningStudentId !== s.eveningStudentId).length}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Morning Only</span>
              <span className="font-semibold text-foreground">
                {mockSeats.filter(s => s.morningStudentId && !s.eveningStudentId).length}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Evening Only</span>
              <span className="font-semibold text-foreground">
                {mockSeats.filter(s => !s.morningStudentId && s.eveningStudentId).length}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-lg font-semibold text-foreground mb-4">Payment Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-status-paid" />
                <span className="text-muted-foreground">Paid</span>
              </div>
              <span className="font-semibold text-foreground">
                {mockPayments.filter(p => p.status === 'paid').length}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-status-pending" />
                <span className="text-muted-foreground">Pending</span>
              </div>
              <span className="font-semibold text-foreground">
                {mockPayments.filter(p => p.status === 'pending').length}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-status-late" />
                <span className="text-muted-foreground">Late (Grace Period)</span>
              </div>
              <span className="font-semibold text-foreground">
                {mockPayments.filter(p => p.status === 'late').length}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-status-left" />
                <span className="text-muted-foreground">Left Library</span>
              </div>
              <span className="font-semibold text-foreground">
                {mockStudents.filter(s => s.status === 'left').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
