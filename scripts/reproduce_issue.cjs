const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- STARTING REPRODUCTION ---');

    // 1. Reproduce User Deletion Error
    console.log('\n1. Testing User Deletion with Relations...');
    try {
        // Create a temp user
        const user = await prisma.profile.create({
            data: {
                email: `temp_del_test_${Date.now()}@test.com`,
                firstName: 'Temp',
                lastName: 'User',
                department: 'IT',
                userRoles: { create: { role: 'employee' } }
            }
        });
        console.log('Created user:', user.id);

        // Create a ticket created by this user
        await prisma.ticket.create({
            data: {
                title: 'Temp Ticket',
                description: 'Desc',
                priority: 'low',
                sourceDepartment: 'IT',
                targetDepartment: 'IT',
                createdBy: user.id
            }
        });
        console.log('Created ticket linked to user');

        // Try to delete user
        console.log('Attempting to delete user...');
        await prisma.profile.delete({ where: { id: user.id } });
        console.log('User deleted successfully (Unexpected!)');
    } catch (e) {
        console.log('User deletion failed as expected:', e.code, e.meta);
    }

    // 2. Reproduce Department Deletion Error
    console.log('\n2. Testing Department Deletion with Relations...');
    try {
        // Create temp department
        const deptName = 'TempDept_' + Date.now();
        const dept = await prisma.department.create({ data: { name: deptName } });
        console.log('Created department:', dept.name);

        // Create a ticket targeting this department (but no users in it)
        await prisma.ticket.create({
            data: {
                title: 'Dept Ticket',
                description: 'Desc',
                priority: 'low',
                sourceDepartment: 'IT',
                targetDepartment: dept.name, // Linked to temp department
                createdBy: (await prisma.profile.findFirst()).id
            }
        });
        console.log('Created ticket linked to department');

        // Try to delete department
        console.log('Attempting to delete department...');
        await prisma.department.delete({ where: { id: dept.id } });
        console.log('Department deleted successfully (Unexpected!)');
    } catch (e) {
        console.log('Department deletion failed as expected:', e.code, e.meta);
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
