import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKPI } from '../hooks/useKPI';
import { apiClient } from '../lib/api';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('../lib/api', () => ({
  apiClient: {
    getKPIs: vi.fn(),
    createKPI: vi.fn(),
  },
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user-id',
      department: 'IT',
      roles: ['admin'],
    },
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('useKPI Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle error when KPI creation fails', async () => {
    const mockError = new Error('Test API Error');
    vi.mocked(apiClient.getKPIs).mockResolvedValue([]);
    vi.mocked(apiClient.createKPI).mockRejectedValue(mockError);

    const { result } = renderHook(() => useKPI());

    const newKPIData = {
      title: 'New KPI',
      department: 'IT',
      targetValue: 100,
      unit: '%',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      period: 'yearly' as const,
      priority: 'high' as const,
      description: 'Test KPI',
    };

    await expect(async () => {
        await act(async () => {
            await result.current.createKPI(newKPIData);
        });
    }).rejects.toThrow('Test API Error');

    expect(apiClient.createKPI).toHaveBeenCalledWith(newKPIData);
    expect(toast.error).toHaveBeenCalledWith('KPI oluşturulurken hata oluştu');
  });
});
