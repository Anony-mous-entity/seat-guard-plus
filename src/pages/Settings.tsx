import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings as SettingsIcon, Bell, IndianRupee, Clock, Shield } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Configure your library management system
        </p>
      </div>

      {/* General Settings */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <SettingsIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">General</h2>
            <p className="text-sm text-muted-foreground">Basic system configuration</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="library-name">Library Name</Label>
            <Input id="library-name" defaultValue="City Central Library" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="total-seats">Total Seats</Label>
            <Input id="total-seats" type="number" defaultValue="20" />
          </div>
        </div>
      </div>

      {/* Payment Settings */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <IndianRupee className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Payment</h2>
            <p className="text-sm text-muted-foreground">Fee structure and billing</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="full-shift-fee">Full Shift Fee (₹)</Label>
              <Input id="full-shift-fee" type="number" defaultValue="2000" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="half-shift-fee">Half Shift Fee (₹)</Label>
              <Input id="half-shift-fee" type="number" defaultValue="1200" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="billing-cycle">Billing Cycle</Label>
            <Input id="billing-cycle" defaultValue="Monthly (Advance)" disabled />
            <p className="text-xs text-muted-foreground">
              Payment is always collected in advance for the upcoming month
            </p>
          </div>
        </div>
      </div>

      {/* Grace Period Settings */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Grace Period</h2>
            <p className="text-sm text-muted-foreground">Payment tolerance settings</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="grace-days">Grace Period (Days)</Label>
            <Input id="grace-days" type="number" defaultValue="15" />
            <p className="text-xs text-muted-foreground">
              Students have this many days after their cycle ends to make payment
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-remove after grace period</Label>
              <p className="text-xs text-muted-foreground">
                Automatically mark students as "Left" after grace period expires
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
            <p className="text-sm text-muted-foreground">Alert preferences</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Payment reminders</Label>
              <p className="text-xs text-muted-foreground">
                Send reminders before payment due date
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator className="bg-border" />
          <div className="flex items-center justify-between">
            <div>
              <Label>Overdue alerts</Label>
              <p className="text-xs text-muted-foreground">
                Notify when payments become overdue
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator className="bg-border" />
          <div className="flex items-center justify-between">
            <div>
              <Label>Grace period warnings</Label>
              <p className="text-xs text-muted-foreground">
                Alert when grace period is about to expire
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>

      {/* Admin Override */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Admin Override</h2>
            <p className="text-sm text-muted-foreground">Special permissions</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Allow grace period extension</Label>
              <p className="text-xs text-muted-foreground">
                Admin can extend grace period for individual students
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator className="bg-border" />
          <div className="flex items-center justify-between">
            <div>
              <Label>Require override reason</Label>
              <p className="text-xs text-muted-foreground">
                Mandatory reason for all admin overrides (audit trail)
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button size="lg">Save Changes</Button>
      </div>
    </div>
  );
}
