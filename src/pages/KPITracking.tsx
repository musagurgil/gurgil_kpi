import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, AlertTriangle, Users, Plus, BarChart3 } from "lucide-react";
import { useKPI } from '@/hooks/useKPI';
import { KPIFiltersComponent } from '@/components/kpi/KPIFilters';
import { CreateKPIDialog } from '@/components/kpi/CreateKPIDialog';
import { KPIStatsCard } from '@/components/kpi/KPIStatsCard';
import { KPIDetailDialog } from '@/components/kpi/KPIDetailDialog';
import { toast } from '@/hooks/use-toast';
import { KPIStats } from '@/types/kpi';

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
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);

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
  }, [kpiStats]);

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
  }, []); // Remove dependencies to prevent infinite re-renders

  const handleCreateKPI = async (data: any) => {
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

  const handleUpdateKPI = async (kpiId: string, updates: any) => {
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

  const canRecordProgress = (kpiStat: any) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'department_manager' && currentUser.department === kpiStat.department) return true;
    return kpiStat.department === currentUser.department;
  };

  const canEditKPI = (kpiStat: KPIStats) => {
    if (!currentUser) return false;
    return currentUser.role === 'admin' || 
           (currentUser.role === 'department_manager' && currentUser.department === kpiStat.department);
  };

  const canDeleteKPI = (kpiStat: KPIStats) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'department_manager' && currentUser.department === kpiStat.department) return true;
    return false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dashboard-bg p-6">
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
  const atRiskKPIs = kpiStats.filter(kpi => kpi.status === 'danger').length;
  const onTrackKPIs = kpiStats.filter(kpi => kpi.status === 'success').length;

  return (
    <div className="min-h-screen bg-dashboard-bg p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Target className="w-8 h-8 text-primary" />
              KPI Takip Sistemi
            </h1>
            <p className="text-muted-foreground mt-1">
              Departman bazlı performans hedeflerini takip edin ve ilerlemelerinizi kaydedin
            </p>
          </div>
          
          <div className="flex items-center gap-2">
          <CreateKPIDialog
            onCreateKPI={handleCreateKPI}
            availableDepartments={availableDepartments}
            availableUsers={availableUsers}
            currentUser={currentUser as any}
          />
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

        <KPIFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
          availableDepartments={[]}
          availableUsers={[]}
          currentUser={currentUser as any}
        />

        {kpiStats.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Henüz KPI hedefi bulunmuyor
              </h3>
              <p className="text-muted-foreground mb-4">
                İlk KPI hedefinizi oluşturarak performans takibine başlayın
              </p>
              {(currentUser?.role === 'admin' || currentUser?.role === 'department_manager') && (
              <CreateKPIDialog
                onCreateKPI={handleCreateKPI}
                availableDepartments={availableDepartments}
                availableUsers={availableUsers}
                currentUser={currentUser as any}
              />
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {kpiStats.map((kpiStat) => (
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

        {selectedKPI && (
          <KPIDetailDialog
            kpiStats={selectedKPI}
            currentUser={currentUser as any}
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