import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Target, Ticket, Clock } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { cn } from "@/lib/utils";

export function RecentActivities() {
  const { stats, loading } = useDashboard();

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-start gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentActivities = stats?.recentActivities || [];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'kpi_progress':
        return Target;
      case 'ticket_update':
        return Ticket;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'kpi_progress':
        return 'text-primary bg-primary/10';
      case 'ticket_update':
        return 'text-warning bg-warning/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);

    if (isNaN(time.getTime())) return 'Tarih bilinmiyor';

    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays === 1) return 'Dün';
    if (diffDays < 7) return `${diffDays} gün önce`;

    // Format date for older activities
    return time.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="shadow-card hover:shadow-elevated transition-smooth">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Son Aktiviteler
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {recentActivities.length} aktivite
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {recentActivities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Henüz aktivite yok</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivities.map((activity: any) => {
              const Icon = getActivityIcon(activity.type);
              const iconColor = getActivityColor(activity.type);

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className={cn("p-2 rounded-lg shrink-0", iconColor)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {activity.title}
                    </p>
                    {activity.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

