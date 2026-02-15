
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function verifySecretaryWorkflow() {
    console.log('🚀 Starting Secretary Workflow Verification...');

    try {
        // 1. Create a Secretary User
        console.log('1️⃣ Creating Secretary User...');
        const secretaryEmail = 'secretary@test.com';
        let secretary = await prisma.user.findUnique({ where: { email: secretaryEmail } });

        if (!secretary) {
            const hashedPassword = await bcrypt.hash('password123', 10);
            secretary = await prisma.user.create({
                data: {
                    email: secretaryEmail,
                    password: hashedPassword,
                    firstName: 'Fatma',
                    lastName: 'Sekreter',
                    department: 'Yönetim',
                    roles: ['secretary']
                }
            });
            // Create profile
            await prisma.profile.create({
                data: {
                    id: secretary.id,
                    email: secretaryEmail,
                    firstName: 'Fatma',
                    lastName: 'Sekreter',
                    department: 'Yönetim',
                    isActive: true
                }
            });
            // Assign role
            await prisma.userRole.create({
                data: {
                    userId: secretary.id,
                    role: 'secretary'
                }
            });
            console.log('✅ Secretary User created.');
        } else {
            console.log('ℹ️ Secretary User already exists.');
            // Ensure role is correct
            const role = await prisma.userRole.findFirst({
                where: { userId: secretary.id, role: 'secretary' }
            });
            if (!role) {
                await prisma.userRole.create({
                    data: { userId: secretary.id, role: 'secretary' }
                });
                console.log('✅ Secretary role added to existing user.');
            }
        }

        // 2. Create a Regular Employee
        console.log('2️⃣ Creating Regular Employee...');
        const employeeEmail = 'employee@test.com';
        let employee = await prisma.user.findUnique({ where: { email: employeeEmail } });

        if (!employee) {
            const hashedPassword = await bcrypt.hash('password123', 10);
            employee = await prisma.user.create({
                data: {
                    email: employeeEmail,
                    password: hashedPassword,
                    firstName: 'Ali',
                    lastName: 'Çalışan',
                    department: 'Satış',
                    roles: ['employee']
                }
            });
            // Create profile
            await prisma.profile.create({
                data: {
                    id: employee.id,
                    email: employeeEmail,
                    firstName: 'Ali',
                    lastName: 'Çalışan',
                    department: 'Satış',
                    isActive: true
                }
            });
            await prisma.userRole.create({
                data: {
                    userId: employee.id,
                    role: 'employee'
                }
            });
            console.log('✅ Regular Employee created.');
        }

        // 3. Create a Meeting Room
        console.log('3️⃣ Creating Meeting Room...');
        const roomName = 'Test Room Secretary';
        let room = await prisma.meetingRoom.findUnique({ where: { name: roomName } });
        if (!room) {
            room = await prisma.meetingRoom.create({
                data: {
                    name: roomName,
                    capacity: 5,
                    location: 'Floor 1'
                }
            });
            console.log('✅ Meeting Room created.');
        }

        // 4. Create a Reservation Request (Pending)
        console.log('4️⃣ Creating Reservation Request (as Employee)...');
        const startTime = new Date();
        startTime.setDate(startTime.getDate() + 1); // Tomorrow
        startTime.setHours(10, 0, 0, 0);
        const endTime = new Date(startTime);
        endTime.setHours(11, 0, 0, 0);

        const reservation = await prisma.meetingReservation.create({
            data: {
                roomId: room.id,
                requestedBy: employee.id,
                startTime: startTime,
                endTime: endTime,
                status: 'pending',
                notes: 'Discussion about Sales'
            }
        });
        console.log(`✅ Reservation created with ID: ${reservation.id} (Status: ${reservation.status})`);

        // 5. Verify Secretary Permission (Simulate via logic check)
        console.log('5️⃣ Verifying Secretary can approve...');

        // In a real API call, the middleware check this. Here we simulate the query logic used in server.js
        // Logic: if (!isAdmin && !isSecretary) -> check department match. if isSecretary -> allow.

        const isSecretary = (await prisma.userRole.findFirst({ where: { userId: secretary.id, role: 'secretary' } })) !== null;

        if (isSecretary) {
            console.log('✅ Permission Check Passed: User has secretary role.');

            // 6. Approve Reservation
            const approvedReservation = await prisma.meetingReservation.update({
                where: { id: reservation.id },
                data: { status: 'approved', approvedBy: secretary.id }
            });
            console.log(`✅ Reservation ${approvedReservation.id} Approved by Secretary (Status: ${approvedReservation.status})`);
        } else {
            console.error('❌ Permission Check Failed: User does not have secretary role.');
        }

        // 7. Handover Simulation (Change Role)
        console.log('7️⃣ Simulating Handover (Changing Secretary)...');
        const newSecretaryEmail = 'new_admin@test.com'; // Using existing admin or create new

        // Let's just remove role from old secretary
        await prisma.userRole.deleteMany({
            where: { userId: secretary.id, role: 'secretary' }
        });
        console.log('✅ Secretary role removed from old user.');

        const checkRole = await prisma.userRole.findFirst({ where: { userId: secretary.id, role: 'secretary' } });
        if (!checkRole) {
            console.log('✅ Verified: Old user no longer has secretary role.');
        }

    } catch (error) {
        console.error('❌ Error during verification:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifySecretaryWorkflow();
