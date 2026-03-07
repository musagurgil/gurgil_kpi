import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCalendar } from '@/hooks/useCalendar';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/lib/api', () => ({
  apiClient: {
    getActivities: vi.fn(),
    createActivity: vi.fn(),
    updateActivity: vi.fn(),
    deleteActivity: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockActivities = [
  {
    id: '1',
    title: 'Meeting 1',
    description: 'Weekly sync',
    date: '2023-10-01',
    startTime: '10:00',
    endTime: '11:00',
    duration: 60,
    categoryId: 'meeting',
    userId: 'user1',
  },
  {
    id: '2',
    title: 'Coding',
    description: 'Feature development',
    date: '2023-10-01',
    startTime: '13:00',
    endTime: '15:30',
    duration: 150,
    categoryId: 'project',
    userId: 'user1',
  },
  {
    id: '3',
    title: 'Break',
    description: 'Lunch break',
    date: '2023-10-02',
    startTime: '12:00',
    endTime: '13:00',
    duration: 60,
    categoryId: 'break',
    userId: 'user1',
  },
];

describe('useCalendar Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading state and fetch activities successfully', async () => {
    vi.mocked(apiClient.getActivities).mockResolvedValue(mockActivities);
    const { result } = renderHook(() => useCalendar());

    expect(result.current.loading).toBe(true);
    expect(result.current.activities).toEqual([]);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.activities).toEqual(mockActivities);
  });

  it('should handle fetch activities error gracefully', async () => {
    vi.mocked(apiClient.getActivities).mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useCalendar());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.activities).toEqual([]);
    expect(toast.error).toHaveBeenCalledWith('Aktiviteler yüklenirken hata oluştu');
  });

  it('should create an activity successfully', async () => {
    vi.mocked(apiClient.getActivities).mockResolvedValue(mockActivities);
    const { result } = renderHook(() => useCalendar());

    await waitFor(() => expect(result.current.loading).toBe(false));

    const newActivityData = {
      title: 'New Task',
      description: 'Doing something new',
      date: '2023-10-03',
      startTime: '09:00',
      endTime: '10:30',
      duration: 90,
      categoryId: 'other',
    };

    const newActivity = { ...newActivityData, id: '4', userId: 'user1' };
    vi.mocked(apiClient.createActivity).mockResolvedValue(newActivity);

    let createdActivity;
    await act(async () => {
      createdActivity = await result.current.createActivity(newActivityData);
    });

    expect(createdActivity).toEqual(newActivity);
    expect(result.current.activities).toEqual([newActivity, ...mockActivities]);
    expect(toast.success).toHaveBeenCalledWith('✅ Aktivite başarıyla oluşturuldu! (1s 30dk)');
  });

  it('should handle create activity error', async () => {
    vi.mocked(apiClient.getActivities).mockResolvedValue(mockActivities);
    const { result } = renderHook(() => useCalendar());
    await waitFor(() => expect(result.current.loading).toBe(false));

    vi.mocked(apiClient.createActivity).mockRejectedValue(new Error('Creation failed'));

    const invalidActivityData = {
      title: 'Invalid',
      description: 'Invalid data',
      date: '2023-10-04',
      startTime: '00:00',
      endTime: '01:00',
      duration: 60,
      categoryId: 'other',
    };

    await act(async () => {
      await expect(
        result.current.createActivity(invalidActivityData)
      ).rejects.toThrow('Creation failed');
    });

    expect(toast.error).toHaveBeenCalledWith('❌ Creation failed');
  });

  it('should update an activity successfully', async () => {
    vi.mocked(apiClient.getActivities).mockResolvedValue(mockActivities);
    const { result } = renderHook(() => useCalendar());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const updatedActivity = { ...mockActivities[0], title: 'Updated Meeting 1' };
    vi.mocked(apiClient.updateActivity).mockResolvedValue(updatedActivity);

    let resultActivity;
    await act(async () => {
      resultActivity = await result.current.updateActivity('1', { title: 'Updated Meeting 1' });
    });

    expect(resultActivity).toEqual(updatedActivity);
    expect(result.current.activities.find(a => a.id === '1')?.title).toBe('Updated Meeting 1');
    expect(toast.success).toHaveBeenCalledWith('✅ Aktivite başarıyla güncellendi!');
  });

  it('should handle update activity error', async () => {
    vi.mocked(apiClient.getActivities).mockResolvedValue(mockActivities);
    const { result } = renderHook(() => useCalendar());
    await waitFor(() => expect(result.current.loading).toBe(false));

    vi.mocked(apiClient.updateActivity).mockRejectedValue(new Error('Update failed'));

    await act(async () => {
      await expect(
        result.current.updateActivity('1', { title: 'Failed update' })
      ).rejects.toThrow('Update failed');
    });

    expect(toast.error).toHaveBeenCalledWith('❌ Update failed');
  });

  it('should delete an activity successfully', async () => {
    vi.mocked(apiClient.getActivities).mockResolvedValue(mockActivities);
    const { result } = renderHook(() => useCalendar());
    await waitFor(() => expect(result.current.loading).toBe(false));

    vi.mocked(apiClient.deleteActivity).mockResolvedValue({});

    await act(async () => {
      await result.current.deleteActivity('1');
    });

    expect(result.current.activities.find(a => a.id === '1')).toBeUndefined();
    expect(result.current.activities.length).toBe(2);
    expect(toast.success).toHaveBeenCalledWith('✅ Aktivite başarıyla silindi!');
  });

  it('should handle delete activity error', async () => {
    vi.mocked(apiClient.getActivities).mockResolvedValue(mockActivities);
    const { result } = renderHook(() => useCalendar());
    await waitFor(() => expect(result.current.loading).toBe(false));

    vi.mocked(apiClient.deleteActivity).mockRejectedValue(new Error('Deletion failed'));

    await act(async () => {
      await expect(result.current.deleteActivity('1')).rejects.toThrow('Deletion failed');
    });

    expect(toast.error).toHaveBeenCalledWith('❌ Deletion failed');
  });

  it('should filter activities correctly', async () => {
    vi.mocked(apiClient.getActivities).mockResolvedValue(mockActivities);
    const { result } = renderHook(() => useCalendar());
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Initially no filters
    let activitiesForDate;
    act(() => {
      activitiesForDate = result.current.getActivitiesForDate(new Date('2023-10-01'));
    });
    expect(activitiesForDate.length).toBe(2);

    // Apply search filter
    act(() => {
      result.current.updateFilters({ searchQuery: 'coding' });
    });

    act(() => {
      activitiesForDate = result.current.getActivitiesForDate(new Date('2023-10-01'));
    });
    expect(activitiesForDate.length).toBe(1);
    expect(activitiesForDate[0].title).toBe('Coding');

    // Apply category filter
    act(() => {
      result.current.updateFilters({ searchQuery: '', selectedCategories: ['meeting'] });
    });

    act(() => {
      activitiesForDate = result.current.getActivitiesForDate(new Date('2023-10-01'));
    });
    expect(activitiesForDate.length).toBe(1);
    expect(activitiesForDate[0].title).toBe('Meeting 1');

    // Clear filters
    act(() => {
      result.current.clearFilters();
    });

    act(() => {
      activitiesForDate = result.current.getActivitiesForDate(new Date('2023-10-01'));
    });
    expect(activitiesForDate.length).toBe(2);
  });

  it('should calculate stats correctly', async () => {
    vi.mocked(apiClient.getActivities).mockResolvedValue(mockActivities);
    const { result } = renderHook(() => useCalendar());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let stats;
    act(() => {
      // Get stats for Oct 2023
      stats = result.current.getMonthlyStats(new Date('2023-10-15'));
    });

    expect(stats.entryCount).toBe(3);
    // meeting 1hr, coding 2.5hr, break 1hr = 4.5hrs total
    expect(stats.totalHours).toBe(4.5);
    expect(stats.averageDailyHours).toBeCloseTo(4.5 / 31, 2); // 31 days in Oct
    expect(stats.categoryStats['meeting']).toBe(1);
    expect(stats.categoryStats['project']).toBe(2.5);
    expect(stats.categoryStats['break']).toBe(1);
  });
});
