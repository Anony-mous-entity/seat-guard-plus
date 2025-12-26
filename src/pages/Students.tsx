import { useState } from 'react';
import { mockStudents, mockPayments, mockSeats } from '@/data/mockData';
import { StudentTable } from '@/components/students/StudentTable';
import { StudentCard } from '@/components/students/StudentCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, LayoutGrid, List } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

type StatusFilter = 'all' | 'active' | 'left';

export default function Students() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const isMobile = useIsMobile();

  // Always use cards on mobile
  const effectiveViewMode = isMobile ? 'cards' : viewMode;

  const filteredStudents = mockStudents.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.phone.includes(searchQuery) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || student.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Prepare seat info for table
  const seatInfo = mockSeats.flatMap((seat) => {
    const info = [];
    if (seat.morningStudentId) {
      info.push({
        number: seat.number,
        studentId: seat.morningStudentId,
        shift: seat.morningStudentId === seat.eveningStudentId ? 'Full' : 'Morning',
      });
    }
    if (seat.eveningStudentId && seat.eveningStudentId !== seat.morningStudentId) {
      info.push({
        number: seat.number,
        studentId: seat.eveningStudentId,
        shift: 'Evening',
      });
    }
    return info;
  });

  const getSeatInfoForStudent = (studentId: string) => {
    const info = seatInfo.find((s) => s.studentId === studentId);
    return info ? `#${info.number} (${info.shift})` : undefined;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground">
            Manage student records and allocations
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Student
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'left'] as StatusFilter[]).map((status) => (
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
          {!isMobile && (
            <div className="flex gap-1 ml-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('cards')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{mockStudents.length}</p>
          <p className="text-sm text-muted-foreground">Total</p>
        </div>
        <div className="rounded-lg border border-status-paid/30 bg-status-paid/10 p-4 text-center">
          <p className="text-2xl font-bold text-status-paid">
            {mockStudents.filter((s) => s.status === 'active').length}
          </p>
          <p className="text-sm text-muted-foreground">Active</p>
        </div>
        <div className="rounded-lg border border-status-left/30 bg-status-left/10 p-4 text-center">
          <p className="text-2xl font-bold text-status-left">
            {mockStudents.filter((s) => s.status === 'left').length}
          </p>
          <p className="text-sm text-muted-foreground">Left</p>
        </div>
      </div>

      {/* Content */}
      {filteredStudents.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No students found matching your criteria.</p>
        </div>
      ) : effectiveViewMode === 'table' ? (
        <StudentTable
          students={filteredStudents}
          payments={mockPayments}
          seats={seatInfo}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              payment={mockPayments.find((p) => p.studentId === student.id)}
              seatInfo={getSeatInfoForStudent(student.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
