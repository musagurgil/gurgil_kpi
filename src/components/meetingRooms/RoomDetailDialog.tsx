import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Users, Calendar as CalendarIcon, Clock, CheckCircle2, XCircle, Building2, ChevronRight } from "lucide-react";
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

  const upcomingReservations = useMemo(() => {
    const now = new Date();
    return reservations
      .filter(r => new Date(r.startTime) > now && r.status === 'approved')
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 5);
  }, [reservations]);

  if (!room) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl truncate flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            {room.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Room Info Banner */}
          <div className="bg-muted/30 p-4 rounded-lg border flex flex-wrap gap-4 justify-between items-center">
            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{room.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>{room.capacity} Kişi</span>
              </div>
              {room.responsible && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                  <span>Sorumlu: {room.responsible.firstName} {room.responsible.lastName}</span>
                </div>
              )}
            </div>
            <Button onClick={() => onReserve(room.id)}>
              <CalendarIcon className="w-4 h-4 mr-2" />
              Rezervasyon Yap
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel: Calendar */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Günlük Program
                </h3>
                <div className="flex bg-muted p-1 rounded-md">
                  <Button
                    variant={viewMode === 'day' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('day')}
                    className="h-7 text-xs"
                  >
                    Gün
                  </Button>
                  <Button
                    variant={viewMode === 'week' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('week')}
                    className="h-7 text-xs"
                  >
                    Hafta
                  </Button>
                </div>
              </div>

              <Card className="border-2 shadow-none">
                <CardContent className="p-0">
                  {/* Calendar Layout */}
                  {viewMode === 'day' && (
                    <div className="divide-y">
                      {/* Navigation */}
                      <div className="flex items-center justify-between p-3 bg-muted/20">
                        <Button variant="ghost" size="icon" onClick={handlePrevDay}>
                          <ChevronRight className="w-4 h-4 rotate-180" />
                        </Button>
                        <span className="font-medium text-sm sm:text-base">
                          {format(selectedDate, "d MMMM yyyy, EEEE", { locale: tr })}
                        </span>
                        <Button variant="ghost" size="icon" onClick={handleNextDay}>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Hours List - Timeline Style */}
                      <div className="max-h-[500px] overflow-y-auto">
                        {hours.map((hour) => {
                          const available = isHourAvailable(hour);
                          const hourReservations = getReservationsForHour(hour);
                          return (
                            <div key={hour} className="flex group min-h-[60px]">
                              {/* Time Column */}
                              <div className="w-16 p-3 text-xs text-muted-foreground border-r bg-muted/10 shrink-0 text-center font-medium">
                                {hour.toString().padStart(2, '0')}:00
                              </div>
                              {/* Content Column */}
                              <div className={cn(
                                "flex-1 p-2 flex flex-col justify-center transition-colors",
                                available ? "group-hover:bg-green-50/50" : "bg-red-50/50 dark:bg-red-950/20"
                              )}>
                                {available ? (
                                  <span className="text-xs text-muted-foreground/50 ml-2">Müsait</span>
                                ) : (
                                  <div className="space-y-1">
                                    {hourReservations.map(res => (
                                      <div key={res.id} className="flex items-center gap-2 bg-background/80 border p-1.5 rounded-md shadow-sm">
                                        <Badge variant="outline" className={cn(
                                          "text-[10px] h-5 px-1.5",
                                          res.status === 'approved' ? "bg-green-100 text-green-700 border-green-200" : "bg-yellow-100 text-yellow-700 border-yellow-200"
                                        )}>
                                          {res.status === 'approved' ? 'Dolu' : 'Bekliyor'}
                                        </Badge>
                                        <span className="text-xs font-medium truncate">
                                          {res.requester?.firstName} {res.requester?.lastName}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground ml-auto">
                                          {format(new Date(res.startTime), "HH:mm")} - {format(new Date(res.endTime), "HH:mm")}
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

                  {viewMode === 'week' && (
                    <div className="p-4">
                      {/* Simplified Week Grid reused from existing logic but cleaner */}
                      <div className="flex items-center justify-between mb-4">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedDate(d => addDays(d, -7))}>← Önceki</Button>
                        <span className="font-medium">
                          {format(weekDays[0], "d MMM", { locale: tr })} - {format(weekDays[6], "d MMM", { locale: tr })}
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedDate(d => addDays(d, 7))}>Sonraki →</Button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                        {weekDays.map(day => {
                          const dayReservations = reservations
                            .filter(r => isSameDay(new Date(r.startTime), day) && r.status !== 'rejected')
                            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

                          return (
                            <div
                              key={day.toString()}
                              className={cn(
                                "p-2 rounded border text-xs min-h-[150px] flex flex-col cursor-pointer hover:border-primary transition-colors",
                                isToday(day) && "border-primary bg-primary/5"
                              )}
                              onClick={() => {
                                setSelectedDate(day);
                                setViewMode('day');
                              }}
                            >
                              <div className="font-medium mb-2 text-center pb-2 border-b">
                                {format(day, "EEE d", { locale: tr })}
                              </div>
                              <div className="space-y-1 flex-1 overflow-y-auto custom-scrollbar">
                                {dayReservations.length === 0 ? (
                                  <div className="text-center text-muted-foreground/50 text-[10px] mt-4">Boş</div>
                                ) : (
                                  dayReservations.map(r => (
                                    <div
                                      key={r.id}
                                      className={cn(
                                        "p-1 rounded text-[10px] truncate border",
                                        r.status === 'approved'
                                          ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
                                          : "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800"
                                      )}
                                      title={`${format(new Date(r.startTime), "HH:mm")} - ${format(new Date(r.endTime), "HH:mm")} (${r.requester?.firstName})`}
                                    >
                                      <span className="font-semibold">{format(new Date(r.startTime), "HH:mm")}</span>
                                      <span className="ml-1 opacity-75">{r.requester?.firstName}</span>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Panel: Upcoming */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                Yaklaşan
              </h3>
              <Card className="h-full max-h-[600px] flex flex-col">
                <CardContent className="p-0 flex-1 overflow-y-auto">
                  {upcomingReservations.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground text-sm">
                      Yaklaşan onaylı rezervasyon yok.
                    </div>
                  ) : (
                    <div className="divide-y">
                      {upcomingReservations.map(res => (
                        <div
                          key={res.id}
                          className="p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedDate(new Date(res.startTime));
                            setViewMode('day');
                          }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm text-primary">
                              {format(new Date(res.startTime), "d MMMM", { locale: tr })}
                            </span>
                            <Badge variant="outline" className="text-[10px] whitespace-nowrap">
                              {format(new Date(res.startTime), "HH:mm")} - {format(new Date(res.endTime), "HH:mm")}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Users className="w-3 h-3" />
                            <span>{res.requester?.firstName} {res.requester?.lastName}</span>
                          </div>
                          {((res.requestedBy === currentUserId || isAdmin) || (canApprove && res.status === 'pending')) && (
                            <div className="flex gap-2 mt-2">
                              {canApprove && res.status === 'pending' && onApprove && (
                                <Button size="sm" className="h-6 text-[10px] w-full" onClick={() => onApprove(res.id)}>Onayla</Button>
                              )}
                              {(res.requestedBy === currentUserId || isAdmin) && onDelete && (
                                <Button size="sm" variant="ghost" className="h-6 text-[10px] w-full text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => onDelete(res.id)}>İptal Et</Button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

