import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  exportKPIsToCSV,
  exportKPIDetailToCSV,
  exportKPIToJSON,
  exportTicketsToCSV,
  exportTicketDetailToCSV,
  exportActivitiesToCSV
} from '../lib/export';
import { KPIStats } from '../types/kpi';
import { Ticket } from '../types/ticket';
import { Activity } from '../types/calendar';

describe('export utilities', () => {
  let mockCreateObjectURL: ReturnType<typeof vi.fn>;
  let mockAppendChild: ReturnType<typeof vi.fn>;
  let mockRemoveChild: ReturnType<typeof vi.fn>;
  let mockClick: ReturnType<typeof vi.fn>;
  let mockSetAttribute: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    global.URL.createObjectURL = mockCreateObjectURL;

    mockClick = vi.fn();
    mockSetAttribute = vi.fn();

    const mockLink = {
      setAttribute: mockSetAttribute,
      click: mockClick,
      style: { visibility: '' }
    };

    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        return mockLink as unknown;
      }
      return document.createElement(tagName);
    });

    mockAppendChild = vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as unknown);
    mockRemoveChild = vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as unknown);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('exportKPIsToCSV', () => {
    it('should throw an error if kpis array is empty', () => {
      expect(() => exportKPIsToCSV([])).toThrow('Export edilecek KPI bulunamadı');
    });

    it('should generate CSV and trigger download', () => {
      const mockKPIs: Partial<KPIStats>[] = [
        {
          id: '1',
          title: 'Test KPI',
          department: 'IT',
          period: '2023',
          priority: 'Yüksek',
          targetValue: 100,
          currentValue: 50,
          unit: '%',
          progressPercentage: 50,
          status: 'Devam Ediyor',
          startDate: '2023-01-01',
          endDate: '2023-12-31',
          remainingDays: 100,
          velocity: 0.5,
          description: 'A test description'
        }
      ];

      exportKPIsToCSV(mockKPIs as KPIStats[]);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockSetAttribute).toHaveBeenCalledWith('href', 'blob:mock-url');
      expect(mockSetAttribute).toHaveBeenCalledWith('download', expect.stringContaining('.csv'));
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
    });
  });

  describe('exportKPIDetailToCSV', () => {
    it('should generate CSV and trigger download for a single KPI detail', () => {
      const mockKPI: Partial<KPIStats> = {
        id: '1',
        title: 'Test KPI Detailed',
        department: 'IT',
        period: '2023',
        priority: 'Yüksek',
        targetValue: 100,
        currentValue: 50,
        unit: '%',
        progressPercentage: 50,
        status: 'Devam Ediyor',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        remainingDays: 100,
        velocity: 0.5,
        recentProgress: [
          {
            id: 'p1',
            value: 10,
            recordedAt: '2023-01-05T00:00:00.000Z',
            recordedBy: 'user1',
            recordedByName: 'User One',
            note: 'Progress update'
          }
        ],
        comments: [
          {
            id: 'c1',
            userId: 'user1',
            userName: 'User One',
            content: 'Great progress',
            createdAt: '2023-01-06T00:00:00.000Z'
          }
        ]
      };

      exportKPIDetailToCSV(mockKPI as KPIStats);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockSetAttribute).toHaveBeenCalledWith('href', 'blob:mock-url');
      expect(mockSetAttribute).toHaveBeenCalledWith('download', expect.stringContaining('kpi-test-kpi-detailed-'));
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
    });
  });

  describe('exportKPIToJSON', () => {
    it('should generate JSON and trigger download', () => {
      const mockKPI: Partial<KPIStats> = {
        id: '1',
        title: 'JSON Test',
        targetValue: 100
      };

      exportKPIToJSON(mockKPI as KPIStats);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockSetAttribute).toHaveBeenCalledWith('href', 'blob:mock-url');
      expect(mockSetAttribute).toHaveBeenCalledWith('download', expect.stringContaining('.json'));
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
    });
  });

  describe('exportTicketsToCSV', () => {
    it('should throw an error if tickets array is empty', () => {
      expect(() => exportTicketsToCSV([])).toThrow('Export edilecek ticket bulunamadı');
    });

    it('should generate CSV and trigger download', () => {
      const mockTickets: Partial<Ticket>[] = [
        {
          id: 't1',
          title: 'Test Ticket',
          status: 'Açık',
          priority: 'Yüksek',
          sourceDepartment: 'HR',
          targetDepartment: 'IT',
          creatorName: 'User HR',
          assignedTo: 'User IT',
          createdAt: new Date('2023-01-01T00:00:00Z').toISOString(),
          updatedAt: new Date('2023-01-02T00:00:00Z').toISOString(),
          description: 'A test ticket'
        }
      ];

      exportTicketsToCSV(mockTickets as Ticket[]);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockSetAttribute).toHaveBeenCalledWith('href', 'blob:mock-url');
      expect(mockSetAttribute).toHaveBeenCalledWith('download', expect.stringContaining('.csv'));
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
    });
  });

  describe('exportTicketDetailToCSV', () => {
    it('should generate CSV and trigger download for a single ticket detail', () => {
      const mockTicket: Partial<Ticket> = {
        id: 't1',
        title: 'Test Ticket Detailed',
        status: 'Açık',
        priority: 'Yüksek',
        sourceDepartment: 'HR',
        targetDepartment: 'IT',
        creatorName: 'User HR',
        assignedTo: 'User IT',
        createdAt: new Date('2023-01-01T00:00:00Z').toISOString(),
        updatedAt: new Date('2023-01-02T00:00:00Z').toISOString(),
        description: 'A test ticket detail',
        comments: [
          {
            id: 'c1',
            ticketId: 't1',
            authorId: 'user1',
            authorName: 'User One',
            content: 'Please look into this',
            isInternal: false,
            createdAt: new Date('2023-01-01T10:00:00Z').toISOString(),
            updatedAt: new Date('2023-01-01T10:00:00Z').toISOString()
          }
        ]
      };

      exportTicketDetailToCSV(mockTicket as Ticket);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockSetAttribute).toHaveBeenCalledWith('href', 'blob:mock-url');
      expect(mockSetAttribute).toHaveBeenCalledWith('download', expect.stringContaining('ticket-t1-'));
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
    });
  });

  describe('exportActivitiesToCSV', () => {
    it('should throw an error if activities array is empty', () => {
      expect(() => exportActivitiesToCSV([])).toThrow('Export edilecek aktivite bulunamadı');
    });

    it('should generate CSV and trigger download', () => {
      const mockActivities: Partial<Activity>[] = [
        {
          id: 'a1',
          title: 'Test Activity',
          date: '2023-01-01',
          startTime: '10:00',
          endTime: '11:00',
          duration: 60,
          description: 'A test activity'
        }
      ];

      exportActivitiesToCSV(mockActivities as Activity[]);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockSetAttribute).toHaveBeenCalledWith('href', 'blob:mock-url');
      expect(mockSetAttribute).toHaveBeenCalledWith('download', expect.stringContaining('.csv'));
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
    });
  });
});
