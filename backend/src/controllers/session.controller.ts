import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express';
import * as sessionService from '../services/session.service';

export const getActiveSessions = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const sessions = await sessionService.getActiveSessions(userId);
        res.status(200).json(sessions);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const revokeSession = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        await sessionService.revokeSession(userId, sessionId);
        res.status(200).json({ message: 'Session revoked successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
