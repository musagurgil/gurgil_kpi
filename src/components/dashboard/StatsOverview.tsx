import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Target, Users, Ticket } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";

export function StatsOverview() {
  const { stats: dashboardStats, loading } = useDashboard();

  const stats = [
    {
      title: "Toplam KPI",
      value: dashboardStats?.totalKPIs?.toString() || "0",
      change: `${(dashboardStats?.totalKPIsChange || 0) >= 0 ? '+' : ''}${dashboardStats?.totalKPIsChange || 0}%`,
      changeType: (dashboardStats?.totalKPIsChange || 0) >= 0 ? "increase" as const : "decrease" as const,
      icon: Target,
      color: "primary"
    },
    {
      title: "Aktif Ticket",
      value: dashboardStats?.openTickets?.toString() || "0",
      change: `${(dashboardStats?.ticketCompletionPercentage || 0) >= 0 ? '+' : ''}${(dashboardStats?.ticketCompletionPercentage || 0).toFixed(1)}%`,
      changeType: (dashboardStats?.ticketCompletionPercentage || 0) >= 0 ? "increase" as const : "decrease" as const,
      icon: Ticket,
      color: "warning"
    },
    {
      title: "Tamamlanan KPI",
      value: dashboardStats?.completedKPIs?.toString() || "0",
      change: `${(dashboardStats?.kpiProgressPercentage || 0) >= 0 ? '+' : ''}${(dashboardStats?.kpiProgressPercentage || 0).toFixed(1)}%`,
      changeType: (dashboardStats?.kpiProgressPercentage || 0) >= 0 ? "increase" as const : "decrease" as const,
      icon: Users,
      color: "success"
    },
    {
      title: "Aktif KPI",
      value: dashboardStats?.activeKPIs?.toString() || "0",
      change: `${(dashboardStats?.kpiProgressPercentage || 0) >= 0 ? '+' : ''}${(dashboardStats?.kpiProgressPercentage || 0).toFixed(1)}%`,
      changeType: (dashboardStats?.kpiProgressPercentage || 0) >= 0 ? "increase" as const : "decrease" as const,
      icon: TrendingUp,
      color: "primary"
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