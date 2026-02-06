import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

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

    // Update roles
    await prisma.userRole.deleteMany({
      where: { userId: id }
    });

    await prisma.userRole.createMany({
      data: roles.map(role => ({
        userId: id,
        role
      }))
    });

    const updatedProfile = await prisma.profile.findUnique({
      where: { id },
      include: { userRoles: true }
    });

    res.json(updatedProfile);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/admin/profiles/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

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
    
    if (isAdmin) {
      // Admin can see all KPIs
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
        progress: true,
        comments: true,
        assignments: {
          include: {
            user: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(kpis);
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
        progress: true,
        comments: true,
        assignments: {
          include: {
            user: true
          }
        }
      }
    });
    
    console.log(`[KPI CREATE] Successfully created KPI:`, { id: kpi.id, title: kpi.title });
    res.json(kpi);
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
        progress: true,
        comments: true,
        assignments: {
          include: {
            user: true
          }
        }
      }
    });
    
    console.log(`[KPI UPDATE] Successfully updated KPI:`, { id: updatedKpi.id, title: updatedKpi.title });
    res.json(updatedKpi);
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

    res.json(progress);
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
    const tickets = await prisma.ticket.findMany({
      where: {
        OR: [
          { sourceDepartment: req.user.department },
          { targetDepartment: req.user.department }
        ]
      },
      include: {
        comments: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tickets);
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/tickets', authenticateToken, async (req, res) => {
  try {
    const { title, description, priority, targetDepartment } = req.body;

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

    res.json(ticket);
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
    // Only the target department can update the ticket status
    if (ticket.targetDepartment !== req.user.department) {
      return res.status(403).json({ 
        error: 'Bu ticket\'ın durumunu sadece hedef departman değiştirebilir' 
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

    res.json(updatedTicket);
  } catch (error) {
    console.error('Update ticket error:', error);
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

// Dashboard stats
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const totalKPIs = await prisma.kpiTarget.count();
    const completedKPIs = await prisma.kpiTarget.count({
      where: { status: 'completed' }
    });
    const activeKPIs = await prisma.kpiTarget.count({
      where: { status: 'active' }
    });
    const totalTickets = await prisma.ticket.count();
    const openTickets = await prisma.ticket.count({
      where: { status: 'open' }
    });
    const inProgressTickets = await prisma.ticket.count({
      where: { status: 'in_progress' }
    });
    const completedTickets = await prisma.ticket.count({
      where: { status: 'closed' }
    });

    res.json({
      totalKPIs,
      completedKPIs,
      activeKPIs,
      totalTickets,
      openTickets,
      inProgressTickets,
      completedTickets
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
