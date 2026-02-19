import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { KPIProgress } from '@/types/kpi';
import { cn } from '@/lib/utils';

interface KPIProgressChartProps {
  progress: KPIProgress[];
  targetValue: number;
  unit: string;
  title?: string;
  showSummary?: boolean;
  showHeader?: boolean;
  compact?: boolean;
  height?: number | string;
  className?: string;
}

export function KPIProgressChart({
  progress,
  targetValue,
  unit,
  title = "İlerleme Grafiği",
  showSummary = true,
  showHeader = true,
  compact = false,
  height = 300,
  className
}: KPIProgressChartProps) {
  // If compact mode is enabled, override defaults unless explicitly provided
  const effectiveShowSummary = compact ? false : showSummary;
  const effectiveShowHeader = compact ? false : showHeader;
  const effectiveHeight = compact ? "100%" : height;

  // Transform progress data for chart
  const chartData = progress
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
    .reduce((acc, p, index) => {
      const date = new Date(p.recordedAt).toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit'
      });

      const cumulativeValue = acc.length > 0
        ? acc[acc.length - 1].cumulative + p.value
        : p.value;

      acc.push({
        date,
        value: p.value,
        cumulative: cumulativeValue,
        target: targetValue,
        percentage: ((cumulativeValue / targetValue) * 100).toFixed(1)
      });

      return acc;
    }, [] as any[]);

  // If no data, show empty state
  if (chartData.length === 0) {
    return (
      <Card className={cn(compact ? "border-0 shadow-none bg-transparent" : "", className)}>
        {effectiveShowHeader && (
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {title}
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className={cn(compact ? "p-0 flex items-center justify-center h-full" : "")}>
          <p className="text-sm text-muted-foreground text-center py-8">
            Henüz grafik oluşturmak için yeterli ilerleme kaydı bulunmuyor.
          </p>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold mb-1">{payload[0].payload.date}</p>
          <p className="text-xs text-muted-foreground">
            İlerleme: <span className="font-medium text-foreground">
              +{payload[0].payload.value.toLocaleString('tr-TR')} {unit}
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            Toplam: <span className="font-medium text-primary">
              {payload[0].payload.cumulative.toLocaleString('tr-TR')} {unit}
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            İlerleme: <span className="font-medium text-kpi-success">
              %{payload[0].payload.percentage}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={cn("flex flex-col", compact ? "border-0 shadow-none bg-transparent h-full" : "", className)}>
      {effectiveShowHeader && (
        <CardHeader className="pb-3 shrink-0">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn("flex-1 min-h-0", compact ? "p-0 h-full" : "")}>
        <div style={{ height: effectiveHeight, minHeight: compact ? 0 : undefined }} className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={!compact} />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fontSize: 12 }}
                hide={compact}
              />
              <YAxis
                className="text-xs"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.toLocaleString('tr-TR')}
                hide={compact}
              />
              <Tooltip content={<CustomTooltip />} />
              {!compact && (
                <Legend
                  wrapperStyle={{ fontSize: '12px' }}
                  formatter={(value) => {
                    if (value === 'cumulative') return 'Toplam İlerleme';
                    if (value === 'target') return 'Hedef';
                    return value;
                  }}
                />
              )}
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorCumulative)"
                name="cumulative"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="hsl(var(--destructive))"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
                name="target"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        {effectiveShowSummary && (
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Son Kayıt</p>
              <p className="text-sm font-semibold">
                +{chartData[chartData.length - 1].value.toLocaleString('tr-TR')} {unit}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Toplam</p>
              <p className="text-sm font-semibold text-primary">
                {chartData[chartData.length - 1].cumulative.toLocaleString('tr-TR')} {unit}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">İlerleme</p>
              <p className="text-sm font-semibold text-kpi-success">
                %{chartData[chartData.length - 1].percentage}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
