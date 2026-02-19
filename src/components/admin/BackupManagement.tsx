import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
} from '@/components/ui/alert-dialog';
import {
    Database,
    Download,
    Upload,
    Trash2,
    HardDrive,
    Clock,
    Shield,
    Loader2,
    CheckCircle,
    AlertTriangle,
    FileText,
    BarChart3,
    RefreshCw,
} from 'lucide-react';
import { useBackup } from '@/hooks/useBackup';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { cn } from '@/lib/utils';

const COLORS = [
    '#3B82F6', // blue
    '#10B981', // emerald
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#F97316', // orange
    '#14B8A6', // teal
    '#6366F1', // indigo
    '#84CC16', // lime
    '#A855F7', // purple
    '#22D3EE', // sky
    '#FB923C', // light orange
];

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

function timeAgo(dateString: string): string {
    const now = new Date();
    const then = new Date(dateString);
    const diff = now.getTime() - then.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Az önce';
    if (minutes < 60) return `${minutes} dakika önce`;
    if (hours < 24) return `${hours} saat önce`;
    if (days < 7) return `${days} gün önce`;
    return formatDate(dateString);
}

// Custom tooltip for pie chart
const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                <p className="font-semibold text-sm text-foreground">{data.displayName}</p>
                <p className="text-xs text-muted-foreground mt-1">
                    {data.count} kayıt · {formatBytes(data.size)}
                </p>
            </div>
        );
    }
    return null;
};

export function BackupManagement() {
    const {
        backups,
        loading,
        creating,
        restoring,
        loadBackups,
        createBackup,
        downloadBackup,
        restoreBackup,
        deleteBackup,
    } = useBackup();

    const [selectedBackup, setSelectedBackup] = useState<any>(null);

    useEffect(() => {
        loadBackups();
    }, [loadBackups]);

    // Get the latest backup for visualization
    const latestBackup = backups.length > 0 ? backups[0] : null;

    const pieData = latestBackup?.tables?.filter((t: any) => t.count > 0).map((t: any) => ({
        ...t,
        name: t.displayName,
    })) || [];
    const barData = latestBackup?.tables?.map((t: any) => ({
        ...t,
        sizeKB: +(t.size / 1024).toFixed(2),
    })) || [];

    return (
        <div className="space-y-6">
            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Create Backup Card */}
                <Card className="border-2 border-dashed border-primary/30 hover:border-primary/60 transition-colors">
                    <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <Database className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Yeni Yedek Al</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Tüm sistem verilerini yedekleyin
                            </p>
                        </div>
                        <Button
                            onClick={createBackup}
                            disabled={creating || restoring}
                            className="w-full"
                            size="lg"
                        >
                            {creating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Yedekleniyor...
                                </>
                            ) : (
                                <>
                                    <HardDrive className="w-4 h-4 mr-2" />
                                    Yedek Oluştur
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Last Backup Info */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm">Son Yedek</h4>
                                {latestBackup ? (
                                    <div className="space-y-1.5 mt-2">
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {timeAgo(latestBackup.createdAt)}
                                        </p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <HardDrive className="w-3 h-3" />
                                            {formatBytes(latestBackup.totalSize)}
                                        </p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <FileText className="w-3 h-3" />
                                            {latestBackup.totalRecords} kayıt
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Henüz yedek alınmamış
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* System Summary */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                <Shield className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm">Yedek Sayısı</h4>
                                <div className="space-y-1.5 mt-2">
                                    <p className="text-2xl font-bold">{backups.length}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Toplam {formatBytes(backups.reduce((sum, b) => sum + b.totalSize, 0))} depolama
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Data Distribution Charts */}
            {latestBackup && pieData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            Veri Dağılımı (Son Yedek)
                        </CardTitle>
                        <CardDescription>
                            Tablo bazında kayıt sayısı ve boyut analizi
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Pie Chart - Record Distribution */}
                            <div>
                                <h4 className="text-sm font-semibold text-center mb-4 text-muted-foreground">
                                    Kayıt Dağılımı
                                </h4>
                                <div className="h-[280px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={55}
                                                outerRadius={90}
                                                paddingAngle={3}
                                                dataKey="count"
                                                nameKey="displayName"
                                            >
                                                {pieData.map((_: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomPieTooltip />} />
                                            <Legend
                                                formatter={(value: string) => (
                                                    <span className="text-xs text-foreground">{value}</span>
                                                )}
                                                wrapperStyle={{ fontSize: '11px' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Bar Chart - Size Distribution */}
                            <div>
                                <h4 className="text-sm font-semibold text-center mb-4 text-muted-foreground">
                                    Boyut Dağılımı (KB)
                                </h4>
                                <div className="h-[280px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                                            <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                                            <YAxis
                                                dataKey="displayName"
                                                type="category"
                                                width={130}
                                                tick={{ fontSize: 10 }}
                                                stroke="hsl(var(--muted-foreground))"
                                            />
                                            <Tooltip
                                                formatter={(value: number) => [`${value} KB`, 'Boyut']}
                                                contentStyle={{
                                                    backgroundColor: 'hsl(var(--popover))',
                                                    border: '1px solid hsl(var(--border))',
                                                    borderRadius: '8px',
                                                    fontSize: '12px',
                                                }}
                                            />
                                            <Bar dataKey="sizeKB" radius={[0, 4, 4, 0]}>
                                                {barData.map((_: any, index: number) => (
                                                    <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Table summary grid */}
                        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                            {latestBackup.tables?.map((table: any, index: number) => (
                                <div
                                    key={table.name}
                                    className="bg-muted/40 rounded-lg p-3 text-center border border-border/50"
                                >
                                    <div
                                        className="w-3 h-3 rounded-full mx-auto mb-2"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    />
                                    <p className="text-xs font-medium truncate" title={table.displayName}>
                                        {table.displayName}
                                    </p>
                                    <p className="text-lg font-bold mt-1">{table.count}</p>
                                    <p className="text-xs text-muted-foreground">{formatBytes(table.size)}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Backup History */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                Yedek Geçmişi
                            </CardTitle>
                            <CardDescription>
                                Oluşturulmuş tüm yedekler
                            </CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={loadBackups} disabled={loading}>
                            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
                            Yenile
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading && backups.length === 0 ? (
                        <div className="flex items-center justify-center py-12 text-muted-foreground">
                            <Loader2 className="w-6 h-6 animate-spin mr-2" />
                            Yedekler yükleniyor...
                        </div>
                    ) : backups.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Database className="w-12 h-12 mb-3 opacity-30" />
                            <p className="font-medium">Henüz yedek oluşturulmamış</p>
                            <p className="text-sm">Yukarıdaki butonu kullanarak ilk yedeğinizi alın.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {backups.map((backup, index) => (
                                <div
                                    key={backup.id}
                                    className={cn(
                                        "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border transition-colors",
                                        index === 0
                                            ? "bg-primary/5 border-primary/20"
                                            : "bg-muted/30 border-border/50 hover:bg-muted/50"
                                    )}
                                >
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <div className={cn(
                                            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                                            index === 0 ? "bg-primary/10" : "bg-muted"
                                        )}>
                                            <Database className={cn("w-5 h-5", index === 0 ? "text-primary" : "text-muted-foreground")} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-medium text-sm truncate">{backup.id}</p>
                                                {index === 0 && (
                                                    <Badge variant="default" className="text-[10px] px-1.5 py-0">
                                                        Son
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDate(backup.createdAt)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <HardDrive className="w-3 h-3" />
                                                    {formatBytes(backup.totalSize)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <FileText className="w-3 h-3" />
                                                    {backup.totalRecords} kayıt
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => downloadBackup(backup.id)}
                                            title="Yedek İndir"
                                        >
                                            <Download className="w-4 h-4 mr-1.5" />
                                            <span className="hidden sm:inline">İndir</span>
                                        </Button>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={restoring}
                                                    className="text-amber-600 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950"
                                                    title="Geri Yükle"
                                                >
                                                    {restoring ? (
                                                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                                                    ) : (
                                                        <Upload className="w-4 h-4 mr-1.5" />
                                                    )}
                                                    <span className="hidden sm:inline">Geri Yükle</span>
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="flex items-center gap-2">
                                                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                                                        Geri Yükleme Onayı
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription className="space-y-2">
                                                        <p>
                                                            <strong>{backup.id}</strong> tarihli yedeği geri yüklemek istediğinizden emin misiniz?
                                                        </p>
                                                        <p className="text-destructive font-medium">
                                                            ⚠️ Bu işlem mevcut tüm verileri silecek ve yedeğin alındığı andaki verileri geri yükleyecektir.
                                                            Bu işlem geri alınamaz!
                                                        </p>
                                                        <div className="bg-muted rounded-lg p-3 text-sm mt-3">
                                                            <p><strong>Yedek Bilgileri:</strong></p>
                                                            <p className="text-muted-foreground">· Tarih: {formatDate(backup.createdAt)}</p>
                                                            <p className="text-muted-foreground">· Boyut: {formatBytes(backup.totalSize)}</p>
                                                            <p className="text-muted-foreground">· Toplam Kayıt: {backup.totalRecords}</p>
                                                        </div>
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>İptal</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => restoreBackup(backup.id)}
                                                        className="bg-amber-600 hover:bg-amber-700 text-white"
                                                    >
                                                        <Upload className="w-4 h-4 mr-2" />
                                                        Geri Yükle
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                                                    title="Yedeği Sil"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Yedeği Sil</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        <strong>{backup.id}</strong> tarihli yedeği silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>İptal</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => deleteBackup(backup.id)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Sil
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
