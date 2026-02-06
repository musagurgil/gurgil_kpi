import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';

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
  criticalKPIs: any[];
  recentActivities: any[];
}

export const useDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalKPIs: 0,
    completedKPIs: 0,
    activeKPIs: 0,
    totalTickets: 0,
    openTickets: 0,
    inProgressTickets: 0,
    completedTickets: 0,
    kpiProgressPercentage: 0,
    ticketCompletionPercentage: 0,
    criticalKPIs: [],
    recentActivities: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getDashboardStats();
        
        // Calculate percentages
        const kpiProgressPercentage = data.totalKPIs > 0 
          ? (data.completedKPIs / data.totalKPIs) * 100 
          : 0;
        
        const ticketCompletionPercentage = data.totalTickets > 0 
          ? (data.completedTickets / data.totalTickets) * 100 
          : 0;

        // Mock critical KPIs and recent activities
        const criticalKPIs = [];
        const recentActivities = [
          {
            id: '1',
            type: 'kpi_created',
            title: 'Yeni KPI oluşturuldu',
            description: 'Aylık Satış Hedefi KPI\'sı oluşturuldu',
            timestamp: new Date().toISOString(),
            user: 'Admin User'
          },
          {
            id: '2',
            type: 'ticket_created',
            title: 'Yeni Ticket oluşturuldu',
            description: 'Sistem Güncelleme Talebi ticket\'ı oluşturuldu',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            user: 'Manager User'
          }
        ];

        setStats({
          ...data,
          kpiProgressPercentage,
          ticketCompletionPercentage,
          criticalKPIs,
          recentActivities
        });
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
        // Set default values on error
        setStats({
          totalKPIs: 0,
          completedKPIs: 0,
          activeKPIs: 0,
          totalTickets: 0,
          openTickets: 0,
          inProgressTickets: 0,
          completedTickets: 0,
          kpiProgressPercentage: 0,
          ticketCompletionPercentage: 0,
          criticalKPIs: [],
          recentActivities: []
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardStats();
  }, []);

  return {
    stats,
    criticalKPIs: stats.criticalKPIs || [],
    loading,
    currentUser: user ? {
      id: user.id,
      role: user.roles.includes('admin') ? 'admin' :
            user.roles.includes('department_manager') ? 'department_manager' : 'employee',
      department: user.department
    } : null
  };
};