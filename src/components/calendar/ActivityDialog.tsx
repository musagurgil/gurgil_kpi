import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TimePicker } from '@/components/ui/time-picker';
import { useCalendar } from '@/hooks/useCalendar';
import { useCategories } from '@/hooks/useCategories';
import { toast } from 'sonner';
import * as LucideIcons from 'lucide-react';

interface ActivityDialogProps {
  date: Date;
  isOpen: boolean;
  onClose: () => void;
  initialHour?: number;
  editingActivity?: any;
}

export const ActivityDialog = ({ 
  date, 
  isOpen, 
  onClose, 
  initialHour, 
  editingActivity 
}: ActivityDialogProps) => {
  const { createActivity, updateActivity, deleteActivity } = useCalendar();
  const { categories, loading: categoriesLoading } = useCategories();
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    startTime: '',
    endTime: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form when dialog opens or editing activity changes
  useEffect(() => {
    if (isOpen) {
      if (editingActivity) {
        // Editing existing activity
        const startTime = editingActivity.startTime?.includes('T') 
          ? new Date(editingActivity.startTime).toTimeString().slice(0, 5)
          : editingActivity.startTime?.slice(0, 5) || '';
        
        const endTime = editingActivity.endTime?.includes('T')
          ? new Date(editingActivity.endTime).toTimeString().slice(0, 5)
          : editingActivity.endTime?.slice(0, 5) || '';

        setForm({
          title: editingActivity.title || '',
          description: editingActivity.description || '',
          categoryId: editingActivity.categoryId?.toString() || '',
          startTime,
          endTime,
        });
      } else {
        // Creating new activity
        const hour = initialHour || new Date().getHours();
        const startTime = `${hour.toString().padStart(2, '0')}:00`;
        const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
        
        setForm({
          title: '',
          description: '',
          categoryId: categories[0]?.id || '',
          startTime,
          endTime,
        });
      }
    }
  }, [isOpen, editingActivity, initialHour, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim()) {
      toast.error('Aktivite başlığı gereklidir');
      return;
    }
    
    if (!form.categoryId) {
      toast.error('Kategori seçimi gereklidir');
      return;
    }
    
    if (!form.startTime || !form.endTime) {
      toast.error('Başlangıç ve bitiş saati gereklidir');
      return;
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(form.startTime) || !timeRegex.test(form.endTime)) {
      toast.error('Geçerli saat formatı giriniz (HH:MM)');
      return;
    }

    // Validate start time is before end time
    const [startHour, startMin] = form.startTime.split(':').map(Number);
    const [endHour, endMin] = form.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    if (startMinutes >= endMinutes) {
      toast.error('Bitiş saati başlangıç saatinden sonra olmalıdır');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const dateStr = date.toISOString().split('T')[0];
      const duration = endMinutes - startMinutes;

      if (editingActivity) {
        await updateActivity(editingActivity.id, {
          ...form,
          date: dateStr,
          duration
        });
        toast.success('Aktivite başarıyla güncellendi');
      } else {
        await createActivity({
          ...form,
          date: dateStr,
          duration
        });
        toast.success('Aktivite başarıyla oluşturuldu');
      }
      
      onClose();
    } catch (error: any) {
      console.error('ActivityDialog: Error saving activity:', error);
      
      let errorMessage = "Aktivite kaydedilirken bir hata oluştu.";
      
      if (error?.message?.includes('Internal server error')) {
        errorMessage = "Sunucu hatası. Lütfen daha sonra tekrar deneyin.";
      } else if (error?.message?.includes('Failed to fetch')) {
        errorMessage = "Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingActivity) return;
    
    if (!confirm('Bu aktiviteyi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await deleteActivity(editingActivity.id);
      toast.success('Aktivite başarıyla silindi');
      onClose();
    } catch (error: any) {
      console.error('ActivityDialog: Error deleting activity:', error);
      toast.error('Aktivite silinirken bir hata oluştu');
    }
  };

  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LucideIcons.Calendar className="w-5 h-5" />
            {editingActivity ? 'Aktiviteyi Düzenle' : 'Yeni Aktivite'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2">
              <LucideIcons.FileText className="w-4 h-4" />
              Başlık *
            </Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Aktivite başlığı"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Aktivite açıklaması"
              rows={3}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="flex items-center gap-2">
              <LucideIcons.Tag className="w-4 h-4" />
              Kategori *
            </Label>
            <Select
              value={form.categoryId}
              onValueChange={(value) => setForm(prev => ({ ...prev, categoryId: value }))}
              disabled={categoriesLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Kategori seçin" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <TimePicker
              value={form.startTime}
              onChange={(value) => handleTimeChange('startTime', value)}
              label="Başlangıç Saati *"
              placeholder="HH:MM"
              required
            />
            
            <TimePicker
              value={form.endTime}
              onChange={(value) => handleTimeChange('endTime', value)}
              label="Bitiş Saati *"
              placeholder="HH:MM"
              required
            />
          </div>

          {/* Duration Display */}
          {form.startTime && form.endTime && (
            <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
              Süre: {(() => {
                const [startHour, startMin] = form.startTime.split(':').map(Number);
                const [endHour, endMin] = form.endTime.split(':').map(Number);
                const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
                const hours = Math.floor(duration / 60);
                const minutes = duration % 60;
                return `${hours} saat ${minutes} dakika`;
              })()}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <div>
              {editingActivity && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  Sil
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                İptal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting 
                  ? (editingActivity ? 'Güncelleniyor...' : 'Oluşturuluyor...') 
                  : (editingActivity ? 'Güncelle' : 'Oluştur')
                }
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};