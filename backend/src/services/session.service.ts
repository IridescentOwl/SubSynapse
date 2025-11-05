import prisma from '../client';

export const getActiveSessions = async (userId: string) => {
    return prisma.activeSession.findMany({
        where: {
            userId,
        },
    });
};

export const revokeSession = async (userId: string, sessionId: string) => {
    const session = await prisma.activeSession.findUnique({
        where: { id: sessionId },
    });

    if (!session) {
        throw new Error('Session not found');
    }

    if (session.userId !== userId) {
        throw new Error('You are not authorized to revoke this session');
    }

    return prisma.activeSession.delete({
        where: {
            id: sessionId,
        },
    });
};
