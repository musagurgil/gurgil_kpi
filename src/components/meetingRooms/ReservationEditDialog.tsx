import { useState, useMemo, useEffect } from 'react';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ReservationEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: any;
  rooms: any[];
  onSubmit: (id: string, data: {
    startTime?: string;
    endTime?: string;
    notes?: string;
  }) => Promise<void>;
  loading?: boolean;
}

// Generate hours 00-23
const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
// Generate minutes 00-59 (every minute)
const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

export function ReservationEditDialog({
  open,
  onOpenChange,
  reservation,
  rooms,
  onSubmit,
  loading = false
}: ReservationEditDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [startHour, setStartHour] = useState<string>("");
  const [startMinute, setStartMinute] = useState<string>("");
  const [endHour, setEndHour] = useState<string>("");
  const [endMinute, setEndMinute] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Control Select dropdowns open state
  const [startHourOpen, setStartHourOpen] = useState(false);
  const [startMinuteOpen, setStartMinuteOpen] = useState(false);
  const [endHourOpen, setEndHourOpen] = useState(false);
  const [endMinuteOpen, setEndMinuteOpen] = useState(false);

  // Initialize form when reservation changes or dialog opens
  useEffect(() => {
    if (reservation && open) {
      const start = new Date(reservation.startTime);
      const end = new Date(reservation.endTime);

      setSelectedDate(start);
      setStartHour(start.getHours().toString().padStart(2, '0'));
      setStartMinute(start.getMinutes().toString().padStart(2, '0'));
      setEndHour(end.getHours().toString().padStart(2, '0'));
      setEndMinute(end.getMinutes().toString().padStart(2, '0'));
      setNotes(reservation.notes || "");
    } else if (!open) {
      // Reset form when dialog closes
      setSelectedDate(undefined);
      setStartHour("");
      setStartMinute("");
      setEndHour("");
      setEndMinute("");
      setNotes("");
    }
  }, [reservation, open]);

  // Combine hour and minute into HH:mm format
  const startTime = useMemo(() => {
    if (startHour && startMinute) {
      return `${startHour}:${startMinute}`;
    }
    return "";
  }, [startHour, startMinute]);

  const endTime = useMemo(() => {
    if (endHour && endMinute) {
      return `${endHour}:${endMinute}`;
    }
    return "";
  }, [endHour, endMinute]);

  const handleSubmit = async () => {
    if (!selectedDate || !startTime || !endTime) {
      return;
    }

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const startTimeFormatted = `${startTime}:00`;
    const endTimeFormatted = `${endTime}:00`;

    const startDateTime = new Date(`${dateStr}T${startTimeFormatted}`);
    const endDateTime = new Date(`${dateStr}T${endTimeFormatted}`);



    // ... (inside handleSubmit)

    // Validate that start time is before end time
    if (startDateTime >= endDateTime) {
      toast.error('Bitiş saati başlangıç saatinden sonra olmalıdır');
      return;
    }

    // Validate that the reservation is not in the past
    if (startDateTime < new Date()) {
      toast.error('Geçmiş tarih için rezervasyon yapılamaz');
      return;
    }

    const updateData: {
      startTime?: string;
      endTime?: string;
      notes?: string;
    } = {};

    // Only include changed fields
    const originalStart = new Date(reservation.startTime);
    const originalEnd = new Date(reservation.endTime);

    if (startDateTime.toISOString() !== originalStart.toISOString()) {
      updateData.startTime = startDateTime.toISOString();
    }
    if (endDateTime.toISOString() !== originalEnd.toISOString()) {
      updateData.endTime = endDateTime.toISOString();
    }
    if (notes.trim() !== (reservation.notes || "")) {
      updateData.notes = notes.trim() || undefined;
    }

    // If nothing changed, don't submit
    if (Object.keys(updateData).length === 0) {
      onOpenChange(false);
      return;
    }

    await onSubmit(reservation.id, updateData);

    // Reset form
    setSelectedDate(undefined);
    setStartHour("");
    setStartMinute("");
    setEndHour("");
    setEndMinute("");
    setNotes("");
    onOpenChange(false);
  };

  if (!reservation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rezervasyon Düzenle</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Oda</Label>
            <div className="p-3 bg-muted rounded-md text-sm">
              {reservation.room?.name} - {reservation.room?.location}
            </div>
          </div>

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

          <div className="space-y-2">
            <Label>Saat Aralığı * (24 saat formatı: 00:00 - 23:59)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Başlangıç Saati
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="startHour" className="text-xs text-muted-foreground">Saat</Label>
                    <Select
                      value={startHour}
                      onValueChange={(value) => {
                        setStartHour(value);
                        setStartHourOpen(false);
                      }}
                      open={startHourOpen}
                      onOpenChange={setStartHourOpen}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="00" />
                      </SelectTrigger>
                      <SelectContent>
                        {HOURS.map((hour) => (
                          <SelectItem key={hour} value={hour}>
                            {hour}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="startMinute" className="text-xs text-muted-foreground">Dakika</Label>
                    <Select
                      value={startMinute}
                      onValueChange={(value) => {
                        setStartMinute(value);
                        setStartMinuteOpen(false);
                      }}
                      open={startMinuteOpen}
                      onOpenChange={setStartMinuteOpen}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="00" />
                      </SelectTrigger>
                      <SelectContent>
                        {MINUTES.map((minute) => (
                          <SelectItem key={minute} value={minute}>
                            {minute}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {startTime && (
                  <div className="text-xs text-muted-foreground">
                    Seçilen: {startTime}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Bitiş Saati
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="endHour" className="text-xs text-muted-foreground">Saat</Label>
                    <Select
                      value={endHour}
                      onValueChange={(value) => {
                        setEndHour(value);
                        setEndHourOpen(false);
                      }}
                      open={endHourOpen}
                      onOpenChange={setEndHourOpen}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="00" />
                      </SelectTrigger>
                      <SelectContent>
                        {HOURS.map((hour) => (
                          <SelectItem key={hour} value={hour}>
                            {hour}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="endMinute" className="text-xs text-muted-foreground">Dakika</Label>
                    <Select
                      value={endMinute}
                      onValueChange={(value) => {
                        setEndMinute(value);
                        setEndMinuteOpen(false);
                      }}
                      open={endMinuteOpen}
                      onOpenChange={setEndMinuteOpen}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="00" />
                      </SelectTrigger>
                      <SelectContent>
                        {MINUTES.map((minute) => (
                          <SelectItem key={minute} value={minute}>
                            {minute}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {endTime && (
                  <div className="text-xs text-muted-foreground">
                    Seçilen: {endTime}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notlar (İsteğe Bağlı)</Label>
            <Textarea
              id="notes"
              placeholder="Toplantı hakkında notlar..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedDate || !startHour || !startMinute || !endHour || !endMinute || loading}
          >
            {loading ? "Güncelleniyor..." : "Güncelle"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

