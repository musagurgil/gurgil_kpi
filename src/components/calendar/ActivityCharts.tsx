import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { PieChart as PieIcon, BarChart3, TrendingUp } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';

interface ActivityChartsProps {
  stats: {
    categoryStats: Record<string, number>;
    dailyBreakdown: { date: string; dateLabel: string; hours: number; activities: number }[];
    totalHours: number;
    entryCount: number;
    averageDailyHours: number;
    dayCount: number;
  };
  dateRangeLabel?: string;
}

export function ActivityCharts({ stats, dateRangeLabel }: ActivityChartsProps) {
  const { categories } = useCategories();

  const getCategoryName = (categoryId: string) => {
    const category = categories?.find(cat => cat.id === categoryId);
    return category?.name || 'Bilinmiyor';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories?.find(cat => cat.id === categoryId);
    return category?.color || '#6b7280';
  };

  // Build category chart data from stats
  const categoryData = Object.entries(stats.categoryStats).map(([categoryId, hours]) => ({
    categoryId,
    name: getCategoryName(categoryId),
    color: getCategoryColor(categoryId),
    count: Number(hours),
    duration: Math.round(Number(hours) * 60)
  }));

  const dailyData = stats.dailyBreakdown || [];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold">{payload[0].name || payload[0].payload.name}</p>
          <p className="text-xs text-muted-foreground">
            Süre: <span className="font-medium text-primary">
              {Number(payload[0].value).toFixed(1)}h
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const DailyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-xs text-muted-foreground">
            Süre: <span className="font-medium text-primary">{payload[0].value}h</span>
          </p>
          {payload[0].payload.activities > 0 && (
            <p className="text-xs text-muted-foreground">
              Aktivite: <span className="font-medium">{payload[0].payload.activities}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (stats.entryCount === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Aktivite İstatistikleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Grafik oluşturmak için yeterli aktivite bulunmuyor.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Category Distribution */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <PieIcon className="w-4 h-4" />
            Kategori Dağılımı
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name} (${Number(entry.count).toFixed(1)}h)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryData.map((item) => (
              <div key={item.categoryId} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground">
                  {item.name}: <span className="font-semibold text-foreground">{Number(item.count).toFixed(1)}h</span>
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Hours */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Günlük Çalışma Saatleri
            {dateRangeLabel && (
              <span className="text-xs font-normal text-muted-foreground ml-1">({dateRangeLabel})</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<DailyTooltip />} />
              <Bar dataKey="hours" fill="hsl(var(--primary))" name="Saat" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Toplam</p>
              <p className="text-sm font-semibold text-primary">
                {stats.totalHours.toFixed(1)}h
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Ortalama</p>
              <p className="text-sm font-semibold">
                {stats.averageDailyHours.toFixed(1)}h/gün
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Aktivite</p>
              <p className="text-sm font-semibold">
                {stats.entryCount}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
