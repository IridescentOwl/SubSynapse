import prisma from '../utils/prisma.singleton';
import bcrypt from 'bcrypt';
import { log } from '../utils/logging.util';

async function seedAdmin() {
    const email = 'admin@synapse.com';
    const password = 'adminpassword123';
    const name = 'System Admin';

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            if (!existingUser.isAdmin) {
                await prisma.user.update({
                    where: { email },
                    data: { isAdmin: true }
                });
                log('info', 'Existing user promoted to admin.');
            } else {
                log('info', 'Admin user already exists.');
            }
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                isAdmin: true,
                emailVerified: true,
                isActive: true
            },
        });

        log('info', `Admin user created with email: ${email}`);
    } catch (error) {
        log('error', 'Error seeding admin user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedAdmin();
