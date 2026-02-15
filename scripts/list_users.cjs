const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.profile.findMany({
        include: {
            userRoles: true
        }
    });

    console.log('--- USERS ---');
    users.forEach(u => {
        const roles = u.userRoles.map(r => r.role).join(', ');
        console.log(`${u.email} | ${u.firstName} ${u.lastName} | Roles: [${roles}]`);
    });
    console.log('-------------');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
