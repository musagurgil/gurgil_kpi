import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useCategories } from '@/hooks/useCategories';
import * as LucideIcons from 'lucide-react';

interface CalendarFiltersProps {
  filters: {
    searchQuery: string;
    selectedCategories: string[];
  };
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
}

export const CalendarFilters = ({ 
  filters, 
  onFiltersChange, 
  onClearFilters 
}: CalendarFiltersProps) => {
  const { categories, loading: categoriesLoading } = useCategories();
  const [isOpen, setIsOpen] = useState(false);

  const activeFilterCount = 
    (filters.searchQuery ? 1 : 0) + 
    ((filters.selectedCategories || []).length > 0 ? 1 : 0);

  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      searchQuery: value
    });
  };

  const handleCategoryToggle = (categoryId: string) => {
    const currentCategories = filters.selectedCategories || [];
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter(id => id !== categoryId)
      : [...currentCategories, categoryId];
    
    onFiltersChange({
      ...filters,
      selectedCategories: newCategories
    });
  };

  const handleClearFilters = () => {
    onClearFilters();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <LucideIcons.Filter className="w-4 h-4 mr-2" />
        Filtreler
        {activeFilterCount > 0 && (
          <Badge 
            variant="destructive" 
            className="ml-2 h-5 w-5 p-0 text-xs"
          >
            {activeFilterCount}
          </Badge>
        )}
      </Button>

      {/* Filter Panel */}
      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-80 z-50 shadow-lg">
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Filtreler</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <LucideIcons.X className="w-4 h-4" />
              </Button>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search" className="flex items-center gap-2">
                <LucideIcons.Search className="w-4 h-4" />
                Arama
              </Label>
              <Input
                id="search"
                placeholder="Aktivite ara..."
                value={filters.searchQuery || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <Label>Kategoriler</Label>
              {categoriesLoading ? (
                <div className="text-sm text-muted-foreground">
                  Kategoriler yükleniyor...
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={(filters.selectedCategories || []).includes(category.id)}
                        onCheckedChange={() => handleCategoryToggle(category.id)}
                      />
                      <Label 
                        htmlFor={`category-${category.id}`}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                disabled={activeFilterCount === 0}
              >
                Temizle
              </Button>
              <Button
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Uygula
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};