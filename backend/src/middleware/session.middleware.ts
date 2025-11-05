import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express';
import prisma from '../client';

export const oneActiveSessionPerSubscription = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { groupId } = req.params;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const activeSession = await prisma.activeSession.findFirst({
        where: {
            userId,
            sessionToken: req.headers.authorization?.split(' ')[1],
        },
    });

    if (!activeSession) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const groupMembership = await prisma.groupMembership.findFirst({
        where: {
            userId,
            groupId,
        },
    });

    if (groupMembership) {
        const recentAccess = await prisma.auditLog.findFirst({
            where: {
                action: 'get_credentials',
                newValues: JSON.stringify({ groupId }),
                userId: {
                    not: userId,
                },
                createdAt: {
                    gte: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes
                },
            },
        });

        if (recentAccess) {
            return res.status(403).json({ message: 'Another user is currently accessing these credentials. Please try again in a few minutes.' });
        }
    }

    next();
};
