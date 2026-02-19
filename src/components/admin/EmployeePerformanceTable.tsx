import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAdmin } from '@/hooks/useAdmin';
import { useKPI } from '@/hooks/useKPI';
import { useTickets } from '@/hooks/useTickets';
import { useCalendar } from '@/hooks/useCalendar';
import { useCategories } from '@/hooks/useCategories';
import { Users, Clock, TrendingUp, Award, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export const EmployeePerformanceTable = () => {
  const { filteredProfiles, loading: adminLoading, error, filters } = useAdmin();
  const { kpiStats, loading: kpiLoading } = useKPI();
  const { tickets, loading: ticketsLoading } = useTickets();
  const { activities, loading: calendarLoading } = useCalendar();
  const { categories } = useCategories();

  const loading = adminLoading || kpiLoading || ticketsLoading || calendarLoading;

  const employeeStats = useMemo(() => {
    if (!filteredProfiles || filteredProfiles.length === 0) return [];

    return filteredProfiles.map(profile => {
      const userKPIs = kpiStats.filter(k => k.assignedUsers?.includes(profile.id));
      const kpiCount = userKPIs.length;
      const completedKPIs = userKPIs.filter(k => k.status === 'success' || k.progressPercentage >= 100).length;

      // Activity Stats (filtered by date range)
      const userActivities = activities.filter(a => {
        if (a.userId !== profile.id) return false;
        if (filters.startDate && a.date < filters.startDate) return false;
        if (filters.endDate && a.date > filters.endDate) return false;
        return true;
      });
      const totalHours = userActivities.reduce((acc, a) => acc + (a.duration || 0) / 60, 0);
      const entryCount = userActivities.length;
      const averageDailyHours = entryCount > 0 ? totalHours / entryCount : 0;

      // Category Distribution
      const categoryDistribution: Record<string, number> = {};
      userActivities.forEach(a => {
        const catId = a.categoryId;
        categoryDistribution[catId] = (categoryDistribution[catId] || 0) + (a.duration || 0) / 60;
      });

      // Performance Score
      const kpiScore = kpiCount > 0 ? (completedKPIs / kpiCount) * 100 : 0;
      const hoursScore = Math.min((totalHours / 20) * 100, 100);
      const performance = (kpiScore * 0.6) + (hoursScore * 0.4);

      return {
        userId: profile.id,
        name: `${profile.firstName} ${profile.lastName}`,
        initials: `${(profile.firstName || '')[0] || ''}${(profile.lastName || '')[0] || ''}`.toUpperCase(),
        department: profile.department,
        kpiCount,
        completedKPIs,
        performance,
        totalHours,
        averageDailyHours,
        entryCount,
        categoryDistribution
      };
    }).sort((a, b) => b.performance - a.performance);
  }, [filteredProfiles, kpiStats, activities, filters]);

  const getTopCategory = (categoryDistribution: Record<string, number>) => {
    if (!categoryDistribution || Object.keys(categoryDistribution).length === 0) return null;
    const topCategoryId = Object.entries(categoryDistribution)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0];
    return (categories || []).find(cat => cat.id === topCategoryId);
  };

  const getPerformanceColor = (perf: number) => {
    if (perf >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (perf >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    if (perf >= 20) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const getPerformanceIcon = (perf: number) => {
    if (perf >= 60) return <ArrowUpRight className="w-3.5 h-3.5" />;
    if (perf >= 30) return <Minus className="w-3.5 h-3.5" />;
    return <ArrowDownRight className="w-3.5 h-3.5" />;
  };

  if (loading) {
    return (
      <Card className="border-border/50 shadow-sm">
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
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-6 text-center text-destructive">
          <p>Hata: {error}</p>
        </CardContent>
      </Card>
    );
  }

  // Summary stats
  const totalEmployees = employeeStats.length;
  const avgPerformance = totalEmployees > 0
    ? employeeStats.reduce((sum, e) => sum + e.performance, 0) / totalEmployees
    : 0;
  const totalHoursAll = employeeStats.reduce((sum, e) => sum + e.totalHours, 0);

  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Çalışan</p>
                <p className="text-xl font-bold text-foreground">{totalEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Ort. Performans</p>
                <p className="text-xl font-bold text-foreground">{avgPerformance.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Toplam Saat</p>
                <p className="text-xl font-bold text-foreground">{totalHoursAll.toFixed(1)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-3 pt-4 px-5">
          <CardTitle className="flex items-center gap-2 text-base">
            <Award className="w-5 h-5 text-indigo-500" />
            Çalışan Performans Tablosu
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {employeeStats.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              Seçilen kriterlere göre veri bulunamadı
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Table Header */}
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1.2fr_1fr] gap-2 px-5 py-2.5 bg-muted/40 border-y border-border/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <div>Çalışan</div>
                <div className="text-center">Saat</div>
                <div className="text-center">Giriş</div>
                <div className="text-center">KPI</div>
                <div className="text-center">Performans</div>
                <div className="text-right">Kategori</div>
              </div>

              {/* Table Rows */}
              {employeeStats.map((employee, index) => {
                const topCategory = getTopCategory(employee.categoryDistribution);
                const perfClass = getPerformanceColor(employee.performance);

                return (
                  <div
                    key={employee.userId}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr_1.2fr_1fr] gap-2 px-5 py-3.5 items-center border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    {/* Employee */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                        {employee.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{employee.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{employee.department || 'Departman Yok'}</p>
                      </div>
                    </div>

                    {/* Hours */}
                    <div className="text-center">
                      <p className="text-sm font-semibold text-foreground">{employee.totalHours.toFixed(1)}h</p>
                      <p className="text-[10px] text-muted-foreground">{employee.averageDailyHours.toFixed(1)}h/gün</p>
                    </div>

                    {/* Entries */}
                    <div className="text-center">
                      <p className="text-sm font-semibold text-foreground">{employee.entryCount}</p>
                    </div>

                    {/* KPI */}
                    <div className="text-center">
                      <p className="text-sm font-semibold text-foreground">
                        {employee.completedKPIs}/{employee.kpiCount}
                      </p>
                    </div>

                    {/* Performance */}
                    <div className="flex flex-col items-center gap-1">
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${perfClass}`}>
                        {getPerformanceIcon(employee.performance)}
                        {employee.performance.toFixed(1)}%
                      </div>
                      <Progress value={employee.performance} className="h-1.5 w-full max-w-[80px]" />
                    </div>

                    {/* Top Category */}
                    <div className="text-right">
                      {topCategory ? (
                        <Badge
                          variant="outline"
                          className="text-xs border"
                          style={{
                            borderColor: topCategory.color || '#ccc',
                            color: topCategory.color || '#ccc',
                            backgroundColor: `${topCategory.color}10`
                          }}
                        >
                          {topCategory.name}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};