import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, AlertTriangle, Clock } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { cn } from "@/lib/utils";

export function UpcomingDeadlines() {
  const { stats, loading } = useDashboard();

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const upcomingDeadlines = stats?.upcomingDeadlines || [];

  const getPriorityColor = (priority: string, remainingDays: number) => {
    if (remainingDays < 0) return "destructive";
    if (remainingDays <= 1) return "destructive";
    if (remainingDays <= 3) return "default";
    return "secondary";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'danger': return 'kpi-danger';
      case 'warning': return 'kpi-warning';
      case 'success': return 'kpi-success';
      default: return 'primary';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `${Math.abs(diffDays)} gün geçti`;
    } else if (diffDays === 0) {
      return 'Bugün';
    } else if (diffDays === 1) {
      return 'Yarın';
    } else {
      return `${diffDays} gün sonra`;
    }
  };

  return (
    <Card className="shadow-card hover:shadow-elevated transition-smooth">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Yaklaşan Deadline'lar
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {upcomingDeadlines.length} görev
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {upcomingDeadlines.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Yaklaşan deadline yok. Harika! 🎉</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingDeadlines.map((deadline: any, index: number) => {
              const remainingDays = deadline.remainingDays || 0;
              const isOverdue = remainingDays < 0;
              
              return (
                <div
                  key={index}
                  className={cn(
                    "p-3 rounded-lg border transition-colors",
                    isOverdue ? "border-destructive/50 bg-destructive/5" : "border-border bg-muted/30"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-foreground truncate">
                        {deadline.title}
                      </h4>
                      {deadline.department && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {deadline.department}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={getPriorityColor(deadline.priority, remainingDays) as any}
                      className="ml-2 shrink-0"
                    >
                      {formatDate(deadline.endDate)}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Progress
                      value={deadline.progressPercentage}
                      className={cn("h-2", `[&>div]:bg-${getStatusColor(deadline.status)}`)}
                    />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        %{deadline.progressPercentage.toFixed(1)} tamamlandı
                      </span>
                      {isOverdue && (
                        <span className="text-destructive flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Süresi doldu
                        </span>
                      )}
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

