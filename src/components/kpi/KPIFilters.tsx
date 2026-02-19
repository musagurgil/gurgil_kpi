import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";
import { KPIFilters, KPI_PERIODS, KPI_PRIORITIES, KPI_STATUSES, KPIUser } from '@/types/kpi';
import { cn } from "@/lib/utils";

interface KPIFiltersProps {
  filters: KPIFilters;
  onFiltersChange: (filters: KPIFilters) => void;
  availableDepartments: string[];
  availableUsers: KPIUser[];
  currentUser: KPIUser | null;
}

export function KPIFiltersComponent({
  filters,
  onFiltersChange,
  availableDepartments,
  availableUsers,
  currentUser
}: KPIFiltersProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

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
  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <div className="bg-card/60 backdrop-blur-sm rounded-xl border border-border/50 p-3 shadow-sm transition-all hover:shadow-md hover:bg-card/80">
      <div className="flex flex-wrap items-center gap-2">
        {/* Filter Icon Label */}
        <div className="flex items-center gap-2 text-muted-foreground mr-2 px-2 border-r border-border/50">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium hidden sm:inline">Filtrele</span>
        </div>

        {/* Department Filter */}
        {(currentUser?.role === 'admin' || availableDepartments.length > 1) && (
          <Select
            value={filters.department || ""}
            onValueChange={(value) => handleFilterChange('department', value)}
          >
            <SelectTrigger className="h-9 w-[160px] bg-background/50 border-border/50 text-xs">
              <SelectValue placeholder="Departman" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Departmanlar</SelectItem>
              {availableDepartments.map(dept => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Period Filter */}
        <Select
          value={filters.period || ""}
          onValueChange={(value) => handleFilterChange('period', value)}
        >
          <SelectTrigger className="h-9 w-[130px] bg-background/50 border-border/50 text-xs">
            <SelectValue placeholder="Dönem" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Dönemler</SelectItem>
            {Object.entries(KPI_PERIODS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={filters.status || ""}
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <SelectTrigger className="h-9 w-[130px] bg-background/50 border-border/50 text-xs">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Durumlar</SelectItem>
            {Object.entries(KPI_STATUSES).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select
          value={filters.priority || ""}
          onValueChange={(value) => handleFilterChange('priority', value)}
        >
          <SelectTrigger className="h-9 w-[130px] bg-background/50 border-border/50 text-xs">
            <SelectValue placeholder="Öncelik" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Öncelikler</SelectItem>
            {Object.entries(KPI_PRIORITIES).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Assigned To Filter */}
        {(currentUser?.role === 'admin' || currentUser?.role === 'department_manager') && (
          <Select
            value={filters.assignedTo || ""}
            onValueChange={(value) => handleFilterChange('assignedTo', value)}
          >
            <SelectTrigger className="h-9 w-[150px] bg-background/50 border-border/50 text-xs">
              <SelectValue placeholder="Atanan Kişi" />
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
        )}

        {/* User Date Range Inputs can be toggled or kept compact. 
              For compact design, let's put them in a popover or just active chips if selected, 
              but for now keeping them visible but smaller might be crowd.
              Let's keep them as small inputs. */}
        <Input
          type="date"
          value={filters.startDate || ""}
          onChange={(e) => handleFilterChange('startDate', e.target.value)}
          className="h-9 w-auto min-w-[130px] bg-background/50 border-border/50 text-xs"
          placeholder="Başlangıç"
        />
        <Input
          type="date"
          value={filters.endDate || ""}
          onChange={(e) => handleFilterChange('endDate', e.target.value)}
          className="h-9 w-auto min-w-[130px] bg-background/50 border-border/50 text-xs"
          placeholder="Bitiş"
        />


        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-9 px-2.5 text-muted-foreground hover:text-foreground ml-auto"
          >
            <X className="w-4 h-4 mr-1" />
            Temizle
          </Button>
        )}
      </div>

      {/* Active Filters Summary (Optional enhancement) */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-border/30">
          {filters.department && (
            <Badge variant="secondary" className="text-[10px] h-5 bg-blue-100 text-blue-700 hover:bg-blue-200 border-none gap-1 pl-1 pr-2 cursor-pointer" onClick={() => handleFilterChange('department', undefined)}>
              <X className="w-3 h-3 hover:text-blue-900" /> {filters.department}
            </Badge>
          )}
          {filters.status && (
            <Badge variant="secondary" className="text-[10px] h-5 bg-purple-100 text-purple-700 hover:bg-purple-200 border-none gap-1 pl-1 pr-2 cursor-pointer" onClick={() => handleFilterChange('status', undefined)}>
              <X className="w-3 h-3 hover:text-purple-900" /> {KPI_STATUSES[filters.status as keyof typeof KPI_STATUSES]}
            </Badge>
          )}
          {filters.priority && (
            <Badge variant="secondary" className="text-[10px] h-5 bg-amber-100 text-amber-700 hover:bg-amber-200 border-none gap-1 pl-1 pr-2 cursor-pointer" onClick={() => handleFilterChange('priority', undefined)}>
              <X className="w-3 h-3 hover:text-amber-900" /> {KPI_PRIORITIES[filters.priority as keyof typeof KPI_PRIORITIES]}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}