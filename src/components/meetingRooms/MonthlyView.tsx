import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, startOfWeek, endOfWeek, getDay } from "date-fns";
import { tr } from "date-fns/locale";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface MonthlyViewProps {
  rooms: any[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onReserve?: (roomId: string) => void;
}

export function MonthlyView({ rooms, selectedDate, onDateChange, onReserve }: MonthlyViewProps) {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const calendarDays = useMemo(() => {
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [calendarStart, calendarEnd]);

  const getReservationsForDay = (room: any, day: Date) => {
    return (room.reservations || []).filter((r: any) => {
      if (r.status === 'rejected') return false;
      const start = new Date(r.startTime);
      const end = new Date(r.endTime);
      return isSameDay(start, day) || isSameDay(end, day) || (start <= day && end >= day);
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

  const goToPreviousMonth = () => {
    onDateChange(addMonths(selectedDate, -1));
  };

  const goToNextMonth = () => {
    onDateChange(addMonths(selectedDate, 1));
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
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
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-lg font-semibold">
          {format(selectedDate, "MMMM yyyy", { locale: tr })}
        </div>
      </div>

      {/* Monthly Calendar Grid */}
      <div className="border border-border rounded-lg overflow-hidden">
        {/* Week Days Header */}
        <div className="grid grid-cols-7 bg-muted/50">
          {weekDays.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground border-r border-border last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day) => {
            const isCurrentMonth = isSameMonth(day, selectedDate);
            const isCurrentDay = isToday(day);
            
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "min-h-[100px] border-r border-b border-border p-2",
                  !isCurrentMonth && "bg-muted/20",
                  isCurrentDay && "bg-primary/5"
                )}
              >
                <div className={cn(
                  "text-sm font-medium mb-1",
                  isCurrentDay && "text-primary font-bold",
                  !isCurrentMonth && "text-muted-foreground"
                )}>
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {rooms.map((room) => {
                    const reservations = getReservationsForDay(room, day);
                    if (reservations.length === 0) return null;
                    
                    return (
                      <div key={room.id} className="space-y-0.5">
                        {reservations.slice(0, 2).map((reservation: any) => (
                          <Badge
                            key={reservation.id}
                            className={cn(
                              "w-full text-[10px] p-0.5 flex items-center justify-center truncate",
                              getStatusColor(reservation.status)
                            )}
                            title={`${room.name}: ${format(new Date(reservation.startTime), "HH:mm")} - ${format(new Date(reservation.endTime), "HH:mm")}`}
                          >
                            {room.name.substring(0, 8)} {format(new Date(reservation.startTime), "HH:mm")}
                          </Badge>
                        ))}
                        {reservations.length > 2 && (
                          <div className="text-[10px] text-muted-foreground">
                            +{reservations.length - 2} daha
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
      </div>
    </div>
  );
}

