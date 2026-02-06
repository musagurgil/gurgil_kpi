import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter, X } from "lucide-react";
import { KPIFilters, KPI_PERIODS, KPI_PRIORITIES, KPI_STATUSES } from '@/types/kpi';
import { User } from '@/types/user';

interface KPIFiltersProps {
  filters: KPIFilters;
  onFiltersChange: (filters: KPIFilters) => void;
  availableDepartments: string[];
  availableUsers: User[];
  currentUser: User | null;
}

export function KPIFiltersComponent({ 
  filters, 
  onFiltersChange, 
  availableDepartments, 
  availableUsers,
  currentUser 
}: KPIFiltersProps) {
  const handleFilterChange = (key: keyof KPIFilters, value: string | undefined) => {
    const updatedValue = value === "all" ? undefined : value;
    onFiltersChange({
      ...filters,
      [key]: updatedValue || undefined
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            Filtreler
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="text-xs"
            >
              <X className="w-4 h-4 mr-1" />
              Temizle ({activeFiltersCount})
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Department Filter - Only show if user can access multiple departments */}
          {(currentUser?.role === 'admin' || availableDepartments.length > 1) && (
            <div className="space-y-2">
              <Label htmlFor="department-filter" className="text-sm font-medium">
                Departman
              </Label>
              <Select
                value={filters.department || ""}
                onValueChange={(value) => handleFilterChange('department', value)}
              >
                <SelectTrigger id="department-filter">
                  <SelectValue placeholder="Tüm departmanlar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm departmanlar</SelectItem>
                  {availableDepartments.map(dept => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Period Filter */}
          <div className="space-y-2">
            <Label htmlFor="period-filter" className="text-sm font-medium">
              Dönem
            </Label>
            <Select
              value={filters.period || ""}
              onValueChange={(value) => handleFilterChange('period', value)}
            >
              <SelectTrigger id="period-filter">
                <SelectValue placeholder="Tüm dönemler" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm dönemler</SelectItem>
                {Object.entries(KPI_PERIODS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status-filter" className="text-sm font-medium">
              Durum
            </Label>
            <Select
              value={filters.status || ""}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="Tüm durumlar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm durumlar</SelectItem>
                {Object.entries(KPI_STATUSES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority Filter */}
          <div className="space-y-2">
            <Label htmlFor="priority-filter" className="text-sm font-medium">
              Öncelik
            </Label>
            <Select
              value={filters.priority || ""}
              onValueChange={(value) => handleFilterChange('priority', value)}
            >
              <SelectTrigger id="priority-filter">
                <SelectValue placeholder="Tüm öncelikler" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm öncelikler</SelectItem>
                {Object.entries(KPI_PRIORITIES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assigned To Filter - Only for admins and managers */}
          {(currentUser?.role === 'admin' || currentUser?.role === 'department_manager') && (
            <div className="space-y-2">
              <Label htmlFor="assigned-filter" className="text-sm font-medium">
                Atanan Kişi
              </Label>
              <Select
                value={filters.assignedTo || ""}
                onValueChange={(value) => handleFilterChange('assignedTo', value)}
              >
                <SelectTrigger id="assigned-filter">
                  <SelectValue placeholder="Herkes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Herkes</SelectItem>
                  {availableUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Start Date Filter */}
          <div className="space-y-2">
            <Label htmlFor="start-date-filter" className="text-sm font-medium">
              Başlangıç Tarihi (Den)
            </Label>
            <Input
              id="start-date-filter"
              type="date"
              value={filters.startDate || ""}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="text-sm"
            />
          </div>

          {/* End Date Filter */}
          <div className="space-y-2">
            <Label htmlFor="end-date-filter" className="text-sm font-medium">
              Bitiş Tarihi (Kadar)
            </Label>
            <Input
              id="end-date-filter"
              type="date"
              value={filters.endDate || ""}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="text-sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}