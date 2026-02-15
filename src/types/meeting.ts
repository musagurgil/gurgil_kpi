export interface MeetingRoom {
    id: string;
    name: string;
    capacity: number;
    location: string;
    description?: string;
    responsibleId?: string;
    responsible?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    createdAt: string;
    updatedAt: string;
    reservations?: MeetingReservation[];
}

export interface MeetingReservation {
    id: string;
    roomId: string;
    requestedBy: string;
    approvedBy?: string;
    startTime: string;
    endTime: string;
    status: 'pending' | 'approved' | 'rejected';
    notes?: string;
    createdAt: string;
    updatedAt: string;

    // Relations
    room?: MeetingRoom;
    requester?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        department: string;
    };
    approver?: {
        id: string;
        firstName: string;
        lastName: string;
    };
}

export interface CreateMeetingRoomData {
    name: string;
    capacity: number;
    location: string;
    description?: string;
}

export interface CreateMeetingReservationData {
    roomId: string;
    startTime: string;
    endTime: string;
    notes?: string;
}

export const RESERVATION_STATUSES = {
    pending: 'Onay Bekliyor',
    approved: 'Onaylandı',
    rejected: 'Reddedildi'
} as const;

export const RESERVATION_STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200'
} as const;
