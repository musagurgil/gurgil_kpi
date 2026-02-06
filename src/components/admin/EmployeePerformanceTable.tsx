import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAdmin } from '@/hooks/useAdmin';
import { useKPI } from '@/hooks/useKPI';
import { useTickets } from '@/hooks/useTickets';
import { useCalendar } from '@/hooks/useCalendar';
import { useCategories } from '@/hooks/useCategories';
import { Users, Clock, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export const EmployeePerformanceTable = () => {
  const { profiles, loading: adminLoading, error } = useAdmin();
  const { kpiStats, loading: kpiLoading } = useKPI();
  const { tickets, loading: ticketsLoading } = useTickets();
  const { activities, loading: calendarLoading } = useCalendar();
  const { categories } = useCategories();

  const loading = adminLoading || kpiLoading || ticketsLoading || calendarLoading;

  const employeeStats = useMemo(() => {
    if (!profiles || profiles.length === 0) return [];

    return profiles.map(profile => {
      // KPI Stats
      const userKPIs = kpiStats.filter(k => k.assignedToId === profile.id);
      const kpiCount = userKPIs.length;
      const completedKPIs = userKPIs.filter(k => k.status === 'success' || k.progressPercentage >= 100).length;

      // Activity Stats
      const userActivities = activities.filter(a => a.userId === profile.id);
      const totalHours = userActivities.reduce((acc, a) => acc + (a.duration || 0) / 60, 0);
      const entryCount = userActivities.length;

      // Calculate average daily hours (assuming activity over last 30 days roughly, or just simple avg per entry for now if no date range)
      // Ideally we filter by date range, but here we take all time avg per entry or similar metric
      const averageDailyHours = entryCount > 0 ? totalHours / entryCount : 0; // Simplified metric for now

      // Category Distribution
      const categoryDistribution: Record<string, number> = {};
      userActivities.forEach(a => {
        const catId = a.categoryId;
        categoryDistribution[catId] = (categoryDistribution[catId] || 0) + (a.duration || 0) / 60;
      });

      // Performance Score (Simple weighted algo)
      // 40% KPI completion rate
      // 40% Activity hours (capped at 160h/month ~ 100%)
      // 20% Ticket resolution (if applicable) -> Skipping for now as tickets might not be assigned to everyone

      const kpiScore = kpiCount > 0 ? (completedKPIs / kpiCount) * 100 : 0;
      const hoursScore = Math.min((totalHours / 20) * 100, 100); // Dummy baseline: 20 hours = 100% for demo
      const performance = (kpiScore * 0.6) + (hoursScore * 0.4);

      const lastActivity = userActivities.length > 0
        ? userActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
        : null;

      return {
        userId: profile.id,
        name: `${profile.firstName} ${profile.lastName}`,
        department: profile.department,
        kpiCount,
        completedKPIs,
        performance,
        lastActivity,
        totalHours,
        averageDailyHours,
        entryCount,
        categoryDistribution
      };
    }).sort((a, b) => b.performance - a.performance);

  }, [profiles, kpiStats, activities]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <p>Hata: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTopCategory = (categoryDistribution: { [categoryId: string]: number } | null | undefined) => {
    if (!categoryDistribution || Object.keys(categoryDistribution).length === 0) return null;

    const topCategoryId = Object.entries(categoryDistribution)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0];

    return (categories || []).find(cat => cat.id === topCategoryId);
  };

  const maxHours = employeeStats && employeeStats.length > 0
    ? Math.max(...employeeStats.map(emp => emp.totalHours || 0), 1)
    : 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Çalışan Performans Tablosu
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!employeeStats || employeeStats.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Seçilen kriterlere göre veri bulunamadı
          </div>
        ) : (
          <div className="space-y-4">
            {employeeStats.map(employee => {
              const topCategory = getTopCategory(employee.categoryDistribution || {});
              const performancePercentage = employee.performance;

              return (
                <div key={employee.userId || Math.random()} className="p-4 border border-border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-foreground">{employee.name || 'İsimsiz'}</h4>
                      <p className="text-sm text-muted-foreground">{employee.department || 'Departman Yok'}</p>
                    </div>
                    {topCategory && (
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: topCategory.color || '#ccc',
                          color: topCategory.color || '#ccc'
                        }}
                      >
                        En Çok: {topCategory.name || 'Kategori'}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-sm text-muted-foreground">Toplam:</span>
                      <span className="font-medium text-foreground">
                        {(employee.totalHours || 0).toFixed(1)}h
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-success" />
                      <span className="text-sm text-muted-foreground">Ortalama:</span>
                      <span className="font-medium text-foreground">
                        {(employee.averageDailyHours || 0).toFixed(1)}h/gün
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-warning" />
                      <span className="text-sm text-muted-foreground">Giriş:</span>
                      <span className="font-medium text-foreground">
                        {employee.entryCount || 0}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Performans Skoru</span>
                      <span className="text-sm font-medium text-foreground">
                        {(performancePercentage || 0).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={performancePercentage || 0} className="h-2" />
                  </div>

                  {/* Category breakdown */}
                  <div className="mt-4 space-y-2">
                    <h5 className="text-sm font-medium text-foreground">Kategori Dağılımı:</h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {(categories || []).map(category => {
                        const hours = (employee.categoryDistribution || {})[category.id] || 0;
                        if (hours === 0) return null;

                        return (
                          <div key={category.id || Math.random()} className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: category.color || '#ccc' }}
                            />
                            <span className="text-xs text-muted-foreground truncate">
                              {category.name || 'Kategori'}: {hours.toFixed(1)}h
                            </span>
                          </div>
                        );
                      })}
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
};