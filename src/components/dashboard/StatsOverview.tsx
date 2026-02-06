import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Target, Users, Ticket } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";

export function StatsOverview() {
  const { stats: dashboardStats, loading, currentUser } = useDashboard();

  // Calculate user-specific percentages
  const userKPIProgressPercentage = dashboardStats?.userKPIs > 0 
    ? (dashboardStats?.userCompletedKPIs / dashboardStats?.userKPIs) * 100 
    : 0;

  const isAdmin = currentUser?.role === 'admin';
  
  const stats = [
    {
      title: isAdmin ? "Toplam KPI'lar" : "Benim KPI'larım",
      value: dashboardStats?.userKPIs?.toString() || "0",
      change: `${userKPIProgressPercentage >= 0 ? '+' : ''}${userKPIProgressPercentage.toFixed(1)}%`,
      changeType: userKPIProgressPercentage >= 50 ? "increase" as const : "decrease" as const,
      icon: Target,
      color: "primary",
      description: isAdmin ? "Sistemdeki tüm KPI'lar" : "Size atanan KPI'lar"
    },
    {
      title: "Atanan Ticket'lar",
      value: dashboardStats?.userAssignedTickets?.toString() || "0",
      change: dashboardStats?.userTickets > 0 
        ? `${((dashboardStats?.userAssignedTickets / dashboardStats?.userTickets) * 100).toFixed(0)}%`
        : "0%",
      changeType: "increase" as const,
      icon: Ticket,
      color: "warning",
      description: "Size atanan ticket'lar"
    },
    {
      title: "Tamamlanan KPI",
      value: dashboardStats?.userCompletedKPIs?.toString() || "0",
      change: `${userKPIProgressPercentage >= 0 ? '+' : ''}${userKPIProgressPercentage.toFixed(1)}%`,
      changeType: userKPIProgressPercentage >= 50 ? "increase" as const : "decrease" as const,
      icon: Users,
      color: "success",
      description: isAdmin ? "Tamamlanan KPI'lar" : "Tamamlanan KPI'larınız"
    },
    {
      title: "Aktif KPI",
      value: dashboardStats?.userActiveKPIs?.toString() || "0",
      change: dashboardStats?.userKPIs > 0
        ? `${((dashboardStats?.userActiveKPIs / dashboardStats?.userKPIs) * 100).toFixed(0)}%`
        : "0%",
      changeType: "increase" as const,
      icon: TrendingUp,
      color: "primary",
      description: isAdmin ? "Devam eden KPI'lar" : "Devam eden KPI'larınız"
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="w-12 h-12 rounded-lg" />
              </div>
              <div className="mt-4">
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="shadow-card hover:shadow-elevated transition-smooth">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg bg-gradient-${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <div className="mt-4 flex items-center">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'increase' ? 'text-kpi-success' : 'text-kpi-danger'
                }`}>
                  {stat.change}
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  geçen aya göre
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}