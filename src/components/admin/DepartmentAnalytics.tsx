import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAdmin } from '@/hooks/useAdmin';
import { useCalendar } from '@/hooks/useCalendar';
import { useCategories } from '@/hooks/useCategories';
import { useKPI } from '@/hooks/useKPI';
import { Building2, Users, Clock, BarChart3, Target } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
  '#f43f5e', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#06b6d4', '#3b82f6', '#6b7280'
];

export const DepartmentAnalytics = () => {
  const { filteredProfiles, loading: adminLoading, error } = useAdmin();
  const { activities, loading: calendarLoading } = useCalendar();
  const { categories } = useCategories();
  const { kpiStats, loading: kpiLoading } = useKPI();

  const loading = adminLoading || calendarLoading || kpiLoading;

  const departmentStats = useMemo(() => {
    if (!filteredProfiles || filteredProfiles.length === 0) return [];

    const statsMap = new Map();

    filteredProfiles.forEach(profile => {
      const dept = profile.department || 'Diğer';

      if (!statsMap.has(dept)) {
        statsMap.set(dept, {
          id: dept, name: dept, department: dept,
          employeeCount: 0, totalEmployees: 0, totalHours: 0,
          categoryDistribution: {}, kpiCount: 0, completedKPIs: 0
        });
      }

      const deptStats = statsMap.get(dept);
      deptStats.employeeCount += 1;
      deptStats.totalEmployees += 1;

      const userActivities = activities.filter(a => a.userId === profile.id);
      const userHours = userActivities.reduce((acc, a) => acc + (a.duration || 0) / 60, 0);
      deptStats.totalHours += userHours;

      userActivities.forEach(a => {
        const catId = a.categoryId;
        deptStats.categoryDistribution[catId] = (deptStats.categoryDistribution[catId] || 0) + (a.duration || 0) / 60;
      });

      const userKPIs = kpiStats.filter(k => k.assignedUsers?.includes(profile.id));
      deptStats.kpiCount += userKPIs.length;
      deptStats.completedKPIs += userKPIs.filter(k => k.status === 'success' || k.progressPercentage >= 100).length;
    });

    return Array.from(statsMap.values()).map((d: any) => ({
      ...d,
      averageHours: d.totalEmployees > 0 ? d.totalHours / d.totalEmployees : 0,
      performance: d.kpiCount > 0 ? (d.completedKPIs / d.kpiCount) * 100 : 0
    })).sort((a, b) => b.totalHours - a.totalHours);
  }, [filteredProfiles, activities, kpiStats]);

  // Chart data
  const barChartData = useMemo(() =>
    departmentStats.map(d => ({
      name: d.department,
      saat: parseFloat(d.totalHours.toFixed(1)),
      çalışan: d.totalEmployees
    }))
    , [departmentStats]);

  const categoryPieData = useMemo(() => {
    const catMap: Record<string, number> = {};
    departmentStats.forEach(d => {
      Object.entries(d.categoryDistribution).forEach(([catId, hours]) => {
        catMap[catId] = (catMap[catId] || 0) + (hours as number);
      });
    });
    return Object.entries(catMap)
      .map(([catId, hours]) => {
        const cat = categories.find(c => c.id === catId);
        return { name: cat?.name || 'Bilinmeyen', value: parseFloat((hours as number).toFixed(1)), color: cat?.color || '#999' };
      })
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [departmentStats, categories]);

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

  const totalEmployees = departmentStats.reduce((sum, d) => sum + d.totalEmployees, 0);
  const totalHours = departmentStats.reduce((sum, d) => sum + d.totalHours, 0);
  const avgKPIPerf = departmentStats.length > 0
    ? departmentStats.reduce((sum, d) => sum + d.performance, 0) / departmentStats.length
    : 0;

  return (
    <div className="space-y-5">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Departman</p>
                <p className="text-xl font-bold text-foreground">{departmentStats.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
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
              <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Toplam Saat</p>
                <p className="text-xl font-bold text-foreground">{totalHours.toFixed(1)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">KPI Başarı</p>
                <p className="text-xl font-bold text-foreground">{avgKPIPerf.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Bar Chart */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-500" />
              Departman Bazlı Aktivite (Saat)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            {barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barChartData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value: number) => [`${value}h`, 'Toplam Saat']}
                  />
                  <Bar dataKey="saat" radius={[0, 6, 6, 0]} maxBarSize={28}>
                    {barChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                Veri bulunamadı
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-500" />
              Kategori Dağılımı (Saat)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            {categoryPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {categoryPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value: number) => [`${value}h`, 'Saat']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                Veri bulunamadı
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Department Details Table */}
      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-3 pt-4 px-5">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-500" />
            Departman Detayları
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {departmentStats.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              Seçilen kriterlere göre departman verisi bulunamadı
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Header */}
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1.5fr] gap-2 px-5 py-2.5 bg-muted/40 border-y border-border/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <div>Departman</div>
                <div className="text-center">Çalışan</div>
                <div className="text-center">Toplam Saat</div>
                <div className="text-center">KPI Başarı</div>
                <div className="text-center">Aktivite Yoğunluğu</div>
              </div>

              {/* Rows */}
              {departmentStats.map((dept, index) => {
                const intensity = Math.min((dept.totalHours / 50) * 100, 100);

                return (
                  <div
                    key={dept.department}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr_1.5fr] gap-2 px-5 py-3.5 items-center border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium text-sm text-foreground truncate">{dept.department}</span>
                    </div>
                    <div className="text-center text-sm font-semibold text-foreground">{dept.totalEmployees}</div>
                    <div className="text-center text-sm font-semibold text-foreground">{dept.totalHours.toFixed(1)}h</div>
                    <div className="text-center">
                      <span className={`text-sm font-semibold ${dept.performance >= 80 ? 'text-emerald-600' :
                        dept.performance >= 50 ? 'text-amber-600' :
                          dept.performance > 0 ? 'text-orange-600' : 'text-muted-foreground'
                        }`}>
                        {dept.performance.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-2">
                      <Progress value={intensity} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground w-12 text-right">{intensity.toFixed(0)}%</span>
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