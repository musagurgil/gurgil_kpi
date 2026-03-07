import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { KPIStats, CreateKPIData, KPIFilters, KPITarget, KPIProgress, KPIComment, RawKPI, KPIUser, calculateKPIStats } from '@/types/kpi';
import { User } from '@/types/user';

export const useKPI = () => {
  const { user } = useAuth();
  const [kpiStats, setKpiStats] = useState<KPIStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<KPIFilters>({
    department: '',
    status: undefined,
    priority: undefined,
    period: undefined,
    assignedTo: undefined,
    startDate: undefined,
    endDate: undefined
  });

  // Load KPIs
  useEffect(() => {
    const loadKPIs = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getKPIs();
        const processedData = data.map((item) => calculateKPIStats(item));
        setKpiStats(processedData);
      } catch (err) {
        console.error('Error loading KPIs:', err);
        const message = err instanceof Error ? err.message : 'KPI\'lar yüklenirken hata oluştu';
        setError(message);
        toast.error('KPI\'lar yüklenirken hata oluştu');
        setKpiStats([]);
      } finally {
        setLoading(false);
      }
    };

    loadKPIs();
  }, []);

  const createKPI = async (kpiData: CreateKPIData) => {
    try {
      await apiClient.createKPI(kpiData);

      // Reload KPI data from server to get accurate values
      const data = await apiClient.getKPIs();
      const processedData = data.map((item) => calculateKPIStats(item));
      setKpiStats(processedData);

      toast.success('✅ KPI başarıyla oluşturuldu!');
      return processedData[0]; // Return the newly created KPI
    } catch (err) {
      console.error('Error creating KPI:', err);
      toast.error('KPI oluşturulurken hata oluştu');
      throw err;
    }
  };

  const updateKPI = async (id: string, kpiData: Partial<CreateKPIData>) => {
    try {
      await apiClient.updateKPI(id, kpiData);

      // Reload KPI data from server to get accurate values
      const data = await apiClient.getKPIs();
      const processedData = data.map((item) => calculateKPIStats(item));
      setKpiStats(processedData);

      toast.success('✅ KPI başarıyla güncellendi!');
      return processedData.find(kpi => kpi.kpiId === id);
    } catch (err) {
      console.error('Error updating KPI:', err);
      const message = err instanceof Error ? err.message : 'KPI güncellenirken hata oluştu';
      toast.error('❌ ' + message);
      throw err;
    }
  };

  const deleteKPI = async (id: string) => {
    try {
      await apiClient.deleteKPI(id);

      // Reload KPI data from server to get accurate values
      const data = await apiClient.getKPIs();
      const processedData = data.map((item) => calculateKPIStats(item));
      setKpiStats(processedData);

      toast.success('✅ KPI başarıyla silindi!');
    } catch (err) {
      console.error('Error deleting KPI:', err);
      const message = err instanceof Error ? err.message : 'KPI silinirken hata oluştu';
      toast.error('❌ ' + message);
      throw err;
    }
  };

  const recordProgress = async (kpiId: string, value: number, note?: string) => {
    // Optimistic update
    const previousKpiStats = [...kpiStats];

    // Create optimistic progress record
    const optimisticProgress = {
      id: `temp-${Date.now()}`,
      value,
      note,
      recordedBy: user?.id,
      recordedByName: `${user?.firstName} ${user?.lastName}`,
      createdAt: new Date().toISOString(),
      recordedAt: new Date().toISOString()
    };

    setKpiStats(currentStats => {
      return currentStats.map(kpi => {
        if (kpi.kpiId === kpiId) {
          // Calculate new values based on optimistic update
          const updatedProgress = [optimisticProgress, ...(kpi.recentProgress || [])];
          const newCurrentValue = (kpi.currentValue || 0) + value;
          const newProgressPercentage = kpi.targetValue > 0 ? (newCurrentValue / kpi.targetValue) * 100 : 0;

          let newStatus: KPIStats['status'] = 'success';
          if (newProgressPercentage >= 100) {
            newStatus = 'success';
          } else if ((kpi.remainingDays || 0) < 0) {
            newStatus = 'danger';
          } else if ((kpi.remainingDays || 0) <= 7 || newProgressPercentage < 50) {
            newStatus = 'warning';
          } else {
            newStatus = 'success';
          }

          return {
            ...kpi,
            currentValue: newCurrentValue,
            progressPercentage: Math.min(newProgressPercentage, 100),
            status: newStatus,
            recentProgress: updatedProgress as KPIProgress[]
          };
        }
        return kpi;
      });
    });

    try {
      await apiClient.recordKPIProgress(kpiId, value, note);
      toast.success(`✅ İlerleme kaydedildi: +${value}`);
    } catch (err) {
      console.error('Error recording progress:', err);
      // Rollback on error
      setKpiStats(previousKpiStats);
      const message = err instanceof Error ? err.message : 'İlerleme kaydedilirken hata oluştu';
      toast.error('❌ ' + message);
      throw err;
    }
  };

  const addComment = async (kpiId: string, content: string) => {
    // Optimistic update
    const previousKpiStats = [...kpiStats];

    const optimisticComment = {
      id: `temp-${Date.now()}`,
      content,
      userId: user?.id,
      userName: `${user?.firstName} ${user?.lastName}`,
      createdAt: new Date().toISOString(),
      kpiId
    };

    setKpiStats(currentStats => {
      return currentStats.map(kpi => {
        if (kpi.kpiId === kpiId) {
          return {
            ...kpi,
            comments: [...(kpi.comments || []), optimisticComment as KPIComment]
          };
        }
        return kpi;
      });
    });

    try {
      await apiClient.addKPIComment(kpiId, content);
      toast.success('✅ Yorum başarıyla eklendi!');
    } catch (err) {
      console.error('Error adding comment:', err);
      // Rollback
      setKpiStats(previousKpiStats);
      const message = err instanceof Error ? err.message : 'Yorum eklenirken hata oluştu';
      toast.error('❌ ' + message);
      throw err;
    }
  };

  const getAvailableDepartments = useCallback(async () => {
    try {
      const departments = await apiClient.getDepartments();
      return departments.map((dept) => dept.name);
    } catch (err) {
      console.error('Error loading departments:', err);
      return [];
    }
  }, []);

  const getAccessibleUsers = useCallback(async (): Promise<KPIUser[]> => {
    try {
      const profiles = await apiClient.getProfiles();
      const processedUsers = profiles.map((profile: User) => {
        // Get the highest priority role (admin > department_manager > employee)
        const roles = profile.userRoles?.map((ur) => ur.role) || profile.roles || [];

        let highestRole = 'employee';
        if (roles.includes('admin')) {
          highestRole = 'admin';
        } else if (roles.includes('department_manager')) {
          highestRole = 'department_manager';
        }

        return {
          id: profile.id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          department: profile.department,
          role: highestRole,
          isActive: profile.isActive,
          createdAt: profile.createdAt
        };
      });

      // Remove duplicates based on email
      const uniqueUsers = processedUsers.filter((user, index, self) =>
        index === self.findIndex(u => u.email === user.email)
      );

      return uniqueUsers;
    } catch (err) {
      console.error('Error loading users:', err);
      return [];
    }
  }, []);

  // Create currentUser object for compatibility
  const currentUser: KPIUser | null = user ? {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    department: user.department,
    role: user.roles.includes('admin') ? 'admin' :
      user.roles.includes('department_manager') ? 'department_manager' :
        user.roles.includes('board_member') ? 'board_member' : 'employee',
    isActive: true,
    createdAt: new Date().toISOString()
  } : null;

  return {
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
  };
};