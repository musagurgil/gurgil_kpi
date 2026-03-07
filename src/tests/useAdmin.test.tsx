import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAdmin } from '../hooks/useAdmin';
import { apiClient } from '../lib/api';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('../lib/api', () => ({
    apiClient: {
        getProfiles: vi.fn(),
        updateProfile: vi.fn(),
        createProfile: vi.fn(),
        deleteProfile: vi.fn(),
    },
}));

vi.mock('../hooks/useAuth', () => ({
    useAuth: () => ({
        user: {
            id: 'admin-id',
            department: 'IT',
            roles: ['admin'],
        },
        hasRole: () => true,
    }),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('../stores/adminFilterStore', () => ({
    useAdminFilters: () => ({
        filters: { department: '', userId: '' },
        setFilters: vi.fn(),
    }),
}));

describe('useAdmin Hook Error Handling', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should handle errors during profile update and call toast.error with fallback message', async () => {
        // Mock the console.error to keep the test output clean
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        // Mock API client to reject with a non-Error to trigger fallback message
        vi.mocked(apiClient.updateProfile).mockRejectedValue('Some string error');

        // Use a pending promise to avoid act/waitFor issues during initialization
        vi.mocked(apiClient.getProfiles).mockReturnValue(new Promise(() => { }));

        const { result } = renderHook(() => useAdmin());

        const profileData = { firstName: 'Updated' };

        // Assert that the function throws the error
        await expect(result.current.updateProfile('user-id', profileData)).rejects.toEqual('Some string error');

        // Verify toast.error was called with the fallback message defined in useAdmin
        expect(toast.error).toHaveBeenCalledWith('Kullanıcı güncellenirken hata oluştu');

        // Verify console.error was called
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });
});
