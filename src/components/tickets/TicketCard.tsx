import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Clock, 
  User, 
  MessageSquare, 
  ArrowRight, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause
} from "lucide-react";
import { Ticket, TICKET_PRIORITIES, TICKET_STATUSES } from "@/types/ticket";
import { User as UserType } from "@/types/user";
import { cn } from "@/lib/utils";

interface TicketCardProps {
  ticket: Ticket;
  users: UserType[];
  currentUser: UserType;
  onViewTicket: (ticket: Ticket) => void;
  onAssignTicket?: (ticketId: string, assignedTo: string) => void;
}

export function TicketCard({ 
  ticket, 
  users, 
  currentUser, 
  onViewTicket,
  onAssignTicket 
}: TicketCardProps) {
  const assignedUser = ticket.assignedTo ? users.find(u => u.id === ticket.assignedTo) : null;

  const getPriorityIcon = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="w-4 h-4" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: Ticket['status']) => {
    switch (status) {
      case 'open':
        return <Clock className="w-4 h-4" />;
      case 'in_progress':
        return <Pause className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'closed':
        return <XCircle className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'low':
        return 'bg-success/10 text-success border-success/20';
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'high':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'urgent':
        return 'bg-destructive text-destructive-foreground border-destructive';
    }
  };

  const getStatusColor = (status: Ticket['status']) => {
    switch (status) {
      case 'open':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'in_progress':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'resolved':
        return 'bg-success/10 text-success border-success/20';
      case 'closed':
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canUserModifyTicket = () => {
    return currentUser.role === 'admin' || 
           ticket.assignedTo === currentUser.id ||
           ticket.createdBy === currentUser.id ||
           (currentUser.role === 'department_manager' && 
            (currentUser.department === ticket.sourceDepartment || 
             currentUser.department === ticket.targetDepartment));
  };

  return (
    <Card className="hover:shadow-elevated transition-smooth cursor-pointer" onClick={() => onViewTicket(ticket)}>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="font-mono text-xs sm:text-sm text-primary font-semibold truncate">
                #{ticket.ticketNumber || ticket.id.substring(0, 8)}
              </span>
              <Badge variant="outline" className={cn("text-xs w-fit", getPriorityColor(ticket.priority))}>
                {getPriorityIcon(ticket.priority)}
                <span className="ml-1 hidden sm:inline">{TICKET_PRIORITIES[ticket.priority]}</span>
                <span className="ml-1 sm:hidden">{TICKET_PRIORITIES[ticket.priority].charAt(0)}</span>
              </Badge>
            </div>
            <h3 className="font-semibold text-foreground line-clamp-2 text-sm sm:text-base">{ticket.title}</h3>
          </div>
          <Badge variant="outline" className={cn("w-fit", getStatusColor(ticket.status))}>
            {getStatusIcon(ticket.status)}
            <span className="ml-1 hidden sm:inline">{TICKET_STATUSES[ticket.status]}</span>
            <span className="ml-1 sm:hidden">{TICKET_STATUSES[ticket.status].charAt(0)}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4">
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span className="hidden sm:inline">{formatDate(ticket.createdAt)}</span>
              <span className="sm:hidden">{formatDate(ticket.createdAt).split(' ')[0]}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageSquare className="w-3 h-3" />
              <span>{ticket.comments?.length || 0}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center space-x-1 sm:space-x-2 text-xs">
            <span className="text-muted-foreground truncate">
              {ticket.sourceDepartment}
            </span>
            <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground truncate">
              {ticket.targetDepartment}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-border">
          <div className="flex items-center space-x-2 min-w-0">
            <span className="text-xs text-muted-foreground hidden sm:inline">Oluşturan:</span>
            <span className="text-xs text-muted-foreground sm:hidden">O:</span>
            <div className="flex items-center space-x-1 min-w-0">
              <Avatar className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0">
                <AvatarFallback className="text-xs bg-muted">
                  {ticket.creatorName ? ticket.creatorName.split(' ').map(n => n.charAt(0)).join('') : 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium truncate">
                {ticket.creatorName || 'Bilinmiyor'}
              </span>
            </div>
          </div>

          {(assignedUser || ticket.assignedToName) && (
            <div className="flex items-center space-x-2 min-w-0">
              <span className="text-xs text-muted-foreground hidden sm:inline">Atanan:</span>
              <span className="text-xs text-muted-foreground sm:hidden">A:</span>
              <div className="flex items-center space-x-1 min-w-0">
                <Avatar className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0">
                  <AvatarFallback className="text-xs bg-primary/10">
                    {assignedUser 
                      ? `${assignedUser.firstName.charAt(0)}${assignedUser.lastName.charAt(0)}`
                      : ticket.assignedToName?.split(' ').map(n => n.charAt(0)).join('') || 'U'
                    }
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium truncate">
                  {assignedUser 
                    ? `${assignedUser.firstName} ${assignedUser.lastName}`
                    : ticket.assignedToName || ticket.assignedTo
                  }
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}