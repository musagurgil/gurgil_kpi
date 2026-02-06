import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Users, Calendar as CalendarIcon, Clock, CheckCircle2, XCircle } from "lucide-react";
import { format, setHours, setMinutes, isSameDay, isWithinInterval, startOfWeek, addDays, isToday } from "date-fns";
import { tr } from "date-fns/locale";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface RoomDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: any;
  reservations: any[];
  onReserve: (roomId: string) => void;
  onEdit?: (reservation: any) => void;
  onDelete?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  canApprove?: boolean;
  isAdmin?: boolean;
  currentUserId?: string;
}

export function RoomDetailDialog({
  open,
  onOpenChange,
  room,
  reservations,
  onReserve,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  canApprove = false,
  isAdmin = false,
  currentUserId
}: RoomDetailDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'day'>('day');

  // Get reservations for selected date
  const dayReservations = useMemo(() => {
    return reservations.filter(r => {
      if (r.status === 'rejected') return false;
      const start = new Date(r.startTime);
      return isSameDay(start, selectedDate);
    });
  }, [reservations, selectedDate]);

  // Generate hours (08:00 - 21:00)
  const hours = useMemo(() => Array.from({ length: 14 }, (_, i) => 8 + i), []);

  // Check if hour is available
  const isHourAvailable = (hour: number) => {
    const hourStart = setMinutes(setHours(selectedDate, hour), 0);
    const hourEnd = setMinutes(setHours(selectedDate, hour + 1), 0);
    
    const hasOverlap = dayReservations.some(r => {
      const start = new Date(r.startTime);
      const end = new Date(r.endTime);
      return (start < hourEnd && end > hourStart);
    });
    
    return !hasOverlap;
  };

  // Get reservations for a specific hour
  const getReservationsForHour = (hour: number) => {
    const hourStart = setMinutes(setHours(selectedDate, hour), 0);
    const hourEnd = setMinutes(setHours(selectedDate, hour + 1), 0);
    
    return dayReservations.filter(r => {
      const start = new Date(r.startTime);
      const end = new Date(r.endTime);
      return (start < hourEnd && end > hourStart);
    });
  };

  // Week view - get week days
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [selectedDate]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Onaylandı</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Reddedildi</Badge>;
      case 'pending':
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Bekliyor</Badge>;
    }
  };

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  if (!room) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl truncate">{room.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Room Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-5 h-5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Konum</p>
                <p className="font-medium text-sm sm:text-base truncate">{room.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <Users className="w-5 h-5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Kapasite</p>
                <p className="font-medium text-sm sm:text-base">{room.capacity} kişi</p>
              </div>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <CalendarIcon className="w-5 h-5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Toplam Rezervasyon</p>
                <p className="font-medium text-sm sm:text-base">{reservations.filter(r => r.status !== 'rejected').length}</p>
              </div>
            </div>
          </div>

          {room.description && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">{room.description}</p>
            </div>
          )}

          {/* Calendar View Toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant={viewMode === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('day')}
                className="flex-1 sm:flex-initial"
              >
                Günlük
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('week')}
                className="flex-1 sm:flex-initial"
              >
                Haftalık
              </Button>
            </div>
            <Button 
              variant="default" 
              onClick={() => onReserve(room.id)}
              className="w-full sm:w-auto shrink-0"
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Rezervasyon Oluştur</span>
              <span className="sm:hidden">Rezervasyon</span>
            </Button>
          </div>

          {/* Calendar */}
          <Card>
            <CardContent className="p-4">
              {/* Day View */}
              {viewMode === 'day' && (
                <div className="space-y-4">
                  {/* Date Navigation */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handlePrevDay}
                      className="w-full sm:w-auto order-2 sm:order-1"
                    >
                      ← Önceki
                    </Button>
                    <div className="flex items-center justify-center gap-2 order-1 sm:order-2">
                      <Button variant="outline" size="sm" onClick={handleToday} className="shrink-0">
                        Bugün
                      </Button>
                      <h3 className="font-semibold text-sm sm:text-lg text-center truncate">
                        {format(selectedDate, "d MMMM yyyy EEEE", { locale: tr })}
                      </h3>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleNextDay}
                      className="w-full sm:w-auto order-3"
                    >
                      Sonraki →
                    </Button>
                  </div>

                  {/* Hours Grid */}
                  <div className="space-y-2">
                    {hours.map((hour) => {
                      const available = isHourAvailable(hour);
                      const hourReservations = getReservationsForHour(hour);
                      
                      return (
                        <div
                          key={hour}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                            available && "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800",
                            !available && "bg-muted/50"
                          )}
                        >
                          <div className="w-20 text-sm font-medium">
                            {hour.toString().padStart(2, '0')}:00 - {(hour + 1).toString().padStart(2, '0')}:00
                          </div>
                          <div className="flex-1">
                            {available ? (
                              <Badge className="bg-green-500">Müsait</Badge>
                            ) : (
                              <div className="space-y-1">
                                {hourReservations.map((reservation) => (
                                  <div
                                    key={reservation.id}
                                    className="flex items-center gap-2 text-sm"
                                  >
                                    {getStatusBadge(reservation.status)}
                                    <span>
                                      {format(new Date(reservation.startTime), "HH:mm", { locale: tr })} -{' '}
                                      {format(new Date(reservation.endTime), "HH:mm", { locale: tr })}
                                    </span>
                                    <span className="text-muted-foreground">
                                      {reservation.requester?.firstName} {reservation.requester?.lastName}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Week View */}
              {viewMode === 'week' && (
                <div className="space-y-4">
                  {/* Week Navigation */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newDate = new Date(selectedDate);
                        newDate.setDate(newDate.getDate() - 7);
                        setSelectedDate(newDate);
                      }}
                      className="w-full sm:w-auto order-2 sm:order-1"
                    >
                      ← Önceki Hafta
                    </Button>
                    <div className="flex items-center justify-center gap-2 order-1 sm:order-2">
                      <Button variant="outline" size="sm" onClick={handleToday} className="shrink-0">
                        Bugün
                      </Button>
                      <h3 className="font-semibold text-sm sm:text-base text-center truncate">
                        {format(weekDays[0], "d MMM", { locale: tr })} - {format(weekDays[6], "d MMM yyyy", { locale: tr })}
                      </h3>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newDate = new Date(selectedDate);
                        newDate.setDate(newDate.getDate() + 7);
                        setSelectedDate(newDate);
                      }}
                      className="w-full sm:w-auto order-3"
                    >
                      Sonraki Hafta →
                    </Button>
                  </div>

                  {/* Week Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {weekDays.map((day) => {
                      const dayReservations = reservations.filter(r => {
                        if (r.status === 'rejected') return false;
                        return isSameDay(new Date(r.startTime), day);
                      });

                      return (
                        <div
                          key={day.toISOString()}
                          className={cn(
                            "p-2 border rounded-lg min-h-[120px] sm:min-h-[150px] lg:min-h-[200px]",
                            isToday(day) && "ring-2 ring-primary"
                          )}
                        >
                          <div className="text-xs sm:text-sm font-medium mb-2">
                            {format(day, "EEE d", { locale: tr })}
                          </div>
                          <div className="space-y-1">
                            {dayReservations.map((reservation) => (
                              <div
                                key={reservation.id}
                                className="text-xs p-1 bg-blue-100 dark:bg-blue-900 rounded"
                              >
                                <div className="font-medium">
                                  {format(new Date(reservation.startTime), "HH:mm", { locale: tr })}
                                </div>
                                <div className="text-muted-foreground truncate">
                                  {reservation.requester?.firstName}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reservations List */}
          <div>
            <h3 className="font-semibold mb-3 text-base sm:text-lg">Rezervasyonlar</h3>
            <div className="space-y-2">
              {reservations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Henüz rezervasyon bulunmuyor.
                </p>
              ) : (
                reservations
                  .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                  .map((reservation) => (
                    <div
                      key={reservation.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 border rounded-lg"
                    >
                      <div className="flex-1 min-w-0 w-full sm:w-auto">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {getStatusBadge(reservation.status)}
                          <span className="text-sm font-medium whitespace-nowrap">
                            {format(new Date(reservation.startTime), "d MMM yyyy", { locale: tr })}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                          <span className="whitespace-nowrap">
                            {format(new Date(reservation.startTime), "HH:mm", { locale: tr })} -{' '}
                            {format(new Date(reservation.endTime), "HH:mm", { locale: tr })}
                          </span>
                          <span className="truncate">
                            {reservation.requester?.firstName} {reservation.requester?.lastName}
                          </span>
                        </div>
                        {reservation.notes && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{reservation.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto shrink-0">
                        {canApprove && reservation.status === 'pending' && onApprove && onReject && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => onApprove(reservation.id)}
                              className="flex-1 sm:flex-initial text-xs"
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Onayla
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => onReject(reservation.id)}
                              className="flex-1 sm:flex-initial text-xs"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Reddet
                            </Button>
                          </>
                        )}
                        {(reservation.requestedBy === currentUserId || isAdmin) && onEdit && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEdit(reservation)}
                            className="flex-1 sm:flex-initial text-xs"
                          >
                            Düzenle
                          </Button>
                        )}
                        {(reservation.requestedBy === currentUserId || isAdmin) && onDelete && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onDelete(reservation.id)}
                            className="flex-1 sm:flex-initial text-xs"
                          >
                            Sil
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

