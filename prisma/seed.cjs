const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create departments
  const departments = [
    { name: 'İnsan Kaynakları' },
    { name: 'Bilgi İşlem' },
    { name: 'IT' },
    { name: 'Muhasebe' },
    { name: 'Satış' },
    { name: 'Pazarlama' },
    { name: 'Üretim' },
    { name: 'Kalite Kontrol' },
    { name: 'Lojistik' }
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: dept
    });
  }

  // Create calendar categories
  const categories = [
    { name: 'Toplantı', color: 'hsl(217, 91%, 60%)' },
    { name: 'Proje', color: 'hsl(142, 71%, 45%)' },
    { name: 'Eğitim', color: 'hsl(38, 92%, 50%)' },
    { name: 'İdari', color: 'hsl(262, 83%, 58%)' },
    { name: 'Mola', color: 'hsl(0, 84%, 60%)' },
    { name: 'Diğer', color: 'hsl(215, 16%, 47%)' }
  ];

  for (const cat of categories) {
    await prisma.calendarCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat
    });
  }

  // Create admin user
  const adminProfile = await prisma.profile.upsert({
    where: { email: 'admin@gurgil.com' },
    update: {},
    create: {
      email: 'admin@gurgil.com',
      firstName: 'Admin',
      lastName: 'User',
      department: 'İnsan Kaynakları',
      userRoles: {
        create: { role: 'admin' }
      }
    }
  });

  // Create department manager
  const managerProfile = await prisma.profile.upsert({
    where: { email: 'manager@gurgil.com' },
    update: {},
    create: {
      email: 'manager@gurgil.com',
      firstName: 'Manager',
      lastName: 'User',
      department: 'Bilgi İşlem',
      userRoles: {
        create: { role: 'department_manager' }
      }
    }
  });

  // Create regular employee
  const employeeProfile = await prisma.profile.upsert({
    where: { email: 'employee@gurgil.com' },
    update: {},
    create: {
      email: 'employee@gurgil.com',
      firstName: 'Employee',
      lastName: 'User',
      department: 'Bilgi İşlem',
      userRoles: {
        create: { role: 'employee' }
      }
    }
  });

  // Create IT department manager (Musa)
  const itManagerProfile = await prisma.profile.upsert({
    where: { email: 'musa@gurgil.com' },
    update: {},
    create: {
      email: 'musa@gurgil.com',
      firstName: 'Musa',
      lastName: 'Gürgil',
      department: 'IT',
      userRoles: {
        create: { role: 'department_manager' }
      }
    }
  });

  // Create sample KPI
  const sampleKPI = await prisma.kpiTarget.create({
    data: {
      title: 'Aylık Satış Hedefi',
      description: 'Bu ay için 100.000 TL satış hedefi',
      department: 'Satış',
      targetValue: 100000,
      currentValue: 25000,
      unit: 'TL',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      period: 'monthly',
      priority: 'high',
      status: 'active',
      createdBy: adminProfile.id,
      assignments: {
        create: [
          { userId: managerProfile.id },
          { userId: employeeProfile.id }
        ]
      }
    }
  });

  // Clear existing tickets and comments
  await prisma.ticketComment.deleteMany({});
  await prisma.ticket.deleteMany({});

  // Create sample notification
  await prisma.notification.create({
    data: {
      userId: adminProfile.id,
      category: 'system',
      priority: 'medium',
      title: 'Hoş Geldiniz',
      message: 'Gurgil KPI sistemine hoş geldiniz!',
      isRead: false
    }
  });

  // Create calendar categories
  const calendarCategories = [
    { name: 'Toplantı', color: 'hsl(217, 91%, 60%)' },
    { name: 'Proje', color: 'hsl(142, 71%, 45%)' },
    { name: 'Eğitim', color: 'hsl(38, 92%, 50%)' },
    { name: 'İdari', color: 'hsl(262, 83%, 58%)' },
    { name: 'Mola', color: 'hsl(0, 84%, 60%)' },
    { name: 'Diğer', color: 'hsl(215, 16%, 47%)' }
  ];

  for (const category of calendarCategories) {
    await prisma.calendarCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log('👤 Admin: admin@gurgil.com');
  console.log('👤 Manager: manager@gurgil.com');
  console.log('👤 Employee: employee@gurgil.com');
  console.log('🔑 Password for all users: 123456');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
