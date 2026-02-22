import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app, httpServer, prisma } from '../../server.js';

describe('Backend Integration Tests', () => {
    let authToken: string;
    let testUserId: string;
    const testEmail = 'test_backend@gurgil.com';
    // Password created in DB doesn't matter as logic checks for hardcoded '123456'
    // Also Profile model doesn't have password field.

    beforeAll(async () => {
        // Ensure database is connected
        await prisma.$connect();

        // Clean up if exists from failed previous run
        await prisma.profile.deleteMany({ where: { email: testEmail } });

        // Ensure Department exists
        const dept = await prisma.department.findUnique({ where: { name: 'IT' } });
        if (!dept) {
            await prisma.department.create({ data: { name: 'IT' } });
        }

        const user = await prisma.profile.create({
            data: {
                firstName: 'Test',
                lastName: 'Backend',
                email: testEmail,
                department: 'IT',
                userRoles: {
                    create: { role: 'admin' } // Give admin role to access dashboard
                }
            }
        });
        testUserId = user.id;
    });

    afterAll(async () => {
        // Clean up
        if (testUserId) {
            try {
                // Delete related data first
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

    describe('Authentication', () => {
        it('should login successfully with valid credentials (hardcoded password)', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testEmail,
                    password: '123456' // Logic requires exactly this password
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            authToken = response.body.token;
        });

        it('should fail with invalid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testEmail,
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(401);
        });
    });

    describe('Dashboard API', () => {
        it('should return dashboard stats when authenticated', async () => {
            const response = await request(app)
                .get('/api/dashboard/stats')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('totalKPIs');
            expect(response.body).toHaveProperty('ticketsByStatus');
            expect(Array.isArray(response.body.ticketsByStatus)).toBe(true);
        });

        it('should fail to return stats without authentication', async () => {
            const response = await request(app)
                .get('/api/dashboard/stats');

            expect(response.status).toBe(401); // Unauthorized
        });
    });
});
