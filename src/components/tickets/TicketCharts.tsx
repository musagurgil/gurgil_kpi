import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { PieChart as PieIcon, BarChart3, Target } from "lucide-react";
import { Ticket, TICKET_STATUSES, TICKET_PRIORITIES } from "@/types/ticket";

interface TicketChartsProps {
  tickets: Ticket[];
}

export function TicketCharts({ tickets }: TicketChartsProps) {
  // ⎯ Status Distribution ⎯
  const statusData = [
    { name: 'Açık', value: tickets.filter(t => t.status === 'open').length, color: '#6366f1' },
    { name: 'Devam Ediyor', value: tickets.filter(t => t.status === 'in_progress').length, color: '#f59e0b' },
    { name: 'Çözüldü', value: tickets.filter(t => t.status === 'resolved').length, color: '#10b981' },
    { name: 'Kapatıldı', value: tickets.filter(t => t.status === 'closed').length, color: '#94a3b8' },
  ].filter(d => d.value > 0);

  // ⎯ Priority Distribution ⎯
  const priorityData = [
    { name: 'Düşük', value: tickets.filter(t => t.priority === 'low').length, color: '#10b981' },
    { name: 'Orta', value: tickets.filter(t => t.priority === 'medium').length, color: '#f59e0b' },
    { name: 'Yüksek', value: tickets.filter(t => t.priority === 'high').length, color: '#f97316' },
    { name: 'Acil', value: tickets.filter(t => t.priority === 'urgent').length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // ⎯ Department Statistics ⎯
  const departmentMap = new Map<string, { total: number; open: number; inProgress: number; resolved: number }>();
  tickets.forEach(ticket => {
    const dept = ticket.targetDepartment;
    if (!departmentMap.has(dept)) {
      departmentMap.set(dept, { total: 0, open: 0, inProgress: 0, resolved: 0 });
    }
    const d = departmentMap.get(dept)!;
    d.total++;
    if (ticket.status === 'open') d.open++;
    if (ticket.status === 'in_progress') d.inProgress++;
    if (ticket.status === 'resolved' || ticket.status === 'closed') d.resolved++;
  });
  const departmentData = Array.from(departmentMap.entries()).map(([name, data]) => ({
    name: name.length > 12 ? name.substring(0, 12) + '…' : name,
    ...data
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-lg p-2.5 shadow-xl text-xs">
          {label && <p className="font-semibold text-foreground mb-1">{label}</p>}
          {payload.map((entry: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-semibold">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderCustomLegend = (data: { name: string; value: number; color: string }[]) => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    return (
      <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-2">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-muted-foreground">{item.name}:</span>
            <span className="font-semibold">{item.value}</span>
            <span className="text-muted-foreground/60">(%{total > 0 ? Math.round((item.value / total) * 100) : 0})</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {/* Status Donut */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2 p-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm">
              <PieIcon className="w-3.5 h-3.5 text-white" />
            </div>
            Durum Dağılımı
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {statusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {renderCustomLegend(statusData)}
            </>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
              Veri bulunmuyor
            </div>
          )}
        </CardContent>
      </Card>

      {/* Priority Donut */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2 p-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm">
              <Target className="w-3.5 h-3.5 text-white" />
            </div>
            Öncelik Dağılımı
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {priorityData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {renderCustomLegend(priorityData)}
            </>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
              Veri bulunmuyor
            </div>
          )}
        </CardContent>
      </Card>

      {/* Department Bar Chart */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm md:col-span-2 lg:col-span-1">
        <CardHeader className="pb-2 p-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-400 to-green-600 shadow-sm">
              <BarChart3 className="w-3.5 h-3.5 text-white" />
            </div>
            Departman İstatistikleri
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {departmentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={departmentData} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="open" name="Açık" fill="#6366f1" radius={[2, 2, 0, 0]} stackId="a" />
                <Bar dataKey="inProgress" name="Devam E." fill="#f59e0b" radius={[0, 0, 0, 0]} stackId="a" />
                <Bar dataKey="resolved" name="Çözüldü" fill="#10b981" radius={[2, 2, 0, 0]} stackId="a" />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
              Veri bulunmuyor
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
