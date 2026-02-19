import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Edit,
  Trash2,
  Save,
  X,
  Target,
  Calendar,
  Clock,
  TrendingUp,
  Users,
  MessageSquare,
  Plus,
  AlertTriangle,
  CheckCircle,
  User,
  Download,
  Loader2,
  Printer,
  History,
  Settings,
  Send,
  ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { KPIStats, KPI_PERIODS, KPI_PRIORITIES, CreateKPIData, KPIUser } from '@/types/kpi';
import { toast } from '@/hooks/use-toast';
import { KPIProgressChart } from './KPIProgressChart';
import { toast as sonnerToast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { KPIPrintView } from './KPIPrintView';

interface KPIDetailDialogProps {
  kpiStats: KPIStats;
  currentUser: KPIUser | null;
  availableDepartments: string[];
  availableUsers: KPIUser[];
  onUpdateKPI: (kpiId: string, updates: Partial<CreateKPIData>) => Promise<void>;
  onDeleteKPI: (kpiId: string) => Promise<void>;
  onRecordProgress: (kpiId: string, value: number, note?: string) => Promise<void>;
  onAddComment: (kpiId: string, content: string) => Promise<void>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  canEdit: boolean;
  canDelete: boolean;
  canRecordProgress: boolean;
}

export function KPIDetailDialog({
  kpiStats,
  currentUser,
  availableDepartments,
  availableUsers,
  onUpdateKPI,
  onDeleteKPI,
  onRecordProgress,
  onAddComment,
  isOpen,
  onOpenChange,
  canEdit,
  canDelete,
  canRecordProgress
}: KPIDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<CreateKPIData>>({});
  const [progressValue, setProgressValue] = useState('');
  const [progressNote, setProgressNote] = useState('');
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isExporting, setIsExporting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Calculate completion status
  const isCompleted = (kpiStats.progressPercentage || 0) >= 100;
  const isOverdue = (kpiStats.remainingDays || 0) < 0;

  // Initialize edit form when KPI changes
  useEffect(() => {
    setEditForm({
      title: kpiStats.title,
      description: kpiStats.description,
      department: kpiStats.department,
      targetValue: kpiStats.targetValue,
      unit: kpiStats.unit,
      startDate: kpiStats.startDate,
      endDate: kpiStats.endDate,
      period: kpiStats.period,
      priority: kpiStats.priority,
      assignedTo: kpiStats.assignedUsers
    });
  }, [kpiStats]);

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
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'danger': return <X className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSave = async () => {
    try {
      await onUpdateKPI(kpiStats.kpiId, editForm);
      setIsEditing(false);
      // Toast useKPI hook'undan gösterilecek
    } catch (error) {
      // Error toast useKPI hook'undan gösterilecek
    }
  };

  const handleDelete = async () => {
    try {
      await onDeleteKPI(kpiStats.kpiId);
      onOpenChange(false);
      // Toast useKPI hook'undan gösterilecek
    } catch (error) {
      // Error toast useKPI hook'undan gösterilecek
    }
  };

  const handleRecordProgress = async () => {
    if (!progressValue) {
      toast({
        title: "Hata",
        description: "Lütfen ilerleme değeri girin",
        variant: "destructive"
      });
      return;
    }

    const value = Number(progressValue);

    // Negatif değer kontrolü
    if (value <= 0) {
      toast({
        title: "Hata",
        description: "İlerleme değeri 0'dan büyük olmalıdır",
        variant: "destructive"
      });
      return;
    }

    // Hedeften fazla olma kontrolü (warning)
    const newCurrentValue = (kpiStats.currentValue || 0) + value;
    if (newCurrentValue > kpiStats.targetValue) {
      toast({
        title: "Uyarı",
        description: `Bu ilerleme ile toplam değer (${newCurrentValue} ${kpiStats.unit}) hedefi (${kpiStats.targetValue} ${kpiStats.unit}) aşacak. Devam etmek istiyor musunuz?`,
        variant: "default"
      });
      // Kullanıcı devam edebilir, sadece uyarı veriyoruz
    }

    try {
      await onRecordProgress(kpiStats.kpiId, value, progressNote || undefined);
      setProgressValue('');
      setProgressNote('');
      // Toast useKPI hook'undan gösterilecek
    } catch (error) {
      // Error toast useKPI hook'undan gösterilecek
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await onAddComment(kpiStats.kpiId, newComment);
      setNewComment('');
      // Toast useKPI hook'undan gösterilecek
    } catch (error) {
      // Error toast useKPI hook'undan gösterilecek
    }
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;

    setIsExporting(true);
    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        logging: false
      } as any);

      // Use JPEG with 0.8 quality for significant size reduction compared to PNG
      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const scaledWidth = pdfWidth;
      const scaledHeight = (imgHeight * pdfWidth) / imgWidth;

      // Create PDF
      pdf.addImage(imgData, 'JPEG', 0, 0, scaledWidth, scaledHeight, undefined, 'FAST');
      pdf.save(`${kpiStats.title.replace(/\s+/g, '_')}_Raporu.pdf`);

      sonnerToast.success('✅ PDF raporu başarıyla indirildi!');
    } catch (error: any) {
      console.error('PDF export error:', error);
      sonnerToast.error('❌ PDF oluşturulurken bir hata oluştu: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Safe progress data for chart
  const progressData = kpiStats.recentProgress ? [...kpiStats.recentProgress].reverse() : [];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] h-[90vh] overflow-hidden flex flex-col p-0 gap-0 border-0 shadow-2xl bg-card [&>button]:hidden">
        {/* Header with Gradient */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shrink-0">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-blue-100 text-xs mb-1">
                  <span className="bg-white/10 px-2 py-0.5 rounded backdrop-blur-sm">{kpiStats.department}</span>
                  <span>•</span>
                  <span>{KPI_PERIODS[kpiStats.period]}</span>
                </div>
                <DialogTitle className="text-2xl font-bold leading-tight">
                  {kpiStats.title}
                </DialogTitle>
                <DialogDescription className="text-blue-100/80 text-sm mt-1 max-w-2xl">
                  KPI detaylarını görüntüleyin, ilerleme kaydedin ve ekip üyeleriyle işbirliği yapın.
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-sm px-3 py-1 font-semibold shadow-sm",
                    kpiStats.status === 'success' && "bg-emerald-400/20 text-emerald-100 border-emerald-400/30",
                    kpiStats.status === 'warning' && "bg-amber-400/20 text-amber-100 border-amber-400/30",
                    kpiStats.status === 'danger' && "bg-rose-400/20 text-rose-100 border-rose-400/30",

                  )}
                >
                  {getStatusIcon()}
                  <span className="ml-1.5">{getStatusText()}</span>
                </Badge>
                <DialogClose asChild>
                  <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 rounded-full h-8 w-8">
                    <X className="w-5 h-5" />
                  </Button>
                </DialogClose>
              </div>
            </div>

            {/* Header Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                <span className="text-xs text-blue-200 block mb-1">İlerleme</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold">{kpiStats.progressPercentage.toFixed(0)}%</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                <span className="text-xs text-blue-200 block mb-1">Mevcut Değer</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold">{kpiStats.currentValue.toLocaleString('tr-TR')}</span>
                  <span className="text-xs opacity-70">{kpiStats.unit}</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                <span className="text-xs text-blue-200 block mb-1">Hedef</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold">{kpiStats.targetValue.toLocaleString('tr-TR')}</span>
                  <span className="text-xs opacity-70">{kpiStats.unit}</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                <span className="text-xs text-blue-200 block mb-1">Kalan Süre</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 opacity-70" />
                  <span className="text-lg font-bold">
                    {kpiStats.remainingDays < 0 ? 'Süre Doldu' : `${kpiStats.remainingDays} Gün`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
          <div className="border-b px-6 bg-muted/30 shrink-0">
            <TabsList className="bg-transparent h-12 w-full justify-start gap-6 p-0">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 font-medium text-muted-foreground data-[state=active]:text-foreground"
              >
                Genel Bakış
              </TabsTrigger>
              <TabsTrigger
                value="progress"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 font-medium text-muted-foreground data-[state=active]:text-foreground"
              >
                İlerleme Geçmişi
              </TabsTrigger>
              <TabsTrigger
                value="comments"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 font-medium text-muted-foreground data-[state=active]:text-foreground relative"
              >
                Yorumlar
                {kpiStats.comments && kpiStats.comments.length > 0 && (
                  <span className="ml-2 bg-muted-foreground/20 text-muted-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                    {kpiStats.comments.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden bg-muted/5 relative min-h-0">
            <TabsContent value="overview" className="h-full mt-0 border-0">
              <ScrollArea className="h-full p-6">
                <div className="space-y-6 animate-in fade-in-50 pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                          <span className="w-1 h-4 bg-primary rounded-full" />
                          Açıklama
                        </h3>
                        <div className="bg-card p-4 rounded-lg text-sm text-foreground/80 leading-relaxed border border-border/50 shadow-sm">
                          {kpiStats.description || 'Açıklama bulunmuyor.'}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <span className="w-1 h-4 bg-primary rounded-full" />
                            İlerleme Grafiği
                          </h3>
                          <span className="text-xs text-muted-foreground">Son 30 Gün</span>
                        </div>
                        <div className="h-[250px] w-full border border-border/50 rounded-lg p-4 bg-card shadow-sm">
                          <KPIProgressChart
                            progress={progressData}
                            targetValue={kpiStats.targetValue}
                            unit={kpiStats.unit}
                            compact={true}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Card className="shadow-sm border-border/50 bg-card">
                        <CardHeader className="pb-2 pt-4 px-4 bg-muted/30 border-b border-border/50">
                          <CardTitle className="text-sm font-semibold">Detaylar</CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 py-4 space-y-3">
                          <div className="grid grid-cols-2 gap-y-3 text-sm">
                            <div className="text-muted-foreground text-xs">Başlangıç</div>
                            <div className="text-right font-medium">{formatDate(kpiStats.startDate)}</div>

                            <div className="text-muted-foreground text-xs">Bitiş</div>
                            <div className="text-right font-medium">{formatDate(kpiStats.endDate)}</div>

                            <div className="text-muted-foreground text-xs">Atananlar</div>
                            <div className="text-right">
                              {kpiStats.assignedUsers && kpiStats.assignedUsers.length > 0 ? (
                                <div className="flex flex-wrap justify-end gap-1">
                                  {kpiStats.assignedUsers.map((u: any) => {
                                    const user = availableUsers.find(au => au.id === u) || { firstName: u, lastName: '' };
                                    return (
                                      <Badge key={u} variant="secondary" className="text-[10px] px-1.5 h-5 bg-muted/50">
                                        {user.firstName} {user.lastName?.[0]}.
                                      </Badge>
                                    );
                                  })}
                                </div>
                              ) : (
                                <span className="text-muted-foreground italic text-xs">Atanmamış</span>
                              )}
                            </div>

                            <div className="text-muted-foreground text-xs">Öncelik</div>
                            <div className="text-right">
                              {kpiStats.priority && (
                                <Badge variant="outline" className="text-[10px] px-1.5 h-5">
                                  {KPI_PRIORITIES[kpiStats.priority]}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <Separator className="my-2" />

                          <div className="space-y-2">
                            {canEdit && (
                              <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={() => setIsEditing(true)} disabled>
                                <Settings className="w-3 h-3 mr-2" />
                                Düzenle (Yakında)
                              </Button>
                            )}
                            <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={handleDownloadPDF} disabled={isExporting}>
                              {isExporting ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Printer className="w-3 h-3 mr-2" />}
                              Yazdır / PDF
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 h-8 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                  disabled={!canDelete}
                                >
                                  <Trash2 className="w-3 h-3 mr-2" />
                                  Sil
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>KPI Silinecek</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Bu işlem geri alınamaz. Devam etmek istiyor musunuz?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>İptal</AlertDialogCancel>
                                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                                    Sil
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </CardContent>
                      </Card>

                      {canRecordProgress && (
                        <Card className="shadow-sm border-blue-200 bg-blue-50/50 dark:bg-blue-900/10">
                          <CardContent className="p-4">
                            <h4 className="font-medium text-sm text-blue-800 dark:text-blue-300 mb-2">Hızlı İlerleme Ekle</h4>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mb-3">
                              Mevcut hedefe yönelik yeni bir ilerleme kaydı oluşturun.
                            </p>
                            <Button
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                              size="sm"
                              onClick={() => setActiveTab("progress")}
                            >
                              <TrendingUp className="w-4 h-4 mr-2" />
                              İlerleme Kaydet
                            </Button>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="progress" className="h-full mt-0 border-0 flex flex-col overflow-hidden">
              <ScrollArea className="flex-1 p-6 h-full">
                <div className="space-y-6 animate-in fade-in-50 pb-6">
                  {canRecordProgress && (
                    <Card className="border border-border/50 shadow-sm bg-card">
                      <CardHeader className="pb-3 pt-4 px-4 bg-muted/30 border-b border-border/50">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          Yeni İlerleme Ekle
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 py-4">
                        <div className="flex flex-col sm:flex-row gap-3 items-start">
                          <div className="grid gap-1.5 flex-1 w-full">
                            <Label htmlFor="progress-value" className="text-xs">Değer ({kpiStats.unit})</Label>
                            <Input
                              id="progress-value"
                              type="number"
                              placeholder="0.00"
                              value={progressValue}
                              onChange={(e) => setProgressValue(e.target.value)}
                              step="0.01"
                              className="h-9"
                            />
                          </div>
                          <div className="grid gap-1.5 flex-[2] w-full">
                            <Label htmlFor="progress-note" className="text-xs">Not (Opsiyonel)</Label>
                            <Input
                              id="progress-note"
                              placeholder="İlerleme hakkında kısa bir not..."
                              value={progressNote}
                              onChange={(e) => setProgressNote(e.target.value)}
                              className="h-9"
                            />
                          </div>
                          <div className="pt-6 w-full sm:w-auto">
                            <Button onClick={handleRecordProgress} size="sm" className="h-9 px-6 w-full sm:w-auto">
                              Kaydet
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold flex items-center gap-2 px-1">
                      <History className="w-4 h-4 text-muted-foreground" />
                      Geçmiş Kayıtlar
                    </h3>

                    {(!kpiStats.recentProgress || kpiStats.recentProgress.length === 0) ? (
                      <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed text-sm">
                        <History className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        Henüz ilerleme kaydı bulunmuyor.
                      </div>
                    ) : (
                      <div className="relative border-l-2 border-muted/50 pl-6 space-y-6 ml-3 my-4">
                        {kpiStats.recentProgress.map((record: any, index: number) => (
                          <div key={record.id || index} className="relative group">
                            <div className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-background border-2 border-primary group-hover:scale-125 transition-transform duration-200" />
                            <div className="bg-card border border-border/50 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200">
                              <div className="flex justify-between items-start mb-2">
                                <div className="font-bold text-primary text-lg">
                                  +{record.value} <span className="text-sm font-normal text-muted-foreground">{kpiStats.unit}</span>
                                </div>
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                  {formatDateTime(record.recordedAt)}
                                </span>
                              </div>
                              <div className="text-xs text-foreground/80 mb-2 flex items-center gap-2">
                                <Avatar className="h-5 w-5">
                                  <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                                    {(record.recordedByName || record.recordedBy || 'U').substring(0, 1).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{record.recordedByName || record.recordedBy}</span>
                                <span className="text-muted-foreground">tarafından kaydedildi.</span>
                              </div>
                              {record.note && (
                                <div className="text-sm text-foreground/90 bg-muted/30 p-2.5 rounded-md mt-2 border border-border/30 italic">
                                  "{record.note}"
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="comments" className="absolute inset-0 mt-0 border-0 flex flex-col overflow-hidden bg-background/50 data-[state=inactive]:hidden">
              <ScrollArea className="flex-1 p-6 w-full">
                <div className="space-y-6 pb-4 animate-in fade-in-50">
                  {(!kpiStats.comments || kpiStats.comments.length === 0) ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <div className="bg-muted/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MessageSquare className="w-8 h-8 opacity-40" />
                      </div>
                      <p className="text-base font-medium mb-1">Henüz yorum yapılmamış.</p>
                      <p className="text-sm opacity-80">Ekip arkadaşlarınızla iletişim kurmak için ilk yorumu siz yapın!</p>
                    </div>
                  ) : (
                    kpiStats.comments.map((comment: any, index: number) => {
                      const isCurrentUser = comment.userId === currentUser?.id || comment.userId === currentUser?.email;
                      return (
                        <div key={comment.id || index} className={cn("flex gap-3 max-w-[85%]", isCurrentUser ? "ml-auto flex-row-reverse" : "")}>
                          <Avatar className="w-8 h-8 border shadow-sm mt-1">
                            <AvatarImage src={`https://ui-avatars.com/api/?name=${comment.userName}&background=random`} />
                            <AvatarFallback>{comment.userName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className={cn(
                            "group p-4 rounded-2xl text-sm shadow-sm border",
                            isCurrentUser
                              ? "bg-primary text-primary-foreground rounded-tr-none border-primary/20"
                              : "bg-muted text-foreground rounded-tl-none border-border/50"
                          )}>
                            <div className={cn("flex justify-between items-baseline gap-4 mb-2 pb-1 border-b opacity-80", isCurrentUser ? "border-primary-foreground/20" : "border-border/50")}>
                              <span className="font-semibold text-xs">{comment.userName}</span>
                              <span className="text-[10px]">
                                {formatDateTime(comment.createdAt)}
                              </span>
                            </div>
                            <p className="leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>

              <div className="p-4 bg-background border-t border-border mt-auto z-10 shadow-lg relative">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />
                <div className="flex gap-3 items-end max-w-3xl mx-auto">
                  <div className="relative flex-1">
                    <Textarea
                      placeholder="Yorumunuzu buraya yazın..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[50px] max-h-[150px] resize-none bg-muted/20 focus:bg-background transition-all border-muted-foreground/30 focus:border-primary pr-2 rounded-xl"
                    />
                  </div>
                  <Button
                    onClick={handleAddComment}
                    size="icon"
                    className="h-11 w-11 shrink-0 rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95"
                    disabled={!newComment.trim()}
                  >
                    <Send className="w-5 h-5 ml-0.5" />
                  </Button>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>

      <div style={{ position: 'absolute', top: -9999, left: -9999 }}>
        <KPIPrintView ref={printRef} kpiStats={kpiStats} />
      </div>
    </Dialog>
  );
}