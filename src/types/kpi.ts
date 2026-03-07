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

export interface RawKPI extends KPITarget {
  progress?: KPIProgress[];
  assignments?: { userId: string }[];
  comments?: KPIComment[];
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
  recordedByName?: string;
  createdAt: string;
  updatedAt?: string;
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
  lifecycleStatus: 'active' | 'completed' | 'paused' | 'cancelled';
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

export interface KPIUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  role: string;
  isActive?: boolean;
  createdAt?: string;
}
// Calculate KPI stats
export const calculateKPIStats = (kpi: RawKPI): KPIStats => {
  const now = new Date();
  const startDate = new Date(kpi.startDate);
  const endDate = new Date(kpi.endDate);

  // Calculate remaining days
  const remainingDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Get current value from all progress records (sum of all progress values)
  const currentValue = kpi.progress?.reduce((sum: number, p: KPIProgress) => sum + (p.value || 0), 0) || 0;

  // Calculate progress percentage
  const progressPercentage = kpi.targetValue > 0 ? (currentValue / kpi.targetValue) * 100 : 0;

  // Determine status
  let status: KPIStats['status'] = 'success';
  if (progressPercentage >= 100) {
    status = 'success';
  } else if (remainingDays < 0) {
    status = 'danger';
  } else if (remainingDays <= 7 || progressPercentage < 50) {
    status = 'warning';
  }

  // Calculate velocity (daily progress rate)
  // Velocity should be based on elapsed days, not total days
  const elapsedDays = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const velocity = elapsedDays > 0 ? currentValue / elapsedDays : 0;

  // Estimate completion date
  let estimatedCompletion: Date | null = null;
  if (velocity > 0 && currentValue < kpi.targetValue) {
    const remainingValue = kpi.targetValue - currentValue;
    const daysToComplete = Math.ceil(remainingValue / velocity);
    const estimatedDate = new Date(now.getTime() + (daysToComplete * 24 * 60 * 60 * 1000));

    // Hard cap at 5 years from now
    const fiveYearsFromNow = new Date(now.getTime() + (5 * 365 * 24 * 60 * 60 * 1000));

    // Limit estimated completion to maximum 2x the original end date OR 5 years, whichever is smaller
    // checking against endDate + 30 days is too strict if the user is just slightly behind
    const maxEstimatedDate = new Date(Math.min(
      new Date(endDate.getTime() + (365 * 24 * 60 * 60 * 1000)).getTime(), // End date + 1 year
      fiveYearsFromNow.getTime()
    ));

    if (estimatedDate > maxEstimatedDate) {
      // If estimated date is too far, use the max date or original end date depending on context
      // For UI purposes, if it's way off, better to show something reasonable or indicate "Overdue"
      estimatedCompletion = maxEstimatedDate;
    } else {
      estimatedCompletion = estimatedDate;
    }
  } else if (currentValue === 0) {
    // If no progress has been made, estimate based on remaining days and target
    // Assume linear progress from now to end date
    const remainingDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (remainingDays > 0) {
      estimatedCompletion = endDate; // Use original end date as estimate
    }
  }

  // Transform assignments array to assignedUsers array (user IDs)
  const assignedUsers = kpi.assignments?.map((assignment) => assignment.userId) || [];

  return {
    ...kpi,
    kpiId: kpi.id, // Map ID from backend
    currentValue,
    progressPercentage: Math.min(progressPercentage, 100),
    remainingDays,
    daysTotal: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
    status,
    lifecycleStatus: kpi.status,
    velocity,
    estimatedCompletion: estimatedCompletion?.toISOString(),
    recentProgress: kpi.progress || [],
    assignedUsers,
    comments: kpi.comments || []
  };
};
