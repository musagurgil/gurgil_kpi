import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Target,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    X,
    MoreHorizontal,
    ArrowRight
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { KPIStats, KPI_PERIODS, KPI_PRIORITIES } from '@/types/kpi';
import { cn } from "@/lib/utils";

interface KPITableProps {
    kpis: KPIStats[];
    onKPISelect: (kpi: KPIStats) => void;
    canRecordProgress: (kpi: KPIStats) => boolean;
    canDelete: (kpi: KPIStats) => boolean;
    onDelete: (kpiId: string) => void;
}

export function KPITable({
    kpis,
    onKPISelect,
    canRecordProgress,
    canDelete,
    onDelete
}: KPITableProps) {

    const getStatusColor = (status: KPIStats['status']) => {
        switch (status) {
            case 'success': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'warning': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'danger': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-muted text-muted-foreground border-border';
        }
    };

    const getStatusIcon = (status: KPIStats['status']) => {
        switch (status) {
            case 'success': return <CheckCircle className="w-4 h-4" />;
            case 'warning': return <AlertTriangle className="w-4 h-4" />;
            case 'danger': return <X className="w-4 h-4" />;
            default: return <Target className="w-4 h-4" />;
        }
    };

    const getStatusText = (kpi: KPIStats) => {
        if (kpi.progressPercentage >= 100) return 'Tamamlandı';
        switch (kpi.status) {
            case 'success': return 'Hedefte';
            case 'warning': return 'Dikkat';
            case 'danger': return 'Kritik';
            default: return 'Normal';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR');
    };

    return (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-muted/50 border-white/5">
                        <TableHead className="w-[300px] font-semibold text-foreground">KPI Adı</TableHead>
                        <TableHead className="font-semibold text-foreground">Departman</TableHead>
                        <TableHead className="w-[120px] font-semibold text-foreground">Durum</TableHead>
                        <TableHead className="w-[180px] font-semibold text-foreground">İlerleme</TableHead>
                        <TableHead className="font-semibold text-foreground hidden md:table-cell">Hedef / Mevcut</TableHead>
                        <TableHead className="font-semibold text-foreground hidden lg:table-cell">Dönem</TableHead>
                        <TableHead className="font-semibold text-foreground hidden lg:table-cell">Bitiş Tarihi</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {kpis.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <Target className="w-8 h-8 opacity-20" />
                                    <p>Görüntülenecek KPI bulunamadı.</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        kpis.map((kpi, index) => (
                            <TableRow
                                key={kpi.kpiId}
                                className={cn(
                                    "cursor-pointer transition-colors hover:bg-muted/50",
                                    index % 2 === 0 ? "bg-background/50" : "bg-muted/20"
                                )}
                                onClick={() => onKPISelect(kpi)}
                            >
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <div className={cn("font-medium truncate max-w-[280px] border-l-2 pl-2",
                                            kpi.priority === 'high' ? "border-l-red-500" :
                                                kpi.priority === 'medium' ? "border-l-yellow-500" : "border-l-blue-500"
                                        )} title={kpi.title}>
                                            {kpi.title}
                                        </div>
                                        {kpi.priority && (
                                            <div className="pl-2.5">
                                                <Badge variant="outline" className="text-[10px] h-4 px-1 text-muted-foreground border-border/50">
                                                    {KPI_PRIORITIES[kpi.priority]}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="font-normal bg-secondary/50 text-secondary-foreground hover:bg-secondary/60">
                                        {kpi.department}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={cn("text-[10px] font-medium flex items-center gap-1.5 w-fit px-2 py-0.5 min-w-[90px] justify-center", getStatusColor(kpi.status))}>
                                        {getStatusIcon(kpi.status)}
                                        <span className="hidden sm:inline">{getStatusText(kpi)}</span>
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1.5 w-[160px]">
                                        <div className="flex justify-between text-xs items-center">
                                            <span className={cn("font-bold", kpi.progressPercentage >= 100 ? "text-emerald-600" : "text-foreground")}>
                                                %{kpi.progressPercentage.toFixed(0)}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {kpi.remainingDays < 0 ? 'Gecikti' : `${kpi.remainingDays} gün`}
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-500",
                                                    kpi.status === 'success' ? "bg-gradient-to-r from-emerald-500 to-green-400" :
                                                        kpi.status === 'warning' ? "bg-gradient-to-r from-amber-500 to-yellow-400" :
                                                            kpi.status === 'danger' ? "bg-gradient-to-r from-rose-500 to-red-400" :
                                                                "bg-primary"
                                                )}
                                                style={{ width: `${Math.min(kpi.progressPercentage, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    <div className="text-sm">
                                        <span className="font-medium text-foreground">{kpi.currentValue.toLocaleString('tr-TR')}</span>
                                        <span className="text-muted-foreground mx-1">/</span>
                                        <span className="text-muted-foreground text-xs">{kpi.targetValue.toLocaleString('tr-TR')} {kpi.unit}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                                    {KPI_PERIODS[kpi.period]}
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">
                                    <div className="flex flex-col text-xs">
                                        <span className="text-foreground font-medium">
                                            {formatDate(kpi.endDate)}
                                        </span>
                                        <span className={cn("text-[10px]", kpi.remainingDays < 0 ? "text-rose-500 font-medium" : "text-muted-foreground")}>
                                            {kpi.remainingDays < 0 ? `${Math.abs(kpi.remainingDays)} gün gecikti` : `${kpi.remainingDays} gün kaldı`}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary/80">
                                                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => onKPISelect(kpi)} className="cursor-pointer">
                                                <ArrowRight className="w-4 h-4 mr-2 text-muted-foreground" />
                                                Detayları Görüntüle
                                            </DropdownMenuItem>
                                            {canDelete(kpi) && (
                                                <DropdownMenuItem onClick={() => onDelete(kpi.kpiId)} className="text-destructive focus:text-destructive cursor-pointer">
                                                    <X className="w-4 h-4 mr-2" />
                                                    Sil
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
