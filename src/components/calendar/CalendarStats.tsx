import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useCategories } from '@/hooks/useCategories';
import * as LucideIcons from 'lucide-react';

interface CalendarStatsProps {
  stats: any;
}

export const CalendarStats = ({ stats }: CalendarStatsProps) => {
  const { categories } = useCategories();

  const getCategoryName = (categoryId: string) => {
    const category = categories?.find(cat => cat.id === categoryId);
    return category?.name || 'Bilinmeyen';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories?.find(cat => cat.id === categoryId);
    return category?.color || '#3b82f6';
  };

  return (
    <div className="space-y-4">
      {/* Monthly Overview */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="pb-3 border-b border-border/30">
          <CardTitle className="text-base flex items-center gap-2 font-semibold">
            <LucideIcons.Calendar className="w-4 h-4 text-primary" />
            Aylık Özet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {/* Total Hours */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LucideIcons.Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Toplam Saat</span>
            </div>
            <span className="text-lg font-bold">
              {(stats?.monthlyTotalHours || 0).toFixed(1)}h
            </span>
          </div>

          {/* Entry Count */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LucideIcons.BarChart3 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Giriş Sayısı</span>
            </div>
            <span className="text-lg font-bold">
              {stats?.entryCount || 0}
            </span>
          </div>

          {/* Average Daily Hours */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LucideIcons.TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Günlük Ortalama</span>
            </div>
            <span className="text-lg font-bold">
              {(stats?.averageDailyHours || 0).toFixed(1)}h
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Category Distribution */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="pb-3 border-b border-border/30">
          <CardTitle className="text-base flex items-center gap-2 font-semibold">
            <LucideIcons.BarChart3 className="w-4 h-4 text-primary" />
            Kategori Dağılımı
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {stats?.categoryStats && Object.keys(stats.categoryStats).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(stats.categoryStats).map(([categoryId, hoursValue]) => {
                const hours = Number(hoursValue);
                const totalHours = stats.monthlyTotalHours || 0;
                const percentage = totalHours > 0 ? Math.min((hours / totalHours) * 100, 100) : 0;

                return (
                  <div key={categoryId} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getCategoryColor(categoryId) }}
                        />
                        <span className="text-sm font-medium">
                          {getCategoryName(categoryId)}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {hours.toFixed(1)}h ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary/30">
                      <div
                        className="h-full bg-foreground transition-all duration-500 rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: getCategoryColor(categoryId)
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                Bu ay henüz aktivite kaydı bulunmuyor
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="pb-3 border-b border-border/30">
          <CardTitle className="text-base font-semibold">Hızlı İstatistikler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">En Aktif Gün</span>
            <span className="font-medium">
              {stats?.entryCount > 0 ? 'Pazartesi' : '-'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Ortalama Süre</span>
            <span className="font-medium">
              {stats?.entryCount > 0
                ? `${((stats.monthlyTotalHours || 0) / (stats.entryCount || 1)).toFixed(1)}h`
                : '-'
              }
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">En Popüler Kategori</span>
            <span className="font-medium">
              {stats?.categoryStats && Object.keys(stats.categoryStats).length > 0
                ? getCategoryName(
                  Object.entries(stats.categoryStats).reduce((a, b) =>
                    stats.categoryStats[a[0]] > stats.categoryStats[b[0]] ? a : b
                  )[0]
                )
                : '-'
              }
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};