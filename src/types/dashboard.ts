import { KPIStats } from './kpi';

export interface CriticalKPI {
    title: string;
    value: number;
    target: number;
    unit: string;
    change: number;
    changeType: 'increase' | 'decrease' | 'neutral';
    status: KPIStats['status'];
    department: string;
    kpiId: string;
    endDate: string;
    remainingDays: number;
}

export interface RecentActivity {
    id: string;
    type: 'kpi_progress' | 'ticket_update';
    title: string;
    description: string;
    timestamp: string;
    kpiId?: string;
    ticketId?: string;
    kpiTitle?: string;
}

export interface UpcomingDeadline {
    title: string;
    endDate: string;
    remainingDays: number;
    progressPercentage: number;
    status: KPIStats['status'];
    priority: string;
    department: string;
}

export interface DashboardStats {
    totalKPIs: number;
    completedKPIs: number;
    activeKPIs: number;
    totalTickets: number;
    openTickets: number;
    inProgressTickets: number;
    completedTickets: number;
    kpiProgressPercentage: number;
    ticketCompletionPercentage: number;
    criticalKPIs: CriticalKPI[];
    recentActivities: RecentActivity[];
    // User-specific stats
    userKPIs: number;
    userCompletedKPIs: number;
    userActiveKPIs: number;
    userTickets: number;
    userAssignedTickets: number;
    upcomingDeadlines: UpcomingDeadline[];
    todaySummary: {
        completedToday: number;
        dueToday: number;
        dueThisWeek: number;
    };
    ticketsByStatus: { name: string; value: number; color: string }[];
    ticketsByDepartment: { name: string; value: number }[];
}
