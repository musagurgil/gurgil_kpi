const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'board_v2@gurgil.com';

    const user = await prisma.profile.findUnique({
        where: { email }
    });

    if (!user) {
        console.error(`User ${email} not found!`);
        process.exit(1);
    }

    console.log(`Found user: ${user.id} (${user.firstName} ${user.lastName})`);

    // Delete existing roles
    await prisma.userRole.deleteMany({
        where: { userId: user.id }
    });

    // Add board_member role
    await prisma.userRole.create({
        data: {
            userId: user.id,
            role: 'board_member'
        }
    });

    console.log('Role updated to board_member');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
