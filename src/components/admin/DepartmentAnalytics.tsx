import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAdmin } from '@/hooks/useAdmin';
import { useCalendar } from '@/hooks/useCalendar';
import { useCategories } from '@/hooks/useCategories';
import { useKPI } from '@/hooks/useKPI';
import { Building2, Users, Clock, BarChart3 } from 'lucide-react';

export const DepartmentAnalytics = () => {
  const { profiles, loading: adminLoading, error } = useAdmin();
  const { activities, loading: calendarLoading } = useCalendar();
  const { categories } = useCategories();
  const { kpiStats, loading: kpiLoading } = useKPI();

  const loading = adminLoading || calendarLoading || kpiLoading;

  const departmentStats = useMemo(() => {
    if (!profiles || profiles.length === 0) return [];

    const statsMap = new Map();

    profiles.forEach(profile => {
      const dept = profile.department || 'Diğer';

      if (!statsMap.has(dept)) {
        statsMap.set(dept, {
          id: dept,
          name: dept,
          department: dept,
          employeeCount: 0,
          totalEmployees: 0,
          totalHours: 0,
          categoryDistribution: {},
          kpiCount: 0,
          completedKPIs: 0
        });
      }

      const deptStats = statsMap.get(dept);
      deptStats.employeeCount += 1;
      deptStats.totalEmployees += 1;

      // Add user hours
      const userActivities = activities.filter(a => a.userId === profile.id);
      const userHours = userActivities.reduce((acc, a) => acc + (a.duration || 0) / 60, 0);
      deptStats.totalHours += userHours;

      // Add category hours
      userActivities.forEach(a => {
        const catId = a.categoryId;
        deptStats.categoryDistribution[catId] = (deptStats.categoryDistribution[catId] || 0) + (a.duration || 0) / 60;
      });

      // Add KPI stats
      const userKPIs = kpiStats.filter(k => k.assignedToId === profile.id);
      deptStats.kpiCount += userKPIs.length;
      deptStats.completedKPIs += userKPIs.filter(k => k.status === 'success').length;
    });

    return Array.from(statsMap.values()).map((d: any) => ({
      ...d,
      averageHours: d.totalEmployees > 0 ? d.totalHours / d.totalEmployees : 0,
      performance: d.kpiCount > 0 ? (d.completedKPIs / d.kpiCount) * 100 : 0 // Simple KPI based perf for dept
    })).sort((a, b) => b.totalHours - a.totalHours);

  }, [profiles, activities, kpiStats]);

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

  const maxHours = departmentStats && departmentStats.length > 0
    ? Math.max(...departmentStats.map(dept => dept.totalHours || 0), 1)
    : 1;
  const totalEmployees = (departmentStats || []).reduce((sum, dept) => sum + (dept.totalEmployees || 0), 0);
  const totalHours = (departmentStats || []).reduce((sum, dept) => sum + (dept.totalHours || 0), 0);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Toplam Departman</p>
                <p className="text-2xl font-bold text-foreground">
                  {departmentStats.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-success/10 rounded-lg">
                <Users className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Toplam Çalışan</p>
                <p className="text-2xl font-bold text-foreground">
                  {totalEmployees}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-warning/10 rounded-lg">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Toplam Saat</p>
                <p className="text-2xl font-bold text-foreground">
                  {(totalHours || 0).toFixed(1)}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Departman Analizi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {departmentStats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Seçilen kriterlere göre departman verisi bulunamadı
            </div>
          ) : (
            (departmentStats || []).map(department => {
              const performancePercentage = Math.min((department.totalHours / 100) * 100, 100); // Demo scaling
              const totalCategoryHours = Object.values<number>(department.categoryDistribution || {})
                .reduce((sum, hours) => sum + (hours || 0), 0);

              return (
                <div key={department.department} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-foreground">
                      {department.department}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{department.totalEmployees} çalışan</span>
                      <span>{(department.totalHours || 0).toFixed(1)}h toplam</span>
                      <span>{(department.averageHours || 0).toFixed(1)}h ortalama</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Aktivite Yoğunluğu</span>
                      <span className="text-sm font-medium text-foreground">
                        {(performancePercentage || 0).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={performancePercentage} className="h-3" />
                  </div>

                  {/* Category Distribution */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h5 className="text-sm font-medium text-foreground">Kategori Dağılımı</h5>
                      {categories.map(category => {
                        const hours = department.categoryDistribution[category.id] || 0;
                        const percentage = totalCategoryHours > 0 ? (hours / totalCategoryHours) * 100 : 0;

                        if (hours === 0) return null;

                        return (
                          <div key={category.id} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: category.color }}
                                />
                                <span className="text-sm text-foreground">
                                  {category.name}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {(hours || 0).toFixed(1)}h ({(percentage || 0).toFixed(1)}%)
                              </div>
                            </div>
                            <Progress
                              value={percentage}
                              className="h-2"
                              style={{
                                '--progress-foreground': category.color
                              } as React.CSSProperties}
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-foreground">Performans Metrikleri</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Çalışan Başına Ortalama:</span>
                          <span className="font-medium text-foreground">
                            {(department.averageHours || 0).toFixed(1)}h
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Toplam Aktivite Saati:</span>
                          <span className="font-medium text-foreground">
                            {(department.totalHours || 0).toFixed(1)}h
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">KPI Başarısı:</span>
                          <span className="font-medium text-foreground">
                            {(department.performance || 0).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};