import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCalendar } from '../hooks/useCalendar';
import { apiClient } from '../lib/api';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('../lib/api', () => ({
    apiClient: {
        getActivities: vi.fn(),
        createActivity: vi.fn(),
    },
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('useCalendar Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(apiClient.getActivities).mockResolvedValue([]);
    });

    it('should handle error when creating activity fails', async () => {
        const error = new Error('Network Error');
        vi.mocked(apiClient.createActivity).mockRejectedValue(error);

        const { result } = renderHook(() => useCalendar());

        // Wait for initial load to complete
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        const newActivity = {
            title: 'Test',
            date: '2023-10-27',
            startTime: '10:00',
            endTime: '11:00',
            duration: 60,
            type: 'meeting' as const,
            status: 'planned' as const,
        };

        // Try to create activity and expect it to throw
        await expect(act(async () => {
            await result.current.createActivity(newActivity);
        })).rejects.toThrow('Network Error');

        // Verify that toast.error was called with the correct message
        expect(toast.error).toHaveBeenCalledWith('❌ Network Error');

        // Verify that the activity was not added to the state
        expect(result.current.activities).toEqual([]);
    });
});
