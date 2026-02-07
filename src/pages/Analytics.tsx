import { useState, useEffect, useMemo } from "react";
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
  CheckCircle2,
} from "lucide-react";
import { useKPI } from "@/hooks/useKPI";
import { useTickets } from "@/hooks/useTickets";
import { apiClient } from "@/lib/api";
import { User } from "@/types/user";

interface Department {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--kpi-success))', 'hsl(var(--kpi-warning))', 'hsl(var(--kpi-danger))', 'hsl(var(--accent))'];

export default function Analytics() {
  const { kpiStats, loading: kpiLoading } = useKPI();
  const { tickets, loading: ticketsLoading } = useTickets();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [profiles, setProfiles] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Load auxiliary data (Departments, Users)
  useEffect(() => {
    const loadData = async () => {
      try {
        const [deptsData, profilesData] = await Promise.all([
          apiClient.getDepartments(),
          apiClient.getProfiles()
        ]);
        // Type assertion needed if strictly typed
        setDepartments(deptsData as unknown as Department[]);
        setProfiles(profilesData);
      } catch (error) {
        console.error("Error loading analytics auxiliary data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const isLoading = loading || kpiLoading || ticketsLoading;

  // 1. KPI Status Distribution
  const statusDistribution = useMemo(() => {
    const counts = kpiStats.reduce((acc, kpi) => {
      const status = kpi.status || 'active'; // Default to active if undefined
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'Başarılı', value: counts['success'] || 0, color: 'hsl(var(--kpi-success))' },
      { name: 'Aktif/Normal', value: (counts['active'] || 0) + (counts['normal'] || 0), color: 'hsl(var(--primary))' },
      { name: 'Uyarı', value: counts['warning'] || 0, color: 'hsl(var(--kpi-warning))' },
      { name: 'Kritik', value: counts['danger'] || 0, color: 'hsl(var(--kpi-danger))' }
    ].filter(item => item.value > 0);
  }, [kpiStats]);

  // 2. Department Performance
  const departmentStats = useMemo(() => {
    if (!departments.length) return [];

    return departments.map(dept => {
      const deptKPIs = kpiStats.filter(k => k.department === dept.name);

      // Calculate completion rate
      const totalKPIs = deptKPIs.length;
      const completedKPIs = deptKPIs.filter(k => k.status === 'success' || k.progressPercentage >= 100).length;
      const activeKPIs = totalKPIs - completedKPIs;

      const deptUsers = profiles.filter(p => p.department === dept.name).length;

      return {
        name: dept.name,
        users: deptUsers,
        totalKPIs,
        activeKPIs,
        completedKPIs,
        successRate: totalKPIs > 0 ? (completedKPIs / totalKPIs) * 100 : 0
      };
    }).sort((a, b) => b.totalKPIs - a.totalKPIs); // Sort by activity volume
  }, [departments, kpiStats, profiles]);

  // 3. Top Performers (Calculated from KPI completion and Ticket resolution)
  const topPerformers = useMemo(() => {
    const userScores = new Map<string, { kpiCount: number; ticketCount: number }>();

    // Score from KPIs
    kpiStats.forEach(kpi => {
      if (kpi.progressPercentage >= 100) {
        // Give points to assigned users
        kpi.assignedUsers?.forEach((userId: string) => {
          const current = userScores.get(userId) || { kpiCount: 0, ticketCount: 0 };
          current.kpiCount += 1;
          userScores.set(userId, current);
        });
      }
    });

    // Score from Tickets
    tickets.forEach(ticket => {
      if (ticket.status === 'resolved' || ticket.status === 'closed') {
        const userId = ticket.assignedTo;
        if (userId) {
          const current = userScores.get(userId) || { kpiCount: 0, ticketCount: 0 };
          current.ticketCount += 1;
          userScores.set(userId, current);
        }
      }
    });

    return Array.from(userScores.entries())
      .map(([userId, scores]) => {
        const profile = profiles.find(p => p.id === userId);
        if (!profile) return null;

        return {
          id: userId,
          name: `${profile.firstName} ${profile.lastName}`,
          department: profile.department,
          kpiCount: scores.kpiCount,
          ticketCount: scores.ticketCount,
          totalScore: scores.kpiCount * 10 + scores.ticketCount * 5 // Weighted score
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null) // Remove nulls (users not found)
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 5);
  }, [kpiStats, tickets, profiles]);

  // 4. Trend Data (Simulated based on KPI Start Dates for distribution over time)
  // Since we don't have historical snapshots, we'll visualize "New KPIs vs Completed KPIs" over the last 6 months
  const trendData = useMemo(() => {
    const months: Record<string, { month: string; newKPIs: number; completedKPIs: number; tickets: number }> = {};
    const now = new Date();

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('tr-TR', { month: 'short' });
      months[key] = { month: key, newKPIs: 0, completedKPIs: 0, tickets: 0 };
    }

    // Populate with KPI data
    kpiStats.forEach(kpi => {
      const startDate = new Date(kpi.startDate);
      const key = startDate.toLocaleString('tr-TR', { month: 'short' });
      if (months[key]) {
        months[key].newKPIs += 1;
      }

      if (kpi.status === 'success' || kpi.progressPercentage >= 100) {
        // Use endDate as proxy for completion time if actual completion log missing
        const endDate = new Date(kpi.endDate);
        const endKey = endDate.toLocaleString('tr-TR', { month: 'short' });
        if (months[endKey]) {
          months[endKey].completedKPIs += 1;
        }
      }
    });

    // Populate with Ticket data (created vs resolved)
    tickets.forEach(ticket => {
      const createdDate = new Date(ticket.createdAt);
      const key = createdDate.toLocaleString('tr-TR', { month: 'short' });
      if (months[key]) months[key].tickets += 1;
    });

    return Object.values(months);
  }, [kpiStats, tickets]);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalKPIs = kpiStats.length;
  const completedKPIs = kpiStats.filter(k => k.status === 'success' || k.progressPercentage >= 100).length;
  const successRate = totalKPIs > 0 ? Math.round((completedKPIs / totalKPIs) * 100) : 0;
  const activeKPIs = totalKPIs - completedKPIs;

  return (
    <div className="flex-1 bg-dashboard-bg min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Şirket Analitik</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Gerçek zamanlı performans metrikleri ve departman analizleri
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="px-3 py-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2"></div>
              Canlı Veri
            </Badge>
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
                    %{successRate}
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
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
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
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="activeKPIs" name="Aktif KPI" fill="hsl(var(--kpi-warning))" stackId="a" />
                  <Bar dataKey="completedKPIs" name="Tamamlanan" fill="hsl(var(--kpi-success))" stackId="a" />
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
                Veri Akış Trendi (Son 6 Ay)
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
                  <Line type="monotone" dataKey="newKPIs" name="Yeni KPI" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="completedKPIs" name="Tamamlanan" stroke="hsl(var(--kpi-success))" strokeWidth={2} />
                  <Line type="monotone" dataKey="tickets" name="Yeni Ticket" stroke="hsl(var(--accent))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                En İyi Performans Gösterenler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topPerformers.map((performer, index) => (
                  <div key={performer.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-white
                        ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-700' : 'bg-primary'}`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{performer.name}</p>
                        <p className="text-xs text-muted-foreground">{performer.department}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {performer.kpiCount} KPI
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {performer.ticketCount} Ticket
                      </Badge>
                    </div>
                  </div>
                ))}
                {topPerformers.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Henüz yeterli performans verisi bulunmuyor.
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
                <div key={dept.name} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div>
                    <h3 className="font-medium text-foreground">{dept.name}</h3>
                    <p className="text-sm text-muted-foreground">{dept.users} çalışan</p>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-8">
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
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-foreground">%{Math.round(dept.successRate)}</p>
                      <p className="text-xs text-muted-foreground">Başarı</p>
                    </div>
                  </div>
                </div>
              ))}
              {departmentStats.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Henüz departman verisi bulunmuyor.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
