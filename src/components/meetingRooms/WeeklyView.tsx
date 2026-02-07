import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Clock, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format, setHours, setMinutes, addDays, isSameDay, startOfWeek, isToday, addWeeks } from "date-fns";
import { tr } from "date-fns/locale";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { MeetingRoom, MeetingReservation } from "@/types/meeting";

interface WeeklyViewProps {
  rooms: MeetingRoom[];
  onReserve?: (roomId: string) => void;
  onDelete?: (roomId: string) => void;
  showDelete?: boolean;
}

export function WeeklyView({ rooms, onReserve, onDelete, showDelete = false }: WeeklyViewProps) {
  const [selectedRoom, setSelectedRoom] = useState<MeetingRoom | null>(null);
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date(), { weekStartsOn: 1 }));

  const hours = useMemo(() => Array.from({ length: 12 }, (_, i) => 8 + i), []); // 08:00 - 19:00
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const getReservationsForHour = (room: MeetingRoom, day: Date, hour: number) => {
    const hourStart = setMinutes(setHours(day, hour), 0);
    const hourEnd = setMinutes(setHours(day, hour + 1), 0);

    return (room.reservations || []).filter((r) => {
      if (r.status === 'rejected') return false;
      const start = new Date(r.startTime);
      const end = new Date(r.endTime);
      return (start < hourEnd && end > hourStart);
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getRoomOccupancy = (room: MeetingRoom) => {
    const now = new Date();
    const upcoming = room.reservations?.filter((r) => {
      if (r.status === 'rejected') return false;
      const start = new Date(r.startTime);
      return start >= now;
    }) || [];

    return {
      count: upcoming.length,
      next: upcoming[0] ? new Date(upcoming[0].startTime) : null
    };
  };

  const isRoomAvailable = (room: MeetingRoom) => {
    const now = new Date();
    const active = room.reservations?.find((r) => {
      if (r.status !== 'approved') return false;
      const start = new Date(r.startTime);
      const end = new Date(r.endTime);
      return start <= now && end >= now;
    });
    return !active;
  };

  const goToPreviousWeek = () => {
    setWeekStart(addWeeks(weekStart, -1));
  };

  const goToNextWeek = () => {
    setWeekStart(addWeeks(weekStart, 1));
  };

  const goToToday = () => {
    setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
          >
            Bugün
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextWeek}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-lg font-semibold">
          {format(weekDays[0], "d MMM", { locale: tr })} - {format(weekDays[6], "d MMM yyyy", { locale: tr })}
        </div>
      </div>

      {/* Room Cards */}
      <div className="grid grid-cols-1 gap-4">
        {rooms.map((room) => {
          const occupancy = getRoomOccupancy(room);
          const available = isRoomAvailable(room);

          return (
            <Card key={room.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.01]">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {room.name}
                      {available ? (
                        <Badge className="bg-green-500">Müsait</Badge>
                      ) : (
                        <Badge variant="destructive">Dolu</Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{room.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{room.capacity} kişi</span>
                      </div>
                      {occupancy.next && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Sonraki: {format(occupancy.next, "d MMM HH:mm", { locale: tr })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {onReserve && (
                      <Button
                        size="sm"
                        onClick={() => onReserve?.(room.id)}
                      >
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        Rezerve Et
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedRoom(room)}
                    >
                      Detaylar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {occupancy.count > 0 && (
                  <div className="mb-3 text-sm text-muted-foreground">
                    {occupancy.count} yaklaşan rezervasyon
                  </div>
                )}

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
                        className={cn(
                          "p-3 text-center border-r border-border last:border-r-0",
                          isToday(day) && "bg-primary/10"
                        )}
                      >
                        <div className="text-sm font-medium text-foreground">
                          {format(day, 'EEE', { locale: tr })}
                        </div>
                        <div className={cn(
                          "text-lg font-bold",
                          isToday(day) ? "text-primary" : "text-muted-foreground"
                        )}>
                          {format(day, 'd')}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Time Slots */}
                  <div className="max-h-[400px] overflow-y-auto">
                    {hours.map((hour) => (
                      <div key={hour} className="grid grid-cols-8 border-b border-border last:border-b-0">
                        <div className="p-2 text-sm text-muted-foreground border-r border-border flex items-center justify-center">
                          {hour}:00
                        </div>
                        {weekDays.map((day) => {
                          const reservations = getReservationsForHour(room, day, hour);

                          return (
                            <div
                              key={day.toISOString()}
                              className="p-1 border-r border-border last:border-r-0 min-h-[60px] relative"
                            >
                              {reservations.map((reservation) => {
                                const start = new Date(reservation.startTime);
                                const end = new Date(reservation.endTime);
                                const startHour = start.getHours();
                                const startMinute = start.getMinutes();
                                const duration = (end.getTime() - start.getTime()) / (1000 * 60);
                                const topOffset = startMinute;
                                const height = duration;

                                return (
                                  <div
                                    key={reservation.id}
                                    className="absolute left-1 right-1 rounded text-[10px] p-1 text-white overflow-hidden"
                                    style={{
                                      backgroundColor: getStatusColor(reservation.status),
                                      top: `${(topOffset / 60) * 60}px`,
                                      height: `${Math.max(height / 60 * 60, 20)}px`,
                                      zIndex: 10
                                    }}
                                    title={`${format(start, "HH:mm")} - ${format(end, "HH:mm")}`}
                                  >
                                    <div className="font-medium truncate">
                                      {format(start, "HH:mm")}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Room Detail Dialog */}
      {selectedRoom && (
        <Dialog open={!!selectedRoom} onOpenChange={(open) => !open && setSelectedRoom(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedRoom.name}</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-4">{selectedRoom.description}</p>
              {/* Weekly calendar grid for selected room */}
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="grid grid-cols-8 bg-muted/50">
                  <div className="p-3 text-sm font-medium text-muted-foreground border-r border-border">
                    Saat
                  </div>
                  {weekDays.map((day) => (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        "p-3 text-center border-r border-border last:border-r-0",
                        isToday(day) && "bg-primary/10"
                      )}
                    >
                      <div className="text-sm font-medium text-foreground">
                        {format(day, 'EEE', { locale: tr })}
                      </div>
                      <div className={cn(
                        "text-lg font-bold",
                        isToday(day) ? "text-primary" : "text-muted-foreground"
                      )}>
                        {format(day, 'd')}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="max-h-[500px] overflow-y-auto">
                  {hours.map((hour) => (
                    <div key={hour} className="grid grid-cols-8 border-b border-border last:border-b-0">
                      <div className="p-2 text-sm text-muted-foreground border-r border-border flex items-center justify-center">
                        {hour}:00
                      </div>
                      {weekDays.map((day) => {
                        const reservations = getReservationsForHour(selectedRoom, day, hour);

                        return (
                          <div
                            key={day.toISOString()}
                            className="p-1 border-r border-border last:border-r-0 min-h-[60px] relative"
                          >
                            {reservations.map((reservation) => {
                              const start = new Date(reservation.startTime);
                              const end = new Date(reservation.endTime);
                              const startHour = start.getHours();
                              const startMinute = start.getMinutes();
                              const duration = (end.getTime() - start.getTime()) / (1000 * 60);
                              const topOffset = startMinute;
                              const height = duration;

                              return (
                                <div
                                  key={reservation.id}
                                  className="absolute left-1 right-1 rounded text-[10px] p-1 text-white overflow-hidden"
                                  style={{
                                    backgroundColor: getStatusColor(reservation.status),
                                    top: `${(topOffset / 60) * 60}px`,
                                    height: `${Math.max(height / 60 * 60, 20)}px`,
                                    zIndex: 10
                                  }}
                                  title={`${format(start, "HH:mm")} - ${format(end, "HH:mm")}`}
                                >
                                  <div className="font-medium truncate">
                                    {format(start, "HH:mm")}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

