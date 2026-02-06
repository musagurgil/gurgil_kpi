import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  User,
  MessageSquare,
  Send,
  Calendar,
  ArrowRight,
  CheckCircle,
  XCircle,
  Pause,
  AlertTriangle,
  Edit,
  Trash2,
  Download
} from "lucide-react";
import { Ticket, TicketComment, TICKET_STATUSES, TICKET_PRIORITIES } from "@/types/ticket";
import { User as UserType } from "@/types/user";
import { cn } from "@/lib/utils";
import { exportTicketDetailToCSV } from "@/lib/export";
import { toast as sonnerToast } from 'sonner';
import { TicketSLA } from "./TicketSLA";

interface TicketDetailsProps {
  ticket: Ticket | null;
  users: UserType[];
  currentUser: UserType;
  onClose: () => void;
  onUpdateTicket: (ticketId: string, updates: Partial<Ticket>) => void;
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
    return currentUser.role === 'admin' || 
           ticket.assignedTo === currentUser.id ||
           ticket.createdBy === currentUser.id ||
           (currentUser.role === 'department_manager' && 
            (currentUser.department === ticket.sourceDepartment || 
             currentUser.department === ticket.targetDepartment));
  };

  const canAssignTicket = () => {
    return currentUser.role === 'admin' ||
           (currentUser.role === 'department_manager' && 
            currentUser.department === ticket.targetDepartment);
  };

  const canDeleteTicket = () => {
    return currentUser.role === 'admin' || ticket.createdBy === currentUser.id;
  };

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

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    setIsSubmittingComment(true);
    try {
      await onAddComment(ticket.id, newComment.trim());
      setNewComment('');
      
      // Wait a brief moment for backend to update
      setTimeout(() => {
      // Refresh ticket data after adding comment
      if (onRefreshTicket) {
        onRefreshTicket();
      }
      }, 100);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    onUpdateTicket(ticket.id, { status: newStatus as Ticket['status'] });
  };

  const handleAssignChange = (assignedTo: string) => {
    if (assignedTo === 'unassigned') {
      onUpdateTicket(ticket.id, { assignedTo: undefined });
    } else {
      onAssignTicket(ticket.id, assignedTo);
    }
  };

  const getAvailableUsers = () => {
    return users.filter(user => 
      user.department === ticket.targetDepartment && user.isActive
    );
  };

  return (
    <Dialog open={!!ticket} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden w-[95vw] sm:w-full">
        <DialogHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="space-y-1 flex-1 min-w-0">
              <DialogTitle className="text-lg sm:text-xl line-clamp-2">{ticket.title}</DialogTitle>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                <span className="font-mono truncate text-primary font-semibold">
                  #{ticket.ticketNumber || ticket.id.substring(0, 8)}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="truncate">Oluşturulma: {formatDate(ticket.createdAt)}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportTicket}
                title="Ticket Raporunu İndir"
              >
                <Download className="w-4 h-4" />
              </Button>
              {canDeleteTicket() && onDeleteTicket && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
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
                      <AlertDialogAction
                        onClick={handleDeleteClick}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Evet, Sil
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Badge variant="outline" className={cn("text-xs", getPriorityColor(ticket.priority))}>
                <AlertTriangle className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">{TICKET_PRIORITIES[ticket.priority]}</span>
                <span className="sm:hidden">{TICKET_PRIORITIES[ticket.priority].charAt(0)}</span>
              </Badge>
              <Badge variant="outline" className={cn("text-xs", getStatusColor(ticket.status))}>
                <Clock className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">{TICKET_STATUSES[ticket.status]}</span>
                <span className="sm:hidden">{TICKET_STATUSES[ticket.status].charAt(0)}</span>
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 h-[calc(90vh-180px)]">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-semibold">Açıklama</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 p-3 rounded-md">
                {ticket.description}
              </p>
            </div>

            {/* Comments */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center">
                <MessageSquare className="w-4 h-4 mr-2" />
                Yorumlar ({ticket.comments?.length || 0})
              </h3>
              
              <ScrollArea className="h-48 sm:h-64 space-y-3">
                {(!ticket.comments || ticket.comments.length === 0) ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Henüz yorum yapılmamış
                  </p>
                ) : (
                  ticket.comments.map((comment) => {
                    const author = users.find(u => u.id === comment.authorId);
                    return (
                      <div key={comment.id} className="space-y-2 p-3 bg-muted/30 rounded-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs">
                                {author ? `${author.firstName.charAt(0)}${author.lastName.charAt(0)}` : 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">{comment.authorName}</span>
                            {comment.isInternal && (
                              <Badge variant="secondary" className="text-xs">İç Yorum</Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    );
                  })
                )}
              </ScrollArea>

              {/* Add Comment */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Yorum ekleyin..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isSubmittingComment}
                    size="sm"
                    className="bg-gradient-primary text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSubmittingComment ? 'Gönderiliyor...' : 'Yorum Ekle'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* SLA Status */}
            <TicketSLA ticket={ticket} />

            {/* Ticket Info */}
            <div className="space-y-4">
              <h3 className="font-semibold">Ticket Bilgileri</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Kaynak Departman:</span>
                  <span className="font-medium">{ticket.sourceDepartment}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Hedef Departman:</span>
                  <span className="font-medium">{ticket.targetDepartment}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Oluşturan:</span>
                  <div className="flex items-center space-x-1">
                    <Avatar className="w-5 h-5">
                      <AvatarFallback className="text-xs">
                        {createdBy ? `${createdBy.firstName.charAt(0)}${createdBy.lastName.charAt(0)}` : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {createdBy ? `${createdBy.firstName} ${createdBy.lastName}` : 'Bilinmiyor'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Son Güncelleme:</span>
                  <span className="font-medium">{formatDate(ticket.updatedAt)}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            {canUserModifyTicket() && (
              <div className="space-y-4">
                <h3 className="font-semibold">İşlemler</h3>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Durum</label>
                    <Select value={ticket.status} onValueChange={handleStatusChange}>
                      <SelectTrigger>
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
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Atanan Kişi</label>
                      <Select 
                        value={ticket.assignedTo || 'unassigned'} 
                        onValueChange={handleAssignChange}
                      >
                        <SelectTrigger>
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