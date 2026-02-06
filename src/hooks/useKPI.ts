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
    const currentValue = kpi.progress?.reduce((sum, p) => sum + (p.value || 0), 0) || 0;
    
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
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const velocity = totalDays > 0 ? currentValue / totalDays : 0;
    
    // Estimate completion date
    let estimatedCompletion = null;
    if (velocity > 0 && currentValue < kpi.targetValue) {
      const remainingValue = kpi.targetValue - currentValue;
      const daysToComplete = Math.ceil(remainingValue / velocity);
      estimatedCompletion = new Date(now.getTime() + (daysToComplete * 24 * 60 * 60 * 1000));
    }
    
    return {
      ...kpi,
      kpiId: kpi.id, // Backend'den gelen id'yi kpiId olarak map et
      currentValue,
      progressPercentage: Math.min(progressPercentage, 100),
      remainingDays,
      status,
      velocity,
      estimatedCompletion: estimatedCompletion?.toISOString(),
      recentProgress: kpi.progress || []
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
      
      return processedData[0]; // Return the newly created KPI
    } catch (err: any) {
      console.error('Error creating KPI:', err);
      toast.error(err.message || 'KPI oluşturulurken hata oluştu');
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
      
      return processedData.find(kpi => kpi.kpiId === id);
    } catch (err: any) {
      console.error('Error updating KPI:', err);
      toast.error(err.message || 'KPI güncellenirken hata oluştu');
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
    } catch (err: any) {
      console.error('Error deleting KPI:', err);
      toast.error(err.message || 'KPI silinirken hata oluştu');
      throw err;
    }
  };

  const recordProgress = async (kpiId: string, value: number, note?: string) => {
    try {
      await apiClient.recordKPIProgress(kpiId, value, note);
      
      // Reload KPI data from server to get accurate values
      const data = await apiClient.getKPIs();
      const processedData = data.map(calculateKPIStats);
      setKpiStats(processedData);
    } catch (err: any) {
      console.error('Error recording progress:', err);
      toast.error(err.message || 'İlerleme kaydedilirken hata oluştu');
      throw err;
    }
  };

  const addComment = async (kpiId: string, content: string) => {
    try {
      await apiClient.addKPIComment(kpiId, content);
      
      // Reload KPI data from server to get accurate values
      const data = await apiClient.getKPIs();
      const processedData = data.map(calculateKPIStats);
      setKpiStats(processedData);
    } catch (err: any) {
      console.error('Error adding comment:', err);
      toast.error(err.message || 'Yorum eklenirken hata oluştu');
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