import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { TicketFilter, TICKET_STATUSES, TICKET_PRIORITIES } from "@/types/ticket";
import { DEPARTMENTS, User } from "@/types/user";

interface TicketFiltersProps {
  filter: TicketFilter;
  onFilterChange: (filter: TicketFilter) => void;
  users: User[];
}

export function TicketFilters({ filter, onFilterChange, users }: TicketFiltersProps) {
  const updateFilter = (updates: Partial<TicketFilter>) => {
    onFilterChange({ ...filter, ...updates });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(filter).some(v => v !== undefined && v !== '');

  return (
    <div className="bg-card/60 backdrop-blur-sm rounded-xl border border-border/50 p-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Ticket ara..."
            value={filter.search || ''}
            onChange={(e) => updateFilter({ search: e.target.value || undefined })}
            className="pl-9 h-9 bg-background/50 border-border/50 text-sm"
          />
        </div>

        {/* Status */}
        <Select
          value={filter.status || 'all'}
          onValueChange={(value) => updateFilter({ status: value === 'all' ? undefined : value as TicketFilter['status'] })}
        >
          <SelectTrigger className="w-[130px] h-9 bg-background/50 border-border/50 text-sm">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Durumlar</SelectItem>
            {Object.entries(TICKET_STATUSES).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority */}
        <Select
          value={filter.priority || 'all'}
          onValueChange={(value) => updateFilter({ priority: value === 'all' ? undefined : value as TicketFilter['priority'] })}
        >
          <SelectTrigger className="w-[130px] h-9 bg-background/50 border-border/50 text-sm">
            <SelectValue placeholder="Öncelik" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Öncelikler</SelectItem>
            {Object.entries(TICKET_PRIORITIES).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Department */}
        <Select
          value={filter.department || 'all'}
          onValueChange={(value) => updateFilter({ department: value === 'all' ? undefined : value })}
        >
          <SelectTrigger className="w-[140px] h-9 bg-background/50 border-border/50 text-sm hidden md:flex">
            <SelectValue placeholder="Departman" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Departmanlar</SelectItem>
            {DEPARTMENTS.map((dept) => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Assigned To */}
        <Select
          value={filter.assignedTo || 'all'}
          onValueChange={(value) => updateFilter({ assignedTo: value === 'all' ? undefined : value })}
        >
          <SelectTrigger className="w-[140px] h-9 bg-background/50 border-border/50 text-sm hidden lg:flex">
            <SelectValue placeholder="Atanan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Atananlar</SelectItem>
            <SelectItem value="unassigned">Atanmamış</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.firstName} {user.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-9 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Temizle
          </Button>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-border/30">
          {filter.status && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-medium">
              {TICKET_STATUSES[filter.status as keyof typeof TICKET_STATUSES]}
              <button onClick={() => updateFilter({ status: undefined })} className="ml-1 hover:text-indigo-800">×</button>
            </span>
          )}
          {filter.priority && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium">
              {TICKET_PRIORITIES[filter.priority as keyof typeof TICKET_PRIORITIES]}
              <button onClick={() => updateFilter({ priority: undefined })} className="ml-1 hover:text-amber-800">×</button>
            </span>
          )}
          {filter.department && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-medium">
              {filter.department}
              <button onClick={() => updateFilter({ department: undefined })} className="ml-1 hover:text-purple-800">×</button>
            </span>
          )}
          {filter.assignedTo && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
              {filter.assignedTo === 'unassigned' ? 'Atanmamış' :
                users.find(u => u.id === filter.assignedTo)?.firstName || 'Bilinmiyor'}
              <button onClick={() => updateFilter({ assignedTo: undefined })} className="ml-1 hover:text-emerald-800">×</button>
            </span>
          )}
          {filter.search && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-500/10 text-gray-600 dark:text-gray-400 text-xs font-medium">
              "{filter.search}"
              <button onClick={() => updateFilter({ search: undefined })} className="ml-1 hover:text-gray-800">×</button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}