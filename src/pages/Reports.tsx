import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCalendar } from "@/hooks/useCalendar";
import { useCategories } from "@/hooks/useCategories";
import { useKPI } from "@/hooks/useKPI";
import { useTickets } from "@/hooks/useTickets";
import { subDays, isAfter, format, startOfDay, parseISO } from "date-fns";
import { tr } from "date-fns/locale";

import { ReportSummaryCards } from "@/components/reports/ReportSummaryCards";
import { CategoryDistribution, CategoryDetailedTable } from "@/components/reports/CategoryDistribution";
import { DailyTrendChart } from "@/components/reports/DailyTrendChart";
import { DepartmentReport } from "@/components/reports/DepartmentReport";

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
    const rangeKPIs = kpiStats;

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

  // 4. Daily Activity Trend
  const activityTrend = useMemo(() => {
    const days = new Map();

    filteredData.activities.forEach(a => {
      const dateStr = a.date; // YYYY-MM-DD
      days.set(dateStr, (days.get(dateStr) || 0) + (a.duration / 60));
    });

    // Convert map to array and sort
    return Array.from(days.entries())
      .map(([date, hours]) => ({ date: format(new Date(date), 'd MMM', { locale: tr }), hours: Math.round(hours * 10) / 10, rawDate: date }))
      .sort((a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime());

  }, [filteredData.activities]);

  const totalHours = Math.round(filteredData.activities.reduce((acc, a) => acc + a.duration / 60, 0) * 10) / 10;
  const avgDaily = dateRange !== "all"
    ? Math.round((totalHours / parseInt(dateRange)) * 10) / 10
    : 0;

  const handleExport = () => {
    const reportData = {
      dateRange: dateRange === "all" ? "Tümü" : `Son ${dateRange} Gün`,
      generatedAt: new Date().toLocaleString('tr-TR'),
      stats: {
        totalWorkHours: totalHours,
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
        <ReportSummaryCards
          totalHours={totalHours}
          avgDaily={avgDaily}
          ticketStats={ticketStats}
          kpiStats={filteredData.kpis}
          activityCount={filteredData.activities.length}
          dateRange={dateRange}
        />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoryDistribution
            categoryStats={categoryStats}
            totalHours={totalHours}
          />
          <DailyTrendChart
            activityTrend={activityTrend}
            dateRangeLabel={dateRange == 'all' ? 'Tümü' : `Son ${dateRange} Gün`}
          />
        </div>

        {/* Detailed Category Table */}
        <CategoryDetailedTable
          categoryStats={categoryStats}
          totalHours={totalHours}
        />

        {/* Department Report */}
        <DepartmentReport
          kpiStats={kpiStats}
          isAdmin={user?.roles.includes('admin') || false}
          userDepartment={user?.department || ''}
        />

      </div>
    </div>
  );
}