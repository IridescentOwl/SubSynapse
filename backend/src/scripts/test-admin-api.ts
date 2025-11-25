import { AdminService } from '../services/admin.service';
import prisma from '../utils/prisma.singleton';
import { log } from '../utils/logging.util';

async function testAdminApi() {
    log('info', 'Starting Admin API Test...');

    try {
        // 1. Test Login
        log('info', 'Testing Login...');
        const loginResult = await AdminService.login('admin@synapse.com', 'adminpassword123');
        if (loginResult && loginResult.token) {
            log('info', 'Login Successful');
        } else {
            throw new Error('Login Failed');
        }

        // 2. Test Dashboard Stats
        log('info', 'Testing Dashboard Stats...');
        const stats = await AdminService.getDashboardStats();
        console.log('Stats:', stats);

        // 3. Create a pending group for testing
        log('info', 'Creating test pending group...');
        const owner = await prisma.user.findFirst();
        if (!owner) throw new Error('No users found to create group');

        const group = await prisma.subscriptionGroup.create({
            data: {
                name: 'Test Pending Group',
                serviceType: 'netflix',
                totalPrice: 100,
                slotsTotal: 4,
                slotsFilled: 0,
                ownerId: owner.id,
                status: 'pending_review',
                adminApproved: false,
                isActive: true
            }
        });
        log('info', `Created group ${group.id}`);

        // 4. Test Get Pending Groups
        log('info', 'Testing Get Pending Groups...');
        const pendingGroups = await AdminService.getPendingGroups();
        const found = pendingGroups.find(g => g.id === group.id);
        if (found) {
            log('info', 'Pending group found in list');
        } else {
            throw new Error('Pending group not found in list');
        }

        // 5. Test Approve Group
        log('info', 'Testing Approve Group...');
        await AdminService.approveGroup(group.id);
        const approvedGroup = await prisma.subscriptionGroup.findUnique({ where: { id: group.id } });
        if (approvedGroup?.status === 'active' && approvedGroup.adminApproved) {
            log('info', 'Group approved successfully');
        } else {
            throw new Error('Group approval failed');
        }

        // 6. Test Reject Group (Create another one)
        log('info', 'Testing Reject Group...');
        const group2 = await prisma.subscriptionGroup.create({
            data: {
                name: 'Test Reject Group',
                serviceType: 'spotify',
                totalPrice: 50,
                slotsTotal: 2,
                slotsFilled: 0,
                ownerId: owner.id,
                status: 'pending_review',
                adminApproved: false,
                isActive: true
            }
        });
        await AdminService.rejectGroup(group2.id);
        const rejectedGroup = await prisma.subscriptionGroup.findUnique({ where: { id: group2.id } });
        if (rejectedGroup?.status === 'rejected' && !rejectedGroup.adminApproved && !rejectedGroup.isActive) {
            log('info', 'Group rejected successfully');
        } else {
            throw new Error('Group rejection failed');
        }

        // Clean up
        await prisma.subscriptionGroup.delete({ where: { id: group.id } });
        await prisma.subscriptionGroup.delete({ where: { id: group2.id } });
        log('info', 'Test data cleaned up');

        log('info', 'All Admin API tests passed!');
    } catch (error) {
        log('error', 'Test failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testAdminApi();
