import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { useKPI } from '@/hooks/useKPI';
import { useTickets } from '@/hooks/useTickets';
import { KPIStats, KPIProgress } from '@/types/kpi';
import { DashboardStats, CriticalKPI, RecentActivity, UpcomingDeadline } from '@/types/dashboard';

export const useDashboard = () => {
  const { user } = useAuth();
  const { kpiStats } = useKPI();
  const { tickets } = useTickets();
  const [serverStats, setServerStats] = useState<Partial<DashboardStats>>({});
  const [loading, setLoading] = useState(true);

  // Fetch server-side stats once
  useEffect(() => {
    const loadDashboardStats = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const data = await apiClient.getDashboardStats();
        setServerStats(data);
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardStats();
  }, [user]); // Only reload if user changes (e.g. login/logout)

  // Memoize user-specific KPIs filtering
  const userKPIsList = useMemo(() => {
    if (!user) return [];

    const isAdmin = user.roles.includes('admin');
    const isDepartmentManager = user.roles.includes('department_manager');

    return kpiStats.filter(kpi => {
      if (isAdmin) return true; // Admin sees all
      if (isDepartmentManager) {
        return kpi.department === user.department;
      }
      // Regular employees see KPIs assigned to them or from their department
      return kpi.assignedUsers?.includes(user.id) || kpi.department === user.department;
    });
  }, [user, kpiStats]);

  // Memoize derived KPI stats
  const {
    userKPIs,
    userCompletedKPIs,
    userActiveKPIs,
    criticalKPIs,
    upcomingDeadlines,
    todaySummary
  } = useMemo(() => {
    const userKPIs = userKPIsList.length;
    const userCompletedKPIs = userKPIsList.filter(kpi =>
      kpi.lifecycleStatus === 'completed' || kpi.progressPercentage >= 100
    ).length;
    const userActiveKPIs = userKPIsList.filter(kpi =>
      kpi.lifecycleStatus === 'active' && kpi.progressPercentage < 100
    ).length;

    // Filter critical KPIs
    const criticalKPIs: CriticalKPI[] = userKPIsList
      .filter(kpi =>
        kpi.priority === 'critical' ||
        kpi.status === 'danger' ||
        (kpi.status === 'warning' && kpi.progressPercentage < 50)
      )
      .sort((a, b) => {
        // Sort by priority: danger > warning > critical priority > others
        if (a.status === 'danger' && b.status !== 'danger') return -1;
        if (a.status !== 'danger' && b.status === 'danger') return 1;
        if (a.status === 'warning' && b.status !== 'warning') return -1;
        if (a.status !== 'warning' && b.status === 'warning') return 1;
        if (a.priority === 'critical' && b.priority !== 'critical') return -1;
        if (a.priority !== 'critical' && b.priority === 'critical') return 1;
        return 0;
      })
      .slice(0, 4)
      .map(kpi => ({
        title: kpi.title,
        value: kpi.currentValue,
        target: kpi.targetValue,
        unit: kpi.unit,
        change: kpi.progressPercentage,
        changeType: kpi.progressPercentage >= 100 ? 'increase' : kpi.progressPercentage < 50 ? 'decrease' : 'increase',
        status: kpi.status,
        department: kpi.department,
        kpiId: kpi.kpiId,
        endDate: kpi.endDate,
        remainingDays: kpi.remainingDays
      }));

    // Calculate upcoming deadlines (7 days)
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Normalize dates for day comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekLater = new Date(today);
    weekLater.setDate(weekLater.getDate() + 7);

    const upcomingDeadlines: UpcomingDeadline[] = userKPIsList
      .filter(kpi => {
        const endDate = new Date(kpi.endDate);
        return endDate >= now && endDate <= sevenDaysLater && kpi.progressPercentage < 100;
      })
      .sort((a, b) => {
        const aDate = new Date(a.endDate);
        const bDate = new Date(b.endDate);
        return aDate.getTime() - bDate.getTime();
      })
      .slice(0, 5)
      .map(kpi => ({
        title: kpi.title,
        endDate: kpi.endDate,
        remainingDays: kpi.remainingDays,
        progressPercentage: kpi.progressPercentage,
        status: kpi.status,
        priority: kpi.priority,
        department: kpi.department
      }));

    // Calculate today's summary
    const completedToday = userKPIsList.filter(kpi => {
      // Check if progress was recorded today
      const hasProgressToday = kpi.recentProgress?.some((p: KPIProgress) => {
        const progressDate = new Date(p.createdAt);
        return progressDate >= today && progressDate < tomorrow;
      });
      return hasProgressToday || (kpi.status === 'success' && kpi.progressPercentage >= 100);
    }).length;

    const dueToday = userKPIsList.filter(kpi => {
      const endDate = new Date(kpi.endDate);
      endDate.setHours(0, 0, 0, 0);
      return endDate.getTime() === today.getTime() && kpi.progressPercentage < 100;
    }).length;

    const dueThisWeek = userKPIsList.filter(kpi => {
      const endDate = new Date(kpi.endDate);
      return endDate >= today && endDate <= weekLater && kpi.progressPercentage < 100;
    }).length;

    return {
      userKPIs,
      userCompletedKPIs,
      userActiveKPIs,
      criticalKPIs,
      upcomingDeadlines,
      todaySummary: {
        completedToday,
        dueToday,
        dueThisWeek
      }
    };
  }, [userKPIsList]);

  // Memoize user-specific tickets stats
  const { userTickets, userAssignedTickets, recentActivities } = useMemo(() => {
    if (!user) return { userTickets: 0, userAssignedTickets: 0, recentActivities: [] };

    const userTickets = tickets.filter(ticket => ticket.createdBy === user.id).length;
    const userAssignedTickets = tickets.filter(ticket => ticket.assignedTo === user.id).length;

    // Recent activities from user's KPIs and tickets
    const recentActivities: RecentActivity[] = [];

    // Add KPI progress activities
    userKPIsList.forEach(kpi => {
      if (kpi.recentProgress && kpi.recentProgress.length > 0) {
        kpi.recentProgress.slice(0, 3).forEach((progress: KPIProgress) => {
          recentActivities.push({
            id: `kpi-progress-${kpi.kpiId}-${progress.id}`,
            type: 'kpi_progress',
            title: `${kpi.title} - İlerleme kaydedildi`,
            description: `+${progress.value} ${kpi.unit}`,
            timestamp: progress.createdAt,
            kpiId: kpi.kpiId,
            kpiTitle: kpi.title
          });
        });
      }
    });

    // Add ticket activities
    tickets.slice(0, 5).forEach(ticket => {
      if (ticket.createdBy === user.id || ticket.assignedTo === user.id) {
        recentActivities.push({
          id: `ticket-${ticket.id}`,
          type: 'ticket_update',
          title: `Ticket güncellendi: ${ticket.title}`,
          description: `Durum: ${ticket.status}`,
          timestamp: ticket.updatedAt || ticket.createdAt,
          ticketId: ticket.id
        });
      }
    });

    // Sort activities by timestamp (most recent first)
    recentActivities.sort((a, b) => {
      const aTime = new Date(a.timestamp).getTime();
      const bTime = new Date(b.timestamp).getTime();
      return bTime - aTime;
    });

    return {
      userTickets,
      userAssignedTickets,
      recentActivities: recentActivities.slice(0, 10)
    };
  }, [user, tickets, userKPIsList]);

  // Combine everything into final stats object
  const stats: DashboardStats = useMemo(() => {
    const defaultStats: DashboardStats = {
      totalKPIs: 0,
      completedKPIs: 0,
      activeKPIs: 0,
      totalTickets: 0,
      openTickets: 0,
      inProgressTickets: 0,
      completedTickets: 0,
      kpiProgressPercentage: 0,
      ticketCompletionPercentage: 0,
      ticketsByStatus: [],
      ticketsByDepartment: [],
      criticalKPIs: [],
      recentActivities: [],
      userKPIs: 0,
      userCompletedKPIs: 0,
      userActiveKPIs: 0,
      userTickets: 0,
      userAssignedTickets: 0,
      upcomingDeadlines: [],
      todaySummary: {
        completedToday: 0,
        dueToday: 0,
        dueThisWeek: 0,
      },
    };

    // Calculate percentages for server stats
    const kpiProgressPercentage = (serverStats.totalKPIs || 0) > 0
      ? ((serverStats.completedKPIs || 0) / (serverStats.totalKPIs || 1)) * 100
      : 0;

    const ticketCompletionPercentage = (serverStats.totalTickets || 0) > 0
      ? ((serverStats.completedTickets || 0) / (serverStats.totalTickets || 1)) * 100
      : 0;

    return {
      ...defaultStats,
      ...serverStats,
      kpiProgressPercentage,
      ticketCompletionPercentage,
      // Client-computed stats override default empty values
      userKPIs,
      userCompletedKPIs,
      userActiveKPIs,
      criticalKPIs,
      upcomingDeadlines,
      todaySummary,
      userTickets,
      userAssignedTickets,
      recentActivities
    };
  }, [serverStats, userKPIs, userCompletedKPIs, userActiveKPIs, criticalKPIs, upcomingDeadlines, todaySummary, userTickets, userAssignedTickets, recentActivities]);

  return {
    stats,
    criticalKPIs: stats.criticalKPIs || [],
    loading,
    currentUser: user ? {
      id: user.id,
      roles: user.roles,
      department: user.department
    } : null
  };
};
