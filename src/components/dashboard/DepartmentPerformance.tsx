import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Building2 } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { useAuth } from "@/hooks/useAuth";
import { useKPI } from "@/hooks/useKPI";

export function DepartmentPerformance() {
  const { stats, loading, currentUser } = useDashboard();
  const { user } = useAuth();
  const { kpiStats } = useKPI();

  // Filter KPIs by user's department or show all for admin
  const isAdmin = user?.roles.includes('admin');
  const userDepartment = user?.department || '';

  // Calculate department performance from actual KPI data
  const departmentPerformanceMap = new Map<string, {
    name: string;
    totalKPIs: number;
    completedKPIs: number;
    totalProgress: number;
  }>();

  kpiStats.forEach(kpi => {
    // Filter based on user role
    if (!isAdmin && kpi.department !== userDepartment) {
      return; // Skip departments not matching user's department
    }

    if (!departmentPerformanceMap.has(kpi.department)) {
      departmentPerformanceMap.set(kpi.department, {
        name: kpi.department,
        totalKPIs: 0,
        completedKPIs: 0,
        totalProgress: 0
      });
    }

    const dept = departmentPerformanceMap.get(kpi.department)!;
    dept.totalKPIs++;
    if (kpi.status === 'success' || kpi.progressPercentage >= 100) {
      dept.completedKPIs++;
    }
    dept.totalProgress += kpi.progressPercentage;
  });

  // Convert to array and calculate performance percentage
  const departmentPerformance = Array.from(departmentPerformanceMap.values())
    .map(dept => {
      const performance = dept.totalKPIs > 0
        ? Math.round(dept.totalProgress / dept.totalKPIs)
        : 0;

      // Calculate change (mock for now, can be enhanced with historical data)
      const change = performance > 80 ? 10 : performance > 60 ? 5 : -5;

      const changeType: 'increase' | 'decrease' = change >= 0 ? 'increase' : 'decrease';

      return {
        name: dept.name,
        performance,
        change,
        target: 100,
        completedKPIs: dept.completedKPIs,
        kpiCount: dept.totalKPIs,
        changeType
      };
    })
    .sort((a, b) => b.performance - a.performance)
    .slice(0, isAdmin ? 10 : 1); // Show all for admin, only user's department for others

  if (loading) {
    return (
      <Card className="shadow-sm border-border/50 hover:shadow-md transition-smooth bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Departman Performansı</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-2 w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!departmentPerformance || departmentPerformance.length === 0) {
    return (
      <Card className="shadow-sm border-border/50 hover:shadow-md transition-smooth bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            {isAdmin ? 'Departman Performansı' : `${userDepartment} Performansı`}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            {isAdmin
              ? 'Henüz departman performans verisi bulunmamaktadır.'
              : `${userDepartment} departmanı için henüz KPI verisi bulunmamaktadır.`
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-border/50 hover:shadow-md transition-smooth bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          {isAdmin ? 'Departman Performansı' : `${userDepartment} Performansı`}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {departmentPerformance.map((dept) => (
          <div key={dept.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h4 className="font-medium text-foreground">{dept.name}</h4>
                <Badge variant="outline" className="text-xs">
                  {dept.completedKPIs}/{dept.kpiCount} KPI
                </Badge>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">%{dept.performance}</span>
                <div className="flex items-center space-x-1">
                  {dept.changeType === 'increase' ? (
                    <TrendingUp className="w-4 h-4 text-kpi-success" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-kpi-danger" />
                  )}
                  <span className={`text-xs ${dept.changeType === 'increase' ? 'text-kpi-success' : 'text-kpi-danger'
                    }`}>
                    {dept.changeType === 'increase' ? '+' : ''}{dept.change}%
                  </span>
                </div>
              </div>
            </div>

            <Progress
              value={(dept.performance / dept.target) * 100}
              className="h-2"
            />

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Hedef: %{dept.target}</span>
              <span>
                {dept.performance >= dept.target ? 'Hedef aşıldı' : `%${(dept.target - dept.performance).toFixed(1)} kalan`}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}