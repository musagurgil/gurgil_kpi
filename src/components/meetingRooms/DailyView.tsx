import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { format, addDays, isToday, isSameDay, setHours, setMinutes, startOfDay } from "date-fns";
import { tr } from "date-fns/locale";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface DailyViewProps {
  rooms: any[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onReserve?: (roomId: string) => void;
}

export function DailyView({ rooms, selectedDate, onDateChange, onReserve }: DailyViewProps) {
  const hours = useMemo(() => Array.from({ length: 14 }, (_, i) => 8 + i), []); // 08:00 - 21:00

  const getReservationsForHour = (room: any, hour: number) => {
    const hourStart = setMinutes(setHours(selectedDate, hour), 0);
    const hourEnd = setMinutes(setHours(selectedDate, hour + 1), 0);
    
    return (room.reservations || []).filter((r: any) => {
      if (r.status === 'rejected') return false;
      const start = new Date(r.startTime);
      const end = new Date(r.endTime);
      return (start < hourEnd && end > hourStart) && isSameDay(start, selectedDate);
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Onaylandı';
      case 'pending':
        return 'Bekliyor';
      default:
        return status;
    }
  };

  const isHourAvailable = (room: any, hour: number) => {
    const reservations = getReservationsForHour(room, hour);
    return reservations.length === 0;
  };

  const goToPreviousDay = () => {
    onDateChange(addDays(selectedDate, -1));
  };

  const goToNextDay = () => {
    onDateChange(addDays(selectedDate, 1));
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className="space-y-4">
      {/* Date Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPreviousDay}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className={cn(isToday(selectedDate) && "bg-primary text-primary-foreground")}
          >
            Bugün
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextDay}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-lg font-semibold">
          {format(selectedDate, "d MMMM yyyy EEEE", { locale: tr })}
        </div>
      </div>

      {/* Daily Grid */}
      <div className="border border-border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[200px_1fr] bg-muted/50 border-b border-border">
          <div className="p-3 text-sm font-medium text-muted-foreground border-r border-border">
            Oda
          </div>
          <div className="p-3 text-sm font-medium text-muted-foreground text-center">
            Saatler
          </div>
        </div>

        {/* Rooms and Hours */}
        <div className="max-h-[600px] overflow-y-auto">
          {rooms.map((room) => (
            <div key={room.id} className="grid grid-cols-[200px_1fr] border-b border-border last:border-b-0">
              {/* Room Info */}
              <div className="p-4 border-r border-border bg-card">
                <div className="font-medium text-foreground mb-1">{room.name}</div>
                <div className="text-xs text-muted-foreground">{room.location}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Kapasite: {room.capacity} kişi
                </div>
                {onReserve && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 w-full"
                    onClick={() => onReserve(room.id)}
                  >
                    Rezerve Et
                  </Button>
                )}
              </div>

              {/* Hours Grid */}
              <div className="flex gap-1 p-2 overflow-x-auto">
                {hours.map((hour) => {
                  const reservations = getReservationsForHour(room, hour);
                  const isAvailable = isHourAvailable(room, hour);
                  
                  return (
                    <div
                      key={hour}
                      className={cn(
                        "relative h-12 min-w-[60px] border border-border rounded text-xs flex flex-col items-center justify-center transition-colors flex-1",
                        isAvailable && "bg-green-50 hover:bg-green-100 cursor-pointer",
                        !isAvailable && "bg-muted/30"
                      )}
                      title={`${hour}:00 - ${hour + 1}:00`}
                    >
                      {reservations.length > 0 ? (
                        <div className="w-full h-full p-1">
                          {reservations.map((reservation: any) => (
                            <Badge
                              key={reservation.id}
                              className={cn(
                                "w-full text-[10px] p-0.5 flex items-center justify-center",
                                getStatusColor(reservation.status)
                              )}
                              title={`${format(new Date(reservation.startTime), "HH:mm")} - ${format(new Date(reservation.endTime), "HH:mm")}`}
                            >
                              {format(new Date(reservation.startTime), "HH:mm")}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">{hour}:00</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

