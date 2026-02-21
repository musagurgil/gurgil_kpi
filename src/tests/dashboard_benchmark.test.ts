import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app, httpServer, prisma } from '../../server.js';

describe('Dashboard Performance Benchmark', () => {
    let authToken: string;
    let testUserId: string;
    const testEmail = 'benchmark_admin@gurgil.com';

    beforeAll(async () => {
        // Ensure database is connected
        await prisma.$connect();

        // Clean up if exists
        await prisma.profile.deleteMany({ where: { email: testEmail } });

        // Create admin user
        const user = await prisma.profile.create({
            data: {
                firstName: 'Benchmark',
                lastName: 'Admin',
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

    it('measures /api/dashboard/stats performance', async () => {
        const iterations = 20;
        const durations: number[] = [];

        // Warm up
        await request(app)
            .get('/api/dashboard/stats')
            .set('Authorization', `Bearer ${authToken}`);

        console.log(`\nStarting benchmark (${iterations} iterations)...`);

        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            const response = await request(app)
                .get('/api/dashboard/stats')
                .set('Authorization', `Bearer ${authToken}`);
            const end = performance.now();

            expect(response.status).toBe(200);
            durations.push(end - start);
        }

        const average = durations.reduce((a, b) => a + b, 0) / durations.length;
        const min = Math.min(...durations);
        const max = Math.max(...durations);

        console.log('\n📊 Dashboard Stats Benchmark Results:');
        console.log(`   Average: ${average.toFixed(2)}ms`);
        console.log(`   Min:     ${min.toFixed(2)}ms`);
        console.log(`   Max:     ${max.toFixed(2)}ms`);
        console.log('-----------------------------------');
    });
});
