export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  sourceDepartment: string;
  targetDepartment: string;
  createdBy: string;
  creatorName?: string;
  creatorEmail?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  attachments?: TicketAttachment[];
  comments: TicketComment[];
  tags?: string[];
}

export interface TicketAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  isInternal: boolean;
  attachments?: TicketAttachment[];
}

export interface TicketFilter {
  status?: 'open' | 'in_progress' | 'resolved' | 'closed' | 'all';
  priority?: 'low' | 'medium' | 'high' | 'urgent' | 'all';
  department?: string;
  assignedTo?: string;
  createdBy?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface CreateTicketData {
  title: string;
  description: string;
  priority: Ticket['priority'];
  targetDepartment: string;
  attachments?: TicketAttachment[];
  tags?: string[];
}

export const TICKET_STATUSES = {
  open: 'Açık',
  in_progress: 'Devam Ediyor',
  resolved: 'Çözüldü',
  closed: 'Kapatıldı'
} as const;

export const TICKET_PRIORITIES = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
  urgent: 'Acil'
} as const;

export const PRIORITY_COLORS = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  urgent: 'bg-red-100 text-red-800 border-red-200'
} as const;

export const STATUS_COLORS = {
  open: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-amber-100 text-amber-800 border-amber-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
  closed: 'bg-gray-100 text-gray-800 border-gray-200'
} as const;