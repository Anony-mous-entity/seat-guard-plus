import { useState } from 'react';
import { format } from 'date-fns';
import { mockStudents, mockPayments } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, Calendar, IndianRupee } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatusFilter = 'all' | 'paid' | 'pending' | 'late';

export default function Payments() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const getStudent = (studentId: string) => {
    return mockStudents.find((s) => s.id === studentId);
  };

  const filteredPayments = mockPayments.filter((payment) => {
    const student = getStudent(payment.studentId);
    const matchesSearch =
      student?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student?.phone.includes(searchQuery);

    const matchesStatus =
      statusFilter === 'all' || payment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: string) => {
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

  const totalCollection = mockPayments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = mockPayments
    .filter((p) => p.status === 'pending' || p.status === 'late')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground">Track and manage all payment records</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Record Payment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <IndianRupee className="h-4 w-4" />
            <span className="text-sm">Total Collected</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            ₹{totalCollection.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-status-pending/30 bg-status-pending/10 p-4">
          <div className="flex items-center gap-2 text-status-pending mb-1">
            <IndianRupee className="h-4 w-4" />
            <span className="text-sm">Pending</span>
          </div>
          <p className="text-2xl font-bold text-status-pending">
            ₹{pendingAmount.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-status-paid/30 bg-status-paid/10 p-4">
          <p className="text-2xl font-bold text-status-paid">
            {mockPayments.filter((p) => p.status === 'paid').length}
          </p>
          <p className="text-sm text-muted-foreground">Paid</p>
        </div>
        <div className="rounded-lg border border-status-late/30 bg-status-late/10 p-4">
          <p className="text-2xl font-bold text-status-late">
            {mockPayments.filter((p) => p.status === 'late').length}
          </p>
          <p className="text-sm text-muted-foreground">Overdue</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'paid', 'pending', 'late'] as StatusFilter[]).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground font-semibold">Student</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Amount</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Period</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Paid On</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No payments found
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => {
                const student = getStudent(payment.studentId);
                return (
                  <TableRow key={payment.id} className="border-border">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                          {student?.name.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {student?.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground">{student?.phone}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-foreground">
                        ₹{payment.amount.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(payment.periodStart, 'dd MMM')} -{' '}
                        {format(payment.periodEnd, 'dd MMM yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">
                        {format(payment.paidDate, 'dd MMM yyyy')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'px-2.5 py-1 rounded-full text-xs font-medium',
                          getStatusStyle(payment.status)
                        )}
                      >
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
