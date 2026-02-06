import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, User, MoreHorizontal } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { TICKET_PRIORITIES, TICKET_STATUSES, PRIORITY_COLORS, STATUS_COLORS } from "@/types/ticket";

export function TicketOverview() {
  const { stats, loading } = useDashboard();
  
  // Mock recent tickets data
  const recentTickets = [
    {
      id: 'TCK-001',
      title: 'Sistem Güncelleme Talebi',
      priority: 'medium',
      status: 'open',
      createdBy: 'Manager User',
      createdAt: '2025-10-08T10:00:00Z'
    },
    {
      id: 'TCK-002',
      title: 'Eğitim Materyali Hazırlama',
      priority: 'low',
      status: 'in_progress',
      createdBy: 'Admin User',
      createdAt: '2025-10-07T14:30:00Z'
    }
  ];

  if (loading) {
    return (
      <Card className="shadow-card">
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
      <Card className="shadow-card">
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
    <Card className="shadow-card">
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
              className="flex items-center justify-between p-4 hover:bg-muted/50 transition-smooth border-b border-border last:border-b-0"
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
                      <span>{ticket.assignedTo || 'Atanmamış'}</span>
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