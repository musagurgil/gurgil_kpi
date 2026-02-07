export interface User {
  id: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  department: string;
  roles: string[];
  userRoles?: { role: string }[];
  isActive?: boolean;
  createdAt?: string;
  lastLogin?: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  roles: string[];
}

export const DEPARTMENTS = [
  'Yönetim',
  'Satış',
  'Pazarlama',
  'İnsan Kaynakları',
  'IT',
  'Finans',
  'Operasyon',
  'Müşteri Hizmetleri'
] as const;

export const ROLES = {
  admin: 'Sistem Yöneticisi',
  department_manager: 'Departman Yöneticisi',
  employee: 'Çalışan'
} as const;