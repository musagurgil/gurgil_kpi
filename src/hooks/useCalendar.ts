import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { Activity } from '@/types/calendar';

export const useCalendar = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
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
      } catch (err) {
        console.error('Error loading activities:', err);
        toast.error('Aktiviteler yüklenirken hata oluştu');
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, []);

  const createActivity = async (activityData: Omit<Activity, 'id' | 'userId'>) => {
    try {
      const newActivity = await apiClient.createActivity(activityData);
      setActivities(prev => [newActivity, ...prev]);
      const hours = Math.floor(activityData.duration / 60);
      const minutes = activityData.duration % 60;
      toast.success(`✅ Aktivite başarıyla oluşturuldu! (${hours}s ${minutes}dk)`);
      return newActivity;
    } catch (err) {
      console.error('Error creating activity:', err);
      const message = err instanceof Error ? err.message : 'Aktivite oluşturulurken hata oluştu';
      toast.error('❌ ' + message);
      throw err;
    }
  };

  const updateActivity = async (id: string, activityData: Partial<Activity>) => {
    try {
      const updatedActivity = await apiClient.updateActivity(id, activityData);
      setActivities(prev => prev.map(a => a.id === id ? updatedActivity : a));
      toast.success('✅ Aktivite başarıyla güncellendi!');
      return updatedActivity;
    } catch (err) {
      console.error('Error updating activity:', err);
      const message = err instanceof Error ? err.message : 'Aktivite güncellenirken hata oluştu';
      toast.error('❌ ' + message);
      throw err;
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      await apiClient.deleteActivity(id);
      setActivities(prev => prev.filter(a => a.id !== id));
      toast.success('✅ Aktivite başarıyla silindi!');
    } catch (err) {
      console.error('Error deleting activity:', err);
      const message = err instanceof Error ? err.message : 'Aktivite silinirken hata oluştu';
      toast.error('❌ ' + message);
      throw err;
    }
  };

  const updateFilters = (newFilters: Partial<typeof filters>) => {
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
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    return getViewRangeStats(startDate, endDate);
  };

  const getViewRangeStats = (startDate: Date, endDate: Date) => {
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const rangeActivities = activities.filter(activity => {
      try {
        if (!activity.date) return false;
        return activity.date >= startStr && activity.date <= endStr;
      } catch {
        return false;
      }
    });

    const totalActivities = rangeActivities.length;

    const calcHours = (activity: Activity) => {
      try {
        const st = activity.startTime?.includes('T')
          ? new Date(activity.startTime)
          : new Date(`2000-01-01T${activity.startTime || '00:00'}`);
        const et = activity.endTime?.includes('T')
          ? new Date(activity.endTime)
          : new Date(`2000-01-01T${activity.endTime || '00:00'}`);
        if (isNaN(st.getTime()) || isNaN(et.getTime())) return 0;
        return (et.getTime() - st.getTime()) / (1000 * 60 * 60);
      } catch {
        return 0;
      }
    };

    const totalHours = rangeActivities.reduce((sum, a) => sum + calcHours(a), 0);

    const categoryStats = rangeActivities.reduce((acc, activity) => {
      const categoryId = activity.categoryId?.toString() || 'unknown';
      acc[categoryId] = (acc[categoryId] || 0) + calcHours(activity);
      return acc;
    }, {} as Record<string, number>);

    // Calculate number of days in range
    const diffTime = endDate.getTime() - startDate.getTime();
    const dayCount = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
    const averageDailyHours = totalHours / dayCount;

    // Daily breakdown for charts
    const dailyBreakdown: { date: string; dateLabel: string; hours: number; activities: number }[] = [];
    const cursor = new Date(startDate);
    while (cursor <= endDate) {
      const dStr = cursor.toISOString().split('T')[0];
      const dayActs = rangeActivities.filter(a => a.date === dStr);
      const dayHours = dayActs.reduce((s, a) => s + calcHours(a), 0);
      dailyBreakdown.push({
        date: dStr,
        dateLabel: cursor.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }),
        hours: Number(dayHours.toFixed(1)),
        activities: dayActs.length
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    // Find most active day name
    const dayOfWeekHours: Record<number, number> = {};
    rangeActivities.forEach(a => {
      if (!a.date) return;
      const dow = new Date(a.date).getDay();
      dayOfWeekHours[dow] = (dayOfWeekHours[dow] || 0) + calcHours(a);
    });
    const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    let mostActiveDay = '-';
    if (Object.keys(dayOfWeekHours).length > 0) {
      const maxDow = Object.entries(dayOfWeekHours).reduce((a, b) => Number(a[1]) > Number(b[1]) ? a : b);
      mostActiveDay = dayNames[Number(maxDow[0])];
    }

    return {
      totalActivities,
      totalHours,
      monthlyTotalHours: totalHours,
      averageDailyHours,
      entryCount: totalActivities,
      categoryStats,
      averageHoursPerDay: averageDailyHours,
      dailyBreakdown,
      mostActiveDay,
      dayCount
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
    getMonthlyStats,
    getViewRangeStats
  };
};