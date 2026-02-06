import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bell, Search, Settings, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/hooks/useDashboard";

export function DashboardHeader() {
  const { profile } = useAuth();
  const { stats } = useDashboard();
  
  // Count urgent notifications (critical tickets, overdue items, etc.)
  const urgentNotifications = stats?.recentActivities?.filter(activity => 
    activity.type === 'ticket_created'
  ).length || 0;

  return (
    <header className="bg-card border-b border-border px-6 py-4 shadow-card">
      <div className="flex items-center justify-between">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Genel performans özeti ve KPI takibi - {profile?.first_name} {profile?.last_name}
          </p>
        </div>

        {/* Search and Actions */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="KPI, ticket, kullanıcı ara..." 
              className="pl-10 w-64"
            />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            {urgentNotifications > 0 && (
              <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-destructive text-destructive-foreground text-xs p-0">
                {urgentNotifications}
              </Badge>
            )}
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>

          {/* Profile */}
          <Button variant="ghost" size="icon">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}