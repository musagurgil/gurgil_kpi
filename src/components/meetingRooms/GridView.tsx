import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Clock, Calendar as CalendarIcon } from "lucide-react";
import { format, isToday, isSameDay, isWithinInterval } from "date-fns";
import { tr } from "date-fns/locale";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface GridViewProps {
  rooms: any[];
  selectedDate?: Date;
  selectedTime?: { start: number; end: number };
  onReserve?: (roomId: string) => void;
  onDelete?: (roomId: string) => void;
  showDelete?: boolean;
}

export function GridView({ 
  rooms, 
  selectedDate, 
  selectedTime,
  onReserve, 
  onDelete,
  showDelete = false 
}: GridViewProps) {
  const today = new Date();
  const checkDate = selectedDate || today;

  const getRoomStatus = (room: any) => {
    const upcomingReservations = (room.reservations || []).filter((r: any) => {
      if (r.status === 'rejected') return false;
      const start = new Date(r.startTime);
      return start >= today && isSameDay(start, checkDate);
    });

    // Check if room is available at selected time
    if (selectedTime) {
      const hourStart = new Date(checkDate);
      hourStart.setHours(selectedTime.start, 0, 0, 0);
      const hourEnd = new Date(checkDate);
      hourEnd.setHours(selectedTime.end, 0, 0, 0);

      const hasConflict = (room.reservations || []).some((r: any) => {
        if (r.status === 'rejected') return false;
        const resStart = new Date(r.startTime);
        const resEnd = new Date(r.endTime);
        return (
          isSameDay(resStart, checkDate) &&
          (resStart < hourEnd && resEnd > hourStart)
        );
      });

      return {
        available: !hasConflict,
        upcomingCount: upcomingReservations.length,
        nextReservation: upcomingReservations[0] || null
      };
    }

    return {
      available: true,
      upcomingCount: upcomingReservations.length,
      nextReservation: upcomingReservations[0] || null
    };
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {rooms.map((room) => {
        const status = getRoomStatus(room);
        
        return (
          <Card 
            key={room.id} 
            className={cn(
              "transition-all duration-200 hover:shadow-lg hover:scale-[1.02]",
              selectedTime && status.available && "ring-2 ring-green-500 ring-offset-2"
            )}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{room.name}</CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{room.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{room.capacity} kişi</span>
                    </div>
                  </div>
                </div>
                {selectedTime && status.available && (
                  <Badge className="bg-green-500">Müsait</Badge>
                )}
                {selectedTime && !status.available && (
                  <Badge variant="destructive">Dolu</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {room.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {room.description}
                  </p>
                )}

                {status.nextReservation && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Sonraki: {format(new Date(status.nextReservation.startTime), "d MMM HH:mm", { locale: tr })}
                    </span>
                  </div>
                )}

                {status.upcomingCount > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {status.upcomingCount} yaklaşan rezervasyon
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {onReserve && (
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => onReserve(room.id)}
                      disabled={selectedTime && !status.available}
                    >
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Rezerve Et
                    </Button>
                  )}
                  {showDelete && onDelete && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete(room.id)}
                    >
                      Sil
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

