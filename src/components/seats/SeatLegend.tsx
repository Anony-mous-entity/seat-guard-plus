export function SeatLegend() {
  const legendItems = [
    { color: 'bg-seat-vacant', label: 'Vacant' },
    { color: 'bg-seat-full', label: 'Full/Dual Shift' },
    { color: 'bg-seat-morning', label: 'Morning Only' },
    { color: 'bg-seat-evening', label: 'Evening Only' },
  ];

  return (
    <div className="flex flex-wrap gap-4">
      {legendItems.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div className={`h-4 w-4 rounded ${item.color}`} />
          <span className="text-sm text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
