const API_BASE_URL = 'http://localhost:3001/api';

import { User, CreateUserData } from '@/types/user';
import { Ticket, CreateTicketData, TicketComment } from '@/types/ticket';
import { Activity, ActivityCategory } from '@/types/calendar';
import { Notification } from '@/types/notification';
import { KPITarget, CreateKPIData, KPIProgress, KPIComment, RawKPI } from '@/types/kpi';
import { MeetingRoom, MeetingReservation, CreateMeetingRoomData, CreateMeetingReservationData } from '@/types/meeting';
import { DashboardStats } from '@/types/dashboard';



interface ApiError extends Error {
  status?: number;
  response?: unknown;
}

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
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
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
      const errorMessage = error.error || error.details || 'Request failed';
      const customError = new Error(errorMessage) as ApiError;
      customError.status = response.status;
      customError.response = error;
      throw customError;
    }

    return response.json();
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.token = response.token;
    localStorage.setItem('auth_token', response.token);
    return response;
  }

  async signup(email: string, password: string, firstName: string, lastName: string, department: string) {
    const response = await this.request<{ user: User; token: string }>('/auth/signup', {
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
    return this.request<User[]>('/admin/profiles');
  }

  async createProfile(data: CreateUserData) {
    return this.request<User>('/admin/profiles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProfile(id: string, data: Partial<CreateUserData>) {
    return this.request<User>(`/admin/profiles/${id}`, {
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
    return this.request<RawKPI[]>('/kpis'); // Returns RawKPI structure
  }

  async createKPI(data: CreateKPIData) {
    return this.request<RawKPI>('/kpis', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateKPI(id: string, data: Partial<CreateKPIData>) {
    return this.request<RawKPI>(`/kpis/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteKPI(id: string) {
    return this.request<{ success: boolean }>(`/kpis/${id}`, {
      method: 'DELETE',
    });
  }

  async recordKPIProgress(kpiId: string, value: number, note?: string) {
    return this.request<KPIProgress>(`/kpis/${kpiId}/progress`, {
      method: 'POST',
      body: JSON.stringify({ value, note }),
    });
  }

  async addKPIComment(kpiId: string, content: string) {
    return this.request<KPIComment>(`/kpis/${kpiId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Ticket methods
  async getTickets() {
    return this.request<Ticket[]>('/tickets');
  }

  async createTicket(data: CreateTicketData) {
    return this.request<Ticket>('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTicket(id: string, data: Partial<CreateTicketData> & { status?: string, assignedTo?: string }) {
    return this.request<Ticket>(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTicket(id: string) {
    return this.request<{ message: string }>(`/tickets/${id}`, {
      method: 'DELETE',
    });
  }

  async getTicketComments(ticketId: string) {
    return this.request<TicketComment[]>(`/tickets/${ticketId}/comments`);
  }

  async addTicketComment(ticketId: string, content: string, isInternal?: boolean) {
    return this.request<TicketComment>(`/tickets/${ticketId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, isInternal }),
    });
  }

  // Calendar methods
  async getActivities() {
    return this.request<Activity[]>('/calendar/activities');
  }

  async getCategories() {
    return this.request<ActivityCategory[]>('/calendar/categories');
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
    return this.request<Activity>('/calendar/activities', {
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
    return this.request<Activity>(`/calendar/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteActivity(id: string) {
    return this.request<{ success: boolean; message: string }>(`/calendar/activities/${id}`, {
      method: 'DELETE',
    });
  }

  // Notification methods
  async getNotifications() {
    return this.request<Notification[]>('/notifications');
  }

  async markNotificationAsRead(id: string) {
    return this.request<Notification>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request<{ success: boolean }>('/notifications/read-all', {
      method: 'PUT',
    });
  }

  async deleteNotification(id: string) {
    return this.request<{ success: boolean }>(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  async deleteReadNotifications() {
    return this.request<{ success: boolean; count: number }>('/notifications/read', {
      method: 'DELETE',
    });
  }

  async deleteAllNotifications() {
    return this.request<{ success: boolean }>('/notifications', {
      method: 'DELETE',
    });
  }

  // Dashboard methods
  async getDashboardStats() {
    return this.request<DashboardStats>('/dashboard/stats');
  }

  // Department methods
  async getDepartments() {
    return this.request<{ id: string; name: string; createdAt: string; updatedAt: string }[]>('/departments');
  }

  async createDepartment(name: string) {
    return this.request<{ id: string; name: string }>('/departments', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async updateDepartment(id: string, name: string) {
    return this.request<{ id: string; name: string }>(`/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  }

  async deleteDepartment(id: string) {
    return this.request<{ success: boolean; message: string }>(`/departments/${id}`, {
      method: 'DELETE',
    });
  }

  // Meeting Room methods
  async getMeetingRooms() {
    return this.request<MeetingRoom[]>('/meeting-rooms');
  }

  async createMeetingRoom(data: CreateMeetingRoomData) {
    return this.request<MeetingRoom>('/meeting-rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteMeetingRoom(id: string) {
    return this.request<{ message: string }>(`/meeting-rooms/${id}`, {
      method: 'DELETE',
    });
  }

  // Meeting Reservation methods
  async getMeetingReservations() {
    return this.request<MeetingReservation[]>('/meeting-reservations');
  }

  async createMeetingReservation(data: CreateMeetingReservationData) {
    return this.request<MeetingReservation>('/meeting-reservations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approveMeetingReservation(id: string) {
    return this.request<MeetingReservation>(`/meeting-reservations/${id}/approve`, {
      method: 'PUT',
    });
  }

  async rejectMeetingReservation(id: string) {
    return this.request<MeetingReservation>(`/meeting-reservations/${id}/reject`, {
      method: 'PUT',
    });
  }

  async updateMeetingReservation(id: string, data: {
    startTime?: string;
    endTime?: string;
    notes?: string;
  }) {
    return this.request<MeetingReservation>(`/meeting-reservations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMeetingReservation(id: string) {
    return this.request<{ success: boolean; message: string }>(`/meeting-reservations/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);