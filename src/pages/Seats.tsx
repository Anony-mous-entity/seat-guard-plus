import { useState } from 'react';
import { SeatGrid } from '@/components/seats/SeatGrid';
import { SeatLegend } from '@/components/seats/SeatLegend';
import { mockSeats } from '@/data/mockData';
import { Seat } from '@/types/library';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';

type FilterType = 'all' | 'vacant' | 'full' | 'morning' | 'evening';

export default function Seats() {
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredSeats = mockSeats.filter((seat) => {
    if (filter === 'all') return true;
    if (filter === 'vacant') return !seat.morningStudentId && !seat.eveningStudentId;
    if (filter === 'full') return seat.morningStudentId && seat.eveningStudentId;
    if (filter === 'morning') return seat.morningStudentId && !seat.eveningStudentId;
    if (filter === 'evening') return !seat.morningStudentId && seat.eveningStudentId;
    return true;
  });

  const handleSeatClick = (seat: Seat) => {
    console.log('Seat clicked:', seat);
    // TODO: Open seat details modal
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Seats</h1>
          <p className="text-muted-foreground">
            Manage and view all library seats
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Seat
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {(['all', 'vacant', 'full', 'morning', 'evening'] as FilterType[]).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f === 'all' ? 'All Seats' : f}
            </Button>
          ))}
        </div>
        <SeatLegend />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{mockSeats.length}</p>
          <p className="text-sm text-muted-foreground">Total Seats</p>
        </div>
        <div className="rounded-lg border border-seat-vacant/30 bg-seat-vacant/10 p-4 text-center">
          <p className="text-2xl font-bold text-seat-vacant">
            {mockSeats.filter((s) => !s.morningStudentId && !s.eveningStudentId).length}
          </p>
          <p className="text-sm text-muted-foreground">Vacant</p>
        </div>
        <div className="rounded-lg border border-seat-full/30 bg-seat-full/10 p-4 text-center">
          <p className="text-2xl font-bold text-seat-full">
            {mockSeats.filter((s) => s.morningStudentId && s.eveningStudentId).length}
          </p>
          <p className="text-sm text-muted-foreground">Full/Dual</p>
        </div>
        <div className="rounded-lg border border-primary/30 bg-primary/10 p-4 text-center">
          <p className="text-2xl font-bold text-primary">
            {mockSeats.filter((s) => (s.morningStudentId && !s.eveningStudentId) || (!s.morningStudentId && s.eveningStudentId)).length}
          </p>
          <p className="text-sm text-muted-foreground">Half Shift</p>
        </div>
      </div>

      {/* Seat Grid */}
      <SeatGrid seats={filteredSeats} onSeatClick={handleSeatClick} />
    </div>
  );
}
