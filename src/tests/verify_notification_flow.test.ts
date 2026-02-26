import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app, prisma } from '../../server.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

describe('Notification Flow Verification', () => {
  let adminToken: string;
  let adminId: string;
  let employeeToken: string;
  let employeeId: string;
  const deptName = `NotifTestDept_${Date.now()}`;

  beforeAll(async () => {
    // 1. Create Department
    await prisma.department.create({ data: { name: deptName } });

    // 2. Create Admin User (who receives notifications)
    const adminUser = await prisma.profile.create({
      data: {
        email: `admin_${Date.now()}@example.com`,
        firstName: 'Admin',
        lastName: 'User',
        department: deptName,
        passwordHash: 'hash',
        userRoles: {
          create: { role: 'admin' }
        }
      }
    });
    adminId = adminUser.id;
    adminToken = jwt.sign({
      id: adminUser.id,
      email: adminUser.email,
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
      department: adminUser.department,
      roles: ['admin']
    }, JWT_SECRET);

    // 3. Create Employee User (who creates ticket)
    const empUser = await prisma.profile.create({
      data: {
        email: `emp_${Date.now()}@example.com`,
        firstName: 'Employee',
        lastName: 'User',
        department: deptName,
        passwordHash: 'hash',
        userRoles: {
          create: { role: 'employee' }
        }
      }
    });
    employeeId = empUser.id;
    employeeToken = jwt.sign({
      id: empUser.id,
      email: empUser.email,
      firstName: empUser.firstName,
      lastName: empUser.lastName,
      department: empUser.department,
      roles: ['employee']
    }, JWT_SECRET);
  });

  afterAll(async () => {
    // Cleanup
    await prisma.notification.deleteMany({
      where: { userId: adminId }
    });
    await prisma.ticket.deleteMany({
      where: { targetDepartment: deptName }
    });
    await prisma.profile.deleteMany({
      where: { department: deptName }
    });
    await prisma.department.delete({
      where: { name: deptName }
    });
    await prisma.$disconnect();
  });

  it('should create a notification when a ticket is created', async () => {
    // 1. Create Ticket
    const ticketRes = await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        title: 'Test Ticket for Notification',
        description: 'Testing if notification is created',
        priority: 'high',
        targetDepartment: deptName
      });

    expect(ticketRes.status).toBe(200);
    const ticketId = ticketRes.body.id;

    // 2. Check if Admin received notification
    // Wait a bit for async processing (though createNotifications is awaited in the route handler,
    // so it should be immediate in the DB)

    const notifications = await prisma.notification.findMany({
      where: {
        userId: adminId,
        category: 'ticket',
        link: `/tickets#${ticketId}`
      }
    });

    expect(notifications.length).toBeGreaterThan(0);
    expect(notifications[0].title).toContain('Yeni Ticket');
    expect(notifications[0].priority).toBe('medium'); // High priority ticket -> Medium notification priority mapping logic
  });
});
