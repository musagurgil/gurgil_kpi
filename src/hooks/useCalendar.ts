import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

export const useCalendar = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filters, setFilters] = useState({
    searchQuery: '',
    selectedCategories: [] as string[]
  });

  // Load activities
  useEffect(() => {
    const loadActivities = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getActivities();
        setActivities(data || []);
      } catch (err: any) {
        console.error('Error loading activities:', err);
        toast.error('Aktiviteler yüklenirken hata oluştu');
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, []);

  const createActivity = async (activityData: {
    title: string;
    description: string;
    categoryId: string;
    startTime: string;
    endTime: string;
    date: string;
    duration: number;
  }) => {
    try {
      const newActivity = await apiClient.createActivity(activityData);
      setActivities(prev => [newActivity, ...prev]);
      toast.success('Aktivite başarıyla oluşturuldu');
      return newActivity;
    } catch (err: any) {
      console.error('Error creating activity:', err);
      toast.error(err.message || 'Aktivite oluşturulurken hata oluştu');
      throw err;
    }
  };

  const updateActivity = async (id: string, activityData: any) => {
    try {
      const updatedActivity = await apiClient.updateActivity(id, activityData);
      setActivities(prev => prev.map(a => a.id === id ? updatedActivity : a));
      toast.success('Aktivite başarıyla güncellendi');
      return updatedActivity;
    } catch (err: any) {
      console.error('Error updating activity:', err);
      toast.error(err.message || 'Aktivite güncellenirken hata oluştu');
      throw err;
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      await apiClient.deleteActivity(id);
      setActivities(prev => prev.filter(a => a.id !== id));
      toast.success('Aktivite başarıyla silindi');
    } catch (err: any) {
      console.error('Error deleting activity:', err);
      toast.error(err.message || 'Aktivite silinirken hata oluştu');
      throw err;
    }
  };

  const updateFilters = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      selectedCategories: []
    });
  };

  const getActivitiesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    let filteredActivities = activities.filter(activity => {
      try {
        // Use activity.date field directly for date comparison
        if (!activity.date) {
          return false;
        }
        return activity.date === dateStr;
      } catch (error) {
        console.warn('Invalid activity date:', activity.date, error);
        return false;
      }
    });

    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filteredActivities = filteredActivities.filter(activity =>
        activity.title?.toLowerCase().includes(query) ||
        activity.description?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (filters.selectedCategories.length > 0) {
      filteredActivities = filteredActivities.filter(activity =>
        filters.selectedCategories.includes(activity.categoryId?.toString())
      );
    }

    return filteredActivities;
  };

  const getMonthlyStats = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const monthlyActivities = activities.filter(activity => {
      try {
        if (!activity.date) {
          return false;
        }
        const activityDate = new Date(activity.date);
        if (isNaN(activityDate.getTime())) {
          return false;
        }
        return activityDate.getFullYear() === year && activityDate.getMonth() === month;
      } catch (error) {
        console.warn('Invalid activity date in getMonthlyStats:', activity.date, error);
        return false;
      }
    });

    const totalActivities = monthlyActivities.length;
    const totalHours = monthlyActivities.reduce((sum, activity) => {
      try {
        const startTime = activity.startTime?.includes('T') 
          ? new Date(activity.startTime)
          : new Date(`2000-01-01T${activity.startTime || '00:00'}`);
        
        const endTime = activity.endTime?.includes('T')
          ? new Date(activity.endTime)
          : new Date(`2000-01-01T${activity.endTime || '00:00'}`);
        
        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
          return sum;
        }
        return sum + (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      } catch (error) {
        console.warn('Error calculating duration for activity:', activity, error);
        return sum;
      }
    }, 0);

    const categoryStats = monthlyActivities.reduce((acc, activity) => {
      const categoryId = activity.categoryId?.toString() || 'unknown';
      acc[categoryId] = (acc[categoryId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const averageDailyHours = totalHours / daysInMonth;
    const entryCount = totalActivities;

    return {
      totalActivities,
      totalHours,
      monthlyTotalHours: totalHours,
      averageDailyHours,
      entryCount,
      categoryStats,
      averageHoursPerDay: averageDailyHours
    };
  };

  return {
    activities,
    loading,
    selectedDate,
    setSelectedDate,
    filters,
    updateFilters,
    clearFilters,
    createActivity,
    updateActivity,
    deleteActivity,
    getActivitiesForDate,
    getMonthlyStats
  };
};