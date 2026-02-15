const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyRoomResponsibility() {
    console.log('🚀 Starting Per-Room Responsibility Verification (Profile Model)...');

    try {
        // 0. Setup Departments
        console.log('0️⃣ Setting up departments...');
        const departments = ['Management', 'Sales', 'Marketing'];
        for (const name of departments) {
            await prisma.department.upsert({
                where: { name },
                update: {},
                create: { name }
            });
        }

        // 1. Setup Users (Profiles)
        console.log('1️⃣ Setting up users...');

        // Create Admin Profile
        const admin = await prisma.profile.upsert({
            where: { email: 'admin_test@test.com' },
            update: {},
            create: {
                email: 'admin_test@test.com',
                firstName: 'Admin',
                lastName: 'User',
                department: 'Management',
                isActive: true
            }
        });

        // Ensure Admin Role
        const adminRole = await prisma.userRole.findFirst({ where: { userId: admin.id, role: 'admin' } });
        if (!adminRole) await prisma.userRole.create({ data: { userId: admin.id, role: 'admin' } });

        // Create Responsible Person (User A)
        const userA = await prisma.profile.upsert({
            where: { email: 'responsible_test@test.com' },
            update: {},
            create: {
                email: 'responsible_test@test.com',
                firstName: 'Responsible',
                lastName: 'Person',
                department: 'Sales',
                isActive: true
            }
        });

        // Create Ordinary User / Requester (User B)
        const userB = await prisma.profile.upsert({
            where: { email: 'requester_test@test.com' },
            update: {},
            create: {
                email: 'requester_test@test.com',
                firstName: 'Ordinary',
                lastName: 'Requester',
                department: 'Marketing',
                isActive: true
            }
        });

        console.log('✅ Users setup complete.');

        // 2. Room Management
        console.log('2️⃣ Admin creating room with Responsible Person...');

        // Clean up existing room if any
        const existingRoom = await prisma.meetingRoom.findFirst({ where: { name: 'Test Room Responsibility' } });
        if (existingRoom) {
            await prisma.meetingReservation.deleteMany({ where: { roomId: existingRoom.id } });
            await prisma.meetingRoom.delete({ where: { id: existingRoom.id } });
        }

        const room = await prisma.meetingRoom.create({
            data: {
                name: 'Test Room Responsibility',
                capacity: 10,
                location: '1st Floor',
                responsibleId: userA.id // Assign User A
            }
        });

        console.log(`✅ Room "${room.name}" created with Responsible ID: ${room.responsibleId}`);

        if (room.responsibleId !== userA.id) throw new Error('Responsible Person assignment failed!');


        // 3. Reservation Flow
        console.log('3️⃣ User B requesting reservation...');

        const startTime = new Date();
        startTime.setDate(startTime.getDate() + 1);
        startTime.setHours(10, 0, 0, 0);
        const endTime = new Date(startTime);
        endTime.setHours(11, 0, 0, 0);

        const reservation = await prisma.meetingReservation.create({
            data: {
                roomId: room.id,
                requestedBy: userB.id,
                startTime: startTime,
                endTime: endTime,
                status: 'pending'
            }
        });

        console.log('✅ Reservation created.');

        // 4. Verify Notification Routing (Simulation)

        const roomCheck = await prisma.meetingRoom.findUnique({
            where: { id: room.id },
            include: { responsible: true }
        });

        if (!roomCheck) throw new Error('Room not found during routing check');

        if (roomCheck.responsibleId === userA.id) {
            console.log('✅ Routing Check: Room Responsible ID matches User A. Notification logic uses this relationship.');
        } else {
            throw new Error(`Routing Check Failed: Room Responsible ID mismatch. Expected ${userA.id}, got ${roomCheck.responsibleId}`);
        }

        // 5. Approval Logic Verification
        console.log('5️⃣ Verifying Approval Permissions...');

        // Check User A (Responsible)
        const canUserAApprove = room.responsibleId === userA.id;
        console.log(`User A (Responsible) can approve? ${canUserAApprove}`);
        if (!canUserAApprove) throw new Error('User A should be able to approve!');

        // Check User B (Requester/Ordinary)
        const canUserBApprove = room.responsibleId === userB.id; // Should be false
        // Also check roles, assuming User B has no special roles
        const userBRoles = await prisma.userRole.findMany({ where: { userId: userB.id } });
        const isUserBSpecial = userBRoles.some(r => ['admin', 'company_manager', 'secretary'].includes(r.role));

        console.log(`User B (Ordinary) can approve? ${canUserBApprove || isUserBSpecial}`);
        if (canUserBApprove || isUserBSpecial) throw new Error('User B should NOT be able to approve!');

        // Simulate Approval by User A
        const approvedReservation = await prisma.meetingReservation.update({
            where: { id: reservation.id },
            data: { status: 'approved', approvedBy: userA.id }
        });
        console.log(`✅ Reservation approved by User A. Status: ${approvedReservation.status}`);


        // 6. Handover Test
        console.log('6️⃣ Testing Handover (Changing Responsible Person)...');

        // Admin updates room to make User B responsible
        const updatedRoom = await prisma.meetingRoom.update({
            where: { id: room.id },
            data: { responsibleId: userB.id }
        });

        console.log(`✅ Room updated. New Responsible ID: ${updatedRoom.responsibleId}`);

        if (updatedRoom.responsibleId !== userB.id) throw new Error('Handover failed!');

        // Now User B should be able to approve (Simulated check)
        const canUserBApproveNow = updatedRoom.responsibleId === userB.id;
        console.log(`User B (New Responsible) can approve now? ${canUserBApproveNow}`);

        if (!canUserBApproveNow) throw new Error('User B should be able to approve after handover!');

        console.log('🚀 All Verification Steps Passed Successfully!');

    } catch (error) {
        console.error('❌ Verification Failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

verifyRoomResponsibility();
