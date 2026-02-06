import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock, MapPin, User, Edit2, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface ReservationCardProps {
  reservation: any;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onEdit?: (reservation: any) => void;
  onDelete?: (id: string) => void;
}

export function ReservationCard({
  reservation,
  onApprove,
  onReject,
  onEdit,
  onDelete
}: ReservationCardProps) {
  const { hasPermission, user } = useAuth();
  const canApprove = hasPermission('department_manager');
  const isAdmin = hasPermission('admin');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="default" className="bg-green-500">
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

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.01]">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold text-lg">{reservation.room?.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{reservation.room?.location}</p>
            </div>
            {getStatusBadge(reservation.status)}
          </div>

          {/* Date and Time */}
          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">
              {format(new Date(reservation.startTime), "d MMM yyyy", { locale: tr })}
            </span>
            <span className="text-muted-foreground">
              {format(new Date(reservation.startTime), "HH:mm", { locale: tr })} -{" "}
              {format(new Date(reservation.endTime), "HH:mm", { locale: tr })}
            </span>
          </div>

          {/* Requester */}
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-muted-foreground" />
            <div>
              <span className="font-medium">
                {reservation.requester?.firstName} {reservation.requester?.lastName}
              </span>
              <span className="text-muted-foreground ml-2">
                {reservation.requester?.email}
              </span>
            </div>
          </div>

          {/* Notes */}
          {reservation.notes && (
            <div className="text-sm">
              <p className="text-muted-foreground line-clamp-2">{reservation.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
            {/* Approve/Reject buttons for managers */}
            {canApprove && reservation.status === 'pending' && onApprove && onReject && (
              <>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => onApprove(reservation.id)}
                  className="flex-1 sm:flex-none"
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Onayla
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onReject(reservation.id)}
                  className="flex-1 sm:flex-none"
                >
                  <XCircle className="w-3 h-3 mr-1" />
                  Reddet
                </Button>
              </>
            )}
            
            {/* Edit/Delete buttons for requester or admin */}
            {(reservation.requestedBy === user?.id || isAdmin) && (
              <>
                {/* Edit button */}
                {(reservation.status === 'pending' || (reservation.status === 'approved' && isAdmin)) && onEdit && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(reservation)}
                    className="flex-1 sm:flex-none"
                  >
                    <Edit2 className="w-3 h-3 mr-1" />
                    Düzenle
                  </Button>
                )}
                
                {/* Delete button */}
                {onDelete && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1 sm:flex-none"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
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
                          onClick={() => onDelete(reservation.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Sil
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

