import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Target, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: number;
  target: number;
  unit: string;
  change: number;
  changeType: 'increase' | 'decrease';
  status: 'success' | 'warning' | 'danger';
  department?: string;
}

export function KPICard({
  title,
  value,
  target,
  unit,
  change,
  changeType,
  status,
  department
}: KPICardProps) {
  const percentage = target > 0 ? Math.min(((value || 0) / target) * 100, 100) : 0;

  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'kpi-success';
      case 'warning': return 'kpi-warning';
      case 'danger': return 'kpi-danger';
      default: return 'primary';
    }
  };

  const getStatusBadgeVariant = () => {
    switch (status) {
      case 'success': return 'default';
      case 'warning': return 'secondary';
      case 'danger': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <Card className={`group relative overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
      {/* Subtle glow effect on hover based on status */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500",
        status === 'success' ? 'bg-emerald-500' : status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
      )} />

      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            {title}
          </CardTitle>
          <Badge
            variant={getStatusBadgeVariant()}
            className={cn(
              "text-[10px] px-2 py-0.5 uppercase tracking-wider font-semibold shadow-sm",
              status === 'success' && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
              status === 'warning' && "bg-amber-500/10 text-amber-500 border-amber-500/20",
              status === 'danger' && "bg-rose-500/10 text-rose-500 border-rose-500/20"
            )}
          >
            {status === 'success' && 'Hedefte'}
            {status === 'warning' && 'Dikkat'}
            {status === 'danger' && 'Kritik'}
          </Badge>
        </div>
        {department && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
            <span className="w-1 h-3 rounded-full bg-primary/40 block"></span>
            {department}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-0 relative z-10">
        {/* Value and Target */}
        <div className="flex items-baseline space-x-2 mb-4">
          <span className="text-3xl font-bold text-foreground tracking-tight">
            {(value || 0).toLocaleString('tr-TR')}
          </span>
          <span className="text-sm font-medium text-muted-foreground">{unit}</span>
          <span className="text-[11px] text-muted-foreground/70 uppercase tracking-widest font-semibold ml-auto hidden sm:inline-block">
            Hedef: {(target || 0).toLocaleString('tr-TR')}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 bg-muted/30 p-3 rounded-xl border border-border/40">
          <div className="flex justify-between mb-2">
            <span className="text-xs font-medium text-foreground">
              İlerleme
            </span>
            <span className="text-xs font-bold text-foreground">
              %{percentage.toFixed(1)}
            </span>
          </div>
          <Progress
            value={percentage}
            className={cn(
              "h-2",
              status === 'success' ? '[&>div]:bg-emerald-500' : status === 'warning' ? '[&>div]:bg-amber-500' : '[&>div]:bg-rose-500'
            )}
          />
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-muted-foreground font-medium">
              Geçerli Durum
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">
              {((target || 0) - (value || 0)).toLocaleString('tr-TR')} {unit} kaldı
            </span>
          </div>
        </div>

        {/* Change Indicator */}
        <div className="flex items-center space-x-1.5 bg-background/50 w-fit px-2.5 py-1 rounded-full border border-border/50">
          {changeType === 'increase' ? (
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
          )}
          <span className={cn(
            "text-xs font-bold",
            changeType === 'increase' ? "text-emerald-500" : "text-rose-500"
          )}>
            {changeType === 'increase' ? '+' : ''}{change || 0}%
          </span>
          <span className="text-[10px] text-muted-foreground ml-1 uppercase tracking-wider font-medium">
            geçen aydan
          </span>
        </div>
      </CardContent>
    </Card>
  );
}