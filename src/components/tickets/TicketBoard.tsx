import { Ticket, TICKET_STATUSES } from "@/types/ticket";
import { User } from "@/types/user";
import { TicketCard } from "./TicketCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
    Clock,
    PlayCircle,
    CheckCircle,
    XCircle,
    MoreHorizontal
} from "lucide-react";

interface TicketBoardProps {
    tickets: Ticket[];
    users: User[];
    currentUser: any;
    onViewTicket: (ticket: Ticket) => void;
    onAssignTicket?: (ticketId: string, assignedTo: string) => void;
}

export function TicketBoard({
    tickets,
    users,
    currentUser,
    onViewTicket,
    onAssignTicket
}: TicketBoardProps) {

    const columns = [
        { id: 'open', label: 'Açık', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { id: 'in_progress', label: 'Devam Eden', icon: PlayCircle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
        { id: 'resolved', label: 'Çözüldü', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
        { id: 'closed', label: 'Kapatıldı', icon: XCircle, color: 'text-gray-500', bg: 'bg-gray-500/10' },
    ] as const;

    return (
        <div className="flex h-[calc(100vh-280px)] gap-4 overflow-x-auto pb-4">
            {columns.map(column => {
                const columnTickets = tickets.filter(t => t.status === column.id);
                const Icon = column.icon;

                return (
                    <div key={column.id} className="min-w-[300px] w-[350px] flex flex-col rounded-lg border bg-muted/40">
                        {/* Column Header */}
                        <div className="p-3 border-b flex items-center justify-between bg-card rounded-t-lg sticky top-0 z-10">
                            <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-md ${column.bg}`}>
                                    <Icon className={`w-4 h-4 ${column.color}`} />
                                </div>
                                <h3 className="font-semibold text-sm">{column.label}</h3>
                                <Badge variant="secondary" className="ml-1 text-xs px-1.5 h-5 min-w-5 flex items-center justify-center">
                                    {columnTickets.length}
                                </Badge>
                            </div>
                            <button className="text-muted-foreground hover:text-foreground">
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Column Content */}
                        <ScrollArea className="flex-1 p-3">
                            <div className="flex flex-col gap-3">
                                {columnTickets.map(ticket => (
                                    <TicketCard
                                        key={ticket.id}
                                        ticket={ticket}
                                        users={users}
                                        currentUser={currentUser}
                                        onViewTicket={onViewTicket}
                                        onAssignTicket={onAssignTicket}
                                    />
                                ))}
                                {columnTickets.length === 0 && (
                                    <div className="h-24 border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                                        Ticket yok
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                );
            })}
        </div>
    );
}
