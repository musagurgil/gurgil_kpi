import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, Palette } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/hooks/use-toast';

const DEFAULT_COLORS = [
  'hsl(217, 91%, 60%)', // Blue
  'hsl(142, 71%, 45%)', // Green
  'hsl(38, 92%, 50%)',  // Orange
  'hsl(262, 83%, 58%)', // Purple
  'hsl(0, 84%, 60%)',   // Red
  'hsl(215, 16%, 47%)', // Gray
  'hsl(291, 64%, 42%)', // Magenta
  'hsl(173, 58%, 39%)', // Teal
  'hsl(45, 93%, 47%)',  // Yellow
  'hsl(10, 79%, 53%)',  // Orange Red
];

import { ActivityCategory } from '@/types/calendar';

export const CategoryManagement = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<ActivityCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: DEFAULT_COLORS[0]
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Hata",
        description: "Kategori adı zorunludur",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingCategory) {
        updateCategory(editingCategory.id, formData);
        toast({
          title: "Başarılı",
          description: "Kategori güncellendi"
        });
      } else {
        addCategory(formData);
        toast({
          title: "Başarılı",
          description: "Yeni kategori eklendi"
        });
      }
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Hata",
        description: "Kategori kaydedilirken hata oluştu",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (category: ActivityCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (categoryId: string) => {
    if (categories.length <= 1) {
      toast({
        title: "Hata",
        description: "En az bir kategori bulunmalıdır",
        variant: "destructive"
      });
      return;
    }
    setDeleteId(categoryId);
  };

  const confirmDelete = () => {
    if (!deleteId) return;

    try {
      deleteCategory(deleteId);
      toast({
        title: "Başarılı",
        description: "Kategori silindi"
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Hata",
        description: "Kategori silinirken hata oluştu",
        variant: "destructive"
      });
    } finally {
      setDeleteId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      color: DEFAULT_COLORS[0]
    });
    setEditingCategory(null);
  };

  const handleNewCategory = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Kategori Yönetimi</h2>
          <p className="text-muted-foreground">
            Takvim aktiviteleri için kategorileri yönetin
          </p>
        </div>
        <Button onClick={handleNewCategory}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Kategori
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(category => (
          <Card key={category.id} className="hover:shadow-md transition-smooth">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <h3 className="font-medium text-foreground">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">#{category.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(category.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Kategori Adı</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Kategori adını girin"
                required
              />
            </div>

            <div>
              <Label>Renk</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {DEFAULT_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 transition-all ${formData.color === color
                      ? 'border-foreground scale-110'
                      : 'border-border hover:border-foreground/50'
                      }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                İptal
              </Button>
              <Button type="submit">
                {editingCategory ? 'Güncelle' : 'Ekle'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu kategoriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};