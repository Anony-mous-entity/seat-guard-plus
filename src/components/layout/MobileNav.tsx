import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Armchair,
  Users,
  CreditCard,
  Clock,
  FileText,
  Settings,
  Library,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Armchair, label: 'Seats', path: '/seats' },
  { icon: Users, label: 'Students', path: '/students' },
  { icon: CreditCard, label: 'Payments', path: '/payments' },
  { icon: Clock, label: 'Pending', path: '/pending' },
  { icon: FileText, label: 'Reports', path: '/reports' },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-sidebar border-b border-sidebar-border lg:hidden">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Library className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold text-foreground">LibraryDesk</span>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64 bg-sidebar border-sidebar-border p-0">
            <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
              <span className="font-semibold text-foreground">Menu</span>
            </div>
            <nav className="space-y-1 p-3">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                    )}
                  >
                    <item.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
                    {item.label}
                  </NavLink>
                );
              })}
              <div className="my-2 border-t border-sidebar-border" />
              <NavLink
                to="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-all duration-200"
              >
                <Settings className="h-5 w-5" />
                Settings
              </NavLink>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
