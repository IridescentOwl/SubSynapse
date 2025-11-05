import prisma from '../client';

const INACTIVITY_PERIOD = 24 * 60 * 60 * 1000; // 24 hours

export const revokeInactiveSessions = async () => {
    await prisma.activeSession.deleteMany({
        where: {
            expiresAt: {
                lt: new Date(),
            },
        },
    });
};
