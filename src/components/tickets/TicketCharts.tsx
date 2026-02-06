import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { BarChart3, PieChart as PieIcon } from 'lucide-react';
import { Ticket } from '@/types/ticket';

interface TicketChartsProps {
  tickets: Ticket[];
}

export function TicketCharts({ tickets }: TicketChartsProps) {
  // Status distribution
  const statusData = [
    { name: 'Açık', value: tickets.filter(t => t.status === 'open').length, color: '#3b82f6' },
    { name: 'Devam Ediyor', value: tickets.filter(t => t.status === 'in_progress').length, color: '#f59e0b' },
    { name: 'Çözüldü', value: tickets.filter(t => t.status === 'resolved').length, color: '#10b981' },
    { name: 'Kapatıldı', value: tickets.filter(t => t.status === 'closed').length, color: '#6b7280' }
  ].filter(item => item.value > 0);

  // Priority distribution
  const priorityData = [
    { name: 'Düşük', value: tickets.filter(t => t.priority === 'low').length, color: '#10b981' },
    { name: 'Orta', value: tickets.filter(t => t.priority === 'medium').length, color: '#f59e0b' },
    { name: 'Yüksek', value: tickets.filter(t => t.priority === 'high').length, color: '#ef4444' },
    { name: 'Acil', value: tickets.filter(t => t.priority === 'urgent').length, color: '#dc2626' }
  ].filter(item => item.value > 0);

  // Department statistics
  const departmentStats = tickets.reduce((acc: any[], ticket) => {
    const existing = acc.find(d => d.department === ticket.targetDepartment);
    if (existing) {
      existing.total++;
      if (ticket.status === 'open') existing.open++;
      if (ticket.status === 'in_progress') existing.inProgress++;
      if (ticket.status === 'resolved' || ticket.status === 'closed') existing.completed++;
    } else {
      acc.push({
        department: ticket.targetDepartment,
        total: 1,
        open: ticket.status === 'open' ? 1 : 0,
        inProgress: ticket.status === 'in_progress' ? 1 : 0,
        completed: (ticket.status === 'resolved' || ticket.status === 'closed') ? 1 : 0
      });
    }
    return acc;
  }, []);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold">{payload[0].name}</p>
          <p className="text-xs text-muted-foreground">
            Adet: <span className="font-medium text-foreground">{payload[0].value}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Oran: <span className="font-medium text-primary">
              %{((payload[0].value / tickets.length) * 100).toFixed(1)}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (tickets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Ticket İstatistikleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Grafik oluşturmak için yeterli ticket bulunmuyor.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Status Distribution */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <PieIcon className="w-4 h-4" />
            Durum Dağılımı
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name} (${entry.value})`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground">
                  {item.name}: <span className="font-semibold text-foreground">{item.value}</span>
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Priority Distribution */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Öncelik Dağılımı
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name} (${entry.value})`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {priorityData.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground">
                  {item.name}: <span className="font-semibold text-foreground">{item.value}</span>
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Department Statistics */}
      {departmentStats.length > 0 && (
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Departman Bazlı İstatistikler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={departmentStats}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="open" stackId="a" fill="#3b82f6" name="Açık" />
                <Bar dataKey="inProgress" stackId="a" fill="#f59e0b" name="Devam Ediyor" />
                <Bar dataKey="completed" stackId="a" fill="#10b981" name="Tamamlanan" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

