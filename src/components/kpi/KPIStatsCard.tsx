import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle,
  X,
  MessageSquare,
  User,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { KPIStats, KPI_PERIODS, KPI_PRIORITIES } from '@/types/kpi';

interface KPIStatsCardProps {
  kpiStats: KPIStats;
  onClick: () => void;
  canRecordProgress: boolean;
  showProgressHistory?: boolean;
  canDelete?: boolean;
  onDelete?: () => void;
}

export function KPIStatsCard({ 
  kpiStats, 
  onClick,
  canRecordProgress,
  showProgressHistory = true,
  canDelete = false,
  onDelete
}: KPIStatsCardProps) {
  const getStatusColor = () => {
    switch (kpiStats.status) {
      case 'success': return 'kpi-success';
      case 'warning': return 'kpi-warning';
      case 'danger': return 'kpi-danger';
      default: return 'primary';
    }
  };

  const getStatusBadgeVariant = () => {
    switch (kpiStats.status) {
      case 'success': return 'default';
      case 'warning': return 'secondary';
      case 'danger': return 'destructive';
      default: return 'default';
    }
  };

  const getStatusIcon = () => {
    switch (kpiStats.status) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'danger': return <X className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getStatusText = () => {
    if ((kpiStats.progressPercentage || 0) >= 100) return 'Tamamlandı';
    switch (kpiStats.status) {
      case 'success': return 'Hedefte';
      case 'warning': return 'Dikkat';
      case 'danger': return 'Kritik';
      default: return 'Normal';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isCompleted = (kpiStats.progressPercentage || 0) >= 100;
  const isOverdue = (kpiStats.remainingDays || 0) < 0;

  return (
    <Card 
      className="shadow-card hover:shadow-elevated transition-smooth cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-sm sm:text-base font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors">
              {kpiStats.title}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-xs">
                {kpiStats.department}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {KPI_PERIODS[kpiStats.period]}
              </Badge>
              {kpiStats.priority && (
                <Badge variant="secondary" className="text-xs">
                  {KPI_PRIORITIES[kpiStats.priority]}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={getStatusBadgeVariant()} 
              className={cn(
                "text-xs flex items-center gap-1 w-fit font-medium",
                kpiStats.status === 'success' && "bg-green-100 text-green-800 border-green-200",
                kpiStats.status === 'warning' && "bg-yellow-100 text-yellow-800 border-yellow-200",
                kpiStats.status === 'danger' && "bg-red-100 text-red-800 border-red-200"
              )}
            >
              {getStatusIcon()}
              <span className="hidden sm:inline">{getStatusText()}</span>
              <span className="sm:hidden">{getStatusText().charAt(0)}</span>
            </Badge>
            {canDelete && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1 hover:bg-destructive/10 rounded-md transition-colors text-destructive hover:text-destructive/80"
                title="KPI'yı Sil"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Value and Target */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
            <div className="flex items-baseline space-x-2">
              <span className="text-xl sm:text-2xl font-bold text-foreground">
                {(kpiStats.currentValue || 0).toLocaleString('tr-TR')}
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground">{kpiStats.unit || ''}</span>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-xs text-muted-foreground">Hedef</div>
              <div className="text-base sm:text-lg font-semibold">
                {(kpiStats.targetValue || 0).toLocaleString('tr-TR')} {kpiStats.unit || ''}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-foreground">
                İlerleme: %{(kpiStats.progressPercentage || 0).toFixed(1)}
              </span>
              <span className="text-muted-foreground">
                {((kpiStats.targetValue || 0) - (kpiStats.currentValue || 0)).toLocaleString('tr-TR')} kalan
              </span>
            </div>
            <Progress 
              value={Math.min(kpiStats.progressPercentage || 0, 100)} 
              className={cn("h-3", `[&>div]:bg-${getStatusColor()}`)}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {kpiStats.currentValue || 0} / {kpiStats.targetValue || 0} {kpiStats.unit || ''}
              </span>
              <span>
                {kpiStats.remainingDays > 0 ? `${kpiStats.remainingDays} gün kaldı` : 
                 kpiStats.remainingDays < 0 ? `${Math.abs(kpiStats.remainingDays)} gün gecikti` : 
                 'Bugün bitiyor'}
              </span>
            </div>
          </div>
        </div>

        {/* Timeline and Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              <span className="text-xs">Tarih Aralığı</span>
            </div>
            <div className="text-xs line-clamp-1">
              {formatDate(kpiStats.startDate)} - {formatDate(kpiStats.endDate)}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3 h-3 flex-shrink-0" />
              <span className="text-xs">Kalan Süre</span>
            </div>
            <div className={cn(
              "text-xs font-medium",
              isOverdue ? "text-kpi-danger" : 
              (kpiStats.remainingDays || 0) <= 7 ? "text-kpi-warning" : "text-foreground"
            )}>
              {isOverdue ? 
                `${Math.abs(kpiStats.remainingDays || 0)} gün gecikme` : 
                `${kpiStats.remainingDays || 0} gün`
              }
            </div>
          </div>
        </div>

        {/* Velocity and Estimation */}
        {(kpiStats.velocity || 0) > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <TrendingUp className="w-3 h-3 flex-shrink-0" />
                <span className="text-xs">Günlük Hız</span>
              </div>
              <div className="text-xs line-clamp-1">
                {(kpiStats.velocity || 0).toFixed(2)} {kpiStats.unit || ''}/gün
              </div>
            </div>
            
            {kpiStats.estimatedCompletion && !isCompleted && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Target className="w-3 h-3 flex-shrink-0" />
                  <span className="text-xs">Tahmini Bitiş</span>
                </div>
                <div className="text-xs line-clamp-1">
                  {formatDate(kpiStats.estimatedCompletion)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Progress */}
        {showProgressHistory && (kpiStats.recentProgress || []).length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="w-3 h-3" />
              <span className="text-xs">Son İlerlemeler</span>
            </div>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {(kpiStats.recentProgress || []).slice(0, 3).map((progress) => (
                <div key={progress.id} className="text-xs bg-muted/30 p-2 rounded">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      +{(progress.value || 0).toLocaleString('tr-TR')} {kpiStats.unit || ''}
                    </span>
                    <span className="text-muted-foreground">
                      {formatDateTime(progress.recordedAt)}
                    </span>
                  </div>
                  {progress.note && (
                    <div className="text-muted-foreground mt-1 line-clamp-1">
                      {progress.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions Hint */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 text-xs text-muted-foreground">
          <span className="hidden sm:inline">Detaylar için tıklayın</span>
          <span className="sm:hidden">Detaylar için tıklayın</span>
          <div className="flex items-center gap-2">
            {(kpiStats.comments || []).length > 0 && (
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3 flex-shrink-0" />
                <span className="hidden sm:inline">{(kpiStats.comments || []).length}</span>
                <span className="sm:hidden">{(kpiStats.comments || []).length}</span>
              </span>
            )}
            {(kpiStats.recentProgress || []).length > 0 && (
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 flex-shrink-0" />
                <span className="hidden sm:inline">{(kpiStats.recentProgress || []).length}</span>
                <span className="sm:hidden">{(kpiStats.recentProgress || []).length}</span>
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}