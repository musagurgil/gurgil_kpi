import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import {
  TrendingUp,
  Users,
  Target,
  Activity,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
// Mock data for analytics

const COLORS = ['hsl(var(--primary))', 'hsl(var(--kpi-success))', 'hsl(var(--kpi-warning))', 'hsl(var(--kpi-danger))', 'hsl(var(--accent))'];

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState<any[]>([]);
  const [departmentStats, setDepartmentStats] = useState<any[]>([]);
  const [topPerformers, setTopPerformers] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Mock data for analytics
      const kpis = [
        { id: '1', title: 'Aylık Satış Hedefi', department: 'Satış', targetValue: 100000, currentValue: 75000, status: 'active', kpi_progress: [] },
        { id: '2', title: 'Müşteri Memnuniyeti', department: 'Müşteri Hizmetleri', targetValue: 90, currentValue: 85, status: 'active', kpi_progress: [] }
      ];

      const departments = [
        { id: '1', name: 'Satış' },
        { id: '2', name: 'Pazarlama' },
        { id: '3', name: 'IT' },
        { id: '4', name: 'İnsan Kaynakları' }
      ];

      const profiles = [
        { id: '1', department: 'Satış', first_name: 'John', last_name: 'Doe' },
        { id: '2', department: 'Pazarlama', first_name: 'Jane', last_name: 'Smith' },
        { id: '3', department: 'IT', first_name: 'Bob', last_name: 'Johnson' }
      ];

      // No error handling needed for mock data

      // Calculate department stats
      const deptStats = departments?.map(dept => {
        const deptKPIs = kpis?.filter(k => k.department === dept.name) || [];
        const deptUsers = profiles?.filter(p => p.department === dept.name) || [];
        const completedKPIs = deptKPIs.filter(k => k.status === 'completed').length;
        const activeKPIs = deptKPIs.filter(k => k.status === 'active').length;
        
        return {
          name: dept.name,
          users: deptUsers.length,
          activeKPIs,
          completedKPIs,
          totalKPIs: deptKPIs.length
        };
      }) || [];

      setDepartmentStats(deptStats);
      setKpiData(kpis || []);

      // Calculate top performers (users with most completed KPIs)
      const userProgress = new Map();
      kpis?.forEach(kpi => {
        if (kpi.kpi_progress && Array.isArray(kpi.kpi_progress)) {
          kpi.kpi_progress.forEach((progress: any) => {
            const current = userProgress.get(progress.user_id) || { count: 0, totalValue: 0 };
            current.count++;
            current.totalValue += Number(progress.value);
            userProgress.set(progress.user_id, current);
          });
        }
      });

      const performers = Array.from(userProgress.entries())
        .map(([userId, stats]: [string, any]) => {
          const user = profiles?.find(p => p.id === userId);
          return {
            id: userId,
            name: user ? `${user.first_name} ${user.last_name}` : 'Unknown',
            department: user?.department || 'N/A',
            progressCount: stats.count,
            totalValue: stats.totalValue
          };
        })
        .sort((a, b) => b.progressCount - a.progressCount)
        .slice(0, 5);

      setTopPerformers(performers);
    } catch (error) {
      console.error('Analytics loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getKPIStatusDistribution = () => {
    const statusCounts = kpiData.reduce((acc, kpi) => {
      acc[kpi.status] = (acc[kpi.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status === 'active' ? 'Aktif' : status === 'completed' ? 'Tamamlandı' : 'Beklemede',
      value: count
    }));
  };

  const getTrendData = () => {
    // Mock trend data - in real app, calculate from historical data
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz'];
    return months.map((month, index) => ({
      month,
      kpis: Math.floor(Math.random() * 20) + 10,
      completed: Math.floor(Math.random() * 15) + 5,
      users: Math.floor(Math.random() * 30) + 20
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statusDistribution = getKPIStatusDistribution();
  const trendData = getTrendData();
  const totalKPIs = kpiData.length;
  const completedKPIs = kpiData.filter(k => k.status === 'completed').length;
  const activeKPIs = kpiData.filter(k => k.status === 'active').length;

  return (
    <div className="flex-1 bg-dashboard-bg min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Şirket Analitik</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Tüm şirket genelinde performans metrikleri ve trendler
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Toplam KPI</p>
                  <p className="text-2xl font-bold text-foreground">{totalKPIs}</p>
                </div>
                <Target className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Aktif KPI</p>
                  <p className="text-2xl font-bold text-foreground">{activeKPIs}</p>
                </div>
                <Activity className="h-8 w-8 text-kpi-warning" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tamamlanan</p>
                  <p className="text-2xl font-bold text-foreground">{completedKPIs}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-kpi-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Başarı Oranı</p>
                  <p className="text-2xl font-bold text-foreground">
                    {totalKPIs > 0 ? Math.round((completedKPIs / totalKPIs) * 100) : 0}%
                  </p>
                </div>
                <Award className="h-8 w-8 text-kpi-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* KPI Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                KPI Durum Dağılımı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Department Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Departman Performansı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="activeKPIs" name="Aktif KPI" fill="hsl(var(--kpi-warning))" />
                  <Bar dataKey="completedKPIs" name="Tamamlanan" fill="hsl(var(--kpi-success))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trend Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                6 Aylık Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="kpis" name="Toplam KPI" stroke="hsl(var(--primary))" />
                  <Line type="monotone" dataKey="completed" name="Tamamlanan" stroke="hsl(var(--kpi-success))" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                En İyi Performans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topPerformers.map((performer, index) => (
                  <div key={performer.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-primary text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{performer.name}</p>
                        <p className="text-xs text-muted-foreground">{performer.department}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {performer.progressCount} kayıt
                    </Badge>
                  </div>
                ))}
                {topPerformers.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Henüz performans verisi bulunmuyor
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Department Details Table */}
        <Card>
          <CardHeader>
            <CardTitle>Departman Detayları</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {departmentStats.map((dept) => (
                <div key={dept.name} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <h3 className="font-medium text-foreground">{dept.name}</h3>
                    <p className="text-sm text-muted-foreground">{dept.users} çalışan</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{dept.totalKPIs}</p>
                      <p className="text-xs text-muted-foreground">Toplam KPI</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-kpi-warning">{dept.activeKPIs}</p>
                      <p className="text-xs text-muted-foreground">Aktif</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-kpi-success">{dept.completedKPIs}</p>
                      <p className="text-xs text-muted-foreground">Tamamlandı</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
