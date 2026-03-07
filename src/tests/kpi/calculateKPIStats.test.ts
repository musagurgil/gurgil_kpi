import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RawKPI, calculateKPIStats } from '../../types/kpi';

describe('calculateKPIStats', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('handles KPI with 0 target (missing or edge case) without throwing divide-by-zero errors', () => {
        const kpi = {
            id: 'kpi-1',
            title: 'Test KPI',
            department: 'IT',
            targetValue: 0,
            currentValue: 5,
            unit: 'points',
            startDate: '2024-01-01T00:00:00Z',
            endDate: '2024-01-31T23:59:59Z',
            period: 'monthly' as const,
            priority: 'medium' as const,
            status: 'active' as const,
            createdBy: 'user-1',
            assignedTo: [],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            progress: [
                {
                    id: 'p1',
                    kpiId: 'kpi-1',
                    userId: 'user-1',
                    value: 5,
                    recordedAt: '2024-01-10T00:00:00Z',
                    recordedBy: 'user-1',
                    createdAt: '2024-01-10T00:00:00Z'
                }
            ],
            assignments: [],
            comments: []
        };

        const stats = calculateKPIStats(kpi);

        expect(stats.kpiId).toBe('kpi-1');
        expect(stats.currentValue).toBe(5);
        expect(stats.progressPercentage).toBe(0);
        expect(stats.status).toBe('warning');
        expect(stats.velocity).toBeGreaterThan(0);
    });

    it('calculates stats correctly for missing optional arrays (progress, assignments, comments)', () => {
        const kpi = {
            id: 'kpi-2',
            title: 'Test KPI 2',
            department: 'IT',
            targetValue: 100,
            currentValue: 0,
            unit: 'points',
            startDate: '2024-01-01T00:00:00Z',
            endDate: '2024-01-31T23:59:59Z',
            period: 'monthly' as const,
            priority: 'medium' as const,
            status: 'active' as const,
            createdBy: 'user-1',
            assignedTo: [],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
        };

        const stats = calculateKPIStats(kpi);

        expect(stats.kpiId).toBe('kpi-2');
        expect(stats.currentValue).toBe(0);
        expect(stats.progressPercentage).toBe(0);
        expect(stats.assignedUsers).toEqual([]);
        expect(stats.recentProgress).toEqual([]);
        expect(stats.comments).toEqual([]);
    });

    it('handles KPI with missing progress array but currentValue exists', () => {
        const kpi = {
            id: 'kpi-3',
            title: 'Test KPI 3',
            department: 'IT',
            targetValue: 100,
            currentValue: 10,
            unit: 'points',
            startDate: '2024-01-01T00:00:00Z',
            endDate: '2024-01-31T23:59:59Z',
            period: 'monthly' as const,
            priority: 'medium' as const,
            status: 'active' as const,
            createdBy: 'user-1',
            assignedTo: [],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
        };

        const stats = calculateKPIStats(kpi);

        expect(stats.kpiId).toBe('kpi-3');
        expect(stats.currentValue).toBe(0);
        expect(stats.progressPercentage).toBe(0);
    });
});
