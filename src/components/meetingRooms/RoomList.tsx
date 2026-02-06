import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Clock, Trash2, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format, setHours, setMinutes, addDays, isSameDay, isWithinInterval, startOfWeek, isToday, addWeeks } from "date-fns";
import { tr } from "date-fns/locale";
import { useMemo, useState } from "react";

interface RoomListProps {
  rooms: any[];
  onReserve: (roomId: string) => void;
  onDelete?: (roomId: string) => void;
  showDelete?: boolean;
}

export function RoomList({ rooms, onReserve, onDelete, showDelete = false }: RoomListProps) {
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date(), { weekStartsOn: 1 }));

  const hours = useMemo(() => Array.from({ length: 12 }, (_, i) => 8 + i), []); // 08:00 - 19:00
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const getRoomDaySegments = (room: any, day: Date) => {
    const dayStart = setMinutes(setHours(day, 8), 0);
    const dayEnd = setMinutes(setHours(day, 19), 0);
    const reservations = (room.reservations || []).filter((r: any) => {
      const start = new Date(r.startTime);
      const end = new Date(r.endTime);
      return isSameDay(start, day) || isSameDay(end, day) || (start < dayEnd && end > dayStart);
    });

    return { dayStart, dayEnd, reservations };
  };

  const getReservationsForHour = (room: any, day: Date, hour: number) => {
    const hourStart = setMinutes(setHours(day, hour), 0);
    const hourEnd = setMinutes(setHours(day, hour + 1), 0);
    
    return (room.reservations || []).filter((r: any) => {
      const start = new Date(r.startTime);
      const end = new Date(r.endTime);
      // Check if reservation overlaps with this hour
      return (start < hourEnd && end > hourStart);
    });
  };

  const getReservationDuration = (reservation: any) => {
    const start = new Date(reservation.startTime);
    const end = new Date(reservation.endTime);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60); // Duration in hours
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#10b981'; // Green
      case 'pending':
        return '#f59e0b'; // Orange
      case 'rejected':
        return '#ef4444'; // Red
      default:
        return '#6b7280'; // Gray
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Onaylandı';
      case 'pending':
        return 'Beklemede';
      case 'rejected':
        return 'Reddedildi';
      default:
        return status;
    }
  };
  const getRoomOccupancy = (room: any) => {
    const now = new Date();
    const upcoming = room.reservations?.filter((r: any) => {
      const start = new Date(r.startTime);
      return start >= now;
    }) || [];
    
    return {
      count: upcoming.length,
      next: upcoming[0] ? new Date(upcoming[0].startTime) : null
    };
  };

  const isRoomAvailable = (room: any) => {
    const now = new Date();
    const active = room.reservations?.find((r: any) => {
      const start = new Date(r.startTime);
      const end = new Date(r.endTime);
      return start <= now && end >= now;
    });
    return !active;
  };

  if (rooms.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Henüz toplantı odası bulunmuyor.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => {
          const occupancy = getRoomOccupancy(room);
          const available = isRoomAvailable(room);

          return (
            <Card
              key={room.id}
              className="shadow-card hover:shadow-elevated transition-smooth cursor-pointer"
              onClick={() => {
                setSelectedRoom(room);
                setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-semibold">{room.name}</CardTitle>
                  <Badge variant={available ? "default" : "secondary"}>
                    {available ? "Müsait" : "Dolu"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{room.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{room.capacity} kişi</span>
                  </div>
                  {occupancy.next && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        Sonraki: {format(occupancy.next, "d MMM HH:mm", { locale: tr })}
                      </span>
                    </div>
                  )}
                  {room.description && (
                    <p className="text-xs pt-1">{room.description}</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-xs text-muted-foreground">
                    {occupancy.count} yaklaşan rezervasyon
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReserve(room.id);
                      }}
                      className="text-xs"
                    >
                      <CalendarIcon className="w-3 h-3 mr-1" />
                      Rezerve Et
                    </Button>
                    {showDelete && onDelete && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="text-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Toplantı Odasını Sil</AlertDialogTitle>
                            <AlertDialogDescription>
                              "{room.name}" toplantı odasını silmek istediğinize emin misiniz? 
                              Bu işlem geri alınamaz.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>İptal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(room.id)}>
                              Sil
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {/* Weekly Calendar Dialog */}
      <Dialog open={!!selectedRoom} onOpenChange={(open) => !open && setSelectedRoom(null)}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedRoom?.name} – Haftalık Takvim
            </DialogTitle>
            <div className="flex items-center justify-between mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
              >
                Bugün
              </Button>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setWeekStart(addWeeks(weekStart, -1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="text-sm font-medium min-w-[200px] text-center">
                  {format(weekDays[0], "d MMM", { locale: tr })} - {format(weekDays[6], "d MMM yyyy", { locale: tr })}
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setWeekStart(addWeeks(weekStart, 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          {selectedRoom && (
            <div className="mt-4">
              {/* Weekly Calendar Grid */}
              <div className="border border-border rounded-lg overflow-hidden">
                {/* Days Header */}
                <div className="grid grid-cols-8 bg-muted/50">
                  <div className="p-3 text-sm font-medium text-muted-foreground border-r border-border">
                    Saat
                  </div>
                  {weekDays.map((day) => (
                    <div 
                      key={day.toISOString()} 
                      className={`p-3 text-center border-r border-border last:border-r-0 ${
                        isToday(day) ? 'bg-primary/10' : ''
                      }`}
                    >
                      <div className="text-sm font-medium text-foreground">
                        {format(day, 'EEE', { locale: tr })}
                      </div>
                      <div className={`text-lg font-bold ${
                        isToday(day) ? 'text-primary' : 'text-muted-foreground'
                      }`}>
                        {format(day, 'd')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Time Slots */}
                <div className="max-h-[500px] overflow-y-auto">
                  {hours.map((hour) => (
                    <div key={hour} className="grid grid-cols-8 border-b border-border last:border-b-0">
                      {/* Time Label */}
                      <div className="p-2 text-sm text-muted-foreground border-r border-border bg-muted/30">
                        {hour.toString().padStart(2, '0')}:00
                      </div>
                      
                      {/* Day Columns */}
                      {weekDays.map((day) => {
                        const reservations = getReservationsForHour(selectedRoom, day, hour);
                        // Only show reservation in its starting hour
                        const startingReservations = reservations.filter((r: any) => {
                          const start = new Date(r.startTime);
                          return start.getHours() === hour;
                        });
                        
                        return (
                          <div
                            key={`${day.toISOString()}-${hour}`}
                            className="min-h-[60px] p-1 border-r border-border last:border-r-0 relative group"
                          >
                            {/* Reservations */}
                            <div className="space-y-1">
                              {startingReservations.map((reservation: any) => {
                                const duration = getReservationDuration(reservation);
                                const height = Math.max(60, duration * 60); // Minimum 60px (1 hour)
                                const color = getStatusColor(reservation.status);
                                const start = new Date(reservation.startTime);
                                const end = new Date(reservation.endTime);
                                
                                return (
                                  <div
                                    key={reservation.id}
                                    className="rounded-md text-white text-xs p-2 cursor-pointer hover:opacity-90 transition-opacity"
                                    style={{
                                      backgroundColor: color,
                                      minHeight: `${height}px`,
                                      height: `${height}px`,
                                      display: 'flex',
                                      flexDirection: 'column',
                                      justifyContent: 'center',
                                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                    }}
                                    title={`${format(start, "HH:mm")} - ${format(end, "HH:mm")} - ${reservation.notes || "Rezervasyon"}`}
                                  >
                                    <div className="font-medium truncate">
                                      {format(start, "HH:mm")} - {format(end, "HH:mm")}
                                    </div>
                                    {reservation.notes && (
                                      <div className="text-xs opacity-90 truncate mt-1">
                                        {reservation.notes}
                                      </div>
                                    )}
                                    <div className="text-xs opacity-75 mt-1">
                                      {getStatusLabel(reservation.status)}
                                    </div>
                                    {reservation.requester && (
                                      <div className="text-xs opacity-75 mt-1">
                                        {reservation.requester.firstName} {reservation.requester.lastName}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="mt-4 flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">Durum:</span>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
                  <span>Onaylandı</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
                  <span>Beklemede</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
                  <span>Reddedildi</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

