import { NotificationFilter, NOTIFICATION_CATEGORIES, NOTIFICATION_PRIORITIES } from '@/types/notification';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Filter, X } from 'lucide-react';

interface NotificationFiltersProps {
  filter: NotificationFilter;
  onFilterChange: (filter: NotificationFilter) => void;
}

export const NotificationFilters = ({ filter, onFilterChange }: NotificationFiltersProps) => {
  const handleReset = () => {
    onFilterChange({
      category: 'all',
      priority: 'all',
      isRead: 'all'
    });
  };

  const hasActiveFilters =
    filter.category !== 'all' ||
    filter.priority !== 'all' ||
    filter.isRead !== 'all';

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/50">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Filter className="h-4 w-4" />
            Filtrele:
          </div>

          <Select
            value={filter.category || 'all'}
            onValueChange={(value) => onFilterChange({ ...filter, category: value as any })}
          >
            <SelectTrigger className="w-[150px] bg-background/50 border-border/50">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kategoriler</SelectItem>
              {Object.entries(NOTIFICATION_CATEGORIES).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filter.priority || 'all'}
            onValueChange={(value) => onFilterChange({ ...filter, priority: value as any })}
          >
            <SelectTrigger className="w-[150px] bg-background/50 border-border/50">
              <SelectValue placeholder="Öncelik" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Öncelikler</SelectItem>
              {Object.entries(NOTIFICATION_PRIORITIES).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filter.isRead === 'all' ? 'all' : filter.isRead ? 'read' : 'unread'}
            onValueChange={(value) =>
              onFilterChange({
                ...filter,
                isRead: value === 'all' ? 'all' : value === 'read'
              })
            }
          >
            <SelectTrigger className="w-[130px] bg-background/50 border-border/50">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="unread">Okunmamış</SelectItem>
              <SelectItem value="read">Okunmuş</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              Temizle
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
