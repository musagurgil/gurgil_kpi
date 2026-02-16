import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // In production, replace with specific frontend URL
    methods: ["GET", "POST"]
  }
});

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// Socket.io Connection Handler
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_user_room', (userId) => {
    if (userId) {
      socket.join(`user:${userId}`);
      console.log(`Socket ${socket.id} joined room user:${userId}`);
    }
  });

  socket.on('join_department_room', (department) => {
    if (department) {
      socket.join(`dept:${department}`);
      console.log(`Socket ${socket.id} joined room dept:${department}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});


// Helper function to create notifications
async function createNotification(userId, category, priority, title, message, link = null) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        category,
        priority,
        title,
        message,
        link,
        isRead: false
      }
    });

    // Real-time notification emission
    io.to(`user:${userId}`).emit('new_notification', notification);

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

// Helper function to check KPI deadline and create notifications
async function checkKPIDeadlineAndNotify(kpi) {
  const now = new Date();
  const endDate = new Date(kpi.endDate);
  const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Notify if deadline is approaching (7 days or less)
  if (daysRemaining > 0 && daysRemaining <= 7) {
    // Notify all assigned users
    const assignments = await prisma.kpiAssignment.findMany({
      where: { kpiId: kpi.id }
    });

    for (const assignment of assignments) {
      await createNotification(
        assignment.userId,
        'kpi',
        'high',
        `⏰ KPI Deadline Yaklaşıyor: ${kpi.title}`,
        `"${kpi.title}" KPI'sının bitiş tarihine ${daysRemaining} gün kaldı. Hedefin %${((kpi.currentValue / kpi.targetValue) * 100).toFixed(1)}'i tamamlandı.`,
        `/kpi`
      );
    }
  }

  // Notify if deadline passed
  if (daysRemaining < 0 && kpi.status === 'active') {
    const assignments = await prisma.kpiAssignment.findMany({
      where: { kpiId: kpi.id }
    });

    for (const assignment of assignments) {
      await createNotification(
        assignment.userId,
        'kpi',
        'critical',
        `🚨 KPI Süresi Doldu: ${kpi.title}`,
        `"${kpi.title}" KPI'sının bitiş tarihi ${Math.abs(daysRemaining)} gün önce geçti. Lütfen durumu güncelleyin.`,
        `/kpi`
      );
    }
  }
}

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const profile = await prisma.profile.findUnique({
      where: { email },
      include: { userRoles: true }
    });

    if (!profile) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // For now, we'll use a simple password check
    // In production, you should hash passwords
    if (password !== '123456') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = {
      id: profile.id,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      department: profile.department,
      roles: profile.userRoles.map(ur => ur.role)
    };

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

    res.json({ user, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName, department } = req.body;

    // Check if user already exists
    const existingUser = await prisma.profile.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const profile = await prisma.profile.create({
      data: {
        email,
        firstName,
        lastName,
        department,
        userRoles: {
          create: { role: 'employee' }
        }
      },
      include: { userRoles: true }
    });

    const user = {
      id: profile.id,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      department: profile.department,
      roles: profile.userRoles.map(ur => ur.role)
    };

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

    res.json({ user, token });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// General user routes
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const { department } = req.query;

    const whereClause = {
      isActive: true
    };

    if (department) {
      whereClause.department = department;
    }

    const users = await prisma.profile.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        department: true,
        userRoles: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { firstName: 'asc' }
    });

    // Transform to flat structure if needed, or keep as is.
    // Frontend expects 'role' property, so let's map it ensuring we pick the primary role or list them.
    // The mock data used 'role' string.
    const mappedUsers = users.map(u => ({
      ...u,
      role: u.userRoles.length > 0 ? u.userRoles[0].role : 'employee'
    }));

    res.json(mappedUsers);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User management routes
app.get('/api/admin/profiles', authenticateToken, async (req, res) => {
  try {
    const profiles = await prisma.profile.findMany({
      include: { userRoles: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json(profiles);
  } catch (error) {
    console.error('Get profiles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/profiles', authenticateToken, async (req, res) => {
  try {
    const { email, firstName, lastName, department, roles } = req.body;

    // First, check if department exists, if not create it
    let departmentRecord = await prisma.department.findUnique({
      where: { name: department }
    });

    if (!departmentRecord) {
      departmentRecord = await prisma.department.create({
        data: { name: department }
      });
    }

    const profile = await prisma.profile.create({
      data: {
        email,
        firstName,
        lastName,
        department,
        userRoles: {
          create: roles.map(role => ({ role }))
        }
      },
      include: { userRoles: true }
    });

    res.json(profile);
  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/profiles/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, firstName, lastName, department, roles } = req.body;

    console.log(`[UPDATE PROFILE] User: ${req.user.email}, Profile ID: ${id}`);
    console.log(`[UPDATE PROFILE] Data:`, { email, firstName, lastName, department, roles });

    // Check if user has admin role
    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    if (!isAdmin) {
      console.log(`[UPDATE PROFILE] Unauthorized: User is not admin`);
      return res.status(403).json({ error: 'Only admins can update profiles' });
    }

    // Check if department exists, if not create it
    if (department) {
      const existingDept = await prisma.department.findUnique({
        where: { name: department }
      });

      if (!existingDept) {
        console.log(`[UPDATE PROFILE] Creating new department: ${department}`);
        await prisma.department.create({
          data: { name: department }
        });
      }
    }

    // Check if profile exists
    const existingProfile = await prisma.profile.findUnique({
      where: { id },
      include: { userRoles: true }
    });

    if (!existingProfile) {
      console.log(`[UPDATE PROFILE] Profile not found: ${id}`);
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Update profile
    const profile = await prisma.profile.update({
      where: { id },
      data: {
        email,
        firstName,
        lastName,
        department
      },
      include: { userRoles: true }
    });

    console.log(`[UPDATE PROFILE] Profile updated successfully`);

    // Update roles
    await prisma.userRole.deleteMany({
      where: { userId: id }
    });

    if (roles && roles.length > 0) {
      await prisma.userRole.createMany({
        data: roles.map(role => ({
          userId: id,
          role
        }))
      });
      console.log(`[UPDATE PROFILE] Roles updated:`, roles);
    }

    const updatedProfile = await prisma.profile.findUnique({
      where: { id },
      include: { userRoles: true }
    });

    console.log(`[UPDATE PROFILE] Success: Profile ${id} updated`);
    res.json(updatedProfile);
  } catch (error) {
    console.error('Update profile error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      meta: error.meta
    });
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Deactivate profile endpoint (Soft Delete)
app.post('/api/admin/profiles/:id/deactivate', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await prisma.profile.findUnique({
      where: { id },
      include: {
        ticketsAssigned: { where: { status: { not: 'closed' } } },
        kpiAssignments: { where: { kpi: { status: 'active' } } }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Deactivate user
    await prisma.profile.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({
      success: true,
      activeAssets: {
        tickets: user.ticketsAssigned.length,
        kpis: user.kpiAssignments.length
      }
    });
  } catch (error) {
    console.error('Deactivate profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Transfer assets endpoint
app.post('/api/admin/profiles/transfer', authenticateToken, async (req, res) => {
  try {
    const { fromUserId, toUserId, transferTickets, transferKpis } = req.body;

    console.log(`[TRANSFER] From: ${fromUserId} To: ${toUserId}`);

    if (!fromUserId || !toUserId) {
      return res.status(400).json({ error: 'Source and target users are required' });
    }

    const targetUser = await prisma.profile.findUnique({ where: { id: toUserId } });
    if (!targetUser) {
      return res.status(404).json({ error: 'Target user not found' });
    }

    const results = {
      tickets: 0,
      kpis: 0
    };

    // Transfer Tickets
    if (transferTickets) {
      const tickets = await prisma.ticket.updateMany({
        where: { assignedTo: fromUserId, status: { not: 'closed' } },
        data: { assignedTo: toUserId }
      });
      results.tickets = tickets.count;

      // Add system note to transferred tickets (optional, but good for history)
      // We can't easily do this in bulk with prisma, so we skip for now or do it in loop if needed.
    }

    // Transfer KPIs
    if (transferKpis) {
      // 1. Find all active assignments for old user
      const assignments = await prisma.kpiAssignment.findMany({
        where: { userId: fromUserId, kpi: { status: 'active' } }
      });

      for (const assignment of assignments) {
        // 2. Check if target user already assigned
        const existingAssignment = await prisma.kpiAssignment.findUnique({
          where: { kpiId_userId: { kpiId: assignment.kpiId, userId: toUserId } }
        });

        if (!existingAssignment) {
          // Reassign
          await prisma.kpiAssignment.update({
            where: { id: assignment.id },
            data: { userId: toUserId }
          });
          results.kpis++;
        } else {
          // Target user already has this KPI, just remove old assignment
          await prisma.kpiAssignment.delete({ where: { id: assignment.id } });
        }
      }
    }

    res.json({ success: true, transferred: results });

  } catch (error) {
    console.error('Transfer assets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Safer Delete Profile Endpoint
app.delete('/api/admin/profiles/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check for linked data manually since we removed Cascade
    const user = await prisma.profile.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            ticketsCreated: true,
            kpiProgress: true,
            ticketComments: true,
            kpiComments: true
          }
        }
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const hasLinkedData = user._count.ticketsCreated > 0 ||
      user._count.kpiProgress > 0 ||
      user._count.ticketComments > 0 ||
      user._count.kpiComments > 0;

    if (hasLinkedData) {
      return res.status(400).json({
        error: 'Cannot delete user with history. Please deactivate instead.',
        requiresDeactivation: true
      });
    }

    await prisma.profile.delete({
      where: { id }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// KPI routes
app.get('/api/kpis', authenticateToken, async (req, res) => {
  try {
    const user = req.user;

    // Build where clause based on user role and department
    let whereClause = {};

    const isAdmin = user.roles && user.roles.includes('admin');
    const isDepartmentManager = user.roles && user.roles.includes('department_manager');
    const isBoardMember = user.roles && user.roles.includes('board_member');

    if (isAdmin || isBoardMember) {
      // Admin and Board Members can see all KPIs
      whereClause = {};
    } else if (isDepartmentManager) {
      // Department manager can see KPIs from their department
      whereClause = {
        OR: [
          { department: user.department },
          {
            assignments: {
              some: {
                user: {
                  department: user.department
                }
              }
            }
          }
        ]
      };
    } else {
      // Regular users can only see KPIs assigned to them or from their department
      whereClause = {
        OR: [
          {
            assignments: {
              some: {
                userId: user.id
              }
            }
          },
          { department: user.department }
        ]
      };
    }

    const kpis = await prisma.kpiTarget.findMany({
      where: whereClause,
      include: {
        progress: {
          include: {
            recorder: true // Include user who recorded the progress
          }
        },
        comments: true,
        assignments: {
          include: {
            user: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform progress records to include user names
    const kpisWithUserNames = kpis.map(kpi => ({
      ...kpi,
      progress: kpi.progress.map(p => ({
        ...p,
        recordedByName: `${p.recorder?.firstName || ''} ${p.recorder?.lastName || ''}`.trim() || p.recordedBy
      }))
    }));

    res.json(kpisWithUserNames);
  } catch (error) {
    console.error('Get KPIs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/kpis', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const { title, description, department, targetValue, unit, startDate, endDate, period, priority, assignedTo } = req.body;

    console.log(`[KPI CREATE] User: ${user.email}`);
    console.log(`[KPI CREATE] Request body:`, { title, description, department, targetValue, unit, startDate, endDate, period, priority, assignedTo });

    // Check if user can create KPIs
    console.log('User roles:', user.roles);
    const isAdmin = user.roles && user.roles.includes('admin');
    const isDepartmentManager = user.roles && user.roles.includes('department_manager');
    console.log('isAdmin:', isAdmin, 'isDepartmentManager:', isDepartmentManager);

    if (!isAdmin && !isDepartmentManager) {
      return res.status(403).json({ error: 'Only admins and department managers can create KPIs' });
    }

    // Department managers can only create KPIs for their department
    if (isDepartmentManager && !isAdmin && department !== user.department) {
      return res.status(403).json({ error: 'Department managers can only create KPIs for their own department' });
    }

    const kpi = await prisma.kpiTarget.create({
      data: {
        title,
        description,
        department,
        targetValue,
        unit,
        startDate,
        endDate,
        period,
        priority,
        status: 'active',
        createdBy: user.id,
        assignments: {
          create: assignedTo.map(userId => ({ userId }))
        }
      },
      include: {
        progress: {
          include: {
            recorder: true
          }
        },
        comments: true,
        assignments: {
          include: {
            user: true
          }
        }
      }
    });

    // Transform progress records to include user names
    const kpiWithUserNames = {
      ...kpi,
      progress: kpi.progress.map(p => ({
        ...p,
        recordedByName: `${p.recorder?.firstName || ''} ${p.recorder?.lastName || ''}`.trim() || p.recordedBy
      }))
    };

    // Check deadline and create notifications
    await checkKPIDeadlineAndNotify(kpi);

    // Notify assigned users about new KPI
    for (const userId of assignedTo) {
      await createNotification(
        userId,
        'kpi',
        'medium',
        `📊 Yeni KPI Ataması: ${kpi.title}`,
        `Size "${kpi.title}" KPI'sı atandı. Hedef: ${kpi.targetValue} ${kpi.unit}, Bitiş: ${new Date(kpi.endDate).toLocaleDateString('tr-TR')}`,
        `/kpi`
      );
    }

    console.log(`[KPI CREATE] Successfully created KPI:`, { id: kpi.id, title: kpi.title });
    res.json(kpiWithUserNames);
  } catch (error) {
    console.error('Create KPI error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// KPI update endpoint
app.put('/api/kpis/:id', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const kpiId = req.params.id;
    const { title, description, department, targetValue, unit, startDate, endDate, period, priority, assignedTo } = req.body;

    console.log(`[KPI UPDATE] User: ${user.email}, KPI ID: ${kpiId}`);
    console.log(`[KPI UPDATE] Request body:`, { title, description, department, targetValue, unit, startDate, endDate, period, priority, assignedTo });

    // Check if KPI exists
    const existingKpi = await prisma.kpiTarget.findUnique({
      where: { id: kpiId },
      include: { assignments: true }
    });

    if (!existingKpi) {
      console.log(`[KPI UPDATE] KPI not found: ${kpiId}`);
      return res.status(404).json({ error: 'KPI not found' });
    }

    console.log(`[KPI UPDATE] Found existing KPI:`, { id: existingKpi.id, title: existingKpi.title, department: existingKpi.department });

    // Check if user can update this KPI
    const isAdmin = user.roles && user.roles.includes('admin');
    const isDepartmentManager = user.roles && user.roles.includes('department_manager');

    if (!isAdmin && !isDepartmentManager) {
      return res.status(403).json({ error: 'Only admins and department managers can update KPIs' });
    }

    // Department managers can only update KPIs for their department
    if (isDepartmentManager && !isAdmin && existingKpi.department !== user.department) {
      return res.status(403).json({ error: 'Department managers can only update KPIs from their own department' });
    }

    // Department managers can only update KPIs for their department
    if (isDepartmentManager && !isAdmin && department !== user.department) {
      return res.status(403).json({ error: 'Department managers can only update KPIs for their own department' });
    }

    // Update KPI
    const updateData = {
      title,
      description,
      department,
      targetValue,
      unit,
      startDate,
      endDate,
      period,
      priority
    };

    // Only update assignments if assignedTo is provided and is an array
    if (assignedTo && Array.isArray(assignedTo)) {
      updateData.assignments = {
        deleteMany: {},
        create: assignedTo.map(userId => ({ userId }))
      };
    }

    console.log(`[KPI UPDATE] Updating KPI with data:`, updateData);

    const updatedKpi = await prisma.kpiTarget.update({
      where: { id: kpiId },
      data: updateData,
      include: {
        progress: {
          include: {
            recorder: true
          }
        },
        comments: true,
        assignments: {
          include: {
            user: true
          }
        }
      }
    });

    // Transform progress records to include user names
    const kpiWithUserNames = {
      ...updatedKpi,
      progress: updatedKpi.progress.map(p => ({
        ...p,
        recordedByName: `${p.recorder?.firstName || ''} ${p.recorder?.lastName || ''}`.trim() || p.recordedBy
      }))
    };

    console.log(`[KPI UPDATE] Successfully updated KPI:`, { id: updatedKpi.id, title: updatedKpi.title });
    res.json(kpiWithUserNames);
  } catch (error) {
    console.error('Update KPI error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// KPI delete endpoint
app.delete('/api/kpis/:id', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const kpiId = req.params.id;

    // Check if KPI exists
    const existingKpi = await prisma.kpiTarget.findUnique({
      where: { id: kpiId }
    });

    if (!existingKpi) {
      return res.status(404).json({ error: 'KPI not found' });
    }

    // Check if user can delete KPIs
    const isAdmin = user.roles && user.roles.includes('admin');
    const isDepartmentManager = user.roles && user.roles.includes('department_manager');

    if (!isAdmin && !isDepartmentManager) {
      return res.status(403).json({ error: 'Only admins and department managers can delete KPIs' });
    }

    // Department managers can only delete KPIs from their department
    if (isDepartmentManager && !isAdmin && existingKpi.department !== user.department) {
      return res.status(403).json({ error: 'Department managers can only delete KPIs from their own department' });
    }

    // Delete KPI
    await prisma.kpiTarget.delete({
      where: { id: kpiId }
    });

    res.json({ message: 'KPI deleted successfully' });
  } catch (error) {
    console.error('Delete KPI error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// KPI progress recording endpoint
app.post('/api/kpis/:id/progress', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const kpiId = req.params.id;
    const { value, note } = req.body;

    // Check if KPI exists
    const kpi = await prisma.kpiTarget.findUnique({
      where: { id: kpiId },
      include: { assignments: true }
    });

    if (!kpi) {
      return res.status(404).json({ error: 'KPI not found' });
    }

    // Check if user can record progress
    const isAdmin = user.roles && user.roles.includes('admin');
    const isDepartmentManager = user.roles && user.roles.includes('department_manager');

    const canRecordProgress = isAdmin ||
      (isDepartmentManager && kpi.department === user.department) ||
      kpi.assignments.some(assignment => assignment.userId === user.id);

    if (!canRecordProgress) {
      return res.status(403).json({ error: 'You cannot record progress for this KPI' });
    }

    // Record progress
    const progress = await prisma.kpiProgress.create({
      data: {
        kpiId,
        userId: user.id,
        value,
        note,
        recordedBy: user.id
      }
    });

    // Update KPI current value
    const updatedKpi = await prisma.kpiTarget.findUnique({
      where: { id: kpiId },
      include: {
        progress: true,
        assignments: true
      }
    });

    if (updatedKpi) {
      // Calculate new total
      const totalProgress = updatedKpi.progress.reduce((sum, p) => sum + p.value, 0);
      const progressPercentage = (totalProgress / updatedKpi.targetValue) * 100;

      // Check if KPI is completed
      if (progressPercentage >= 100) {
        // Notify all assigned users about completion
        for (const assignment of updatedKpi.assignments) {
          await createNotification(
            assignment.userId,
            'kpi',
            'high',
            `🎉 KPI Tamamlandı: ${updatedKpi.title}`,
            `"${updatedKpi.title}" KPI'sı %100 tamamlandı! ${user.firstName} ${user.lastName} son ilerlemeyi kaydetti.`,
            `/kpi`
          );
        }
      } else if (progressPercentage >= 75) {
        // Notify about significant progress
        for (const assignment of updatedKpi.assignments) {
          if (assignment.userId !== user.id) { // Don't notify the person who recorded
            await createNotification(
              assignment.userId,
              'kpi',
              'medium',
              `📈 KPI İlerlemesi: ${updatedKpi.title}`,
              `"${updatedKpi.title}" KPI'sında %${progressPercentage.toFixed(1)} ilerleme kaydedildi. ${user.firstName} ${user.lastName} +${value} ${updatedKpi.unit} ekledi.`,
              `/kpi`
            );
          }
        }
      }

      // Check deadline
      await checkKPIDeadlineAndNotify(updatedKpi);
    }

    // Add user name to the response
    const progressWithUser = {
      ...progress,
      recordedByName: `${user.firstName} ${user.lastName}`
    };

    res.json(progressWithUser);
  } catch (error) {
    console.error('Record KPI progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// KPI comment endpoint
app.post('/api/kpis/:id/comments', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const kpiId = req.params.id;
    const { content } = req.body;

    // Check if KPI exists
    const kpi = await prisma.kpiTarget.findUnique({
      where: { id: kpiId },
      include: { assignments: true }
    });

    if (!kpi) {
      return res.status(404).json({ error: 'KPI not found' });
    }

    // Check if user can comment
    const isAdmin = user.roles && user.roles.includes('admin');
    const isDepartmentManager = user.roles && user.roles.includes('department_manager');

    const canComment = isAdmin ||
      (isDepartmentManager && kpi.department === user.department) ||
      kpi.assignments.some(assignment => assignment.userId === user.id) ||
      kpi.department === user.department;

    if (!canComment) {
      return res.status(403).json({ error: 'You cannot comment on this KPI' });
    }

    // Add comment
    const comment = await prisma.kpiComment.create({
      data: {
        kpiId,
        userId: user.id,
        content,
        userName: `${user.firstName} ${user.lastName}`
      },
      include: {
        user: true
      }
    });

    res.json(comment);
  } catch (error) {
    console.error('Add KPI comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Ticket routes
app.get('/api/tickets', authenticateToken, async (req, res) => {
  try {
    // Filter tickets based on user's department
    // Users can only see tickets where their department is either source or target
    // Admin and Board Members see all tickets
    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    const isBoardMember = req.user.roles && req.user.roles.includes('board_member');

    let whereClause = {};

    if (!isAdmin && !isBoardMember) {
      whereClause = {
        OR: [
          { sourceDepartment: req.user.department },
          { targetDepartment: req.user.department }
        ]
      };
    }

    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      include: {
        comments: true,
        assignee: true // Include assigned user details
      },
      orderBy: { createdAt: 'desc' }
    });

    // Add ticket numbers and transform assigned user
    const ticketsWithNumbers = tickets.map((ticket, index) => {
      const departmentPrefix = ticket.targetDepartment.substring(0, 2).toUpperCase();
      const ticketNumber = `${departmentPrefix}${String(index + 1).padStart(7, '0')}`;

      return {
        ...ticket,
        ticketNumber,
        assignedToName: ticket.assignee
          ? `${ticket.assignee.firstName} ${ticket.assignee.lastName}`
          : null
      };
    });

    res.json(ticketsWithNumbers);
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/tickets', authenticateToken, async (req, res) => {
  try {
    const { title, description, priority, targetDepartment } = req.body;

    // Generate ticket number based on target department
    const departmentPrefix = targetDepartment.substring(0, 2).toUpperCase();

    // Count existing tickets for this department to generate sequential number
    const ticketCount = await prisma.ticket.count({
      where: { targetDepartment }
    });

    const ticketNumber = `${departmentPrefix}${String(ticketCount + 1).padStart(7, '0')}`;

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        priority,
        status: 'open',
        sourceDepartment: req.user.department,
        targetDepartment,
        createdBy: req.user.id,
        creatorName: `${req.user.firstName} ${req.user.lastName}`
      },
      include: {
        comments: true
      }
    });

    // Add ticket number to response (computed field)
    const ticketWithNumber = {
      ...ticket,
      ticketNumber
    };

    // Emit real-time event
    io.to(`dept:${targetDepartment}`).to(`dept:${req.user.department}`).emit('ticket_created', ticketWithNumber);

    // Notify all users in target department
    const targetDepartmentUsers = await prisma.profile.findMany({
      where: { department: targetDepartment },
      include: { userRoles: true }
    });

    const priorityLabels = {
      'low': 'Düşük',
      'medium': 'Orta',
      'high': 'Yüksek',
      'urgent': 'Acil'
    };

    // Emit real-time event
    io.to(`dept:${targetDepartment}`).to(`dept:${req.user.department}`).emit('ticket_created', ticketWithNumber);

    for (const user of targetDepartmentUsers) {
      // Notify department managers and admins
      const isManager = user.userRoles.some(r => r.role === 'department_manager');
      const isAdmin = user.userRoles.some(r => r.role === 'admin');

      if (isManager || isAdmin) {
        await createNotification(
          user.id,
          'ticket',
          priority === 'urgent' ? 'high' : 'medium',
          `📨 Yeni Ticket: ${ticketNumber}`,
          `${req.user.firstName} ${req.user.lastName} (${req.user.department}) tarafından yeni bir ticket oluşturuldu. Öncelik: ${priorityLabels[priority]}`,
          `/tickets`
        );
      }
    }

    res.json(ticketWithNumber);
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/tickets/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo } = req.body;

    // First, get the ticket to check permissions
    const ticket = await prisma.ticket.findUnique({
      where: { id }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check if user has permission to update this ticket
    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    const isTargetDepartment = ticket.targetDepartment === req.user.department;
    const isSourceDepartment = ticket.sourceDepartment === req.user.department;
    const isCreator = ticket.createdBy === req.user.id;
    const isAssigned = ticket.assignedTo === req.user.id;

    // Admin, target department, or assigned user can update
    const canUpdate = isAdmin || isTargetDepartment || (isSourceDepartment && isCreator) || isAssigned;

    if (!canUpdate) {
      return res.status(403).json({
        error: 'Bu ticket\'ı güncelleme yetkiniz bulunmuyor'
      });
    }

    // Update the ticket
    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(assignedTo && { assignedTo }),
        updatedAt: new Date()
      },
      include: {
        comments: true
      }
    });

    // Notify assigned user about status change
    if (status && status !== ticket.status && updatedTicket.assignedTo) {
      const statusLabels = {
        'open': 'Açık',
        'in_progress': 'Devam Ediyor',
        'resolved': 'Çözüldü',
        'closed': 'Kapatıldı'
      };
      await createNotification(
        updatedTicket.assignedTo,
        'ticket',
        'medium',
        `🎫 Ticket Durumu Güncellendi: ${ticket.title}`,
        `"${ticket.title}" ticket'ının durumu "${statusLabels[status] || status}" olarak güncellendi.`,
        `/tickets`
      );
    }

    res.json(updatedTicket);
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete ticket endpoint
app.delete('/api/tickets/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get the ticket to check permissions
    const ticket = await prisma.ticket.findUnique({
      where: { id }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Only admin or creator can delete
    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    const isCreator = ticket.createdBy === req.user.id;

    if (!isAdmin && !isCreator) {
      return res.status(403).json({
        error: 'Sadece admin veya ticket oluşturan kişi silebilir'
      });
    }

    // Delete the ticket (comments will be cascade deleted)
    await prisma.ticket.delete({
      where: { id }
    });

    res.json({ message: 'Ticket başarıyla silindi' });
  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Comment routes
app.post('/api/tickets/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, isInternal } = req.body;

    // First, check if ticket exists and user has access
    const ticket = await prisma.ticket.findUnique({
      where: { id }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check if user has access to this ticket
    if (ticket.sourceDepartment !== req.user.department &&
      ticket.targetDepartment !== req.user.department) {
      return res.status(403).json({
        error: 'Bu ticket\'a yorum yapma yetkiniz yok'
      });
    }

    // Create the comment
    const comment = await prisma.ticketComment.create({
      data: {
        content,
        isInternal: isInternal || false,
        ticketId: id,
        authorId: req.user.id,
        authorName: `${req.user.firstName} ${req.user.lastName}`
      }
    });

    res.json(comment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/tickets/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // First, check if ticket exists and user has access
    const ticket = await prisma.ticket.findUnique({
      where: { id }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check if user has access to this ticket
    if (ticket.sourceDepartment !== req.user.department &&
      ticket.targetDepartment !== req.user.department) {
      return res.status(403).json({
        error: 'Bu ticket\'ın yorumlarını görme yetkiniz yok'
      });
    }

    // Get comments for the ticket
    const comments = await prisma.ticketComment.findMany({
      where: { ticketId: id },
      orderBy: { createdAt: 'asc' }
    });

    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Calendar routes
app.get('/api/calendar/categories', authenticateToken, async (req, res) => {
  try {
    const categories = await prisma.calendarCategory.findMany({
      orderBy: { name: 'asc' }
    });

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/calendar/activities', authenticateToken, async (req, res) => {
  try {
    // Get user's role to determine access level
    const userProfile = await prisma.profile.findUnique({
      where: { id: req.user.id },
      include: { userRoles: true }
    });

    let activities;

    // Check if user is admin or department manager
    const isAdmin = userProfile?.userRoles?.some(role => role.role === 'admin');
    const isDepartmentManager = userProfile?.userRoles?.some(role => role.role === 'department_manager');

    if (isAdmin) {
      // Admin can see all activities
      activities = await prisma.calendarActivity.findMany({
        include: {
          category: true
        },
        orderBy: { startTime: 'desc' }
      });
    } else if (isDepartmentManager) {
      // Department manager can see activities from their department users
      const departmentUsers = await prisma.profile.findMany({
        where: { department: userProfile.department },
        select: { id: true }
      });

      const userIds = departmentUsers.map(user => user.id);

      activities = await prisma.calendarActivity.findMany({
        where: {
          userId: { in: userIds }
        },
        include: {
          category: true
        },
        orderBy: { startTime: 'desc' }
      });
    } else {
      // Regular users can only see their own activities
      activities = await prisma.calendarActivity.findMany({
        where: {
          userId: req.user.id
        },
        include: {
          category: true
        },
        orderBy: { startTime: 'desc' }
      });
    }

    res.json(activities);
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/calendar/activities', authenticateToken, async (req, res) => {
  try {
    const { title, description, categoryId, startTime, endTime, date } = req.body;

    console.log('Create activity request body:', req.body);
    console.log('categoryId type:', typeof categoryId, 'value:', categoryId);

    // Get the actual category from database by ID
    const category = await prisma.calendarCategory.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return res.status(400).json({ error: `Kategori bulunamadı: ${categoryId}` });
    }

    // Combine date with startTime and endTime to create full datetime
    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);

    const activity = await prisma.calendarActivity.create({
      data: {
        title,
        description,
        categoryId: category.id, // Use the actual category ID from database
        date,
        startTime: startDateTime.toISOString(), // Convert to ISO string
        endTime: endDateTime.toISOString(), // Convert to ISO string
        duration: Math.round((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60)), // duration in minutes
        userId: req.user.id
      }
    });

    res.json(activity);
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete calendar activity
app.delete('/api/calendar/activities/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // First, check if activity exists and user has access
    const activity = await prisma.calendarActivity.findUnique({
      where: { id }
    });

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    // Check if user has access to this activity
    if (activity.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Bu aktiviteyi silme yetkiniz yok'
      });
    }

    // Delete the activity
    await prisma.calendarActivity.delete({
      where: { id }
    });

    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update calendar activity
app.put('/api/calendar/activities/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, categoryId, startTime, endTime, date } = req.body;

    // First, check if activity exists and user has access
    const activity = await prisma.calendarActivity.findUnique({
      where: { id }
    });

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    // Check if user has access to this activity
    if (activity.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Bu aktiviteyi düzenleme yetkiniz yok'
      });
    }

    // Get the category if categoryId is provided
    let category = null;
    if (categoryId) {
      category = await prisma.calendarCategory.findUnique({
        where: { id: categoryId }
      });

      if (!category) {
        return res.status(400).json({ error: `Kategori bulunamadı: ${categoryId}` });
      }
    }

    // Combine date with startTime and endTime to create full datetime
    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);

    const updatedActivity = await prisma.calendarActivity.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(category && { categoryId: category.id }),
        ...(date && { date }),
        ...(startTime && { startTime: startDateTime.toISOString() }),
        ...(endTime && { endTime: endDateTime.toISOString() }),
        ...(startTime && endTime && {
          duration: Math.round((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60))
        })
      }
    });

    res.json(updatedActivity);
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Notification routes
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[MARK AS READ] User: ${req.user.id}, Notification ID: ${id}`);

    // Verify notification belongs to user
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!notification) {
      console.log(`[MARK AS READ] Notification not found or doesn't belong to user`);
      return res.status(404).json({ error: 'Notification not found' });
    }

    // If already read, just return success
    if (notification.isRead) {
      console.log(`[MARK AS READ] Notification already read`);
      return res.json(notification);
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    console.log(`[MARK AS READ] Success: Notification ${id} marked as read`);
    res.json(updated);
  } catch (error) {
    console.error('Mark notification as read error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

app.put('/api/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.user.id,
        isRead: false
      },
      data: { isRead: true }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete all read notifications
app.delete('/api/notifications/read', authenticateToken, async (req, res) => {
  try {
    await prisma.notification.deleteMany({
      where: {
        userId: req.user.id,
        isRead: true
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete read notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/notifications/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify notification belongs to user
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await prisma.notification.delete({
      where: { id }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.delete('/api/notifications', authenticateToken, async (req, res) => {
  try {
    await prisma.notification.deleteMany({
      where: { userId: req.user.id }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete all notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dashboard stats
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    // ⚡ Bolt: Optimized dashboard stats query
    // Replaced 9 sequential DB calls with 3 parallel groupBy queries
    // This reduces database round-trips and improves response time
    const [kpiStats, ticketStats, ticketDeptGroup] = await Promise.all([
      // 1. KPI Stats using groupBy
      prisma.kpiTarget.groupBy({
        by: ['status'],
        _count: { id: true }
      }),
      // 2. Ticket Stats using groupBy
      prisma.ticket.groupBy({
        by: ['status'],
        _count: { id: true }
      }),
      // 3. Ticket by Department (already using groupBy)
      prisma.ticket.groupBy({
        by: ['targetDepartment'],
        _count: { id: true }
      })
    ]);

    // Helper to get count from groupBy result
    const getCount = (arr, status) => {
      const item = arr.find(i => i.status === status);
      return item ? item._count.id : 0;
    };

    // Calculate totals
    const totalKPIs = kpiStats.reduce((acc, curr) => acc + curr._count.id, 0);
    const completedKPIs = getCount(kpiStats, 'completed');
    const activeKPIs = getCount(kpiStats, 'active');

    const totalTickets = ticketStats.reduce((acc, curr) => acc + curr._count.id, 0);
    const openTickets = getCount(ticketStats, 'open');
    const inProgressTickets = getCount(ticketStats, 'in_progress');
    const resolvedTickets = getCount(ticketStats, 'resolved');
    const closedTickets = getCount(ticketStats, 'closed');

    // Tickets by Status for Pie Chart
    const ticketsByStatus = [
      { name: 'Açık', value: openTickets, color: '#ef4444' }, // red-500
      { name: 'İşlemde', value: inProgressTickets, color: '#f59e0b' }, // amber-500
      { name: 'Çözüldü', value: resolvedTickets, color: '#10b981' }, // emerald-500
      { name: 'Kapandı', value: closedTickets, color: '#6b7280' } // gray-500
    ];

    const ticketsByDepartment = ticketDeptGroup.map(item => ({
      name: item.targetDepartment,
      value: item._count.id
    }));

    res.json({
      totalKPIs,
      completedKPIs,
      activeKPIs,
      totalTickets,
      openTickets,
      inProgressTickets,
      completedTickets: closedTickets,
      ticketsByStatus,
      ticketsByDepartment
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Departments endpoint
app.get('/api/departments', authenticateToken, async (req, res) => {
  try {
    console.log('Getting departments...');
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' }
    });
    console.log('Departments found:', departments);
    res.json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/departments', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;

    // Check if user has admin role
    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    if (!isAdmin) {
      return res.status(403).json({ error: 'Only admins can create departments' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Department name is required' });
    }

    // Check if department already exists
    const existingDepartment = await prisma.department.findUnique({
      where: { name: name.trim() }
    });

    if (existingDepartment) {
      return res.status(400).json({ error: 'Department already exists' });
    }

    const department = await prisma.department.create({
      data: { name: name.trim() }
    });

    res.json(department);
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/departments/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Check if user has admin role
    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    if (!isAdmin) {
      return res.status(403).json({ error: 'Only admins can update departments' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Department name is required' });
    }

    // Check if department exists
    const existingDepartment = await prisma.department.findUnique({
      where: { id }
    });

    if (!existingDepartment) {
      return res.status(404).json({ error: 'Department not found' });
    }

    // Check if new name already exists
    const duplicateDepartment = await prisma.department.findUnique({
      where: { name: name.trim() }
    });

    if (duplicateDepartment && duplicateDepartment.id !== id) {
      return res.status(400).json({ error: 'Department name already exists' });
    }

    // Check if department has users
    const usersCount = await prisma.profile.count({
      where: { department: existingDepartment.name }
    });

    if (usersCount > 0) {
      // Update all users' department field
      await prisma.profile.updateMany({
        where: { department: existingDepartment.name },
        data: { department: name.trim() }
      });
    }

    const updatedDepartment = await prisma.department.update({
      where: { id },
      data: { name: name.trim() }
    });

    res.json(updatedDepartment);
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/departments/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user has admin role
    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    if (!isAdmin) {
      return res.status(403).json({ error: 'Only admins can delete departments' });
    }

    // Check if department exists
    const department = await prisma.department.findUnique({
      where: { id }
    });

    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    // Check if department has users
    const usersCount = await prisma.profile.count({
      where: { department: department.name }
    });

    if (usersCount > 0) {
      return res.status(400).json({
        error: 'Cannot delete department with users. Please move users to another department first.'
      });
    }

    await prisma.department.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== MEETING ROOMS API ====================

// Get all meeting rooms
app.get('/api/meeting-rooms', authenticateToken, async (req, res) => {
  try {
    const rooms = await prisma.meetingRoom.findMany({
      include: {
        reservations: {
          // Include all reservations (pending, approved, rejected) for calendar view
          // Only show future reservations (or current day)
          where: {
            startTime: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)) // Start of today
            }
          },
          include: {
            requester: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                department: true
              }
            }
          },
          orderBy: {
            startTime: 'asc'
          }
        },
        responsible: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(rooms);
  } catch (error) {
    console.error('Get meeting rooms error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create meeting room (admin only)
app.post('/api/meeting-rooms', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const isAdmin = user.roles && user.roles.includes('admin');

    if (!isAdmin) {
      return res.status(403).json({ error: 'Only admins can create meeting rooms' });
    }

    const { name, capacity, location, description, responsibleId } = req.body;

    if (!name || !capacity || !location) {
      return res.status(400).json({ error: 'Name, capacity, and location are required' });
    }

    // Check if room with same name exists
    const existingRoom = await prisma.meetingRoom.findUnique({
      where: { name: name.trim() }
    });

    if (existingRoom) {
      return res.status(400).json({ error: 'Meeting room with this name already exists' });
    }

    const room = await prisma.meetingRoom.create({
      data: {
        name: name.trim(),
        capacity: parseInt(capacity),
        location: location.trim(),
        description: description?.trim() || null,
        responsibleId: responsibleId || null
      }
    });

    res.json(room);
  } catch (error) {
    console.error('Create meeting room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update meeting room (admin only)
app.put('/api/meeting-rooms/:id', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const isAdmin = user.roles && user.roles.includes('admin');

    if (!isAdmin) {
      return res.status(403).json({ error: 'Only admins can update meeting rooms' });
    }

    const { id } = req.params;
    const { name, capacity, location, description, responsibleId } = req.body;

    // Check if room exists
    const existingRoom = await prisma.meetingRoom.findUnique({
      where: { id }
    });

    if (!existingRoom) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const updatedRoom = await prisma.meetingRoom.update({
      where: { id },
      data: {
        name: name?.trim(),
        capacity: capacity ? parseInt(capacity) : undefined,
        location: location?.trim(),
        description: description?.trim() || null,
        responsibleId: responsibleId || null
      }
    });

    res.json(updatedRoom);
  } catch (error) {
    console.error('Update meeting room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete meeting room (admin only)
app.delete('/api/meeting-rooms/:id', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const isAdmin = user.roles && user.roles.includes('admin');

    if (!isAdmin) {
      return res.status(403).json({ error: 'Only admins can delete meeting rooms' });
    }

    const { id } = req.params;

    // Check for existing reservations
    const reservations = await prisma.meetingReservation.findMany({
      where: { roomId: id, status: 'approved' }
    });

    if (reservations.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete room with approved reservations. Please cancel or reject all reservations first.'
      });
    }

    await prisma.meetingRoom.delete({
      where: { id }
    });

    res.json({ message: 'Meeting room deleted successfully' });
  } catch (error) {
    console.error('Delete meeting room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get meeting reservations
app.get('/api/meeting-reservations', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const isAdmin = user.roles && user.roles.includes('admin');
    const isDepartmentManager = user.roles && user.roles.includes('department_manager');
    const isSecretary = user.roles && user.roles.includes('secretary');

    let reservations;

    if (isAdmin || isSecretary) {
      // Admin can see all reservations
      reservations = await prisma.meetingReservation.findMany({
        include: {
          room: true,
          requester: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              department: true
            }
          },
          approver: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else if (isDepartmentManager) {
      // Department managers can see reservations from their department
      const userProfile = await prisma.profile.findUnique({
        where: { id: user.id }
      });

      reservations = await prisma.meetingReservation.findMany({
        where: {
          requester: {
            department: userProfile.department
          }
        },
        include: {
          room: true,
          requester: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              department: true
            }
          },
          approver: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // Check if user is responsible for any room
      const responsibleRooms = await prisma.meetingRoom.findMany({
        where: { responsibleId: user.id },
        select: { id: true }
      });

      const responsibleRoomIds = responsibleRooms.map(r => r.id);

      reservations = await prisma.meetingReservation.findMany({
        where: {
          OR: [
            { requestedBy: user.id },
            { roomId: { in: responsibleRoomIds } }
          ]
        },
        include: {
          room: true,
          requester: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              department: true
            }
          },
          approver: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    res.json(reservations);
  } catch (error) {
    console.error('Get meeting reservations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create meeting reservation request
app.post('/api/meeting-reservations', authenticateToken, async (req, res) => {
  try {
    const { roomId, startTime, endTime, notes } = req.body;
    const user = req.user;

    if (!roomId || !startTime || !endTime) {
      return res.status(400).json({ error: 'Room ID, start time, and end time are required' });
    }

    // Validate ISO 8601 datetime format
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date/time format. Please use ISO 8601 format (YYYY-MM-DDTHH:mm:ss)' });
    }

    // Validate 24-hour format (ensure hours are between 00:00 and 23:59)
    const startHours = start.getHours();
    const startMinutes = start.getMinutes();
    const endHours = end.getHours();
    const endMinutes = end.getMinutes();

    if (startHours < 0 || startHours > 23 || startMinutes < 0 || startMinutes > 59) {
      return res.status(400).json({ error: 'Start time must be in 24-hour format (00:00 - 23:59)' });
    }

    if (endHours < 0 || endHours > 23 || endMinutes < 0 || endMinutes > 59) {
      return res.status(400).json({ error: 'End time must be in 24-hour format (00:00 - 23:59)' });
    }

    if (start >= end) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    if (start < new Date()) {
      return res.status(400).json({ error: 'Cannot create reservation for past dates' });
    }

    // Check for overlapping reservations
    const overlapping = await prisma.meetingReservation.findFirst({
      where: {
        roomId,
        status: {
          in: ['pending', 'approved']
        },
        OR: [
          {
            AND: [
              { startTime: { lte: start } },
              { endTime: { gt: start } }
            ]
          },
          {
            AND: [
              { startTime: { lt: end } },
              { endTime: { gte: end } }
            ]
          },
          {
            AND: [
              { startTime: { gte: start } },
              { endTime: { lte: end } }
            ]
          }
        ]
      }
    });

    if (overlapping) {
      return res.status(400).json({
        error: 'This time slot is already reserved. Please choose another time.'
      });
    }

    const reservation = await prisma.meetingReservation.create({
      data: {
        roomId,
        requestedBy: user.id,
        startTime: start,
        endTime: end,
        notes: notes?.trim() || null,
        status: 'pending'
      },
      include: {
        room: true,
        requester: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            department: true
          }
        }
      }
    });

    // Notify room responsible person
    const roomWithResponsible = await prisma.meetingRoom.findUnique({
      where: { id: roomId },
      include: { responsible: true }
    });

    if (roomWithResponsible && roomWithResponsible.responsibleId) {
      const requesterProfile = await prisma.profile.findUnique({
        where: { id: user.id }
      });

      await createNotification(
        roomWithResponsible.responsibleId,
        'system',
        'medium',
        '📅 Yeni Toplantı Odası Talebi',
        `${requesterProfile ? requesterProfile.firstName + ' ' + requesterProfile.lastName : 'Biri'} "${roomWithResponsible.name}" odası için ${new Date(start).toLocaleString('tr-TR')} - ${new Date(end).toLocaleString('tr-TR')} tarihlerinde rezervasyon talep etti.`,
        '/meeting-rooms'
      );
    } else {
      // Fallback: Notify Admins if no responsible person assigned?
      // Or keep Secretary/Manager logic as backup?
      // For now, let's notify Admins as fallback to ensure someone sees it
      const admins = await prisma.userRole.findMany({
        where: { role: 'admin' }
      });

      const requesterProfile = await prisma.profile.findUnique({
        where: { id: user.id }
      });

      for (const admin of admins) {
        await createNotification(
          admin.userId,
          'system',
          'medium',
          '📅 Yeni Toplantı Odası Talebi (Sorumlu Atanmamış)',
          `${requesterProfile ? requesterProfile.firstName + ' ' + requesterProfile.lastName : 'Biri'} "${reservation.room.name}" odası için talep oluşturdu.`,
          '/meeting-rooms'
        );
      }
    }

    // Emit real-time event
    const reservationWithDetails = await prisma.meetingReservation.findUnique({
      where: { id: reservation.id },
      include: {
        room: true,
        requester: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            department: true
          }
        }
      }
    });
    io.emit('reservation_created', reservationWithDetails);

    res.json(reservation);
  } catch (error) {
    console.error('Create meeting reservation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve meeting reservation (manager only)
app.put('/api/meeting-reservations/:id/approve', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const isAdmin = user.roles && user.roles.includes('admin');
    const isSecretary = user.roles && user.roles.includes('secretary');

    const { id } = req.params;

    const reservation = await prisma.meetingReservation.findUnique({
      where: { id },
      include: {
        room: true,
        requester: true
      }
    });

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    // Check if user is the responsible person for this room
    const isRoomResponsible = reservation.room.responsibleId === user.id;

    if (!isAdmin && !isDepartmentManager && !isSecretary && !isRoomResponsible) {
      return res.status(403).json({ error: 'Only managers, secretaries, or room responsibles can approve reservations' });
    }

    // Check if user can approve (admin, secretary, responsible, or same department manager)
    if (!isAdmin && !isSecretary && !isRoomResponsible) {
      const userProfile = await prisma.profile.findUnique({
        where: { id: user.id }
      });

      if (userProfile.department !== reservation.requester.department) {
        return res.status(403).json({
          error: 'You can only approve reservations from your own department'
        });
      }
    }

    if (reservation.status !== 'pending') {
      return res.status(400).json({ error: `Reservation is already ${reservation.status}` });
    }

    // Check for overlapping approved reservations
    const overlapping = await prisma.meetingReservation.findFirst({
      where: {
        roomId: reservation.roomId,
        id: { not: id },
        status: 'approved',
        OR: [
          {
            AND: [
              { startTime: { lte: reservation.startTime } },
              { endTime: { gt: reservation.startTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: reservation.endTime } },
              { endTime: { gte: reservation.endTime } }
            ]
          },
          {
            AND: [
              { startTime: { gte: reservation.startTime } },
              { endTime: { lte: reservation.endTime } }
            ]
          }
        ]
      }
    });

    if (overlapping) {
      return res.status(400).json({
        error: 'This time slot is already reserved by another approved meeting.'
      });
    }

    const updatedReservation = await prisma.meetingReservation.update({
      where: { id },
      data: {
        status: 'approved',
        approvedBy: user.id,
        updatedAt: new Date()
      },
      include: {
        room: true,
        requester: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            department: true
          }
        },
        approver: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Create calendar activity for the requester
    try {
      // Get or create "Meeting" category
      let meetingCategory = await prisma.calendarCategory.findFirst({
        where: { name: 'Toplantı' }
      });

      if (!meetingCategory) {
        meetingCategory = await prisma.calendarCategory.create({
          data: {
            name: 'Toplantı',
            color: '#3b82f6'
          }
        });
      }

      const startDate = new Date(reservation.startTime);
      const endDate = new Date(reservation.endTime);
      const dateStr = startDate.toISOString().split('T')[0];
      const startTimeStr = startDate.toTimeString().slice(0, 5);
      const endTimeStr = endDate.toTimeString().slice(0, 5);
      const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));

      await prisma.calendarActivity.create({
        data: {
          title: `Toplantı: ${reservation.room.name}`,
          description: reservation.notes || `Toplantı odası rezervasyonu - ${reservation.room.location}`,
          categoryId: meetingCategory.id,
          date: dateStr,
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
          duration: duration,
          userId: reservation.requestedBy
        }
      });
    } catch (calendarError) {
      console.error('Error creating calendar activity:', calendarError);
      // Don't fail the approval if calendar sync fails
    }

    // Notify requester
    await createNotification(
      reservation.requestedBy,
      'system',
      'low',
      '✅ Toplantı Rezervasyonu Onaylandı',
      `"${reservation.room.name}" odası için ${new Date(reservation.startTime).toLocaleString('tr-TR')} - ${new Date(reservation.endTime).toLocaleString('tr-TR')} tarihlerindeki rezervasyonunuz onaylandı.`,
      '/meeting-rooms'
    );

    // Emit real-time event
    io.emit('reservation_updated', updatedReservation);

    res.json(updatedReservation);
  } catch (error) {
    console.error('Approve meeting reservation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reject meeting reservation (manager only)
app.put('/api/meeting-reservations/:id/reject', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const isAdmin = user.roles && user.roles.includes('admin');
    const isDepartmentManager = user.roles && user.roles.includes('department_manager');
    const isSecretary = user.roles && user.roles.includes('secretary');

    if (!isAdmin && !isDepartmentManager && !isSecretary) {
      return res.status(403).json({ error: 'Only managers or secretaries can reject reservations' });
    }

    const { id } = req.params;

    const reservation = await prisma.meetingReservation.findUnique({
      where: { id },
      include: {
        room: true,
        requester: true
      }
    });

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    // Check if user can reject (admin, secretary, or same department manager)
    if (!isAdmin && !isSecretary) {
      const userProfile = await prisma.profile.findUnique({
        where: { id: user.id }
      });

      if (userProfile.department !== reservation.requester.department) {
        return res.status(403).json({
          error: 'You can only reject reservations from your own department'
        });
      }
    }

    if (reservation.status !== 'pending') {
      return res.status(400).json({ error: `Reservation is already ${reservation.status}` });
    }

    const updatedReservation = await prisma.meetingReservation.update({
      where: { id },
      data: {
        status: 'rejected',
        approvedBy: user.id,
        updatedAt: new Date()
      },
      include: {
        room: true,
        requester: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            department: true
          }
        },
        approver: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Notify requester
    await createNotification(
      reservation.requestedBy,
      'system',
      'medium',
      '❌ Toplantı Rezervasyonu Reddedildi',
      `"${reservation.room.name}" odası için ${new Date(reservation.startTime).toLocaleString('tr-TR')} - ${new Date(reservation.endTime).toLocaleString('tr-TR')} tarihlerindeki rezervasyon talebiniz reddedildi.`,
      '/meeting-rooms'
    );

    // Emit real-time event
    io.emit('reservation_updated', updatedReservation);

    res.json(updatedReservation);
  } catch (error) {
    console.error('Reject meeting reservation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update meeting reservation
app.put('/api/meeting-reservations/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, notes } = req.body;
    const user = req.user;

    // Get the reservation
    const reservation = await prisma.meetingReservation.findUnique({
      where: { id },
      include: {
        room: true,
        requester: true
      }
    });

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    // Check permissions: only requester or admin can update
    const isAdmin = user.roles && user.roles.includes('admin');
    const isRequester = reservation.requestedBy === user.id;

    if (!isAdmin && !isRequester) {
      return res.status(403).json({ error: 'You can only update your own reservations' });
    }

    // If reservation is approved, only admin can update
    if (reservation.status === 'approved' && !isAdmin) {
      return res.status(403).json({ error: 'Approved reservations can only be updated by admin' });
    }

    // Validate dates if provided
    let start = reservation.startTime;
    let end = reservation.endTime;

    if (startTime || endTime) {
      if (startTime) {
        start = new Date(startTime);
        if (isNaN(start.getTime())) {
          return res.status(400).json({ error: 'Invalid start time format' });
        }
      }
      if (endTime) {
        end = new Date(endTime);
        if (isNaN(end.getTime())) {
          return res.status(400).json({ error: 'Invalid end time format' });
        }
      }

      if (start >= end) {
        return res.status(400).json({ error: 'End time must be after start time' });
      }

      if (start < new Date()) {
        return res.status(400).json({ error: 'Cannot update reservation to past dates' });
      }

      // Check for overlapping reservations (excluding current reservation)
      const overlapping = await prisma.meetingReservation.findFirst({
        where: {
          roomId: reservation.roomId,
          id: { not: id },
          status: {
            in: ['pending', 'approved']
          },
          OR: [
            {
              AND: [
                { startTime: { lte: start } },
                { endTime: { gt: start } }
              ]
            },
            {
              AND: [
                { startTime: { lt: end } },
                { endTime: { gte: end } }
              ]
            },
            {
              AND: [
                { startTime: { gte: start } },
                { endTime: { lte: end } }
              ]
            }
          ]
        }
      });

      if (overlapping) {
        return res.status(400).json({
          error: 'This time slot is already reserved. Please choose another time.'
        });
      }
    }

    // Update reservation
    const updatedReservation = await prisma.meetingReservation.update({
      where: { id },
      data: {
        ...(startTime && { startTime: start }),
        ...(endTime && { endTime: end }),
        ...(notes !== undefined && { notes: notes?.trim() || null }),
        updatedAt: new Date()
      },
      include: {
        room: true,
        requester: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            department: true
          }
        },
        approver: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // If reservation was approved and time changed, notify approver
    if (reservation.status === 'approved' && (startTime || endTime) && reservation.approvedBy) {
      await createNotification(
        reservation.approvedBy,
        'system',
        'medium',
        '⚠️ Rezervasyon Güncellendi',
        `"${reservation.room.name}" odası için onayladığınız rezervasyon güncellendi.`,
        '/meeting-rooms'
      );
    }

    res.json(updatedReservation);
  } catch (error) {
    console.error('Update meeting reservation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete meeting reservation
app.delete('/api/meeting-reservations/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Get the reservation
    const reservation = await prisma.meetingReservation.findUnique({
      where: { id },
      include: {
        room: true,
        requester: true,
        approver: true
      }
    });

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    // Check permissions: only requester or admin can delete
    const isAdmin = user.roles && user.roles.includes('admin');
    const isRequester = reservation.requestedBy === user.id;

    if (!isAdmin && !isRequester) {
      return res.status(403).json({ error: 'You can only delete your own reservations' });
    }

    // If reservation is approved, notify approver
    if (reservation.status === 'approved' && reservation.approvedBy) {
      await createNotification(
        reservation.approvedBy,
        'system',
        'medium',
        '❌ Rezervasyon İptal Edildi',
        `"${reservation.room.name}" odası için onayladığınız rezervasyon iptal edildi.`,
        '/meeting-rooms'
      );
    }

    // Emit real-time event
    io.emit('reservation_deleted', id);

    // Delete reservation
    await prisma.meetingReservation.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Reservation deleted successfully' });
  } catch (error) {
    console.error('Delete meeting reservation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export for testing
export { httpServer, app, io, prisma };

// Start server if run directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
