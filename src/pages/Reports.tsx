import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Cell,
  Legend,
  LineChart,
  Line
} from "recharts";
import {
  Users,
  Clock,
  TrendingUp,
  Calendar,
  Activity,
  Target,
  Download,
  FileText,
  Ticket
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCalendar } from "@/hooks/useCalendar";
import { useCategories } from "@/hooks/useCategories";
import { useKPI } from "@/hooks/useKPI";
import { useTickets } from "@/hooks/useTickets";
import { subDays, isAfter, format, startOfDay, parseISO } from "date-fns";
import { tr } from "date-fns/locale";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--kpi-success))', 'hsl(var(--kpi-warning))', 'hsl(var(--kpi-danger))', 'hsl(var(--accent))'];

export default function Reports() {
  const { user } = useAuth();
  const { activities, loading: calendarLoading } = useCalendar();
  const { categories } = useCategories();
  const { kpiStats, loading: kpiLoading } = useKPI();
  const { tickets, loading: ticketsLoading } = useTickets();

  const [dateRange, setDateRange] = useState("30"); // 7, 30, 90, 365, all

  const isLoading = calendarLoading || kpiLoading || ticketsLoading;

  // Filter data based on date range
  const filteredData = useMemo(() => {
    const now = new Date();
    const startDate = dateRange === "all" ? new Date(0) : subDays(startOfDay(now), parseInt(dateRange));

    const rangeActivities = activities.filter(a => {
      if (!a.date) return false;
      return isAfter(new Date(a.date), startDate);
    });

    const rangeTickets = tickets.filter(t => isAfter(parseISO(t.createdAt), startDate));

    // KPI filtering is tricky as they have start/end dates. 
    // We'll include KPIs that are active within the range or created within the range.
    // For simplicity, let's look at assignments or updates if available, but here 
    // we'll filter by creation date for "New KPIs" and updates for progress.
    const rangeKPIs = kpiStats; // Use all for status, but filter for activity stream

    return { activities: rangeActivities, tickets: rangeTickets, kpis: rangeKPIs, startDate };
  }, [activities, tickets, kpiStats, dateRange]);

  // 1. Activity Categories (Time distribution)
  const categoryStats = useMemo(() => {
    const stats = new Map();

    filteredData.activities.forEach(activity => {
      const category = categories.find(c => c.id === activity.categoryId);
      const name = category ? category.name : 'Diğer';
      const durationHours = activity.duration / 60;
      stats.set(name, (stats.get(name) || 0) + durationHours);
    });

    return Array.from(stats.entries())
      .map(([name, value]) => ({ name, value: Math.round(value * 10) / 10 }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData.activities, categories]);

  // 2. Ticket Resolution Stats
  const ticketStats = useMemo(() => {
    const resolved = filteredData.tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
    const created = filteredData.tickets.length;
    const open = filteredData.tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;

    return { resolved, created, open };
  }, [filteredData.tickets]);

  // 3. User Engagement (Top active users based on calendar hours)
  const userEngagement = useMemo(() => {
    // Note: In a real app we'd need user names attached to activities. 
    // Assuming activities currently are only loaded for the current user or all users if admin?
    // useCalendar loads ALL activities from API.
    // However, the activity object structure in useCalendar (based on mock/API) might vary.
    // Let's assume we can aggregate by 'userId'. 

    // Currently useCalendar.ts -> apiClient.getActivities() doesn't seem to explicitly map user names 
    // in the frontend transformation, but let's check if the API response includes it.
    // If not, we might only be able to show aggregate data.

    // Let's stick to Category breakdown for interactions and maybe simple "Total Hours" trend.
    return [];
  }, []);

  // 4. Daily Activity Trend
  const activityTrend = useMemo(() => {
    const days = new Map();
    // Initialize days if range is small, but for "all" it might be too big. 
    // Let's just aggregate present data.

    filteredData.activities.forEach(a => {
      const dateStr = a.date; // YYYY-MM-DD
      days.set(dateStr, (days.get(dateStr) || 0) + (a.duration / 60));
    });

    // Convert map to array and sort
    return Array.from(days.entries())
      .map(([date, hours]) => ({ date: format(new Date(date), 'd MMM', { locale: tr }), hours: Math.round(hours * 10) / 10, rawDate: date }))
      .sort((a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime());

  }, [filteredData.activities]);

  const handleExport = () => {
    const reportData = {
      dateRange: dateRange === "all" ? "Tümü" : `Son ${dateRange} Gün`,
      generatedAt: new Date().toLocaleString('tr-TR'),
      stats: {
        totalWorkHours: filteredData.activities.reduce((acc, a) => acc + a.duration / 60, 0).toFixed(1),
        totalTicketsCreated: ticketStats.created,
        totalTicketsResolved: ticketStats.resolved,
        activeKPIs: kpiStats.filter(k => k.status !== 'success').length,
        completedKPIs: kpiStats.filter(k => k.status === 'success' || k.progressPercentage >= 100).length
      },
      categoryBreakdown: categoryStats
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gurgil-rapor-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalHours = Math.round(filteredData.activities.reduce((acc, a) => acc + a.duration / 60, 0) * 10) / 10;
  const avgDaily = dateRange !== "all"
    ? Math.round((totalHours / parseInt(dateRange)) * 10) / 10
    : 0; // Don't calc avg for 'all' as accurate days count is hard without start date

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-dashboard-bg min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header & Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Raporlar & İstatistikler</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Departman aktiviteleri ve sistem verileri özeti ({user?.department})
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tarih Aralığı" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Son 7 Gün</SelectItem>
                <SelectItem value="30">Son 30 Gün</SelectItem>
                <SelectItem value="90">Son 3 Ay</SelectItem>
                <SelectItem value="all">Tüm Zamanlar</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="w-4 h-4" />
              Dışa Aktar
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Total Work Hours */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Toplam Çalışma</p>
                  <p className="text-2xl font-bold text-foreground">{totalHours}s</p>
                  {dateRange !== 'all' && <p className="text-xs text-muted-foreground mt-1">Ort. {avgDaily}s / gün</p>}
                </div>
                <Clock className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          {/* Ticket Stats */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Destek Talepleri</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-foreground">{ticketStats.created}</p>
                    <span className="text-xs text-muted-foreground">Toplam</span>
                  </div>
                  <p className="text-xs text-green-500 mt-1">{ticketStats.resolved} Çözüldü</p>
                </div>
                <Ticket className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          {/* KPI Stats */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Aktif KPI'lar</p>
                  <p className="text-2xl font-bold text-foreground">{filteredData.kpis.filter(k => k.status !== 'success').length}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {filteredData.kpis.filter(k => k.status === 'success').length} Tamamlandı
                  </p>
                </div>
                <Target className="h-8 w-8 text-kpi-warning" />
              </div>
            </CardContent>
          </Card>

          {/* Efficiency/Engagement (Placeholder calculation) */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Aktivite Sayısı</p>
                  <p className="text-2xl font-bold text-foreground">{filteredData.activities.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">Kayıtlı işlem</p>
                </div>
                <Activity className="h-8 w-8 text-kpi-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Çalışma Kategorileri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} saat`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Daily Trend */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Günlük Çalışma Trendi ({dateRange == 'all' ? 'Tümü' : `Son ${dateRange} Gün`})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={activityTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value} saat`} />
                  <Legend />
                  <Bar dataKey="hours" name="Çalışma Saati" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Category Table */}
        <Card>
          <CardHeader>
            <CardTitle>Kategori Bazlı Detaylar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryStats.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                    <span className="font-medium">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="font-bold">{cat.value} saat</p>
                      <p className="text-xs text-muted-foreground">Toplam Süre</p>
                    </div>
                    <div className="text-right w-16">
                      <Badge variant="outline">
                        {totalHours > 0 ? ((cat.value / totalHours) * 100).toFixed(1) : 0}%
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
              {categoryStats.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Seçilen tarih aralığında veri bulunamadı.</p>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}