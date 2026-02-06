import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { Ticket } from '@/types/ticket';
import { cn } from "@/lib/utils";

interface TicketSLAProps {
  ticket: Ticket;
}

// SLA sürelerişu (saat cinsinden)
const SLA_TIMES = {
  urgent: 4,    // 4 saat
  high: 24,     // 1 gün
  medium: 72,   // 3 gün
  low: 168      // 1 hafta
};

export function TicketSLA({ ticket }: TicketSLAProps) {
  const slaHours = SLA_TIMES[ticket.priority as keyof typeof SLA_TIMES] || 72;
  const createdAt = new Date(ticket.createdAt);
  const now = new Date();
  
  // Calculate elapsed time
  const elapsedMs = now.getTime() - createdAt.getTime();
  const elapsedHours = elapsedMs / (1000 * 60 * 60);
  
  // Calculate remaining time
  const remainingHours = slaHours - elapsedHours;
  const remainingDays = Math.floor(remainingHours / 24);
  const remainingHoursOnly = Math.floor(remainingHours % 24);
  
  // Calculate progress percentage
  const progressPercentage = Math.min((elapsedHours / slaHours) * 100, 100);
  
  // Determine SLA status
  const isOverdue = remainingHours < 0;
  const isWarning = !isOverdue && remainingHours <= (slaHours * 0.2); // 20% kaldığında uyar
  const isNearDeadline = !isOverdue && !isWarning && remainingHours <= (slaHours * 0.5); // 50% kaldığında
  
  const getSLAColor = () => {
    if (ticket.status === 'resolved' || ticket.status === 'closed') {
      return 'kpi-success';
    }
    if (isOverdue) return 'kpi-danger';
    if (isWarning) return 'kpi-warning';
    return 'kpi-success';
  };

  const getSLABadge = () => {
    if (ticket.status === 'resolved' || ticket.status === 'closed') {
      return { variant: 'default', text: 'Çözüldü', icon: <CheckCircle className="w-3 h-3" /> };
    }
    if (isOverdue) {
      return { variant: 'destructive', text: 'SLA Aşıldı', icon: <AlertTriangle className="w-3 h-3" /> };
    }
    if (isWarning) {
      return { variant: 'secondary', text: 'Kritik', icon: <AlertTriangle className="w-3 h-3" /> };
    }
    return { variant: 'outline', text: 'Normal', icon: <Clock className="w-3 h-3" /> };
  };

  const badge = getSLABadge();

  const formatTimeRemaining = () => {
    if (ticket.status === 'resolved' || ticket.status === 'closed') {
      const resolvedAt = new Date(ticket.resolvedAt || ticket.closedAt || ticket.updatedAt);
      const resolutionTime = resolvedAt.getTime() - createdAt.getTime();
      const resolutionHours = Math.floor(resolutionTime / (1000 * 60 * 60));
      const withinSLA = resolutionHours <= slaHours;
      
      return (
        <div className="space-y-1">
          <p className="text-sm">
            <span className={cn("font-semibold", withinSLA ? "text-kpi-success" : "text-kpi-danger")}>
              {withinSLA ? '✅ SLA içinde çözüldü' : '⚠️ SLA dışında çözüldü'}
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            Çözüm süresi: {Math.floor(resolutionHours / 24)}g {resolutionHours % 24}s
          </p>
        </div>
      );
    }
    
    if (isOverdue) {
      return (
        <span className="font-semibold text-kpi-danger">
          {Math.abs(remainingDays)}g {Math.abs(remainingHoursOnly)}s gecikme
        </span>
      );
    }
    
    if (remainingDays > 0) {
      return (
        <span className={cn("font-semibold", isWarning ? "text-kpi-warning" : "text-foreground")}>
          {remainingDays}g {remainingHoursOnly}s kaldı
        </span>
      );
    }
    
    return (
      <span className={cn("font-semibold", "text-kpi-warning")}>
        {Math.floor(remainingHours)}s kaldı
      </span>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            SLA Durumu
          </CardTitle>
          <Badge variant={badge.variant as any} className="flex items-center gap-1">
            {badge.icon}
            {badge.text}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Hedef Süre:</span>
            <span className="font-medium">
              {slaHours < 24 ? `${slaHours} saat` : `${Math.floor(slaHours / 24)} gün`}
            </span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Geçen Süre:</span>
            <span className="font-medium">
              {Math.floor(elapsedHours / 24)}g {Math.floor(elapsedHours % 24)}s
            </span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Kalan Süre:</span>
            {formatTimeRemaining()}
          </div>
        </div>

        {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
          <div className="space-y-2">
            <Progress 
              value={progressPercentage} 
              className={cn("h-2", `[&>div]:bg-${getSLAColor()}`)}
            />
            <p className="text-xs text-muted-foreground text-center">
              SLA süresinin %{progressPercentage.toFixed(1)}'i geçti
            </p>
          </div>
        )}

        <div className="pt-2 border-t border-border space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Öncelik:</span>
            <span className="font-medium">{TICKET_PRIORITIES[ticket.priority]}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Durum:</span>
            <span className="font-medium">{TICKET_STATUSES[ticket.status]}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Extend types to include TICKET_PRIORITIES and TICKET_STATUSES
const TICKET_PRIORITIES: Record<string, string> = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
  urgent: 'Acil'
};

const TICKET_STATUSES: Record<string, string> = {
  open: 'Açık',
  in_progress: 'Devam Ediyor',
  resolved: 'Çözüldü',
  closed: 'Kapatıldı'
};

