import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app, httpServer, prisma } from '../../server.js';

describe('Dashboard Stats Tests', () => {
    let authToken: string;
    let testUserId: string;
    const testEmail = 'perf_test@gurgil.com';
    const deptName = 'PerfTestDept';

    beforeAll(async () => {
        // Ensure database is connected
        await prisma.$connect();

        // Clean up previous test run artifacts
        try {
            await prisma.ticket.deleteMany({ where: { creatorEmail: testEmail } });
            await prisma.kpiTarget.deleteMany({ where: { description: 'PerfTestKPI' } });
            await prisma.profile.deleteMany({ where: { email: testEmail } });
            await prisma.department.deleteMany({ where: { name: deptName } });
        } catch (e) {
            console.log('Cleanup ignored', e);
        }

        // 1. Create Department
        await prisma.department.create({
            data: { name: deptName }
        });

        // 2. Create Admin User
        const user = await prisma.profile.create({
            data: {
                firstName: 'Perf',
                lastName: 'Tester',
                email: testEmail,
                department: deptName,
                userRoles: {
                    create: { role: 'admin' }
                }
            }
        });
        testUserId = user.id;

        // Login to get token
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: testEmail,
                password: '123456'
            });
        authToken = response.body.token;

        // 3. Create KPIs
        // Active: 2, Completed: 1, Paused: 1 (should count as Active in total if total is just sum of all?)
        // Original code: total = count(), completed = count(status='completed'), active = count(status='active')
        // So 'paused' or 'cancelled' would be in total but not in completed or active variables.

        await prisma.kpiTarget.create({
            data: {
                title: 'Active KPI 1',
                department: deptName,
                targetValue: 100,
                unit: '%',
                startDate: '2023-01-01',
                endDate: '2023-12-31',
                period: 'yearly',
                priority: 'high',
                status: 'active',
                createdBy: testUserId,
                description: 'PerfTestKPI'
            }
        });
        await prisma.kpiTarget.create({
            data: {
                title: 'Active KPI 2',
                department: deptName,
                targetValue: 100,
                unit: '%',
                startDate: '2023-01-01',
                endDate: '2023-12-31',
                period: 'yearly',
                priority: 'medium',
                status: 'active',
                createdBy: testUserId,
                description: 'PerfTestKPI'
            }
        });
        await prisma.kpiTarget.create({
            data: {
                title: 'Completed KPI 1',
                department: deptName,
                targetValue: 100,
                unit: '%',
                startDate: '2023-01-01',
                endDate: '2023-12-31',
                period: 'yearly',
                priority: 'low',
                status: 'completed',
                createdBy: testUserId,
                description: 'PerfTestKPI'
            }
        });
         await prisma.kpiTarget.create({
            data: {
                title: 'Paused KPI 1',
                department: deptName,
                targetValue: 100,
                unit: '%',
                startDate: '2023-01-01',
                endDate: '2023-12-31',
                period: 'yearly',
                priority: 'low',
                status: 'paused',
                createdBy: testUserId,
                description: 'PerfTestKPI'
            }
        });


        // 4. Create Tickets
        // Open: 2, InProgress: 1, Resolved: 1, Closed: 1
        await prisma.ticket.create({
            data: {
                title: 'Open Ticket 1',
                description: 'Test',
                priority: 'medium',
                status: 'open',
                sourceDepartment: deptName,
                targetDepartment: deptName,
                createdBy: testUserId,
                creatorEmail: testEmail
            }
        });
        await prisma.ticket.create({
            data: {
                title: 'Open Ticket 2',
                description: 'Test',
                priority: 'medium',
                status: 'open',
                sourceDepartment: deptName,
                targetDepartment: deptName,
                createdBy: testUserId,
                creatorEmail: testEmail
            }
        });
        await prisma.ticket.create({
            data: {
                title: 'In Progress Ticket 1',
                description: 'Test',
                priority: 'high',
                status: 'in_progress',
                sourceDepartment: deptName,
                targetDepartment: deptName,
                createdBy: testUserId,
                creatorEmail: testEmail
            }
        });
         await prisma.ticket.create({
            data: {
                title: 'Resolved Ticket 1',
                description: 'Test',
                priority: 'low',
                status: 'resolved',
                sourceDepartment: deptName,
                targetDepartment: deptName,
                createdBy: testUserId,
                creatorEmail: testEmail
            }
        });
         await prisma.ticket.create({
            data: {
                title: 'Closed Ticket 1',
                description: 'Test',
                priority: 'low',
                status: 'closed',
                sourceDepartment: deptName,
                targetDepartment: deptName,
                createdBy: testUserId,
                creatorEmail: testEmail
            }
        });
    });

    afterAll(async () => {
        // Cleanup
        try {
            // Delete related data first
            await prisma.kpiAssignment.deleteMany({ where: { user: { email: testEmail } } });
            await prisma.kpiTarget.deleteMany({ where: { createdBy: testUserId } });
            await prisma.ticket.deleteMany({ where: { createdBy: testUserId } });
            await prisma.userRole.deleteMany({ where: { userId: testUserId } });
            await prisma.profile.delete({ where: { id: testUserId } });
            await prisma.department.delete({ where: { name: deptName } });
        } catch (e) {
            console.error('Cleanup error:', e);
        }

        await prisma.$disconnect();
        if (httpServer.listening) {
            httpServer.close();
        }
    });

    it('should return correct aggregated stats', async () => {
        const response = await request(app)
            .get('/api/dashboard/stats')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        const stats = response.body;

        console.log('Stats received:', stats);

        // Verify KPI stats
        // We added 4 KPIs (2 active, 1 completed, 1 paused).
        // Note: The DB might have other data from seed or other tests.
        // So we should check if values are AT LEAST what we added.
        expect(stats.totalKPIs).toBeGreaterThanOrEqual(4);
        expect(stats.activeKPIs).toBeGreaterThanOrEqual(2);
        expect(stats.completedKPIs).toBeGreaterThanOrEqual(1);

        // Verify Ticket Stats
        // We added 5 tickets (2 open, 1 in_progress, 1 resolved, 1 closed).
        expect(stats.totalTickets).toBeGreaterThanOrEqual(5);
        expect(stats.openTickets).toBeGreaterThanOrEqual(2);
        expect(stats.inProgressTickets).toBeGreaterThanOrEqual(1);
        expect(stats.completedTickets).toBeGreaterThanOrEqual(1); // 'closed' maps to completedTickets

        // Verify Tickets by Status (Pie Chart)
        const openStatus = stats.ticketsByStatus.find((s: any) => s.name === 'Açık');
        expect(openStatus.value).toBeGreaterThanOrEqual(2);

        // Verify Tickets by Department
        const deptStat = stats.ticketsByDepartment.find((d: any) => d.name === deptName);
        expect(deptStat).toBeDefined();
        expect(deptStat.value).toBeGreaterThanOrEqual(5); // All 5 tickets targeted this dept
    });
});
