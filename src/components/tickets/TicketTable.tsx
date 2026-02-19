import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Clock,
    CheckCircle,
    XCircle,
    Pause,
    AlertTriangle,
    ArrowRight
} from "lucide-react";
import { Ticket, TICKET_STATUSES, TICKET_PRIORITIES } from "@/types/ticket";
import { User } from "@/types/user";
import { cn } from "@/lib/utils";

interface TicketTableProps {
    tickets: Ticket[];
    users: User[];
    currentUser: any;
    onViewTicket: (ticket: Ticket) => void;
    onAssignTicket?: (ticketId: string, assignedTo: string) => void;
}

export function TicketTable({
    tickets,
    users,
    onViewTicket,
}: TicketTableProps) {

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

    const getPriorityBadge = (priority: Ticket['priority']) => {
        switch (priority) {
            case 'low': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
            case 'medium': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
            case 'high': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
            case 'urgent': return 'bg-red-500 text-white border-red-600';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    return (
        <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead className="text-xs font-semibold w-[110px]">ID</TableHead>
                        <TableHead className="text-xs font-semibold">Başlık</TableHead>
                        <TableHead className="text-xs font-semibold w-[100px]">Durum</TableHead>
                        <TableHead className="text-xs font-semibold w-[90px]">Öncelik</TableHead>
                        <TableHead className="text-xs font-semibold w-[200px] hidden md:table-cell">Departmanlar</TableHead>
                        <TableHead className="text-xs font-semibold w-[80px] hidden lg:table-cell">Kişiler</TableHead>
                        <TableHead className="text-xs font-semibold w-[100px] hidden sm:table-cell">Tarih</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tickets.map((ticket, index) => {
                        const assignedUser = ticket.assignedTo ? users.find(u => u.id === ticket.assignedTo) : null;

                        return (
                            <TableRow
                                key={ticket.id}
                                onClick={() => onViewTicket(ticket)}
                                className={cn(
                                    "cursor-pointer transition-colors hover:bg-indigo-500/5",
                                    index % 2 === 1 && "bg-muted/10"
                                )}
                            >
                                <TableCell className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                                    #{ticket.ticketNumber || ticket.id.substring(0, 8)}
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm font-medium line-clamp-1">{ticket.title}</span>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={cn("text-[10px] h-5 gap-0.5", getStatusBadge(ticket.status))}>
                                        {getStatusIcon(ticket.status)}
                                        {TICKET_STATUSES[ticket.status]}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={cn("text-[10px] h-5 gap-0.5", getPriorityBadge(ticket.priority))}>
                                        {(ticket.priority === 'urgent' || ticket.priority === 'high') &&
                                            <AlertTriangle className="w-2.5 h-2.5" />
                                        }
                                        {TICKET_PRIORITIES[ticket.priority]}
                                    </Badge>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    <div className="flex items-center gap-1 text-xs">
                                        <span className="truncate max-w-[80px]">{ticket.sourceDepartment}</span>
                                        <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                                        <span className="truncate max-w-[80px] text-indigo-600 dark:text-indigo-400 font-medium">{ticket.targetDepartment}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">
                                    <div className="flex items-center -space-x-1.5">
                                        <Avatar className="w-5 h-5 border-2 border-background">
                                            <AvatarFallback className="text-[8px] bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold">
                                                {ticket.creatorName?.split(' ').map(n => n.charAt(0)).join('') || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        {(assignedUser || ticket.assignedToName) && (
                                            <Avatar className="w-5 h-5 border-2 border-background">
                                                <AvatarFallback className="text-[8px] bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-semibold">
                                                    {assignedUser
                                                        ? `${assignedUser.firstName.charAt(0)}${assignedUser.lastName.charAt(0)}`
                                                        : ticket.assignedToName?.split(' ').map(n => n.charAt(0)).join('') || 'U'
                                                    }
                                                </AvatarFallback>
                                            </Avatar>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">
                                    {formatDate(ticket.createdAt)}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
