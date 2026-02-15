
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifySecretaryWorkflow() {
    console.log('🚀 Starting Secretary Workflow Verification...');

    try {
        // 1. Create a Secretary User (Profile)
        console.log('1️⃣ Creating Secretary Profile...');
        const secretaryEmail = 'secretary_test_cjs@test.com';
        let secretary = await prisma.profile.findUnique({ where: { email: secretaryEmail } });

        if (!secretary) {
            secretary = await prisma.profile.create({
                data: {
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
            console.log('✅ Secretary Profile created.');
        } else {
            console.log('ℹ️ Secretary Profile already exists.');
            // Ensure role is correct
            const role = await prisma.userRole.findFirst({
                where: { userId: secretary.id, role: 'secretary' }
            });
            if (!role) {
                await prisma.userRole.create({
                    data: { userId: secretary.id, role: 'secretary' }
                });
                console.log('✅ Secretary role added to existing profile.');
            }
        }

        // 2. Create a Regular Employee (Profile)
        console.log('2️⃣ Creating Regular Employee Profile...');
        const employeeEmail = 'employee_test_cjs@test.com';
        let employee = await prisma.profile.findUnique({ where: { email: employeeEmail } });

        if (!employee) {
            employee = await prisma.profile.create({
                data: {
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
            console.log('✅ Regular Employee Profile created.');
        }

        // 3. Create a Meeting Room
        console.log('3️⃣ Creating Meeting Room...');
        // Unique name to avoid conflicts
        const roomName = 'Test Room Secretary CJS ' + Date.now();
        const room = await prisma.meetingRoom.create({
            data: {
                name: roomName,
                capacity: 5,
                location: 'Floor 1'
            }
        });
        console.log('✅ Meeting Room created.');

        // 4. Create a Reservation Request (Pending)
        console.log('4️⃣ Creating Reservation Request (as Employee)...');

        // Future date
        const startTime = new Date();
        startTime.setDate(startTime.getDate() + 1); // Tomorrow
        startTime.setHours(15, 0, 0, 0);
        const endTime = new Date(startTime);
        endTime.setHours(16, 0, 0, 0);

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

        // 5. Verify Secretary Permission Logic (Simulated)
        console.log('5️⃣ Verifying Secretary Logic...');

        // Check if user has secretary role in user_roles table
        const secretaryRole = await prisma.userRole.findFirst({ where: { userId: secretary.id, role: 'secretary' } });

        if (secretaryRole) {
            console.log('✅ Permission Check Passed: User has secretary role.');

            // 6. Approve Reservation
            const approvedReservation = await prisma.meetingReservation.update({
                where: { id: reservation.id },
                data: { status: 'approved', approvedBy: secretary.id }
            });
            console.log(`✅ Reservation Approved by Secretary (New Status: ${approvedReservation.status})`);
        } else {
            console.error('❌ Permission Check Failed: User does not have secretary role.');
        }

        // Reuse Handover Verification Logic?
        // Let's check if we can transfer the role
        console.log('7️⃣ Simulating Handover (Changing Secretary Role)...');

        // Remove role from current secretary
        await prisma.userRole.deleteMany({
            where: { userId: secretary.id, role: 'secretary' }
        });
        console.log('✅ Secretary role removed from current user.');

        // Assign to employee (just for test)
        await prisma.userRole.create({
            data: { userId: employee.id, role: 'secretary' }
        });
        console.log('✅ Secretary role assigned to previous employee.');

        const newSecretaryRole = await prisma.userRole.findFirst({ where: { userId: employee.id, role: 'secretary' } });
        if (newSecretaryRole) {
            console.log('✅ Handover Verified: New user has secretary role.');
        }

    } catch (error) {
        console.error('❌ Error during verification:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifySecretaryWorkflow();
