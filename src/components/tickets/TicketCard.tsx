import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Clock,
  MessageSquare,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause,
  Calendar
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
  onViewTicket,
}: TicketCardProps) {
  const assignedUser = ticket.assignedTo ? users.find(u => u.id === ticket.assignedTo) : null;

  const getPriorityBorder = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'low': return 'border-l-emerald-500';
      case 'medium': return 'border-l-amber-500';
      case 'high': return 'border-l-orange-500';
      case 'urgent': return 'border-l-red-500';
    }
  };

  const getPriorityBadge = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'low': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
      case 'urgent': return 'bg-red-500 text-white border-red-600';
    }
  };

  const getStatusBadge = (status: Ticket['status']) => {
    switch (status) {
      case 'open': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'in_progress': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'resolved': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'closed': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: Ticket['status']) => {
    switch (status) {
      case 'open': return <Clock className="w-3 h-3" />;
      case 'in_progress': return <Pause className="w-3 h-3" />;
      case 'resolved': return <CheckCircle className="w-3 h-3" />;
      case 'closed': return <XCircle className="w-3 h-3" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Az önce';
    if (hours < 24) return `${hours}s önce`;
    if (days < 7) return `${days}g önce`;
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
  };

  return (
    <Card
      className={cn(
        "border-l-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group bg-card/90 backdrop-blur-sm",
        getPriorityBorder(ticket.priority)
      )}
      onClick={() => onViewTicket(ticket)}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header: ID + Badges */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-500/10 px-1.5 py-0.5 rounded">
                #{ticket.ticketNumber || ticket.id.substring(0, 8)}
              </span>
              <Badge variant="outline" className={cn("text-[10px] h-5 gap-0.5", getPriorityBadge(ticket.priority))}>
                {ticket.priority === 'urgent' || ticket.priority === 'high'
                  ? <AlertTriangle className="w-2.5 h-2.5" />
                  : null
                }
                {TICKET_PRIORITIES[ticket.priority]}
              </Badge>
            </div>
            <h3 className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {ticket.title}
            </h3>
          </div>
          <Badge variant="outline" className={cn("text-[10px] h-5 gap-0.5 shrink-0", getStatusBadge(ticket.status))}>
            {getStatusIcon(ticket.status)}
            {TICKET_STATUSES[ticket.status]}
          </Badge>
        </div>

        {/* Description preview */}
        <p className="text-xs text-muted-foreground line-clamp-2">{ticket.description}</p>

        {/* Department Flow */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium truncate max-w-[100px]">
            {ticket.sourceDepartment}
          </span>
          <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
          <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium truncate max-w-[100px]">
            {ticket.targetDepartment}
          </span>
        </div>

        {/* Footer: People + Meta */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center -space-x-1.5">
            <Avatar className="w-6 h-6 border-2 border-background ring-0">
              <AvatarFallback className="text-[9px] bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold">
                {ticket.creatorName ? ticket.creatorName.split(' ').map(n => n.charAt(0)).join('') : 'U'}
              </AvatarFallback>
            </Avatar>
            {(assignedUser || ticket.assignedToName) && (
              <Avatar className="w-6 h-6 border-2 border-background ring-0">
                <AvatarFallback className="text-[9px] bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-semibold">
                  {assignedUser
                    ? `${assignedUser.firstName.charAt(0)}${assignedUser.lastName.charAt(0)}`
                    : ticket.assignedToName?.split(' ').map(n => n.charAt(0)).join('') || 'U'
                  }
                </AvatarFallback>
              </Avatar>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              <span>{ticket.comments?.length || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(ticket.createdAt)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}