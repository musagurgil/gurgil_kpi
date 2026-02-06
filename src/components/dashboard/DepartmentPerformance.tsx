import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";

export function DepartmentPerformance() {
  const { stats, loading } = useDashboard();
  
  // Mock department performance data
  const departmentPerformance = [
    { name: 'Satış', performance: 85, change: 12 },
    { name: 'IT', performance: 92, change: 8 },
    { name: 'Pazarlama', performance: 78, change: -5 },
    { name: 'İnsan Kaynakları', performance: 88, change: 15 }
  ];

  if (loading) {
    return (
      <Card className="shadow-card">
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
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Departman Performansı</CardTitle>
        </CardHeader>
        
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Henüz departman verisi bulunmamaktadır.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Departman Performansı</CardTitle>
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
                  <span className={`text-xs ${
                    dept.changeType === 'increase' ? 'text-kpi-success' : 'text-kpi-danger'
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