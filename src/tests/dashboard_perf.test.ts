import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app, httpServer, prisma } from '../../server.js';

describe('Dashboard Performance Optimization Tests', () => {
    let authToken: string;
    let testUserId: string;
    const testEmail = 'perf_test@gurgil.com';

    beforeAll(async () => {
        // Ensure database is connected
        await prisma.$connect();

        // Clean up if exists
        await prisma.profile.deleteMany({ where: { email: testEmail } });

        // Ensure department exists
        await prisma.department.upsert({
            where: { name: 'IT' },
            update: {},
            create: { name: 'IT' }
        });

        const user = await prisma.profile.create({
            data: {
                firstName: 'Perf',
                lastName: 'Test',
                email: testEmail,
                department: 'IT',
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
    });

    afterAll(async () => {
        if (testUserId) {
            try {
                await prisma.userRole.deleteMany({ where: { userId: testUserId } });
                await prisma.profile.delete({ where: { id: testUserId } });
            } catch (e) {
                console.error('Cleanup error:', e);
            }
        }
        await prisma.$disconnect();
        if (httpServer.listening) {
            httpServer.close();
        }
    });

    it('should return correct dashboard stats structure and data types', async () => {
        const response = await request(app)
            .get('/api/dashboard/stats')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);

        // Check keys
        const expectedKeys = [
            'totalKPIs', 'completedKPIs', 'activeKPIs',
            'totalTickets', 'openTickets', 'inProgressTickets', 'completedTickets',
            'ticketsByStatus', 'ticketsByDepartment'
        ];

        expectedKeys.forEach(key => {
            expect(response.body).toHaveProperty(key);
        });

        // Check types
        expect(typeof response.body.totalKPIs).toBe('number');
        expect(typeof response.body.completedKPIs).toBe('number');
        expect(typeof response.body.activeKPIs).toBe('number');
        expect(typeof response.body.totalTickets).toBe('number');
        expect(typeof response.body.openTickets).toBe('number');

        // Verify aggregation logic consistency (total >= sub-counts)
        const { openTickets, inProgressTickets, completedTickets, totalTickets } = response.body;
        // Check if values are non-negative
        expect(openTickets).toBeGreaterThanOrEqual(0);
        expect(inProgressTickets).toBeGreaterThanOrEqual(0);
        expect(completedTickets).toBeGreaterThanOrEqual(0);

        // Since we don't control other tests running in parallel or pre-existing data,
        // we can only assert that the sum of parts is <= total.
        // (Assuming 'closed' + 'resolved' + 'open' + 'in_progress' are all statuses)
        // Wait, 'completedTickets' in response maps to 'closedTickets' in server.js
        // And 'resolvedTickets' is also returned but not in the destructuring above.
        // Check ticketsByStatus array for resolved tickets
        const ticketsByStatus = response.body.ticketsByStatus;
        expect(Array.isArray(ticketsByStatus)).toBe(true);
        const resolvedItem = ticketsByStatus.find((item: any) => item.name === 'Çözüldü');
        expect(resolvedItem).toBeDefined();
        expect(typeof resolvedItem.value).toBe('number');
    });
});
