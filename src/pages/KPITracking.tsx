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
    <div className="min-h-screen bg-dashboard-bg p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Target className="w-6 h-6 sm:w-8 sm:h-8 text-primary shrink-0" />
              <span className="truncate">KPI Takip Sistemi</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Departman bazlı performans hedeflerini takip edin ve ilerlemelerinizi kaydedin
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handleExportKPIs}
              disabled={filteredKPIs.length === 0}
              className="gap-2 w-full sm:w-auto justify-center"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Excel'e Aktar</span>
              <span className="sm:hidden">Aktar</span>
              <span className="hidden sm:inline">({filteredKPIs.length})</span>
            </Button>
            <div className="w-full sm:w-auto">
              {!currentUser?.role.includes('board_member') && (
                <CreateKPIDialog
                  onCreateKPI={handleCreateKPI}
                  availableDepartments={availableDepartments}
                  availableUsers={availableUsers}
                  currentUser={currentUser}
                />
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Toplam KPI</p>
                  <p className="text-2xl font-bold">{totalKPIs}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-kpi-success" />
                <div>
                  <p className="text-sm text-muted-foreground">Hedefte</p>
                  <p className="text-2xl font-bold text-kpi-success">{onTrackKPIs}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-kpi-danger" />
                <div>
                  <p className="text-sm text-muted-foreground">Risk Altında</p>
                  <p className="text-2xl font-bold text-kpi-danger">{atRiskKPIs}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-kpi-success" />
                <div>
                  <p className="text-sm text-muted-foreground">Tamamlanan</p>
                  <p className="text-2xl font-bold text-kpi-success">{completedKPIs}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-4">
          {/* Filters are here by default via KPIFiltersComponent structure but let's add View Toggle near filters or just above grid */}
        </div>

        <div className="flex flex-col space-y-4">
          <div className="flex justify-end items-center gap-2">
            <div className="flex p-1 bg-muted rounded-md border text-muted-foreground">
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setViewMode('list')}
                title="Liste Görünümü"
              >
                <ListIcon className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setViewMode('grid')}
                title="Kart Görünümü"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <KPIFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            availableDepartments={availableDepartments}
            availableUsers={availableUsers}
            currentUser={currentUser}
          />
        </div>

        {filteredKPIs.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {kpiStats.length === 0 ? 'Henüz KPI hedefi bulunmuyor' : 'Filtrelerinize uygun KPI bulunamadı'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {kpiStats.length === 0
                  ? 'İlk KPI hedefinizi oluşturarak performans takibine başlayın'
                  : 'Farklı filtreler deneyebilir veya filtreleri temizleyebilirsiniz'}
              </p>
              {kpiStats.length === 0 && (currentUser?.role === 'admin' || currentUser?.role === 'department_manager') && (
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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