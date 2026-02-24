import { useState, useCallback } from "react";
import { Ticket } from "@/types/ticket";
import { User } from "@/types/user";
import { TicketCard } from "./TicketCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    Clock,
    PlayCircle,
    CheckCircle,
    XCircle,
    GripVertical
} from "lucide-react";

interface TicketBoardProps {
    tickets: Ticket[];
    users: User[];
    currentUser: any;
    onViewTicket: (ticket: Ticket) => void;
    onAssignTicket?: (ticketId: string, assignedTo: string) => void;
    onStatusChange?: (ticketId: string, newStatus: string) => void;
}

const COLUMNS = [
    { id: 'open', label: 'Açık', icon: Clock, gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-500/10', border: 'border-blue-500/20', dropBorder: 'border-blue-400', dropBg: 'bg-blue-500/5' },
    { id: 'in_progress', label: 'Devam Eden', icon: PlayCircle, gradient: 'from-amber-400 to-orange-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dropBorder: 'border-amber-400', dropBg: 'bg-amber-500/5' },
    { id: 'resolved', label: 'Çözüldü', icon: CheckCircle, gradient: 'from-emerald-400 to-green-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dropBorder: 'border-emerald-400', dropBg: 'bg-emerald-500/5' },
    { id: 'closed', label: 'Kapatıldı', icon: XCircle, gradient: 'from-gray-400 to-slate-500', bg: 'bg-gray-500/10', border: 'border-gray-500/20', dropBorder: 'border-gray-400', dropBg: 'bg-gray-500/5' },
] as const;

export function TicketBoard({
    tickets,
    users,
    currentUser,
    onViewTicket,
    onAssignTicket,
    onStatusChange
}: TicketBoardProps) {
    const [draggedTicketId, setDraggedTicketId] = useState<string | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

    const handleDragStart = useCallback((e: React.DragEvent, ticketId: string) => {
        setDraggedTicketId(ticketId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', ticketId);
        // Add a slight delay to allow the drag image to render
        requestAnimationFrame(() => {
            const el = document.getElementById(`ticket-card-${ticketId}`);
            if (el) el.style.opacity = '0.4';
        });
    }, []);

    const handleDragEnd = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        // Restore opacity
        if (draggedTicketId) {
            const el = document.getElementById(`ticket-card-${draggedTicketId}`);
            if (el) el.style.opacity = '1';
        }
        setDraggedTicketId(null);
        setDragOverColumn(null);
    }, [draggedTicketId]);

    const handleDragOver = useCallback((e: React.DragEvent, columnId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverColumn(columnId);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        // Only clear if we're actually leaving the column (not entering a child)
        const relatedTarget = e.relatedTarget as HTMLElement;
        const currentTarget = e.currentTarget as HTMLElement;
        if (!currentTarget.contains(relatedTarget)) {
            setDragOverColumn(null);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent, columnId: string) => {
        e.preventDefault();
        const ticketId = e.dataTransfer.getData('text/plain');

        if (ticketId && onStatusChange) {
            const ticket = tickets.find(t => t.id === ticketId);
            if (ticket && ticket.status !== columnId) {
                onStatusChange(ticketId, columnId);
            }
        }

        setDraggedTicketId(null);
        setDragOverColumn(null);
    }, [tickets, onStatusChange]);

    return (
        <div className="flex h-[calc(100vh-280px)] gap-4 overflow-x-auto pb-4">
            {COLUMNS.map(column => {
                const columnTickets = tickets.filter(t => t.status === column.id);
                const Icon = column.icon;
                const isDropTarget = dragOverColumn === column.id && draggedTicketId !== null;
                const draggedTicket = draggedTicketId ? tickets.find(t => t.id === draggedTicketId) : null;
                const isDraggedFromThis = draggedTicket?.status === column.id;

                return (
                    <div
                        key={column.id}
                        className={cn(
                            "min-w-[300px] w-[350px] flex flex-col rounded-xl border bg-card/50 backdrop-blur-sm overflow-hidden transition-all duration-200",
                            column.border,
                            isDropTarget && !isDraggedFromThis && `${column.dropBorder} border-2 ${column.dropBg} shadow-lg scale-[1.01]`,
                        )}
                        onDragOver={(e) => handleDragOver(e, column.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, column.id)}
                    >
                        {/* Column Header */}
                        <div className={`p-3 flex items-center justify-between bg-gradient-to-r ${column.gradient}`}>
                            <div className="flex items-center gap-2">
                                <div className="p-1 rounded-md bg-white/20">
                                    <Icon className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="font-semibold text-sm text-white">{column.label}</h3>
                            </div>
                            <Badge className="bg-white/20 text-white border-0 text-xs px-1.5 h-5 min-w-5 flex items-center justify-center hover:bg-white/30">
                                {columnTickets.length}
                            </Badge>
                        </div>

                        {/* Column Content */}
                        <ScrollArea className="flex-1 p-3">
                            <div className="flex flex-col gap-3">
                                {columnTickets.map(ticket => (
                                    <div
                                        key={ticket.id}
                                        id={`ticket-card-${ticket.id}`}
                                        draggable={!!onStatusChange}
                                        onDragStart={(e) => handleDragStart(e, ticket.id)}
                                        onDragEnd={handleDragEnd}
                                        className={cn(
                                            "transition-all duration-200",
                                            onStatusChange && "cursor-grab active:cursor-grabbing",
                                            draggedTicketId === ticket.id && "opacity-40"
                                        )}
                                    >
                                        {/* Drag handle indicator */}
                                        {onStatusChange && (
                                            <div className="flex items-center gap-1 mb-1 opacity-0 hover:opacity-60 transition-opacity">
                                                <GripVertical className="w-3 h-3 text-muted-foreground" />
                                                <span className="text-[10px] text-muted-foreground">Sürükle</span>
                                            </div>
                                        )}
                                        <TicketCard
                                            ticket={ticket}
                                            users={users}
                                            currentUser={currentUser}
                                            onViewTicket={onViewTicket}
                                            onAssignTicket={onAssignTicket}
                                        />
                                    </div>
                                ))}
                                {columnTickets.length === 0 && (
                                    <div className={cn(
                                        "h-24 border-2 border-dashed rounded-lg flex items-center justify-center text-xs transition-colors",
                                        isDropTarget && !isDraggedFromThis
                                            ? "border-primary/40 bg-primary/5 text-primary/60"
                                            : "border-muted-foreground/15 text-muted-foreground/50"
                                    )}>
                                        {isDropTarget && !isDraggedFromThis
                                            ? "Buraya bırak"
                                            : "Ticket yok"}
                                    </div>
                                )}
                                {/* Drop indicator at bottom of non-empty columns */}
                                {isDropTarget && !isDraggedFromThis && columnTickets.length > 0 && (
                                    <div className="h-12 border-2 border-dashed border-primary/30 rounded-lg flex items-center justify-center text-xs text-primary/50 animate-pulse">
                                        Buraya bırak
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
