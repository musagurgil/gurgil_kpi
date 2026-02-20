import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Clock,
  MessageSquare,
  Send,
  ArrowRight,
  CheckCircle,
  XCircle,
  Pause,
  AlertTriangle,
  Trash2,
  Download,
  Ticket,
  Building2,
  User as UserIcon,
  CalendarDays
} from "lucide-react";
import { Ticket as TicketType, TicketComment, TICKET_STATUSES, TICKET_PRIORITIES } from "@/types/ticket";
import { User as UserType } from "@/types/user";
import { cn } from "@/lib/utils";
import { exportTicketDetailToCSV } from "@/lib/export";
import { toast as sonnerToast } from 'sonner';
import { TicketSLA } from "./TicketSLA";

interface TicketDetailsProps {
  ticket: TicketType | null;
  users: UserType[];
  currentUser: UserType;
  onClose: () => void;
  onUpdateTicket: (ticketId: string, updates: Partial<TicketType>) => void;
  onAssignTicket: (ticketId: string, assignedTo: string) => void;
  onAddComment: (ticketId: string, content: string, isInternal?: boolean) => void;
  onDeleteTicket?: (ticketId: string) => void;
  onRefreshTicket?: () => void;
}

export function TicketDetails({
  ticket,
  users,
  currentUser,
  onClose,
  onUpdateTicket,
  onAssignTicket,
  onAddComment,
  onDeleteTicket,
  onRefreshTicket
}: TicketDetailsProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  if (!ticket) return null;

  const createdBy = users.find(u => u.id === ticket.createdBy);
  const assignedUser = ticket.assignedTo ? users.find(u => u.id === ticket.assignedTo) : null;

  const canUserModifyTicket = () => {
    if (currentUser.roles.includes('board_member')) return false;
    // Admin can always modify
    if (currentUser.roles.includes('admin')) return true;
    // Assigned user can modify
    if (ticket.assignedTo === currentUser.id) return true;
    // Creator can modify
    if (ticket.createdBy === currentUser.id) return true;
    // Any user in the target department can modify (matches server-side logic)
    if (currentUser.department === ticket.targetDepartment) return true;
    // Department manager of source department can modify
    if (currentUser.roles.includes('department_manager') &&
      currentUser.department === ticket.sourceDepartment) return true;
    return false;
  };

  const canAssignTicket = () => {
    if (currentUser.roles.includes('board_member')) return false;
    if (currentUser.roles.includes('admin')) return true;
    if (currentUser.roles.includes('department_manager') && currentUser.department === ticket.targetDepartment) return true;
    return false;
  };

  const canDeleteTicket = () => currentUser.roles.includes('admin');

  const handleExportTicket = () => {
    try {
      exportTicketDetailToCSV(ticket);
      sonnerToast.success('✅ Ticket raporu Excel dosyasına aktarıldı!');
    } catch (error: any) {
      sonnerToast.error('❌ Export işlemi başarısız: ' + error.message);
    }
  };

  const handleDeleteClick = () => {
    if (onDeleteTicket) {
      onDeleteTicket(ticket.id);
      onClose();
    }
  };

  const getPriorityBadge = (priority: TicketType['priority']) => {
    switch (priority) {
      case 'low': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'urgent': return 'bg-red-500 text-white border-red-600';
    }
  };

  const getStatusBadge = (status: TicketType['status']) => {
    switch (status) {
      case 'open': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'in_progress': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'resolved': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'closed': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setIsSubmittingComment(true);
    try {
      await onAddComment(ticket.id, newComment.trim());
      setNewComment('');
      setTimeout(() => { if (onRefreshTicket) onRefreshTicket(); }, 100);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    onUpdateTicket(ticket.id, { status: newStatus as TicketType['status'] });
  };

  const handleAssignChange = (assignedTo: string) => {
    if (assignedTo === 'unassigned') {
      onUpdateTicket(ticket.id, { assignedTo: undefined });
    } else {
      onAssignTicket(ticket.id, assignedTo);
    }
  };

  const getAvailableUsers = () => {
    return users.filter(user => user.department === ticket.targetDepartment && user.isActive);
  };

  return (
    <Dialog open={!!ticket} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden w-[95vw] sm:w-full p-0">
        <DialogDescription className="sr-only">Ticket detay bilgileri ve işlem paneli</DialogDescription>

        {/* Gradient Header */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-5 rounded-t-lg">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoLTZWMzRoLTR2LTRoNHYtNmg2djZoNHY0aC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30 rounded-t-lg" />
          <div className="relative">
            <DialogHeader className="text-left space-y-2 pb-0">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-white/80 bg-white/15 px-2 py-0.5 rounded font-semibold">
                      #{ticket.ticketNumber || ticket.id.substring(0, 8)}
                    </span>
                    <span className="text-xs text-white/60">•</span>
                    <span className="text-xs text-white/60">{formatDate(ticket.createdAt)}</span>
                  </div>
                  <DialogTitle className="text-lg text-white font-bold line-clamp-2">{ticket.title}</DialogTitle>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button variant="ghost" size="icon" onClick={handleExportTicket}
                    className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10">
                    <Download className="w-4 h-4" />
                  </Button>
                  {canDeleteTicket() && onDeleteTicket && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-red-300 hover:bg-white/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Ticket'ı Silmek İstediğinize Emin misiniz?</AlertDialogTitle>
                          <AlertDialogDescription>
                            <span className="font-semibold text-foreground">{ticket.title}</span> ticket'ını silmek üzeresiniz.
                            Bu işlem geri alınamaz ve tüm yorumlar da silinecektir.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>İptal</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteClick}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Evet, Sil
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Badge variant="outline" className={cn("text-[10px] h-5 gap-0.5 border-white/20", getPriorityBadge(ticket.priority))}>
                  <AlertTriangle className="w-2.5 h-2.5" />
                  {TICKET_PRIORITIES[ticket.priority]}
                </Badge>
                <Badge variant="outline" className={cn("text-[10px] h-5 gap-0.5 border-white/20", getStatusBadge(ticket.status))}>
                  <Clock className="w-2.5 h-2.5" />
                  {TICKET_STATUSES[ticket.status]}
                </Badge>
              </div>
            </DialogHeader>
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-5 h-[calc(90vh-200px)] overflow-auto">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Açıklama</h3>
              <div className="text-sm text-foreground whitespace-pre-wrap bg-muted/30 p-4 rounded-lg border border-border/30">
                {ticket.description}
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Yorumlar ({ticket.comments?.length || 0})
              </h3>

              <ScrollArea className="h-48 sm:h-56">
                <div className="space-y-2.5 pr-3">
                  {(!ticket.comments || ticket.comments.length === 0) ? (
                    <div className="text-center py-10">
                      <MessageSquare className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">Henüz yorum yapılmamış</p>
                    </div>
                  ) : (
                    ticket.comments.map((comment) => {
                      const author = users.find(u => u.id === comment.authorId);
                      const isOwnComment = comment.authorId === currentUser.id;
                      return (
                        <div key={comment.id} className={cn(
                          "p-3 rounded-xl space-y-1.5",
                          isOwnComment
                            ? "bg-indigo-500/5 border border-indigo-500/10 ml-4"
                            : "bg-muted/40 border border-border/30 mr-4"
                        )}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-5 h-5">
                                <AvatarFallback className={cn("text-[9px] font-semibold",
                                  isOwnComment
                                    ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                                    : "bg-muted text-muted-foreground"
                                )}>
                                  {author ? `${author.firstName.charAt(0)}${author.lastName.charAt(0)}` : 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-xs">{comment.authorName}</span>
                              {comment.isInternal && (
                                <Badge variant="secondary" className="text-[10px] h-4">İç Yorum</Badge>
                              )}
                            </div>
                            <span className="text-[10px] text-muted-foreground">{formatDate(comment.createdAt)}</span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap pl-7">{comment.content}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>

              {/* Add Comment */}
              <div className="flex gap-2 items-end pt-2 border-t border-border/30">
                <Textarea
                  placeholder="Yorum ekleyin..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={2}
                  className="text-sm resize-none bg-muted/30 border-border/50"
                />
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isSubmittingComment}
                  size="sm"
                  className="h-9 px-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* SLA */}
            <TicketSLA ticket={ticket} />

            {/* Info */}
            <div className="rounded-xl border border-border/50 p-3 space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Bilgiler</h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Building2 className="w-3 h-3" />
                    <span>Departman</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="font-medium">{ticket.sourceDepartment}</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <span className="font-medium text-indigo-600 dark:text-indigo-400">{ticket.targetDepartment}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <UserIcon className="w-3 h-3" />
                    <span>Oluşturan</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Avatar className="w-4 h-4">
                      <AvatarFallback className="text-[8px] bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                        {createdBy ? `${createdBy.firstName.charAt(0)}${createdBy.lastName.charAt(0)}` : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {createdBy ? `${createdBy.firstName} ${createdBy.lastName}` : 'Bilinmiyor'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <CalendarDays className="w-3 h-3" />
                    <span>Güncelleme</span>
                  </div>
                  <span className="font-medium">{formatDate(ticket.updatedAt)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {canUserModifyTicket() && (
              <div className="rounded-xl border border-border/50 p-3 space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">İşlemler</h3>
                <div className="space-y-2.5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Durum</label>
                    <Select value={ticket.status} onValueChange={handleStatusChange}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(TICKET_STATUSES).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {canAssignTicket() && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Atanan Kişi</label>
                      <Select value={ticket.assignedTo || 'unassigned'} onValueChange={handleAssignChange}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Atanmamış</SelectItem>
                          {getAvailableUsers().map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.firstName} {user.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}