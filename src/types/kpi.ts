export interface KPITarget {
  id: string;
  title: string;
  description?: string;
  department: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: string;
  endDate: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  createdBy: string;
  assignedTo: string[];
  createdAt: string;
  updatedAt: string;
}

export interface KPIComment {
  id: string;
  kpiId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface KPIProgress {
  id: string;
  kpiId: string;
  userId: string;
  value: number;
  note?: string;
  recordedAt: string;
  recordedBy: string;
}

export interface KPIStats {
  kpiId: string;
  title: string;
  description?: string;
  department: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: string;
  endDate: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'warning' | 'danger';
  progressPercentage: number;
  remainingDays: number;
  daysTotal: number;
  velocity: number; // progress per day
  estimatedCompletion: string;
  recentProgress: KPIProgress[];
  comments: KPIComment[];
  assignedUsers: string[];
}

export interface CreateKPIData {
  title: string;
  description?: string;
  department: string;
  targetValue: number;
  unit: string;
  startDate: string;
  endDate: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string[];
}

export interface KPIFilters {
  department?: string;
  period?: 'monthly' | 'quarterly' | 'yearly' | 'all';
  status?: 'active' | 'completed' | 'paused' | 'cancelled' | 'all';
  priority?: 'low' | 'medium' | 'high' | 'critical' | 'all';
  assignedTo?: string;
  startDate?: string;
  endDate?: string;
}

export const KPI_PERIODS = {
  monthly: 'Aylık',
  quarterly: 'Üç Aylık', 
  yearly: 'Yıllık'
} as const;

export const KPI_PRIORITIES = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek', 
  critical: 'Kritik'
} as const;

export const KPI_STATUSES = {
  active: 'Aktif',
  completed: 'Tamamlandı',
  paused: 'Duraklatıldı',
  cancelled: 'İptal Edildi'
} as const;