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
    <Card className="shadow-card hover:shadow-elevated transition-smooth">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Badge variant={getStatusBadgeVariant()} className="text-xs">
            {status === 'success' && 'Hedefte'}
            {status === 'warning' && 'Dikkat'}
            {status === 'danger' && 'Kritik'}
          </Badge>
        </div>
        {department && (
          <p className="text-xs text-muted-foreground">{department}</p>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Value and Target */}
        <div className="flex items-baseline space-x-2 mb-3">
          <span className="text-2xl font-bold text-foreground">
            {(value || 0).toLocaleString('tr-TR')}
          </span>
          <span className="text-sm text-muted-foreground">{unit}</span>
          <span className="text-xs text-muted-foreground">
            / {(target || 0).toLocaleString('tr-TR')} hedef
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <Progress 
            value={percentage} 
            className={cn("h-2", `[&>div]:bg-${getStatusColor()}`)}
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-muted-foreground">
              %{percentage.toFixed(1)} tamamlandı
            </span>
            <span className="text-xs text-muted-foreground">
              {((target || 0) - (value || 0)).toLocaleString('tr-TR')} kalan
            </span>
          </div>
        </div>

        {/* Change Indicator */}
        <div className="flex items-center space-x-2">
          {changeType === 'increase' ? (
            <TrendingUp className="w-4 h-4 text-kpi-success" />
          ) : (
            <TrendingDown className="w-4 h-4 text-kpi-danger" />
          )}
          <span className={cn(
            "text-sm font-medium",
            changeType === 'increase' ? "text-kpi-success" : "text-kpi-danger"
          )}>
            {changeType === 'increase' ? '+' : ''}{change || 0}% geçen ay
          </span>
        </div>
      </CardContent>
    </Card>
  );
}