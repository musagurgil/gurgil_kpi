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

  describe('data loading', () => {
    it('should load categories from API successfully', async () => {
      const mockApiCategories = [
        { id: 1, name: 'API Cat 1', color: '#111' },
        { id: 2, name: 'API Cat 2', color: '#222' }
      ];
      vi.mocked(apiClient.getCategories).mockResolvedValue(mockApiCategories);

      const { result } = renderHook(() => useCategories());

      expect(result.current.loading).toBe(true);
      expect(result.current.categories).toEqual([]);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(apiClient.getCategories).toHaveBeenCalledTimes(1);
      expect(result.current.loading).toBe(false);
      expect(result.current.categories).toEqual([
        { id: '1', name: 'API Cat 1', color: '#111' },
        { id: '2', name: 'API Cat 2', color: '#222' }
      ]);
    });

    it('should fallback to localStorage if API returns empty', async () => {
      vi.mocked(apiClient.getCategories).mockResolvedValue([]);

      const mockLocalCategories = [
        { id: 'local-1', name: 'Local Cat', color: '#333' }
      ];
      localStorage.setItem('activity-categories', JSON.stringify(mockLocalCategories));

      const { result } = renderHook(() => useCategories());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(apiClient.getCategories).toHaveBeenCalledTimes(1);
      expect(result.current.categories).toEqual(mockLocalCategories);
    });

    it('should fallback to DEFAULT_CATEGORIES if API fails and localStorage is empty', async () => {
      vi.mocked(apiClient.getCategories).mockRejectedValue(new Error('API Error'));

      // Suppress console.error for expected API failure in test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useCategories());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(apiClient.getCategories).toHaveBeenCalledTimes(1);
      expect(result.current.categories.length).toBeGreaterThan(0);
      expect(result.current.categories[0]).toHaveProperty('id', 'meeting'); // Check default data

      // Check if DEFAULT_CATEGORIES was saved to localStorage
      const stored = JSON.parse(localStorage.getItem('activity-categories') || '[]');
      expect(stored).toEqual(result.current.categories);

      consoleSpy.mockRestore();
    });
  });

  describe('state mutations', () => {
    it('should add a category and update localStorage', async () => {
      vi.mocked(apiClient.getCategories).mockResolvedValue([]);
      const { result } = renderHook(() => useCategories());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const initialLength = result.current.categories.length;

      act(() => {
        result.current.addCategory({ name: 'New Cat', color: '#fff' });
      });

      expect(result.current.categories.length).toBe(initialLength + 1);
      const addedCategory = result.current.categories[result.current.categories.length - 1];
      expect(addedCategory.name).toBe('New Cat');
      expect(addedCategory.color).toBe('#fff');
      expect(addedCategory.id).toBeDefined();

      const stored = JSON.parse(localStorage.getItem('activity-categories') || '[]');
      expect(stored.length).toBe(initialLength + 1);
      expect(stored[stored.length - 1].name).toBe('New Cat');
    });

    it('should update a category and update localStorage', async () => {
      vi.mocked(apiClient.getCategories).mockResolvedValue([]);
      const { result } = renderHook(() => useCategories());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.addCategory({ name: 'Initial Cat', color: '#000' });
      });

      const addedCategory = result.current.categories[result.current.categories.length - 1];

      act(() => {
        result.current.updateCategory(addedCategory.id, { name: 'Updated Cat', color: '#111' });
      });

      const updatedCategory = result.current.categories.find(c => c.id === addedCategory.id);
      expect(updatedCategory?.name).toBe('Updated Cat');
      expect(updatedCategory?.color).toBe('#111');

      const stored = JSON.parse(localStorage.getItem('activity-categories') || '[]');
      const storedCategory = stored.find((c: { id: string }) => c.id === addedCategory.id);
      expect(storedCategory?.name).toBe('Updated Cat');
    });

    it('should delete a category successfully and call toast.success', async () => {
      vi.mocked(apiClient.getCategories).mockResolvedValue([]);
      vi.mocked(apiClient.deleteCategory).mockResolvedValue(undefined as unknown as void);

      const { result } = renderHook(() => useCategories());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.addCategory({ name: 'To Delete', color: '#000' });
      });

      const categoryToDelete = result.current.categories[result.current.categories.length - 1];
      const initialLength = result.current.categories.length;

      await act(async () => {
        await result.current.deleteCategory(categoryToDelete.id);
      });

      expect(apiClient.deleteCategory).toHaveBeenCalledWith(categoryToDelete.id);
      expect(result.current.categories.length).toBe(initialLength - 1);
      expect(result.current.categories.find(c => c.id === categoryToDelete.id)).toBeUndefined();
      expect(toast.success).toHaveBeenCalledWith('✅ Kategori başarıyla silindi!');
    });
  });

  describe('utility functions', () => {
    it('should get category by id', async () => {
      const mockApiCategories = [
        { id: 1, name: 'Cat 1', color: '#111' },
        { id: 2, name: 'Cat 2', color: '#222' }
      ];
      vi.mocked(apiClient.getCategories).mockResolvedValue(mockApiCategories);
      const { result } = renderHook(() => useCategories());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const category = result.current.getCategoryById('1');
      expect(category).toBeDefined();
      expect(category?.name).toBe('Cat 1');

      const missingCategory = result.current.getCategoryById('non-existent');
      expect(missingCategory).toBeUndefined();
    });

    it('should get category color', async () => {
      const mockApiCategories = [
        { id: 1, name: 'Cat 1', color: '#111' }
      ];
      vi.mocked(apiClient.getCategories).mockResolvedValue(mockApiCategories);
      const { result } = renderHook(() => useCategories());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.getCategoryColor('1')).toBe('#111');
      expect(result.current.getCategoryColor('non-existent')).toBe('hsl(215, 16%, 47%)'); // default color
    });

    it('should get category name', async () => {
      const mockApiCategories = [
        { id: 1, name: 'Cat 1', color: '#111' }
      ];
      vi.mocked(apiClient.getCategories).mockResolvedValue(mockApiCategories);
      const { result } = renderHook(() => useCategories());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.getCategoryName('1')).toBe('Cat 1');
      expect(result.current.getCategoryName('non-existent')).toBe('Bilinmeyen'); // default name
    });
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
