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
            case 'success': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
            case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
            case 'danger': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
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
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[250px]">KPI Adı</TableHead>
                        <TableHead>Departman</TableHead>
                        <TableHead className="w-[100px]">Durum</TableHead>
                        <TableHead className="w-[150px]">İlerleme</TableHead>
                        <TableHead className="hidden md:table-cell">Hedef / Mevcut</TableHead>
                        <TableHead className="hidden lg:table-cell">Dönem</TableHead>
                        <TableHead className="hidden lg:table-cell">Bitiş Tarihi</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {kpis.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                KPI bulunamadı.
                            </TableCell>
                        </TableRow>
                    ) : (
                        kpis.map((kpi) => (
                            <TableRow key={kpi.kpiId} className="cursor-pointer hover:bg-muted/50" onClick={() => onKPISelect(kpi)}>
                                <TableCell>
                                    <div className="font-medium truncate max-w-[200px]" title={kpi.title}>
                                        {kpi.title}
                                    </div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                        {kpi.priority && (
                                            <Badge variant="outline" className="text-[10px] h-4 px-1">
                                                {KPI_PRIORITIES[kpi.priority]}
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="font-normal">
                                        {kpi.department}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={cn("text-xs font-medium flex items-center gap-1 w-fit", getStatusColor(kpi.status))}>
                                        {getStatusIcon(kpi.status)}
                                        <span className="hidden sm:inline">{getStatusText(kpi)}</span>
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1 min-w-[100px]">
                                        <div className="flex justify-between text-xs">
                                            <span className="font-bold">%{kpi.progressPercentage.toFixed(0)}</span>
                                        </div>
                                        <Progress
                                            value={Math.min(kpi.progressPercentage, 100)}
                                            className={cn("h-2",
                                                kpi.status === 'success' ? "[&>div]:bg-green-600" :
                                                    kpi.status === 'warning' ? "[&>div]:bg-yellow-500" :
                                                        kpi.status === 'danger' ? "[&>div]:bg-red-500" : "[&>div]:bg-primary"
                                            )}
                                        />
                                    </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    <div className="text-sm">
                                        <span className="font-medium">{kpi.currentValue.toLocaleString('tr-TR')}</span>
                                        <span className="text-muted-foreground mx-1">/</span>
                                        <span className="text-muted-foreground">{kpi.targetValue.toLocaleString('tr-TR')} {kpi.unit}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                                    {KPI_PERIODS[kpi.period]}
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">
                                    <div className={cn("text-sm", kpi.remainingDays < 0 ? "text-red-500 font-medium" : "text-muted-foreground")}>
                                        {formatDate(kpi.endDate)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {kpi.remainingDays < 0 ? `${Math.abs(kpi.remainingDays)} gün gecikti` : `${kpi.remainingDays} gün kaldı`}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => onKPISelect(kpi)}>
                                                Detayları Görüntüle
                                            </DropdownMenuItem>
                                            {canDelete(kpi) && (
                                                <DropdownMenuItem onClick={() => onDelete(kpi.kpiId)} className="text-destructive focus:text-destructive">
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
