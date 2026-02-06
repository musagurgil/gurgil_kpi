import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { PieChart as PieIcon, BarChart3, TrendingUp } from 'lucide-react';

interface ActivityChartsProps {
  activities: any[];
}

export function ActivityCharts({ activities }: ActivityChartsProps) {
  // Category distribution
  const categoryStats = activities.reduce((acc: any[], activity) => {
    const existing = acc.find(c => c.categoryId === activity.categoryId);
    if (existing) {
      existing.count++;
      existing.duration += activity.duration || 0;
    } else {
      acc.push({
        categoryId: activity.categoryId,
        name: activity.category?.name || 'Bilinmiyor',
        color: activity.category?.color || '#6b7280',
        count: 1,
        duration: activity.duration || 0
      });
    }
    return acc;
  }, []);

  // Daily hours distribution (last 7 days)
  const last7Days = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayActivities = activities.filter(a => a.date === dateStr);
    const totalMinutes = dayActivities.reduce((sum, a) => sum + (a.duration || 0), 0);
    
    last7Days.push({
      date: date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }),
      hours: (totalMinutes / 60).toFixed(1),
      activities: dayActivities.length
    });
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold">{payload[0].name}</p>
          <p className="text-xs text-muted-foreground">
            Aktivite: <span className="font-medium text-foreground">{payload[0].value}</span>
          </p>
          {payload[0].payload.duration && (
            <p className="text-xs text-muted-foreground">
              Süre: <span className="font-medium text-primary">
                {Math.floor(payload[0].payload.duration / 60)}s {payload[0].payload.duration % 60}dk
              </span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (activities.length === 0) {
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
                data={categoryStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name} (${entry.count})`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {categoryStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryStats.map((item) => (
              <div key={item.categoryId} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground">
                  {item.name}: <span className="font-semibold text-foreground">{item.count}</span>
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Hours (Last 7 Days) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Günlük Çalışma Saatleri (Son 7 Gün)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="hours" fill="hsl(var(--primary))" name="Saat" />
            </BarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Toplam</p>
              <p className="text-sm font-semibold text-primary">
                {last7Days.reduce((sum, day) => sum + Number(day.hours), 0).toFixed(1)}h
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Ortalama</p>
              <p className="text-sm font-semibold">
                {(last7Days.reduce((sum, day) => sum + Number(day.hours), 0) / 7).toFixed(1)}h/gün
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Aktivite</p>
              <p className="text-sm font-semibold">
                {last7Days.reduce((sum, day) => sum + Number(day.activities), 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

