import { useState } from 'react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Clock, Zap } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface QuickReservationProps {
  rooms: any[];
  onReserve: (data: {
    roomId: string;
    startTime: string;
    endTime: string;
    notes?: string;
  }) => Promise<void>;
}

export function QuickReservation({ rooms, onReserve }: QuickReservationProps) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [startHour, setStartHour] = useState<string>("");
  const [startMinute, setStartMinute] = useState<string>("00");
  const [endHour, setEndHour] = useState<string>("");
  const [endMinute, setEndMinute] = useState<string>("00");
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const MINUTES = ['00', '15', '30', '45'];

  const getAvailableRooms = () => {
    if (!selectedDate || !startHour || !endHour) return rooms;

    const start = new Date(selectedDate);
    start.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
    const end = new Date(selectedDate);
    end.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

    return rooms.filter((room) => {
      const hasConflict = (room.reservations || []).some((r: any) => {
        if (r.status === 'rejected') return false;
        const resStart = new Date(r.startTime);
        const resEnd = new Date(r.endTime);
        return (resStart < end && resEnd > start);
      });
      return !hasConflict;
    });
  };

  const availableRooms = getAvailableRooms();

  const handleSubmit = async () => {
    if (!selectedDate || !startHour || !endHour || !selectedRoomId) {
      return;
    }

    const start = new Date(selectedDate);
    start.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
    const end = new Date(selectedDate);
    end.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

    if (start >= end) {
      toast.error('Bitiş saati başlangıç saatinden sonra olmalıdır');
      return;
    }

    setLoading(true);
    try {
      await onReserve({
        roomId: selectedRoomId,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        notes: notes.trim() || undefined
      });
      setOpen(false);
      setSelectedDate(new Date());
      setStartHour("");
      setEndHour("");
      setSelectedRoomId("");
      setNotes("");
    } catch (error) {
      // Error handled in parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Zap className="w-4 h-4" />
        <span className="hidden sm:inline">Hızlı Rezervasyon</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Hızlı Rezervasyon</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tarih *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "PPP", { locale: tr })
                    ) : (
                      <span>Tarih seçin</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Başlangıç Saati *</Label>
                <div className="flex gap-2">
                  <Select value={startHour} onValueChange={setStartHour}>
                    <SelectTrigger>
                      <SelectValue placeholder="Saat" />
                    </SelectTrigger>
                    <SelectContent>
                      {HOURS.map((hour) => (
                        <SelectItem key={hour} value={hour}>
                          {hour}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={startMinute} onValueChange={setStartMinute}>
                    <SelectTrigger>
                      <SelectValue placeholder="Dakika" />
                    </SelectTrigger>
                    <SelectContent>
                      {MINUTES.map((min) => (
                        <SelectItem key={min} value={min}>
                          {min}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Bitiş Saati *</Label>
                <div className="flex gap-2">
                  <Select value={endHour} onValueChange={setEndHour}>
                    <SelectTrigger>
                      <SelectValue placeholder="Saat" />
                    </SelectTrigger>
                    <SelectContent>
                      {HOURS.map((hour) => (
                        <SelectItem key={hour} value={hour}>
                          {hour}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={endMinute} onValueChange={setEndMinute}>
                    <SelectTrigger>
                      <SelectValue placeholder="Dakika" />
                    </SelectTrigger>
                    <SelectContent>
                      {MINUTES.map((min) => (
                        <SelectItem key={min} value={min}>
                          {min}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Oda *</Label>
              <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                <SelectTrigger>
                  <SelectValue placeholder="Müsait odaları seçin" />
                </SelectTrigger>
                <SelectContent>
                  {availableRooms.length === 0 ? (
                    <SelectItem value="" disabled>
                      Seçilen saatte müsait oda yok
                    </SelectItem>
                  ) : (
                    availableRooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name} - {room.location} ({room.capacity} kişi)
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {availableRooms.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {availableRooms.length} müsait oda bulundu
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Notlar (İsteğe Bağlı)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Toplantı hakkında notlar..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedDate || !startHour || !endHour || !selectedRoomId || loading}
            >
              {loading ? 'Rezerve ediliyor...' : 'Rezerve Et'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

