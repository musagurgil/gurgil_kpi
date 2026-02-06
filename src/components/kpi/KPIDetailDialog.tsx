import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { KPIStats, KPI_PERIODS, KPI_PRIORITIES, CreateKPIData, KPIComment, KPIProgress } from '@/types/kpi';
import { User as UserType } from '@/types/user';
import { toast } from '@/hooks/use-toast';
import { KPIProgressChart } from './KPIProgressChart';
import { exportKPIDetailToCSV } from '@/lib/export';
import { toast as sonnerToast } from 'sonner';

interface KPIDetailDialogProps {
  kpiStats: KPIStats;
  currentUser: UserType | null;
  availableDepartments: string[];
  availableUsers: UserType[];
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

  const handleExportKPI = () => {
    try {
      exportKPIDetailToCSV(kpiStats);
      sonnerToast.success('✅ KPI raporu Excel dosyasına aktarıldı!');
    } catch (error: any) {
      sonnerToast.error('❌ Export işlemi başarısız: ' + error.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="space-y-1 flex-1">
              <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
                {getStatusIcon()}
                <span className="line-clamp-2">{kpiStats.title}</span>
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                <Badge variant="outline" className="text-xs">{kpiStats.department}</Badge>
                <Badge variant="outline" className="text-xs">{KPI_PERIODS[kpiStats.period]}</Badge>
                <Badge variant="secondary" className="text-xs">{KPI_PRIORITIES[kpiStats.priority]}</Badge>
                <Badge variant={kpiStats.status === 'success' ? 'default' : kpiStats.status === 'danger' ? 'destructive' : 'secondary'} className="text-xs">
                  {getStatusText()}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportKPI}
                title="KPI Raporunu İndir"
              >
                <Download className="w-4 h-4" />
              </Button>
              {canEdit && (
                <Button
                  variant={isEditing ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              {canDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>KPI'yı Sil</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bu KPI'yı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>İptal</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Sil
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Genel Bakış</TabsTrigger>
            <TabsTrigger value="progress" className="text-xs sm:text-sm">İlerleme</TabsTrigger>
            <TabsTrigger value="comments" className="text-xs sm:text-sm">Yorumlar</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs sm:text-sm">Ayarlar</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* KPI Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Current Progress */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Mevcut Durum
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-bold">
                        {kpiStats.currentValue.toLocaleString('tr-TR')}
                      </span>
                      <span className="text-sm text-muted-foreground">{kpiStats.unit}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Hedef: {kpiStats.targetValue.toLocaleString('tr-TR')} {kpiStats.unit}
                    </div>
                    <Progress 
                      value={Math.min(kpiStats.progressPercentage, 100)} 
                      className={cn("h-2", `[&>div]:bg-${getStatusColor()}`)}
                    />
                    <div className="text-xs text-muted-foreground">
                      %{(kpiStats.progressPercentage || 0).toFixed(1)} tamamlandı
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Zaman Çizelgesi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Başlangıç - Bitiş</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(kpiStats.startDate)} - {formatDate(kpiStats.endDate)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Kalan Süre</div>
                    <div className={cn(
                      "text-sm font-medium",
                      isOverdue ? "text-kpi-danger" : 
                      (kpiStats.remainingDays || 0) <= 7 ? "text-kpi-warning" : "text-foreground"
                    )}>
                      {isOverdue ? 
                        `${Math.abs(kpiStats.remainingDays || 0)} gün gecikme` : 
                        `${kpiStats.remainingDays || 0} gün`
                      }
                    </div>
                  </div>
                  {(kpiStats.velocity || 0) > 0 && (
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Günlük Hız</div>
                      <div className="text-sm text-muted-foreground">
                        {(kpiStats.velocity || 0).toFixed(2)} {kpiStats.unit || ''}/gün
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            {kpiStats.description && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Açıklama</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{kpiStats.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Assigned Users */}
            {(kpiStats.assignedUsers || []).length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Atanan Kişiler ({(kpiStats.assignedUsers || []).length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(kpiStats.assignedUsers || []).map((userId, index) => {
                      const user = availableUsers.find(u => u.id === userId);
                      return (
                        <Badge key={index} variant="secondary" className="text-xs flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {user ? `${user.firstName} ${user.lastName}` : userId}
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="progress" className="space-y-4 mt-4">
            {/* Progress Chart */}
            {(kpiStats.recentProgress || []).length > 0 && (
              <KPIProgressChart
                progress={kpiStats.recentProgress || []}
                targetValue={kpiStats.targetValue}
                unit={kpiStats.unit}
                title="İlerleme Grafiği"
              />
            )}

            {/* Record New Progress */}
            {canRecordProgress && !isCompleted && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Yeni İlerleme Kaydet
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="progress-value">Değer ({kpiStats.unit})</Label>
                      <Input
                        id="progress-value"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={progressValue}
                        onChange={(e) => setProgressValue(e.target.value)}
                        placeholder="İlerleme değeri girin"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="progress-note">Not (İsteğe Bağlı)</Label>
                      <Input
                        id="progress-note"
                        value={progressNote}
                        onChange={(e) => setProgressNote(e.target.value)}
                        placeholder="Açıklama ekleyin"
                      />
                    </div>
                  </div>
                  <Button onClick={handleRecordProgress} disabled={!progressValue} className="w-full">
                    İlerleme Kaydet
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Progress History */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  İlerleme Geçmişi ({(kpiStats.recentProgress || []).length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(kpiStats.recentProgress || []).length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {(kpiStats.recentProgress || []).map((progress) => (
                      <div key={progress.id} className="bg-muted/30 p-3 rounded">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">
                            +{progress.value.toLocaleString('tr-TR')} {kpiStats.unit}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(progress.recordedAt)}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Kaydeden: {progress.recordedByName || progress.recordedBy}
                        </div>
                        {progress.note && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {progress.note}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Henüz ilerleme kaydı bulunmuyor.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments" className="space-y-4 mt-4">
            {/* Add New Comment */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Yeni Yorum Ekle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Yorumunuzu yazın..."
                  className="min-h-[80px]"
                />
                <Button onClick={handleAddComment} disabled={!newComment.trim()} className="w-full">
                  Yorum Ekle
                </Button>
              </CardContent>
            </Card>

            {/* Comments List */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Yorumlar ({kpiStats.comments?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(kpiStats.comments || []).length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {(kpiStats.comments || []).map((comment) => (
                      <div key={comment.id} className="bg-muted/30 p-3 rounded">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-foreground">{comment.userName}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Henüz yorum bulunmuyor.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 mt-4">
            {isEditing ? (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    KPI Düzenle
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-title">Başlık</Label>
                      <Input
                        id="edit-title"
                        value={editForm.title || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-department">Departman</Label>
                      <Select
                        value={editForm.department || ''}
                        onValueChange={(value) => setEditForm(prev => ({ ...prev, department: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Departman seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDepartments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-target">Hedef Değer</Label>
                      <Input
                        id="edit-target"
                        type="number"
                        value={editForm.targetValue || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, targetValue: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-unit">Birim</Label>
                      <Input
                        id="edit-unit"
                        value={editForm.unit || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, unit: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-start-date">Başlangıç Tarihi</Label>
                      <Input
                        id="edit-start-date"
                        type="date"
                        value={editForm.startDate || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-end-date">Bitiş Tarihi</Label>
                      <Input
                        id="edit-end-date"
                        type="date"
                        value={editForm.endDate || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-period">Periyod</Label>
                      <Select
                        value={editForm.period || ''}
                        onValueChange={(value: any) => setEditForm(prev => ({ ...prev, period: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Periyod seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Aylık</SelectItem>
                          <SelectItem value="quarterly">Üç Aylık</SelectItem>
                          <SelectItem value="yearly">Yıllık</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-priority">Öncelik</Label>
                      <Select
                        value={editForm.priority || ''}
                        onValueChange={(value: any) => setEditForm(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Öncelik seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Düşük</SelectItem>
                          <SelectItem value="medium">Orta</SelectItem>
                          <SelectItem value="high">Yüksek</SelectItem>
                          <SelectItem value="critical">Kritik</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Açıklama</Label>
                    <Textarea
                      id="edit-description"
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} className="flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      Kaydet
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                      <X className="w-4 h-4 mr-2" />
                      İptal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">KPI Ayarları</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    KPI ayarlarını görüntülemek veya düzenlemek için düzenleme moduna geçin.
                  </p>
                  {canEdit && (
                    <Button onClick={() => setIsEditing(true)} variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Düzenle
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}