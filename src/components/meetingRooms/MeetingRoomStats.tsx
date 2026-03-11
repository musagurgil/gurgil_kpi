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
  // ⚡ Bolt Optimization: Memoize and pre-compute meeting room statistics
  // What: Replaced multiple O(N) array filtering passes and O(N*M) room reservations lookup with a single O(N) reduce pass
  // Why: Prevents blocking the main thread with redundant loops over the reservations array on every dashboard render
  const stats = useMemo(() => {
    const now = new Date();

    // Single pass to calculate all reservation stats and group by roomId
    const resStats = reservations.reduce((acc, r) => {
      const start = new Date(r.startTime);
      const isApproved = r.status === 'approved';

      // Group by roomId for O(1) active room checking later
      if (!acc.byRoom[r.roomId]) acc.byRoom[r.roomId] = [];
      acc.byRoom[r.roomId].push(r);

      // Calculate upcoming
      if (isApproved && start >= now) acc.upcoming++;

      // Calculate today
      if (isToday(start)) acc.today++;

      // Calculate pending
      if (r.status === 'pending') acc.pending++;

      return acc;
    }, { byRoom: {} as Record<string, MeetingReservation[]>, upcoming: 0, today: 0, pending: 0 });

    const availableRooms = rooms.filter(room => {
      // O(1) lookup instead of O(N) find
      const roomReservations = room.reservations ?? (resStats.byRoom[room.id] || []);
      const active = roomReservations.some((r) => {
        if (r.status !== 'approved') return false;
        const start = new Date(r.startTime);
        const end = new Date(r.endTime);
        return start <= now && end >= now;
      });

      return !active;
    });

    return {
      totalRooms: rooms.length,
      availableRooms: availableRooms.length,
      totalReservations: reservations.length,
      upcomingReservations: resStats.upcoming,
      todayReservations: resStats.today,
      pendingReservations: resStats.pending,
      userUpcomingReservations: userReservations?.reduce((count, r) => {
        if (r.status === 'approved' && new Date(r.startTime) >= now) return count + 1;
        return count;
      }, 0) || 0
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

