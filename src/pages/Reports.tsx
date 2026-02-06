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
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Users, 
  Clock, 
  TicketIcon, 
  TrendingUp, 
  Calendar,
  Activity,
  Target,
  Award
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCalendar } from "@/hooks/useCalendar";
import { useCategories } from "@/hooks/useCategories";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--kpi-success))', 'hsl(var(--kpi-warning))', 'hsl(var(--kpi-danger))'];

export default function Reports() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const { getActivitiesForDate } = useCalendar();
  const { categories } = useCategories();

  useEffect(() => {
    setLoading(false);
  }, []);

  const calculateKPIs = () => {
    return {
      totalUsers: 0,
      activeUsers: 0,
      recentlyActive: 0,
      engagementRate: 0
    };
  };

  const getCalendarAnalytics = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let totalHours = 0;
    let activityCount = 0;
    const categoryStats = new Map();

    for (let d = new Date(thirtyDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const activities = getActivitiesForDate(new Date(d));
      activities.forEach(activity => {
        totalHours += activity.duration / 60;
        activityCount++;
        
        const category = categories.find(c => c.id === activity.categoryId);
        if (category) {
          const current = categoryStats.get(category.name) || 0;
          categoryStats.set(category.name, current + activity.duration / 60);
        }
      });
    }

    const categoryData = Array.from(categoryStats.entries()).map(([name, hours]) => ({
      name,
      hours: Math.round(hours * 10) / 10
    }));

    return {
      totalHours: Math.round(totalHours * 10) / 10,
      activityCount,
      averageHoursPerDay: Math.round((totalHours / 30) * 10) / 10,
      categoryData
    };
  };

  const getUserPerformanceData = () => {
    return [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const kpis = calculateKPIs();
  const calendarAnalytics = getCalendarAnalytics();
  const userPerformanceData = getUserPerformanceData();

  return (
    <div className="flex-1 bg-dashboard-bg min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Departman Raporları</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              {profile?.department} departmanı performans raporları
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Toplam Kullanıcı</p>
                  <p className="text-2xl font-bold text-foreground">{kpis.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-kpi-success" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Aktif Kullanıcı</p>
                  <p className="text-2xl font-bold text-foreground">{kpis.activeUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-kpi-warning" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Toplam Çalışma (30 gün)</p>
                  <p className="text-2xl font-bold text-foreground">{calendarAnalytics.totalHours}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-kpi-success" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Katılım Oranı</p>
                  <p className="text-2xl font-bold text-foreground">%{kpis.engagementRate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Aktivite Kategorileri (30 gün)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={calendarAnalytics.categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, hours }) => `${name}: ${hours}h`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="hours"
                  >
                    {calendarAnalytics.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Takvim İstatistikleri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Toplam Aktivite:</span>
                <Badge variant="secondary">{calendarAnalytics.activityCount}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Günlük Ortalama:</span>
                <Badge variant="secondary">{calendarAnalytics.averageHoursPerDay}h</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}