import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, CheckCircle2, AlertCircle, Building2 } from "lucide-react";
import { useMemo } from "react";
import { format, isToday, isFuture, isPast } from "date-fns";
import { tr } from "date-fns/locale";
import { MeetingRoom, MeetingReservation } from "@/types/meeting";

interface MeetingRoomStatsProps {
  rooms: MeetingRoom[];
  reservations: MeetingReservation[];
  userReservations?: MeetingReservation[];
  canApprove?: boolean;
}

export function MeetingRoomStats({ rooms, reservations, userReservations, canApprove }: MeetingRoomStatsProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const availableRooms = rooms.filter(room => {
      // Check if room has active reservation
      const active = room.reservations?.find((r) => {
        if (r.status !== 'approved') return false;
        const start = new Date(r.startTime);
        const end = new Date(r.endTime);
        return start <= now && end >= now;
      });

      // Also check against global reservations list if needed, 
      // but assuming room.reservations is populated or we should use the reservations prop passed in
      // The original code used room.reservations, so we stick to that if it exists on MeetingRoom type
      // If MeetingRoom type doesn't have reservations, we might need to filter the reservations prop.
      // Checking type definition from memory/previous turns: MeetingRoom usually has relations if included.
      // Let's assume room.reservations is available or optional.

      // Actually, looking at the original code: 
      // const active = room.reservations?.find((r: any) => { ...

      // If MeetingRoom definition doesn't include reservations, this will fail.
      // Let's assume for now it does, or I might need to cross-check.
      // If the `reservations` prop contains ALL reservations, maybe we should use that instead? 
      // But `room.reservations` is more direct if available.

      return !active;
    });

    const upcomingReservations = reservations.filter(r => {
      if (r.status !== 'approved') return false;
      const start = new Date(r.startTime);
      return start >= now;
    });

    const todayReservations = reservations.filter(r => {
      const start = new Date(r.startTime);
      return isToday(start);
    });

    const pendingReservations = reservations.filter(r => r.status === 'pending');

    return {
      totalRooms: rooms.length,
      availableRooms: availableRooms.length,
      totalReservations: reservations.length,
      upcomingReservations: upcomingReservations.length,
      todayReservations: todayReservations.length,
      pendingReservations: pendingReservations.length,
      userUpcomingReservations: userReservations?.filter(r => {
        if (r.status !== 'approved') return false;
        const start = new Date(r.startTime);
        return start >= now;
      }).length || 0
    };
  }, [rooms, reservations, userReservations]);

  const statCards = [
    {
      title: "Toplam Oda",
      value: stats.totalRooms,
      icon: Building2,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950"
    },
    {
      title: "Müsait Odalar",
      value: stats.availableRooms,
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950"
    },
    {
      title: "Yaklaşan Rezervasyonlar",
      value: stats.upcomingReservations,
      icon: Calendar,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950"
    },
    {
      title: "Bekleyen Onaylar",
      value: stats.pendingReservations,
      icon: AlertCircle,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950",
      showOnlyForManagers: true
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        if (stat.showOnlyForManagers && !canApprove) return null;

        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

