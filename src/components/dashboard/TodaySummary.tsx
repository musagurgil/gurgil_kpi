import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Clock, Calendar, TrendingUp } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { cn } from "@/lib/utils";

export function TodaySummary() {
  const { stats, loading } = useDashboard();

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const { completedToday, dueToday, dueThisWeek } = stats?.todaySummary || {
    completedToday: 0,
    dueToday: 0,
    dueThisWeek: 0,
  };

  const summaryItems = [
    {
      label: "Bugün Tamamlanan",
      value: completedToday,
      icon: CheckCircle2,
      color: "text-kpi-success",
      bgColor: "bg-kpi-success/10",
      badge: completedToday > 0 ? "success" : "secondary"
    },
    {
      label: "Bugün Biten",
      value: dueToday,
      icon: Clock,
      color: "text-kpi-warning",
      bgColor: "bg-kpi-warning/10",
      badge: dueToday > 0 ? "destructive" : "secondary"
    },
    {
      label: "Bu Hafta Biten",
      value: dueThisWeek,
      icon: Calendar,
      color: "text-primary",
      bgColor: "bg-primary/10",
      badge: dueThisWeek > 0 ? "default" : "secondary"
    }
  ];

  return (
    <Card className="shadow-card hover:shadow-elevated transition-smooth">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Günün Özeti</CardTitle>
          <Badge variant="outline" className="text-xs">
            <TrendingUp className="w-3 h-3 mr-1" />
            Bugün
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {summaryItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", item.bgColor)}>
                    <Icon className={cn("w-4 h-4", item.color)} />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {item.label}
                  </span>
                </div>
                <Badge
                  variant={item.badge as any}
                  className={cn(
                    "text-sm font-bold min-w-[2rem] justify-center",
                    item.value === 0 && "opacity-50"
                  )}
                >
                  {item.value}
                </Badge>
              </div>
            );
          })}
        </div>

        {completedToday === 0 && dueToday === 0 && dueThisWeek === 0 && (
          <div className="mt-4 p-4 text-center text-sm text-muted-foreground bg-muted/30 rounded-lg">
            <p>Bugün için yeni görev yok. İyi çalışmalar! ✨</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

