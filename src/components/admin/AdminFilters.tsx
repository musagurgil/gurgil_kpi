import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/hooks/useAdmin';
import { AdminFilters as AdminFiltersType } from '@/types/admin';
import { Filter, Download } from 'lucide-react';

export const AdminFilters = () => {
  const { filters, setFilters, getAvailableDepartments, getAvailableUsers, exportToCSV, loading } = useAdmin();

  const updateFilters = (updates: Partial<AdminFiltersType>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const resetFilters = () => {
    setFilters({
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filtreler ve Rapor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="startDate">Başlangıç Tarihi</Label>
            <Input
              id="startDate"
              type="date"
              value={filters.startDate}
              onChange={(e) => updateFilters({ startDate: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="endDate">Bitiş Tarihi</Label>
            <Input
              id="endDate"
              type="date"
              value={filters.endDate}
              onChange={(e) => updateFilters({ endDate: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="department">Departman</Label>
            <Select 
              value={filters.department || 'all'} 
              onValueChange={(value) => updateFilters({ 
                department: value === 'all' ? undefined : value,
                userId: undefined // Reset user when department changes
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tüm Departmanlar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Departmanlar</SelectItem>
                {getAvailableDepartments().map(dept => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="user">Kullanıcı</Label>
            <Select 
              value={filters.userId || 'all'} 
              onValueChange={(value) => updateFilters({ userId: value === 'all' ? undefined : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tüm Kullanıcılar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kullanıcılar</SelectItem>
                {getAvailableUsers().map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="outline" onClick={resetFilters}>
            Filtreleri Temizle
          </Button>
          <Button onClick={exportToCSV} className="flex items-center gap-2" disabled={loading}>
            <Download className="w-4 h-4" />
            {loading ? 'Yükleniyor...' : 'CSV İndir'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};