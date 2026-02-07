import React from 'react';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import * as LucideIcons from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';

interface EventDetailDialogProps {
  activity: any;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (activity: any) => void;
  onDelete?: (activity: any) => void;
}

export const EventDetailDialog = ({
  activity,
  isOpen,
  onClose,
  onEdit,
  onDelete
}: EventDetailDialogProps) => {
  const { categories } = useCategories();
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  if (!activity) return null;

  // Get category info from categoryId
  const getCategoryInfo = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category || { name: 'Kategori Yok', color: '#3b82f6' };
  };

  const categoryInfo = getCategoryInfo(activity.categoryId);

  const formatTime = (timeString: string) => {
    try {
      if (timeString?.includes('T')) {
        // ISO string format
        const date = new Date(timeString);
        return date.toLocaleTimeString('tr-TR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      } else if (timeString?.includes(':')) {
        // Time string format (HH:MM)
        return timeString;
      }
      return timeString || '';
    } catch (error) {
      console.warn('Error formatting time:', timeString, error);
      return timeString || '';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      if (dateString?.includes('T')) {
        const date = new Date(dateString);
        return format(date, 'dd MMMM yyyy EEEE', { locale: tr });
      } else {
        const date = new Date(dateString);
        return format(date, 'dd MMMM yyyy EEEE', { locale: tr });
      }
    } catch (error) {
      console.warn('Error formatting date:', dateString, error);
      return dateString || '';
    }
  };

  const getDuration = () => {
    try {
      const startTime = activity.startTime?.includes('T')
        ? new Date(activity.startTime)
        : new Date(`2000-01-01T${activity.startTime || '00:00'}`);

      const endTime = activity.endTime?.includes('T')
        ? new Date(activity.endTime)
        : new Date(`2000-01-01T${activity.endTime || '00:00'}`);

      const durationMs = endTime.getTime() - startTime.getTime();
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        return `${hours} saat ${minutes} dakika`;
      } else {
        return `${minutes} dakika`;
      }
    } catch (error) {
      console.warn('Error calculating duration:', error);
      return 'Bilinmiyor';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <LucideIcons.Calendar className="w-5 h-5" />
              {activity.title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <LucideIcons.X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Category Badge */}
          <div className="flex items-center gap-2">
            <LucideIcons.Tag className="w-4 h-4 text-muted-foreground" />
            <Badge
              variant="secondary"
              className="text-xs"
              style={{
                backgroundColor: categoryInfo.color,
                color: 'white'
              }}
            >
              {categoryInfo.name}
            </Badge>
          </div>

          {/* Date and Time Info */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <LucideIcons.Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {formatDate(activity.date || activity.startTime)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <LucideIcons.Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                {formatTime(activity.startTime)} - {formatTime(activity.endTime)}
              </span>
              <Badge variant="outline" className="text-xs">
                {getDuration()}
              </Badge>
            </div>
          </Card>

          {/* Description */}
          {activity.description && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <LucideIcons.FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Açıklama</span>
              </div>
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                {activity.description}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <LucideIcons.Trash2 className="w-4 h-4 mr-2" />
              Sil
            </Button>

            <Button
              onClick={() => onEdit(activity)}
              size="sm"
            >
              <LucideIcons.Edit className="w-4 h-4 mr-2" />
              Düzenle
            </Button>
          </div>
        </div>
      </DialogContent>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu aktiviteyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (onDelete) {
                  onDelete(activity);
                }
                setShowDeleteConfirm(false);
                onClose();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog >
  );
};