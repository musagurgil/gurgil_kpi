import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { KPICard } from "@/components/dashboard/KPICard";
import { TicketOverview } from "@/components/dashboard/TicketOverview";
import { DepartmentPerformance } from "@/components/dashboard/DepartmentPerformance";
import { Footer } from "@/components/common/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/hooks/useDashboard";

export default function Dashboard() {
  const { criticalKPIs, loading } = useDashboard();

  return (
    <div className="flex-1 bg-dashboard-bg min-h-screen flex flex-col">
      <DashboardHeader />
      
      <main className="p-6 space-y-6 flex-1">
        {/* Stats Overview */}
        <StatsOverview />
        
        {/* KPI Cards */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Kritik KPI'lar</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-card rounded-lg shadow-card p-6">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-8 w-20" />
                    <div className="space-y-2">
                      <Skeleton className="h-2 w-full" />
                      <div className="flex justify-between">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : criticalKPIs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {criticalKPIs.map((kpi, index) => (
                <KPICard key={index} {...kpi} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Henüz KPI verisi bulunmamaktadır.
            </div>
          )}
        </div>
        
        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DepartmentPerformance />
          <TicketOverview />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}