import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Clock,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Pause,
    ArrowRight,
    MoreHorizontal
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Ticket, TICKET_PRIORITIES, TICKET_STATUSES } from "@/types/ticket";
import { User } from "@/types/user";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

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
    currentUser,
    onViewTicket
}: TicketTableProps) {

    const getPriorityColor = (priority: Ticket['priority']) => {
        switch (priority) {
            case 'low': return 'bg-success/10 text-success border-success/20';
            case 'medium': return 'bg-warning/10 text-warning border-warning/20';
            case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
            case 'urgent': return 'bg-destructive text-destructive-foreground border-destructive';
        }
    };

    const getStatusColor = (status: Ticket['status']) => {
        switch (status) {
            case 'open': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
            case 'in_progress': return 'bg-warning/10 text-warning border-warning/20';
            case 'resolved': return 'bg-success/10 text-success border-success/20';
            case 'closed': return 'bg-muted text-muted-foreground border-border';
        }
    };

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Başlık</TableHead>
                        <TableHead className="w-[120px]">Durum</TableHead>
                        <TableHead className="w-[100px]">Öncelik</TableHead>
                        <TableHead className="hidden md:table-cell">Departmanlar</TableHead>
                        <TableHead className="hidden lg:table-cell">Dahil Olanlar</TableHead>
                        <TableHead className="hidden lg:table-cell w-[140px]">Tarih</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tickets.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                Ticket bulunamadı.
                            </TableCell>
                        </TableRow>
                    ) : (
                        tickets.map((ticket) => {
                            const assignedUser = ticket.assignedTo ? users.find(u => u.id === ticket.assignedTo) : null;

                            return (
                                <TableRow key={ticket.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onViewTicket(ticket)}>
                                    <TableCell className="font-mono text-xs font-medium">
                                        #{ticket.ticketNumber || ticket.id.substring(0, 8)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium truncate max-w-[200px] sm:max-w-[300px]">
                                            {ticket.title}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cn("text-xs whitespace-nowrap", getStatusColor(ticket.status))}>
                                            {TICKET_STATUSES[ticket.status]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cn("text-xs whitespace-nowrap", getPriorityColor(ticket.priority))}>
                                            {TICKET_PRIORITIES[ticket.priority]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <div className="flex items-center text-xs text-muted-foreground">
                                            <span className="truncate max-w-[80px]">{ticket.sourceDepartment}</span>
                                            <ArrowRight className="w-3 h-3 mx-1 shrink-0" />
                                            <span className="truncate max-w-[80px]">{ticket.targetDepartment}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell">
                                        <div className="flex items-center -space-x-2">
                                            <Avatar className="w-6 h-6 border-2 border-background">
                                                <AvatarFallback className="text-[10px] bg-muted">
                                                    {ticket.creatorName ? ticket.creatorName.split(' ').map(n => n.charAt(0)).join('') : 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            {assignedUser && (
                                                <Avatar className="w-6 h-6 border-2 border-background">
                                                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                                        {assignedUser.firstName.charAt(0)}{assignedUser.lastName.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                                        {format(new Date(ticket.createdAt), "d MMM yyyy", { locale: tr })}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
