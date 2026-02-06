import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Filter, X } from "lucide-react";
import { TicketFilter, TICKET_STATUSES, TICKET_PRIORITIES } from "@/types/ticket";
import { DEPARTMENTS, User } from "@/types/user";

interface TicketFiltersProps {
  filter: TicketFilter;
  onFilterChange: (filter: TicketFilter) => void;
  users: User[];
}

export function TicketFilters({ filter, onFilterChange, users }: TicketFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (updates: Partial<TicketFilter>) => {
    onFilterChange({ ...filter, ...updates });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = Object.keys(filter).length > 0;

  return (
    <Card className="border-border">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search and Filter Toggle */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Ticket ID, başlık veya açıklama ile ara..."
                value={filter.search || ''}
                onChange={(e) => updateFilter({ search: e.target.value })}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="shrink-0"
            >
              <Filter className="w-4 h-4 mr-1" />
              Filtreler
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 mr-1" />
                Temizle
              </Button>
            )}
          </div>

          {/* Expanded Filters */}
          {isExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-border">
              <div className="space-y-2">
                <Label>Durum</Label>
                <Select
                  value={filter.status || ''}
                  onValueChange={(value) => updateFilter({ status: value === 'all' ? undefined : value as TicketFilter['status'] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tüm durumlar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm durumlar</SelectItem>
                    {Object.entries(TICKET_STATUSES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Öncelik</Label>
                <Select
                  value={filter.priority || ''}
                  onValueChange={(value) => updateFilter({ priority: value === 'all' ? undefined : value as TicketFilter['priority'] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tüm öncelikler" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm öncelikler</SelectItem>
                    {Object.entries(TICKET_PRIORITIES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Departman</Label>
                <Select
                  value={filter.department || ''}
                  onValueChange={(value) => updateFilter({ department: value === 'all' ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tüm departmanlar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm departmanlar</SelectItem>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Atanan Kişi</Label>
                <Select
                  value={filter.assignedTo || ''}
                  onValueChange={(value) => updateFilter({ assignedTo: value === 'all' ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tüm atananlar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm atananlar</SelectItem>
                    <SelectItem value="unassigned">Atanmamış</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
              {filter.status && (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">
                  Durum: {TICKET_STATUSES[filter.status as keyof typeof TICKET_STATUSES]}
                </span>
              )}
              {filter.priority && (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">
                  Öncelik: {TICKET_PRIORITIES[filter.priority as keyof typeof TICKET_PRIORITIES]}
                </span>
              )}
              {filter.department && (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">
                  Departman: {filter.department}
                </span>
              )}
              {filter.assignedTo && (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">
                  Atanan: {filter.assignedTo === 'unassigned' ? 'Atanmamış' : 
                    users.find(u => u.id === filter.assignedTo)?.firstName || 'Bilinmiyor'}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}