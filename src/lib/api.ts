const API_BASE_URL = 'http://localhost:3001/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Get fresh token from localStorage
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.token = response.token;
    localStorage.setItem('auth_token', response.token);
    return response;
  }

  async signup(email: string, password: string, firstName: string, lastName: string, department: string) {
    const response = await this.request<{ user: any; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, firstName, lastName, department }),
    });
    
    this.token = response.token;
    localStorage.setItem('auth_token', response.token);
    return response;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // User management
  async getProfiles() {
    return this.request<any[]>('/admin/profiles');
  }

  async createProfile(data: {
    email: string;
    firstName: string;
    lastName: string;
    department: string;
    roles: string[];
  }) {
    return this.request<any>('/admin/profiles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProfile(id: string, data: {
    email: string;
    firstName: string;
    lastName: string;
    department: string;
    roles: string[];
  }) {
    return this.request<any>(`/admin/profiles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProfile(id: string) {
    return this.request<{ success: boolean }>(`/admin/profiles/${id}`, {
      method: 'DELETE',
    });
  }

  // KPI methods
  async getKPIs() {
    return this.request<any[]>('/kpis');
  }

  async createKPI(data: {
    title: string;
    description: string;
    department: string;
    targetValue: number;
    unit: string;
    startDate: string;
    endDate: string;
    period: string;
    priority: string;
    assignedTo: string[];
  }) {
    return this.request<any>('/kpis', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateKPI(id: string, data: any) {
    return this.request<any>(`/kpis/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteKPI(id: string) {
    return this.request<any>(`/kpis/${id}`, {
      method: 'DELETE',
    });
  }

  async recordKPIProgress(kpiId: string, value: number, note?: string) {
    return this.request<any>(`/kpis/${kpiId}/progress`, {
      method: 'POST',
      body: JSON.stringify({ value, note }),
    });
  }

  async addKPIComment(kpiId: string, content: string) {
    return this.request<any>(`/kpis/${kpiId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Ticket methods
  async getTickets() {
    return this.request<any[]>('/tickets');
  }

  async createTicket(data: {
    title: string;
    description: string;
    priority: string;
    targetDepartment: string;
  }) {
    return this.request<any>('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Calendar methods
  async getActivities() {
    return this.request<any[]>('/calendar/activities');
  }

  async createActivity(data: {
    title: string;
    description: string;
    categoryId: string;
    startTime: string;
    endTime: string;
    date: string;
    duration: number;
  }) {
    return this.request<any>('/calendar/activities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateActivity(id: string, data: {
    title?: string;
    description?: string;
    categoryId?: string;
    startTime?: string;
    endTime?: string;
    date?: string;
  }) {
    return this.request<any>(`/calendar/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteActivity(id: string) {
    return this.request<any>(`/calendar/activities/${id}`, {
      method: 'DELETE',
    });
  }

  // Notification methods
  async getNotifications() {
    return this.request<any[]>('/notifications');
  }

  // Dashboard methods
  async getDashboardStats() {
    return this.request<any>('/dashboard/stats');
  }

  // Department methods
  async getDepartments() {
    return this.request<any[]>('/departments');
  }

  async createDepartment(name: string) {
    return this.request<any>('/departments', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);