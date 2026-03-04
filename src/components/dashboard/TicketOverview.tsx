import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, User, MoreHorizontal } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { useTickets } from "@/hooks/useTickets";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { TICKET_PRIORITIES, TICKET_STATUSES, PRIORITY_COLORS, STATUS_COLORS } from "@/types/ticket";
import { useState, useEffect, useMemo } from "react";
import { User as UserType } from "@/types/user";
import { apiClient } from "@/lib/api";

export function TicketOverview() {
  const { loading: dashboardLoading } = useDashboard();
  const { tickets, loading: ticketsLoading } = useTickets();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserType[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await apiClient.getUsers();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const loading = dashboardLoading || ticketsLoading;

  // ⚡ Bolt Optimization: Memoize user mapping and ticket filtering/sorting
  // What: Created a O(1) users lookup map and wrapped O(N log N) filtering/sorting in useMemo
  // Why: Replaces O(N*M) array iteration inside render (.find inside .map) with O(1) hash map lookups,
  //      and prevents unnecessary ticket recalculation on every re-render when context changes
  const usersMap = useMemo(() => {
    return users.reduce((acc, u) => {
      acc[u.id] = u;
      return acc;
    }, {} as Record<string, UserType>);
  }, [users]);

  // Filter tickets targeted to the user's department, sort by newest, take top 5
  const recentTickets = useMemo(() => {
    return [...tickets]
      .filter(t => !user || t.targetDepartment === user.department || user.roles.includes('admin'))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [tickets, user]);

  if (loading) {
    return (
      <Card className="shadow-sm border-border/50 hover:shadow-md transition-smooth bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Son Ticket'lar</CardTitle>
            <Button variant="outline" size="sm" disabled>
              Tümünü Gör
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="space-y-1">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex items-center justify-between p-4 border-b border-border last:border-b-0">
                <div className="flex items-center space-x-4 flex-1">
                  <Skeleton className="w-3 h-3 rounded-full" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="w-8 h-8" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recentTickets || recentTickets.length === 0) {
    return (
      <Card className="shadow-sm border-border/50 hover:shadow-md transition-smooth bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Son Ticket'lar</CardTitle>
            <Button variant="outline" size="sm">
              Tümünü Gör
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Henüz ticket bulunmamaktadır.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-border/50 hover:shadow-md transition-smooth bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Son Ticket'lar</CardTitle>
          <Button variant="outline" size="sm">
            Tümünü Gör
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="space-y-1">
          {recentTickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => navigate(`/tickets#${ticket.id}`)}
              className="flex items-center justify-between p-4 hover:bg-muted/50 transition-smooth border-b border-border last:border-b-0 cursor-pointer"
            >
              <div className="flex items-center space-x-4 flex-1">
                {/* Priority Indicator */}
                <div className={`w-3 h-3 rounded-full ${PRIORITY_COLORS[ticket.priority]}`} />

                {/* Ticket Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-foreground truncate">
                      {ticket.title}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {ticket.id}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>{ticket.sourceDepartment}</span>
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>
                        {ticket.assignedTo
                          ? (usersMap[ticket.assignedTo]?.firstName + ' ' + usersMap[ticket.assignedTo]?.lastName || 'Atanmış Kullanıcı')
                          : 'Atanmamış'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(ticket.createdAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status and Priority Badges */}
              <div className="flex items-center space-x-2">
                <Badge className={`text-xs ${STATUS_COLORS[ticket.status]}`}>
                  {TICKET_STATUSES[ticket.status]}
                </Badge>
                <Badge className={`text-xs ${PRIORITY_COLORS[ticket.priority]}`}>
                  {TICKET_PRIORITIES[ticket.priority]}
                </Badge>
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}