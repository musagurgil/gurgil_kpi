import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  Trash2,
  ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 cursor-pointer border-l-4",
        kpiStats.priority === 'high' ? "border-l-red-500" :
          kpiStats.priority === 'medium' ? "border-l-yellow-500" : "border-l-blue-500"
      )}
      onClick={onClick}
    >
      <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
      </div>

      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-start gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-background/50 backdrop-blur-sm">
                  {kpiStats.department}
                </Badge>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                  {KPI_PERIODS[kpiStats.period]}
                </Badge>
              </div>
              <CardTitle className="text-base font-semibold leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
                {kpiStats.title}
              </CardTitle>
            </div>
            <Badge
              variant={getStatusBadgeVariant()}
              className={cn(
                "text-[10px] px-2 py-0.5 h-6 flex items-center gap-1.5 shrink-0 shadow-sm",
                kpiStats.status === 'success' && "bg-emerald-100 text-emerald-700 border-emerald-200",
                kpiStats.status === 'warning' && "bg-amber-100 text-amber-700 border-amber-200",
                kpiStats.status === 'danger' && "bg-rose-100 text-rose-700 border-rose-200"
              )}
            >
              {getStatusIcon()}
              <span className="font-medium">{getStatusText()}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 space-y-4">
        {/* Value and Target */}
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold tracking-tight">
                {(kpiStats.currentValue || 0).toLocaleString('tr-TR')}
              </span>
              <span className="text-xs font-medium text-muted-foreground">{kpiStats.unit || ''}</span>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Hedef</div>
              <div className="text-sm font-semibold">
                {(kpiStats.targetValue || 0).toLocaleString('tr-TR')} {kpiStats.unit || ''}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className={cn("font-medium",
                (kpiStats.progressPercentage || 0) >= 100 ? "text-emerald-600" : "text-muted-foreground"
              )}>
                %{(kpiStats.progressPercentage || 0).toFixed(0)} Tamamlandı
              </span>
              <span className="text-muted-foreground">
                {((kpiStats.targetValue || 0) - (kpiStats.currentValue || 0)) > 0
                  ? `${((kpiStats.targetValue || 0) - (kpiStats.currentValue || 0)).toLocaleString('tr-TR')} ${kpiStats.unit} kalan`
                  : 'Hedefe ulaşıldı'
                }
              </span>
            </div>
            <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  kpiStats.status === 'success' ? "bg-gradient-to-r from-emerald-500 to-green-400" :
                    kpiStats.status === 'warning' ? "bg-gradient-to-r from-amber-500 to-yellow-400" :
                      kpiStats.status === 'danger' ? "bg-gradient-to-r from-rose-500 to-red-400" :
                        "bg-primary"
                )}
                style={{ width: `${Math.min(kpiStats.progressPercentage || 0, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-muted-foreground">Kalan Süre</span>
            <div className={cn(
              "text-xs font-medium flex items-center gap-1",
              isOverdue ? "text-rose-600" : (kpiStats.remainingDays || 0) <= 7 ? "text-amber-600" : "text-foreground"
            )}>
              <Clock className="w-3 h-3" />
              {kpiStats.remainingDays > 0 ? `${kpiStats.remainingDays} gün` : Math.abs(kpiStats.remainingDays) + ' gün gecikti'}
            </div>
          </div>

          <div className="flex flex-col gap-0.5 items-end">
            <span className="text-[10px] text-muted-foreground">Son Aktivite</span>
            <div className="flex items-center gap-2">
              {(kpiStats.comments || []).length > 0 && (
                <div className="flex items-center gap-0.5 text-xs text-muted-foreground" title="Yorumlar">
                  <MessageSquare className="w-3 h-3" />
                  {kpiStats.comments.length}
                </div>
              )}
              <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                {kpiStats.recentProgress && kpiStats.recentProgress.length > 0 ? (
                  <span title="Son ilerleme">{formatDate(kpiStats.recentProgress[0].recordedAt)}</span>
                ) : (
                  <span>-</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions Overlay Removed as per user request */}
      </CardContent>
    </Card>
  );
}