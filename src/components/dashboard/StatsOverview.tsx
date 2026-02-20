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

  const isAdmin = currentUser?.roles?.includes('admin');

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

        // Map colors to actual gradients and shadows
        const getBgGradient = (c: string) => {
          if (c === 'primary') return 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30';
          if (c === 'success') return 'bg-gradient-to-br from-emerald-400 to-green-600 shadow-emerald-500/30';
          if (c === 'warning') return 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/30';
          return 'bg-gradient-to-br from-gray-500 to-slate-600 shadow-gray-500/30';
        };

        const getCardBorder = (c: string) => {
          if (c === 'primary') return 'group-hover:border-blue-500/30';
          if (c === 'success') return 'group-hover:border-emerald-500/30';
          if (c === 'warning') return 'group-hover:border-amber-500/30';
          return 'group-hover:border-border/50';
        };

        return (
          <Card key={index} className={`group relative overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${getCardBorder(stat.color)}`}>
            {/* Subtle gradient background on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br from-${stat.color}/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl shadow-lg ${getBgGradient(stat.color)} text-white`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4 flex items-center bg-background/50 w-fit px-2.5 py-1 rounded-full border border-border/50">
                <span className={`text-xs font-semibold flex items-center ${stat.changeType === 'increase' ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                  {stat.changeType === 'increase' ? '+' : ''}{stat.change}
                </span>
                <span className="text-[10px] text-muted-foreground ml-1.5 uppercase tracking-wider font-medium">
                  geçen aydan
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}