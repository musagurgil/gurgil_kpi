import { useState, useEffect } from 'react';
import { ActivityCategory } from '@/types/calendar';
import { apiClient } from '@/lib/api';

const DEFAULT_CATEGORIES: ActivityCategory[] = [
  { id: 'meeting', name: 'Toplantı', color: 'hsl(217, 91%, 60%)' },
  { id: 'project', name: 'Proje', color: 'hsl(142, 71%, 45%)' },
  { id: 'training', name: 'Eğitim', color: 'hsl(38, 92%, 50%)' },
  { id: 'administrative', name: 'İdari', color: 'hsl(262, 83%, 58%)' },
  { id: 'break', name: 'Mola', color: 'hsl(0, 84%, 60%)' },
  { id: 'other', name: 'Diğer', color: 'hsl(215, 16%, 47%)' }
];

export const useCategories = () => {
  const [categories, setCategories] = useState<ActivityCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Load categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const apiCategories = await apiClient.getCategories();
        if (apiCategories && apiCategories.length > 0) {
          // Convert backend categories to frontend format
          const formattedCategories = apiCategories.map((cat) => ({
            id: cat.id.toString(),
            name: cat.name,
            color: cat.color
          }));
          setCategories(formattedCategories);
        } else {
          // Fallback to localStorage if API fails
          const stored = localStorage.getItem('activity-categories');
          if (stored) {
            const parsed = JSON.parse(stored);
            setCategories(parsed);
          } else {
            setCategories(DEFAULT_CATEGORIES);
            localStorage.setItem('activity-categories', JSON.stringify(DEFAULT_CATEGORIES));
          }
        }
      } catch (error) {
        console.error('Error loading categories from API:', error);
        // Fallback to localStorage
        try {
          const stored = localStorage.getItem('activity-categories');
          if (stored) {
            const parsed = JSON.parse(stored);
            setCategories(parsed);
          } else {
            setCategories(DEFAULT_CATEGORIES);
            localStorage.setItem('activity-categories', JSON.stringify(DEFAULT_CATEGORIES));
          }
        } catch (localError) {
          console.error('Error loading categories from localStorage:', localError);
          setCategories(DEFAULT_CATEGORIES);
        }
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const addCategory = (category: Omit<ActivityCategory, 'id'>) => {
    const newCategory: ActivityCategory = {
      ...category,
      id: Date.now().toString()
    };

    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    localStorage.setItem('activity-categories', JSON.stringify(updatedCategories));
  };

  const updateCategory = (id: string, updates: Partial<ActivityCategory>) => {
    const updatedCategories = categories.map(cat =>
      cat.id === id ? { ...cat, ...updates } : cat
    );
    setCategories(updatedCategories);
    localStorage.setItem('activity-categories', JSON.stringify(updatedCategories));
  };

  const deleteCategory = (id: string) => {
    const updatedCategories = categories.filter(cat => cat.id !== id);
    setCategories(updatedCategories);
    localStorage.setItem('activity-categories', JSON.stringify(updatedCategories));
  };

  const getCategoryById = (id: string) => {
    return categories.find(cat => cat.id === id);
  };

  const getCategoryColor = (id: string) => {
    const category = getCategoryById(id);
    return category?.color || 'hsl(215, 16%, 47%)';
  };

  const getCategoryName = (id: string) => {
    const category = getCategoryById(id);
    return category?.name || 'Bilinmeyen';
  };

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getCategoryColor,
    getCategoryName
  };
};