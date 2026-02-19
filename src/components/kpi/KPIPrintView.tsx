import React, { forwardRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { KPIStats, KPI_PERIODS, KPI_PRIORITIES } from '@/types/kpi';
import { cn } from "@/lib/utils";
import { Target, Calendar, TrendingUp, User, CheckCircle, AlertTriangle, X } from "lucide-react";
import { KPIProgressChart } from './KPIProgressChart';

interface KPIPrintViewProps {
    kpiStats: KPIStats;
}

export const KPIPrintView = forwardRef<HTMLDivElement, KPIPrintViewProps>(({ kpiStats }, ref) => {
    const isOverdue = (kpiStats.remainingDays || 0) < 0;

    const getStatusColor = () => {
        switch (kpiStats.status) {
            case 'success': return 'kpi-success';
            case 'warning': return 'kpi-warning';
            case 'danger': return 'kpi-danger';
            default: return 'primary';
        }
    };

    const getStatusIcon = () => {
        switch (kpiStats.status) {
            case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
            case 'danger': return <X className="w-5 h-5 text-red-600" />;
            default: return <Target className="w-5 h-5 text-blue-600" />;
        }
    };

    const getStatusText = () => {
        if (kpiStats.progressPercentage >= 100) return 'Tamamlandı';
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

    return (
        <div ref={ref} className="bg-white p-8 w-[794px] min-h-[1123px] text-black">
            {/* Header Section */}
            <div className="border-b pb-6 mb-6">
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            {getStatusIcon()}
                            {kpiStats.title}
                        </h1>
                        <p className="text-gray-500 text-sm">{kpiStats.description}</p>
                    </div>
                    <div className="text-right">
                        <div className="bg-gray-100 px-3 py-1 rounded-full inline-block mb-2">
                            <span className="text-sm font-semibold">{kpiStats.department}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                            Rapor Oluşturma Tarihi: {new Date().toLocaleDateString('tr-TR')}
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 mt-4">
                    <Badge variant="outline" className="text-xs bg-white text-black border-gray-300 px-4 flex items-center justify-center h-8 whitespace-nowrap">
                        {KPI_PERIODS[kpiStats.period]}
                    </Badge>
                    <Badge variant="secondary" className="text-xs bg-gray-200 text-black px-4 flex items-center justify-center h-8 whitespace-nowrap">
                        {KPI_PRIORITIES[kpiStats.priority]} Öncelik
                    </Badge>
                    <Badge className={cn("text-xs text-white px-4 flex items-center justify-center h-8 whitespace-nowrap",
                        kpiStats.status === 'success' ? 'bg-green-600' :
                            kpiStats.status === 'warning' ? 'bg-yellow-600' :
                                kpiStats.status === 'danger' ? 'bg-red-600' : 'bg-blue-600'
                    )}>
                        {getStatusText()}
                    </Badge>
                </div>
            </div>

            {/* Key Stats Grid */}
            <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        İlerleme Durumu
                    </h3>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-3xl font-bold text-gray-900">
                            {kpiStats.currentValue.toLocaleString('tr-TR')}
                            <span className="text-base font-normal text-gray-500 ml-1">{kpiStats.unit}</span>
                        </span>
                        <span className="text-sm font-medium text-gray-600 mb-1">
                            Hedef: {kpiStats.targetValue.toLocaleString('tr-TR')}
                        </span>
                    </div>
                    <Progress
                        value={Math.min(kpiStats.progressPercentage, 100)}
                        className={cn("h-2 mb-2 bg-gray-200",
                            kpiStats.status === 'success' ? '[&>div]:bg-green-600' :
                                kpiStats.status === 'warning' ? '[&>div]:bg-yellow-600' :
                                    kpiStats.status === 'danger' ? '[&>div]:bg-red-600' : '[&>div]:bg-blue-600'
                        )}
                    />
                    <div className="text-right text-xs font-medium text-gray-600">
                        %{(kpiStats.progressPercentage || 0).toFixed(1)} tamamlandı
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Zaman Çizelgesi
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm border-b border-gray-200 pb-2">
                            <span className="text-gray-500">Başlangıç:</span>
                            <span className="font-medium">{formatDate(kpiStats.startDate)}</span>
                        </div>
                        <div className="flex justify-between text-sm border-b border-gray-200 pb-2">
                            <span className="text-gray-500">Bitiş:</span>
                            <span className="font-medium">{formatDate(kpiStats.endDate)}</span>
                        </div>
                        <div className="flex justify-between text-sm pt-1">
                            <span className="text-gray-500">Kalan Süre:</span>
                            <span className={cn("font-bold", isOverdue ? "text-red-600" : "text-green-600")}>
                                {Math.abs(kpiStats.remainingDays || 0)} gün {isOverdue ? 'gecikme' : 'kaldı'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart Section - Critical */}
            <div className="mb-8 p-4 bg-white border rounded-lg shadow-sm">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    İlerleme Grafiği
                </h3>
                <div className="h-[300px] w-full">
                    <KPIProgressChart
                        progress={kpiStats.recentProgress || []}
                        targetValue={kpiStats.targetValue}
                        unit={kpiStats.unit}
                        showHeader={false}
                        showSummary={false}
                    />
                </div>
            </div>

            {/* Recent Activity Table (Last 5 items) */}
            <div className="mb-8">
                <h3 className="text-lg font-bold mb-4 border-b pb-2">Son Aktiviteler</h3>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200 text-left">
                            <th className="py-2 text-gray-500 font-medium">Tarih</th>
                            <th className="py-2 text-gray-500 font-medium">Kişi</th>
                            <th className="py-2 text-gray-500 font-medium">İşlem</th>
                            <th className="py-2 text-gray-500 font-medium">Değer</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(kpiStats.recentProgress || []).slice(0, 5).map((progress, idx) => (
                            <tr key={idx} className="border-b border-gray-100">
                                <td className="py-2">{new Date(progress.recordedAt).toLocaleDateString('tr-TR')}</td>
                                <td className="py-2">{progress.recordedByName || progress.recordedBy}</td>
                                <td className="py-2 max-w-[200px] truncate">{progress.note || 'İlerleme Kaydı'}</td>
                                <td className="py-2 font-semibold">+{progress.value} {kpiStats.unit}</td>
                            </tr>
                        ))}
                        {(kpiStats.recentProgress || []).length === 0 && (
                            <tr>
                                <td colSpan={4} className="py-4 text-center text-gray-500">Henüz aktivite bulunmuyor.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
                Bu rapor Gurgil KPI Yönetim Sistemi tarafından otomatik olarak oluşturulmuştur.
            </div>
        </div>
    );
});

KPIPrintView.displayName = "KPIPrintView";
