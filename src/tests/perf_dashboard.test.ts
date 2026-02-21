import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app, httpServer, prisma } from '../../server.js';

describe('Dashboard Performance Test', () => {
    let authToken: string;
    let testUserId: string;
    const testEmail = 'perf_test@gurgil.com';

    beforeAll(async () => {
        // Ensure database is connected
        await prisma.$connect();

        // Clean up if exists from failed previous run
        await prisma.profile.deleteMany({ where: { email: testEmail } });

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

        // Login
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

    it('measures dashboard stats response time', async () => {
        const iterations = 20;
        let totalTime = 0;

        // Warmup
        await request(app)
            .get('/api/dashboard/stats')
            .set('Authorization', `Bearer ${authToken}`);

        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            const response = await request(app)
                .get('/api/dashboard/stats')
                .set('Authorization', `Bearer ${authToken}`);
            const end = performance.now();

            expect(response.status).toBe(200);
            totalTime += (end - start);
        }

        const avgTime = totalTime / iterations;
        console.log(`\nAverage Response Time (${iterations} requests): ${avgTime.toFixed(2)}ms\n`);
    });
});
