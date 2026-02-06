import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Edit2, 
  Trash2,
  Building2,
  FileText
} from "lucide-react";
import { format, isPast } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface ReservationDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: any;
  room?: any;
  onEdit?: (reservation: any) => void;
  onDelete?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  canApprove?: boolean;
  isAdmin?: boolean;
  currentUserId?: string;
}

export function ReservationDetailDialog({
  open,
  onOpenChange,
  reservation,
  room,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  canApprove = false,
  isAdmin = false,
  currentUserId
}: ReservationDetailDialogProps) {
  if (!reservation) return null;

  const startDate = new Date(reservation.startTime);
  const endDate = new Date(reservation.endTime);
  const isPastReservation = isPast(endDate);
  const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60)); // minutes

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Onaylandı
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Reddedildi
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Bekliyor
          </Badge>
        );
    }
  };

  const canEdit = reservation.status === 'pending' || (reservation.status === 'approved' && isAdmin);
  const canDelete = reservation.requestedBy === currentUserId || isAdmin;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>Rezervasyon Detayları</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            {getStatusBadge(reservation.status)}
            {isPastReservation && (
              <Badge variant="outline" className="text-xs">
                Geçmiş Rezervasyon
              </Badge>
            )}
          </div>

          {/* Room Information */}
          {room && (
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2">
                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    {room.name}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span className="truncate">{room.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4 shrink-0" />
                      <span>{room.capacity} kişi kapasiteli</span>
                    </div>
                  </div>
                  {room.description && (
                    <p className="text-sm text-muted-foreground mt-2">{room.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Date and Time Information */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  <span className="text-sm sm:text-base font-medium">
                    {format(startDate, "d MMMM yyyy EEEE", { locale: tr })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <span className="text-sm sm:text-base font-medium">
                      {format(startDate, "HH:mm", { locale: tr })} - {format(endDate, "HH:mm", { locale: tr })}
                    </span>
                    <Badge variant="outline" className="text-xs w-fit">
                      {duration} dakika
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requester Information */}
          {reservation.requester && (
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm sm:text-base">Rezervasyon Sahibi</h3>
                  <div className="flex items-center gap-2 text-sm sm:text-base">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {reservation.requester.firstName} {reservation.requester.lastName}
                    </span>
                    {reservation.requester.department && (
                      <Badge variant="outline" className="text-xs">
                        {reservation.requester.department}
                      </Badge>
                    )}
                  </div>
                  {reservation.requester.email && (
                    <p className="text-sm text-muted-foreground">
                      {reservation.requester.email}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Approver Information */}
          {reservation.status !== 'pending' && reservation.approver && (
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm sm:text-base">
                    {reservation.status === 'approved' ? 'Onaylayan' : 'Reddeden'}
                  </h3>
                  <div className="flex items-center gap-2 text-sm sm:text-base">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {reservation.approver.firstName} {reservation.approver.lastName}
                    </span>
                  </div>
                  {reservation.approvedAt && (
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {format(new Date(reservation.approvedAt), "d MMMM yyyy HH:mm", { locale: tr })}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {reservation.notes && (
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Notlar
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-wrap">
                    {reservation.notes}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
            {/* Approve/Reject buttons for managers */}
            {canApprove && reservation.status === 'pending' && onApprove && onReject && (
              <>
                <Button
                  variant="default"
                  onClick={() => {
                    onApprove(reservation.id);
                    onOpenChange(false);
                  }}
                  className="flex-1 sm:flex-initial"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Onayla
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    onReject(reservation.id);
                    onOpenChange(false);
                  }}
                  className="flex-1 sm:flex-initial"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reddet
                </Button>
              </>
            )}

            {/* Edit button */}
            {canEdit && onEdit && (
              <Button
                variant="outline"
                onClick={() => {
                  onEdit(reservation);
                  onOpenChange(false);
                }}
                className="flex-1 sm:flex-initial"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Düzenle
              </Button>
            )}

            {/* Delete button */}
            {canDelete && onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="flex-1 sm:flex-initial"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Sil
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Rezervasyonu Sil</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bu rezervasyonu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                      {reservation.status === 'approved' && (
                        <span className="block mt-2 text-warning">
                          ⚠️ Onaylanmış bir rezervasyonu siliyorsunuz.
                        </span>
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>İptal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        onDelete(reservation.id);
                        onOpenChange(false);
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Sil
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

