export interface EmployeeStats {
  userId: string;
  name: string;
  department: string;
  totalHours: number;
  entryCount: number;
  averageDailyHours: number;
  categoryDistribution: { [categoryId: string]: number };
}

export interface DepartmentStats {
  department: string;
  totalEmployees: number;
  totalHours: number;
  averageHours: number;
  categoryDistribution: { [categoryId: string]: number };
}

export interface AdminFilters {
  department?: string;
  userId?: string;
  startDate: string;
  endDate: string;
}

export interface ExportData {
  employees: EmployeeStats[];
  departments: DepartmentStats[];
  filters: AdminFilters;
  exportDate: string;
}