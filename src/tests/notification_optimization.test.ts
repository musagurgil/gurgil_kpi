import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../../server.js';

describe('Notification Performance Optimization', () => {
    let userIds: string[] = [];
    const NUM_USERS = 50; // Enough to show difference

    beforeAll(async () => {
        // Ensure database is connected
        await prisma.$connect();

        // Create dummy users for testing
        // We need a department first
        let dept = await prisma.department.findUnique({ where: { name: 'TestDept' } });
        if (!dept) {
            dept = await prisma.department.create({ data: { name: 'TestDept' } });
        }

        // Create users
        const usersData = Array.from({ length: NUM_USERS }, (_, i) => ({
            email: `perf_test_user_${i}@example.com`,
            firstName: `PerfUser${i}`,
            lastName: 'Test',
            department: 'TestDept',
            passwordHash: 'hash'
        }));

        // Batch create users
        // Profile creation needs to be done carefully as email must be unique
        // We'll delete them first just in case
        await prisma.profile.deleteMany({
            where: {
                email: { in: usersData.map(u => u.email) }
            }
        });

        // Use createMany for users too if supported, but Profile has relations (department)
        // createMany is supported for simple models. Profile has a foreign key to Department.
        // It should work.
        // Wait, Profile id is CUID by default. createMany doesn't generate CUIDs automatically if not provided?
        // Actually Prisma handles default CUID generation in createMany.

        // But let's stick to createMany for users to speed up setup.
        await prisma.profile.createMany({
            data: usersData
        });

        // Fetch back the users to get their IDs
        const users = await prisma.profile.findMany({
            where: {
                email: { in: usersData.map(u => u.email) }
            },
            select: { id: true }
        });
        userIds = users.map(u => u.id);
    });

    afterAll(async () => {
        // Cleanup
        if (userIds.length > 0) {
            await prisma.notification.deleteMany({
                where: { userId: { in: userIds } }
            });
            await prisma.profile.deleteMany({
                where: { id: { in: userIds } }
            });
        }
        await prisma.$disconnect();
    });

    it('should be faster to use createMany than sequential creates', async () => {
        // 1. Sequential Creation
        const startSequential = performance.now();
        for (const userId of userIds) {
            await prisma.notification.create({
                data: {
                    userId,
                    category: 'test_seq',
                    priority: 'low',
                    title: 'Sequential Test',
                    message: 'This is a test notification',
                    isRead: false
                }
            });
        }
        const endSequential = performance.now();
        const durationSequential = endSequential - startSequential;

        // 2. Optimized (createMany)
        const startOptimized = performance.now();

        // Create notifications
        await prisma.notification.createMany({
            data: userIds.map(userId => ({
                userId,
                category: 'test_opt',
                priority: 'low',
                title: 'Optimized Test',
                message: 'This is a test notification',
                isRead: false
            }))
        });

        // Fetch back (simulating the need to get IDs for emission)
        // We can fetch by category and creation time window
        const now = new Date();
        const oneMinuteAgo = new Date(now.getTime() - 60000);

        const notifications = await prisma.notification.findMany({
            where: {
                userId: { in: userIds },
                category: 'test_opt',
                createdAt: { gte: oneMinuteAgo }
            }
        });

        const endOptimized = performance.now();
        const durationOptimized = endOptimized - startOptimized;

        // Assertions
        expect(notifications.length).toBe(NUM_USERS);

        // Expect optimized to be faster
        // Note: In some environments with small N, overhead might make them close, but with N=50 it should be faster.
        // Let's be conservative.
        expect(durationOptimized).toBeLessThan(durationSequential);
    });
});
