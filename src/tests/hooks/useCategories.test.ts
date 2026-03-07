import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCategories } from '../../hooks/useCategories';
import { apiClient } from '../../lib/api';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('../../lib/api', () => ({
  apiClient: {
    getCategories: vi.fn(),
    deleteCategory: vi.fn(),
  }
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  }
}));

describe('useCategories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should handle error during category deletion', async () => {
    vi.mocked(apiClient.getCategories).mockResolvedValue([]);

    // Setup a specific error response to simulate a failed deletion
    const errorMessage = 'Network Error';
    vi.mocked(apiClient.deleteCategory).mockRejectedValueOnce({
        response: { data: { message: errorMessage } }
    });

    const { result } = renderHook(() => useCategories());

    // Wait for initial load
    await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Add a category to set up the test state
    act(() => {
        result.current.addCategory({ name: 'Test Cat', color: '#000' });
    });

    const categoryId = result.current.categories[result.current.categories.length - 1].id;
    const initialCategoryCount = result.current.categories.length;

    // Call deleteCategory, which is expected to fail
    await act(async () => {
        await result.current.deleteCategory(categoryId);
    });

    // Verify toast.error was called with the correct error message
    expect(toast.error).toHaveBeenCalledWith(errorMessage);

    // Verify the category wasn't removed from state due to the error
    expect(result.current.categories.length).toBe(initialCategoryCount);
    expect(result.current.categories.find(c => c.id === categoryId)).toBeDefined();
  });

  it('should handle error without response message during category deletion', async () => {
    vi.mocked(apiClient.getCategories).mockResolvedValue([]);

    // Setup a generic error response to simulate a failed deletion
    vi.mocked(apiClient.deleteCategory).mockRejectedValueOnce(new Error('Failed to delete'));

    const { result } = renderHook(() => useCategories());

    // Wait for initial load
    await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Add a category to set up the test state
    act(() => {
        result.current.addCategory({ name: 'Test Cat', color: '#000' });
    });

    const categoryId = result.current.categories[result.current.categories.length - 1].id;

    // Call deleteCategory, which is expected to fail
    await act(async () => {
        await result.current.deleteCategory(categoryId);
    });

    // Verify toast.error was called with the fallback error message
    expect(toast.error).toHaveBeenCalledWith('Kategori silinirken hata oluştu');
  });
});
