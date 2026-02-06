import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

export const useKPI = () => {
  const { user } = useAuth();
  const [kpiStats, setKpiStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    department: '',
    status: '',
    priority: '',
    period: ''
  });

  // Calculate KPI stats
  const calculateKPIStats = (kpi: any) => {
    const now = new Date();
    const startDate = new Date(kpi.startDate);
    const endDate = new Date(kpi.endDate);

    // Calculate remaining days
    const remainingDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Get current value from all progress records (sum of all progress values)
    const currentValue = kpi.progress?.reduce((sum: number, p: any) => sum + (p.value || 0), 0) || 0;

    // Calculate progress percentage
    const progressPercentage = kpi.targetValue > 0 ? (currentValue / kpi.targetValue) * 100 : 0;

    // Determine status
    let status = 'normal';
    if (progressPercentage >= 100) {
      status = 'success';
    } else if (remainingDays < 0) {
      status = 'danger';
    } else if (remainingDays <= 7 || progressPercentage < 50) {
      status = 'warning';
    }

    // Calculate velocity (daily progress rate)
    // Velocity should be based on elapsed days, not total days
    const elapsedDays = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const velocity = elapsedDays > 0 ? currentValue / elapsedDays : 0;

    // Estimate completion date
    let estimatedCompletion = null;
    if (velocity > 0 && currentValue < kpi.targetValue) {
      const remainingValue = kpi.targetValue - currentValue;
      const daysToComplete = Math.ceil(remainingValue / velocity);
      const estimatedDate = new Date(now.getTime() + (daysToComplete * 24 * 60 * 60 * 1000));

      // Limit estimated completion to maximum 2x the original end date to prevent unrealistic dates
      const maxEstimatedDate = new Date(endDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // End date + 30 days

      if (estimatedDate > maxEstimatedDate) {
        // If estimated date is too far, use the original end date
        estimatedCompletion = endDate;
      } else {
        estimatedCompletion = estimatedDate;
      }
    } else if (currentValue === 0) {
      // If no progress has been made, estimate based on remaining days and target
      // Assume linear progress from now to end date
      const remainingDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (remainingDays > 0) {
        estimatedCompletion = endDate; // Use original end date as estimate
      }
    }

    // Transform assignments array to assignedUsers array (user IDs)
    const assignedUsers = kpi.assignments?.map((assignment: any) => assignment.userId) || [];

    return {
      ...kpi,
      kpiId: kpi.id, // Backend'den gelen id'yi kpiId olarak map et
      currentValue,
      progressPercentage: Math.min(progressPercentage, 100),
      remainingDays,
      status,
      velocity,
      estimatedCompletion: estimatedCompletion?.toISOString(),
      recentProgress: kpi.progress || [],
      assignedUsers, // assignments array'ini assignedUsers'a dönüştür
      comments: kpi.comments || []
    };
  };

  // Load KPIs
  useEffect(() => {
    const loadKPIs = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getKPIs();
        const processedData = data.map(calculateKPIStats);
        setKpiStats(processedData);
      } catch (err: any) {
        console.error('Error loading KPIs:', err);
        setError(err.message || 'KPI\'lar yüklenirken hata oluştu');
        toast.error('KPI\'lar yüklenirken hata oluştu');
        // Set empty array as fallback
        setKpiStats([]);
      } finally {
        setLoading(false);
      }
    };

    loadKPIs();
  }, []);

  const createKPI = async (kpiData: {
    title: string;
    description: string;
    department: string;
    targetValue: number;
    unit: string;
    startDate: string;
    endDate: string;
    period: string;
    priority: string;
    assignedTo: string[];
  }) => {
    try {
      await apiClient.createKPI(kpiData);

      // Reload KPI data from server to get accurate values
      const data = await apiClient.getKPIs();
      const processedData = data.map(calculateKPIStats);
      setKpiStats(processedData);

      toast.success('✅ KPI başarıyla oluşturuldu!');
      return processedData[0]; // Return the newly created KPI
    } catch (err: any) {
      console.error('Error creating KPI:', err);
      toast.error('❌ ' + (err.message || 'KPI oluşturulurken hata oluştu'));
      throw err;
    }
  };

  const updateKPI = async (id: string, kpiData: any) => {
    try {
      await apiClient.updateKPI(id, kpiData);

      // Reload KPI data from server to get accurate values
      const data = await apiClient.getKPIs();
      const processedData = data.map(calculateKPIStats);
      setKpiStats(processedData);

      toast.success('✅ KPI başarıyla güncellendi!');
      return processedData.find(kpi => kpi.kpiId === id);
    } catch (err: any) {
      console.error('Error updating KPI:', err);
      toast.error('❌ ' + (err.message || 'KPI güncellenirken hata oluştu'));
      throw err;
    }
  };

  const deleteKPI = async (id: string) => {
    try {
      await apiClient.deleteKPI(id);

      // Reload KPI data from server to get accurate values
      const data = await apiClient.getKPIs();
      const processedData = data.map(calculateKPIStats);
      setKpiStats(processedData);

      toast.success('✅ KPI başarıyla silindi!');
    } catch (err: any) {
      console.error('Error deleting KPI:', err);
      toast.error('❌ ' + (err.message || 'KPI silinirken hata oluştu'));
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

          let newStatus = 'normal';
          if (newProgressPercentage >= 100) {
            newStatus = 'success';
          } else if ((kpi.remainingDays || 0) < 0) {
            newStatus = 'danger';
          } else if ((kpi.remainingDays || 0) <= 7 || newProgressPercentage < 50) {
            newStatus = 'warning';
          }

          return {
            ...kpi,
            currentValue: newCurrentValue,
            progressPercentage: Math.min(newProgressPercentage, 100),
            status: newStatus,
            recentProgress: updatedProgress
          };
        }
        return kpi;
      });
    });

    try {
      await apiClient.recordKPIProgress(kpiId, value, note);
      // Success toast is handled by optimistic UI, but we confirm here
      // We could silently re-validate here if strict consistency is needed, 
      // but for better UX we accept the optimistic state as truth until next load.
      // However, to ensure we have the real server ID for the progress, we might want to reload eventually.
      // For now, let's keep the optimistic state to avoid flicker.
      toast.success(`✅ İlerleme kaydedildi: +${value}`);
    } catch (err: any) {
      console.error('Error recording progress:', err);
      // Rollback on error
      setKpiStats(previousKpiStats);
      toast.error('❌ ' + (err.message || 'İlerleme kaydedilirken hata oluştu'));
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
      createdAt: new Date().toISOString()
    };

    setKpiStats(currentStats => {
      return currentStats.map(kpi => {
        if (kpi.kpiId === kpiId) {
          return {
            ...kpi,
            comments: [optimisticComment, ...(kpi.comments || [])]
          };
        }
        return kpi;
      });
    });

    try {
      await apiClient.addKPIComment(kpiId, content);
      toast.success('✅ Yorum başarıyla eklendi!');
    } catch (err: any) {
      console.error('Error adding comment:', err);
      // Rollback
      setKpiStats(previousKpiStats);
      toast.error('❌ ' + (err.message || 'Yorum eklenirken hata oluştu'));
      throw err;
    }
  };

  const getAvailableDepartments = useCallback(async () => {
    try {
      const departments = await apiClient.getDepartments();
      return departments.map((dept: any) => dept.name);
    } catch (err: any) {
      console.error('Error loading departments:', err);
      return [];
    }
  }, []);

  const getAccessibleUsers = useCallback(async () => {
    try {
      const profiles = await apiClient.getProfiles();
      const processedUsers = profiles.map((profile: any) => {
        // Get the highest priority role (admin > department_manager > employee)
        const roles = profile.userRoles?.map((ur: any) => ur.role) || [];
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
    } catch (err: any) {
      console.error('Error loading users:', err);
      return [];
    }
  }, []);

  // Create currentUser object for compatibility
  const currentUser = user ? {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    department: user.department,
    role: user.roles.includes('admin') ? 'admin' :
      user.roles.includes('department_manager') ? 'department_manager' : 'employee',
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