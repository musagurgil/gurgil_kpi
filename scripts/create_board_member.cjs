const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'board@gurgil.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await prisma.profile.findUnique({
        where: { email }
    });

    if (existingUser) {
        console.log('Board member user already exists.');
        // Ensure role matches
        await prisma.userRole.deleteMany({
            where: { userId: existingUser.id }
        });
        await prisma.userRole.create({
            data: {
                userId: existingUser.id,
                role: 'board_member'
            }
        });
        console.log('Updated role to board_member.');
    } else {
        const user = await prisma.profile.create({
            data: {
                email,
                password: hashedPassword,
                firstName: 'Board',
                lastName: 'Member',
                department: 'Yönetim',
                isActive: true,
                userRoles: {
                    create: {
                        role: 'board_member'
                    }
                }
            }
        });
        console.log(`Created board member user: ${user.email}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
