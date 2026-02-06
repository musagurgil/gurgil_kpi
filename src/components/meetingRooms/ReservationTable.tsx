import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, XCircle, Clock, MapPin, User, Edit2, Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ReservationCard } from "./ReservationCard";

interface ReservationTableProps {
  reservations: any[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onEdit?: (reservation: any) => void;
  onDelete?: (id: string) => void;
}

export function ReservationTable({
  reservations,
  onApprove,
  onReject,
  onEdit,
  onDelete
}: ReservationTableProps) {
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

  if (reservations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Henüz rezervasyon bulunmuyor
              </h3>
              <p className="text-sm text-muted-foreground">
                İlk rezervasyonunuzu oluşturmak için "Rezervasyon Oluştur" butonuna tıklayın.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rezervasyonlar</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mobile Card View */}
        <div className="block md:hidden space-y-4">
          {reservations.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              onApprove={onApprove}
              onReject={onReject}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Oda</TableHead>
              <TableHead>Talep Eden</TableHead>
              <TableHead>Tarih/Saat</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Notlar</TableHead>
              <TableHead>İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.map((reservation) => (
              <TableRow key={reservation.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{reservation.room?.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {reservation.room?.location}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm">
                        {reservation.requester?.firstName} {reservation.requester?.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {reservation.requester?.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {format(new Date(reservation.startTime), "d MMM yyyy", { locale: tr })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(reservation.startTime), "HH:mm", { locale: tr })} -{" "}
                    {format(new Date(reservation.endTime), "HH:mm", { locale: tr })}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                <TableCell>
                  <div className="max-w-xs">
                    <p className="text-sm text-muted-foreground truncate">
                      {reservation.notes || "-"}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Approve/Reject buttons for managers */}
                    {canApprove && reservation.status === 'pending' && onApprove && onReject && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => onApprove(reservation.id)}
                          className="text-xs"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Onayla
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onReject(reservation.id)}
                          className="text-xs"
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Reddet
                        </Button>
                      </>
                    )}
                    
                    {/* Edit/Delete buttons for requester or admin */}
                    {(reservation.requestedBy === user?.id || isAdmin) && (
                      <>
                        {/* Edit button - only for pending or if admin */}
                        {(reservation.status === 'pending' || (reservation.status === 'approved' && isAdmin)) && onEdit && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEdit(reservation)}
                            className="text-xs"
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
                                className="text-xs"
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
                    
                    {/* Approver info */}
                    {reservation.status !== 'pending' && reservation.approver && canApprove && (
                      <div className="text-xs text-muted-foreground">
                        {reservation.approver?.firstName} {reservation.approver?.lastName}
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </CardContent>
    </Card>
  );
}

