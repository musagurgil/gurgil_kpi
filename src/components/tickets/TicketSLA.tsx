import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { Ticket, TICKET_PRIORITIES, TICKET_STATUSES } from '@/types/ticket';
import { cn } from "@/lib/utils";

interface TicketSLAProps {
  ticket: Ticket;
}

const SLA_TIMES = {
  urgent: 4,
  high: 24,
  medium: 72,
  low: 168
};

export function TicketSLA({ ticket }: TicketSLAProps) {
  const slaHours = SLA_TIMES[ticket.priority as keyof typeof SLA_TIMES] || 72;
  const createdAt = new Date(ticket.createdAt);
  const now = new Date();

  const elapsedMs = now.getTime() - createdAt.getTime();
  const elapsedHours = elapsedMs / (1000 * 60 * 60);

  const remainingHours = slaHours - elapsedHours;
  const remainingDays = Math.floor(Math.abs(remainingHours) / 24);
  const remainingHoursOnly = Math.floor(Math.abs(remainingHours) % 24);

  const progressPercentage = Math.min((elapsedHours / slaHours) * 100, 100);

  const isOverdue = remainingHours < 0;
  const isWarning = !isOverdue && remainingHours <= (slaHours * 0.2);
  const isResolved = ticket.status === 'resolved' || ticket.status === 'closed';

  const getProgressColor = () => {
    if (isResolved) return 'from-emerald-400 to-green-500';
    if (isOverdue) return 'from-red-400 to-red-600';
    if (isWarning) return 'from-amber-400 to-orange-500';
    return 'from-blue-400 to-indigo-500';
  };

  const getSLABadge = () => {
    if (isResolved) {
      return { variant: 'default' as const, text: 'Çözüldü', icon: <CheckCircle className="w-3 h-3" />, className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
    }
    if (isOverdue) {
      return { variant: 'destructive' as const, text: 'SLA Aşıldı', icon: <AlertTriangle className="w-3 h-3" />, className: 'bg-red-500/10 text-red-600 border-red-500/20' };
    }
    if (isWarning) {
      return { variant: 'secondary' as const, text: 'Kritik', icon: <AlertTriangle className="w-3 h-3" />, className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
    }
    return { variant: 'outline' as const, text: 'Normal', icon: <Clock className="w-3 h-3" />, className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
  };

  const badge = getSLABadge();

  const formatTimeRemaining = () => {
    if (isResolved) {
      const resolvedAt = new Date(ticket.resolvedAt || ticket.closedAt || ticket.updatedAt);
      const resolutionTime = resolvedAt.getTime() - createdAt.getTime();
      const resolutionHours = Math.floor(resolutionTime / (1000 * 60 * 60));
      const withinSLA = resolutionHours <= slaHours;

      return (
        <div className="space-y-0.5">
          <p className={cn("text-xs font-semibold", withinSLA ? "text-emerald-600" : "text-red-600")}>
            {withinSLA ? '✅ SLA içinde' : '⚠️ SLA dışında'}
          </p>
          <p className="text-[10px] text-muted-foreground">
            Süre: {Math.floor(resolutionHours / 24)}g {resolutionHours % 24}s
          </p>
        </div>
      );
    }

    if (isOverdue) {
      return (
        <span className="font-semibold text-red-600 text-xs">
          {remainingDays}g {remainingHoursOnly}s gecikme
        </span>
      );
    }

    if (remainingDays > 0) {
      return (
        <span className={cn("font-semibold text-xs", isWarning ? "text-amber-600" : "text-foreground")}>
          {remainingDays}g {remainingHoursOnly}s kaldı
        </span>
      );
    }

    return (
      <span className="font-semibold text-amber-600 text-xs">
        {Math.floor(remainingHours)}s kaldı
      </span>
    );
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card/80 overflow-hidden">
      {/* Gradient top bar */}
      <div className={cn("h-1 bg-gradient-to-r", getProgressColor())} />

      <div className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold">SLA</span>
          </div>
          <Badge variant="outline" className={cn("text-[10px] h-5 gap-0.5", badge.className)}>
            {badge.icon}
            {badge.text}
          </Badge>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Hedef:</span>
            <span className="font-medium">
              {slaHours < 24 ? `${slaHours} saat` : `${Math.floor(slaHours / 24)} gün`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Geçen:</span>
            <span className="font-medium">
              {Math.floor(elapsedHours / 24)}g {Math.floor(elapsedHours % 24)}s
            </span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-muted-foreground">Kalan:</span>
            {formatTimeRemaining()}
          </div>
        </div>

        {!isResolved && (
          <div className="space-y-1">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-700 bg-gradient-to-r", getProgressColor())}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              %{progressPercentage.toFixed(0)} geçti
            </p>
          </div>
        )}

        <div className="pt-2 border-t border-border/30 space-y-1 text-[11px]">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Öncelik:</span>
            <span className="font-medium">{TICKET_PRIORITIES[ticket.priority]}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Durum:</span>
            <span className="font-medium">{TICKET_STATUSES[ticket.status]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
