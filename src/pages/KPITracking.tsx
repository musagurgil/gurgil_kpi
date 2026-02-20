import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, AlertTriangle, Users, Plus, BarChart3, Download, LayoutGrid, List as ListIcon } from "lucide-react";
import { useKPI } from '@/hooks/useKPI';
import { KPIFiltersComponent } from '@/components/kpi/KPIFilters';
import { CreateKPIDialog } from '@/components/kpi/CreateKPIDialog';
import { KPIStatsCard } from '@/components/kpi/KPIStatsCard';
import { KPITable } from '@/components/kpi/KPITable';
import { KPIDetailDialog } from '@/components/kpi/KPIDetailDialog';
import { toast } from '@/hooks/use-toast';
import { KPIStats, CreateKPIData, KPIUser } from '@/types/kpi';
import { exportKPIsToCSV } from '@/lib/export';
import { toast as sonnerToast } from 'sonner';

export default function KPITracking() {
  const {
    kpiStats,
    loading,
    error,
    filters,
    setFilters,
    createKPI,
    updateKPI,
    deleteKPI,
    recordProgress,
    addComment,
    getAvailableDepartments,
    getAccessibleUsers,
    currentUser
  } = useKPI();

  const [selectedKPI, setSelectedKPI] = useState<KPIStats | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);
  const [availableUsers, setAvailableUsers] = useState<KPIUser[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (error) {
      toast({
        title: "Hata",
        description: error,
        variant: "destructive"
      });
    }
  }, [error]);

  // Update selectedKPI when kpiStats changes (e.g., after progress recording or updates)
  useEffect(() => {
    if (selectedKPI) {
      const updatedKPI = kpiStats.find(kpi => kpi.kpiId === selectedKPI.kpiId);
      if (updatedKPI) {
        setSelectedKPI(updatedKPI);
      }
    }
  }, [kpiStats, selectedKPI]);

  // Load departments and users
  useEffect(() => {
    const loadData = async () => {
      try {
        const [departments, users] = await Promise.all([
          getAvailableDepartments(),
          getAccessibleUsers()
        ]);

        console.log('Departments loaded:', departments);
        console.log('Users loaded:', users);

        setAvailableDepartments(departments);
        setAvailableUsers(users);
      } catch (err) {
        console.error('Error loading departments and users:', err);
        toast({
          title: "Hata",
          description: "Departman ve kullanıcı verileri yüklenemedi",
          variant: "destructive"
        });
      }
    };

    loadData();
  }, [getAvailableDepartments, getAccessibleUsers]);

  const handleCreateKPI = async (data: CreateKPIData) => {
    await createKPI(data);
  };

  const handleRecordProgress = async (kpiId: string, value: number, note?: string) => {
    await recordProgress(kpiId, value, note);
  };

  const handleAddComment = async (kpiId: string, content: string) => {
    await addComment(kpiId, content);
  };

  const handleKPIClick = (kpiStat: KPIStats) => {
    setSelectedKPI(kpiStat);
    setIsDetailModalOpen(true);
  };

  const handleUpdateKPI = async (kpiId: string, updates: Partial<CreateKPIData>) => {
    await updateKPI(kpiId, updates);
    if (selectedKPI && selectedKPI.kpiId === kpiId) {
      const updatedKPI = kpiStats.find(k => k.kpiId === kpiId);
      if (updatedKPI) {
        setSelectedKPI(updatedKPI);
      }
    }
  };

  const handleDeleteKPI = async (kpiId: string) => {
    await deleteKPI(kpiId);
    setIsDetailModalOpen(false);
    setSelectedKPI(null);
  };

  const canRecordProgress = (kpiStat: KPIStats) => {
    if (!currentUser) return false;
    if (currentUser.role === 'board_member') return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'department_manager' && currentUser.department === kpiStat.department) return true;
    // Employee can record progress if assigned to the KPI OR if it's their department's KPI
    const isAssigned = kpiStat.assignedUsers?.includes(currentUser.id);
    const isSameDepartment = kpiStat.department === currentUser.department;
    return isAssigned || isSameDepartment;
  };

  const canEditKPI = (kpiStat: KPIStats) => {
    if (!currentUser) return false;
    if (currentUser.role === 'board_member') return false;
    return currentUser.role === 'admin' ||
      (currentUser.role === 'department_manager' && currentUser.department === kpiStat.department);
  };

  const canDeleteKPI = (kpiStat: KPIStats) => {
    if (!currentUser) return false;
    if (currentUser.role === 'board_member') return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'department_manager' && currentUser.department === kpiStat.department) return true;
    return false;
  };

  const handleExportKPIs = () => {
    try {
      exportKPIsToCSV(filteredKPIs, 'kpi-raporu');
      sonnerToast.success(`✅ ${filteredKPIs.length} KPI Excel dosyasına aktarıldı!`);
    } catch (error) {
      sonnerToast.error('❌ Export işlemi başarısız: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    }
  };

  // Filter KPIs based on filters
  const filteredKPIs = kpiStats.filter(kpi => {
    if (filters.department && kpi.department !== filters.department) return false;
    if (filters.status && kpi.lifecycleStatus !== filters.status) return false;
    if (filters.priority && kpi.priority !== filters.priority) return false;
    if (filters.period && kpi.period !== filters.period) return false;
    if (filters.assignedTo && !kpi.assignedUsers?.includes(filters.assignedTo)) return false;
    if (filters.startDate && new Date(kpi.startDate) < new Date(filters.startDate)) return false;
    if (filters.endDate && new Date(kpi.endDate) > new Date(filters.endDate)) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-dashboard-bg p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">KPI verileri yükleniyor...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalKPIs = kpiStats.length;
  const completedKPIs = kpiStats.filter(kpi => kpi.progressPercentage >= 100).length;
  // At risk: danger status or warning status with low progress
  const atRiskKPIs = kpiStats.filter(kpi =>
    kpi.status === 'danger' || (kpi.status === 'warning' && kpi.progressPercentage < 50)
  ).length;
  // On track: success status (completed) or normal status with good progress and time remaining
  const onTrackKPIs = kpiStats.filter(kpi =>
    kpi.status === 'success' || (kpi.status === 'warning' && kpi.progressPercentage >= 50 && kpi.remainingDays > 7)
  ).length;

  return (
    <div className="min-h-screen bg-dashboard-bg p-4 sm:p-6 space-y-6">
      {/* Premium Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 shadow-xl text-white">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:16px_16px]" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <Target className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <span>KPI Takip Sistemi</span>
            </h1>
            <p className="text-blue-100 text-sm sm:text-base max-w-2xl">
              Departman bazlı performans hedeflerini takip edin, ilerlemeleri kaydedin ve başarı oranlarını analiz edin.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              variant="secondary"
              className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-sm transition-all duration-300"
              onClick={handleExportKPIs}
              disabled={filteredKPIs.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Excel'e Aktar</span>
              <span className="sm:hidden">Aktar</span>
            </Button>

            {currentUser?.role !== 'board_member' && (
              <div className="w-full sm:w-auto">
                <CreateKPIDialog
                  onCreateKPI={handleCreateKPI}
                  availableDepartments={availableDepartments}
                  availableUsers={availableUsers}
                  currentUser={currentUser}
                />
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats in Header */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-blue-200">Toplam KPI</p>
                <p className="text-xl font-bold">{totalKPIs}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/30 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <p className="text-xs text-blue-200">Hedefte</p>
                <p className="text-xl font-bold text-emerald-300">{onTrackKPIs}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/30 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-rose-300" />
              </div>
              <div>
                <p className="text-xs text-blue-200">Risk Altında</p>
                <p className="text-xl font-bold text-rose-300">{atRiskKPIs}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/30 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-300" />
              </div>
              <div>
                <p className="text-xs text-blue-200">Tamamlanan</p>
                <p className="text-xl font-bold text-blue-300">{completedKPIs}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Re-using the filter component but passing a prop to style it better if needed, 
               or wrapping it to constrain width if it's too wide in the new design. 
               For now, placing it directly. The internal redesign of KPIFiltersComponent will handle its look. */}
          <div className="w-full sm:flex-1">
            <KPIFiltersComponent
              filters={filters}
              onFiltersChange={setFilters}
              availableDepartments={availableDepartments}
              availableUsers={availableUsers}
              currentUser={currentUser}
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center bg-card/50 p-1 rounded-lg border border-border/50 backdrop-blur-sm">
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode('list')}
              title="Liste Görünümü"
            >
              <ListIcon className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode('grid')}
              title="Kart Görünümü"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {filteredKPIs.length === 0 ? (
          <Card className="border-dashed shadow-none bg-transparent">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {kpiStats.length === 0 ? 'Henüz KPI hedefi bulunmuyor' : 'Filtrelerinize uygun KPI bulunamadı'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {kpiStats.length === 0
                  ? 'Departmanınızın performans hedeflerini takip etmek için ilk KPI kaydınızı oluşturun.'
                  : 'Arama kriterlerinizi değiştirerek veya filtreleri temizleyerek tekrar deneyin.'}
              </p>
              {kpiStats.length === 0 && (currentUser?.role !== 'board_member') && (
                <CreateKPIDialog
                  onCreateKPI={handleCreateKPI}
                  availableDepartments={availableDepartments}
                  availableUsers={availableUsers}
                  currentUser={currentUser}
                />
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredKPIs.map((kpiStat) => (
                  <KPIStatsCard
                    key={kpiStat.kpiId}
                    kpiStats={kpiStat}
                    onClick={() => handleKPIClick(kpiStat)}
                    canRecordProgress={canRecordProgress(kpiStat)}
                    canDelete={canDeleteKPI(kpiStat)}
                    onDelete={() => handleDeleteKPI(kpiStat.kpiId)}
                  />
                ))}
              </div>
            )}
            {viewMode === 'list' && (
              <KPITable
                kpis={filteredKPIs}
                onKPISelect={handleKPIClick}
                canRecordProgress={canRecordProgress}
                canDelete={canDeleteKPI}
                onDelete={handleDeleteKPI}
              />
            )}
          </>
        )}

        {selectedKPI && (
          <KPIDetailDialog
            kpiStats={selectedKPI}
            currentUser={currentUser}
            availableDepartments={availableDepartments}
            availableUsers={availableUsers}
            onUpdateKPI={handleUpdateKPI}
            onDeleteKPI={handleDeleteKPI}
            onRecordProgress={handleRecordProgress}
            onAddComment={handleAddComment}
            isOpen={isDetailModalOpen}
            onOpenChange={setIsDetailModalOpen}
            canEdit={canEditKPI(selectedKPI)}
            canDelete={canDeleteKPI(selectedKPI)}
            canRecordProgress={canRecordProgress(selectedKPI)}
          />
        )}
      </div>
    </div>
  );
}