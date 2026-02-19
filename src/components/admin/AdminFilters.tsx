import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useAdmin, AdminFiltersState } from '@/hooks/useAdmin';
import { Filter, Download, RotateCcw } from 'lucide-react';

export const AdminFilters = () => {
  const { filters, setFilters, getAvailableDepartments, getAvailableUsers, exportToCSV, loading } = useAdmin();

  const updateFilters = (updates: Partial<AdminFiltersState>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const resetFilters = () => {
    setFilters({
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <Card className="border-border/50 shadow-sm bg-card/80 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row items-end gap-3">
          {/* Date Range */}
          <div className="flex gap-3 flex-1 min-w-0 w-full lg:w-auto">
            <div className="flex-1 min-w-[140px]">
              <Label htmlFor="startDate" className="text-xs text-muted-foreground mb-1 block">
                Başlangıç
              </Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => updateFilters({ startDate: e.target.value })}
                className="h-9 text-sm"
              />
            </div>
            <div className="flex-1 min-w-[140px]">
              <Label htmlFor="endDate" className="text-xs text-muted-foreground mb-1 block">
                Bitiş
              </Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => updateFilters({ endDate: e.target.value })}
                className="h-9 text-sm"
              />
            </div>
          </div>

          {/* Dropdowns */}
          <div className="flex gap-3 flex-1 min-w-0 w-full lg:w-auto">
            <div className="flex-1 min-w-[150px]">
              <Label className="text-xs text-muted-foreground mb-1 block">Departman</Label>
              <Select
                value={filters.department || 'all'}
                onValueChange={(value) => updateFilters({
                  department: value === 'all' ? undefined : value,
                  userId: undefined
                })}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Tüm Departmanlar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Departmanlar</SelectItem>
                  {getAvailableDepartments().map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[150px]">
              <Label className="text-xs text-muted-foreground mb-1 block">Kullanıcı</Label>
              <Select
                value={filters.userId || 'all'}
                onValueChange={(value) => updateFilters({ userId: value === 'all' ? undefined : value })}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Tüm Kullanıcılar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kullanıcılar</SelectItem>
                  {getAvailableUsers().map(user => (
                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 w-full lg:w-auto shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-9 gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Temizle</span>
            </Button>
            <Button
              size="sm"
              onClick={exportToCSV}
              disabled={loading}
              className="h-9 gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              CSV İndir
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};