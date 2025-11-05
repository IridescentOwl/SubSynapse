import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/express';
import * as credentialService from '../services/credentials.service';

export const storeCredentials = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { groupId, username, password } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        await credentialService.storeCredentials(userId, groupId, username, password);
        res.status(201).json({ message: 'Credentials stored successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getCredentials = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { groupId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const credentials = await credentialService.getCredentials(userId, groupId);
        res.status(200).json(credentials);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCredentials = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { groupId } = req.params;
        const { username, password } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        await credentialService.updateCredentials(userId, groupId, username, password);
        res.status(200).json({ message: 'Credentials updated successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteCredentials = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { groupId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        await credentialService.deleteCredentials(userId, groupId);
        res.status(200).json({ message: 'Credentials deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
