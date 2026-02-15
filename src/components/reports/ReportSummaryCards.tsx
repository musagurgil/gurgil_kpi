import { Card, CardContent } from "@/components/ui/card";
import { Clock, Ticket, Target, Activity } from "lucide-react";

interface TicketStats {
    created: number;
    resolved: number;
    open: number;
}

interface KPIStat {
    status: string;
    progressPercentage: number;
}

interface ReportSummaryCardsProps {
    totalHours: number;
    avgDaily: number;
    ticketStats: TicketStats;
    kpiStats: KPIStat[];
    activityCount: number;
    dateRange: string;
}

export function ReportSummaryCards({
    totalHours,
    avgDaily,
    ticketStats,
    kpiStats,
    activityCount,
    dateRange
}: ReportSummaryCardsProps) {
    const activeKPIs = kpiStats.filter(k => k.status !== 'success').length;
    const completedKPIs = kpiStats.filter(k => k.status === 'success' || k.progressPercentage >= 100).length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Work Hours */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Toplam Çalışma</p>
                            <p className="text-2xl font-bold text-foreground">{totalHours}s</p>
                            {dateRange !== 'all' && <p className="text-xs text-muted-foreground mt-1">Ort. {avgDaily}s / gün</p>}
                        </div>
                        <Clock className="h-8 w-8 text-primary" />
                    </div>
                </CardContent>
            </Card>

            {/* Ticket Stats */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Destek Talepleri</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-2xl font-bold text-foreground">{ticketStats.created}</p>
                                <span className="text-xs text-muted-foreground">Toplam</span>
                            </div>
                            <p className="text-xs text-green-500 mt-1">{ticketStats.resolved} Çözüldü</p>
                        </div>
                        <Ticket className="h-8 w-8 text-accent" />
                    </div>
                </CardContent>
            </Card>

            {/* KPI Stats */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Aktif KPI'lar</p>
                            <p className="text-2xl font-bold text-foreground">{activeKPIs}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {completedKPIs} Tamamlandı
                            </p>
                        </div>
                        <Target className="h-8 w-8 text-kpi-warning" />
                    </div>
                </CardContent>
            </Card>

            {/* Efficiency/Engagement */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Aktivite Sayısı</p>
                            <p className="text-2xl font-bold text-foreground">{activityCount}</p>
                            <p className="text-xs text-muted-foreground mt-1">Kayıtlı işlem</p>
                        </div>
                        <Activity className="h-8 w-8 text-kpi-success" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
