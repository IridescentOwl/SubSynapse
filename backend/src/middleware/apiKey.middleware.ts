import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '../services/auth.service';

const prisma = new PrismaClient();

export const apiKeyMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'];
    const adminEmail = req.headers['x-admin-email'];

    if (!apiKey || typeof apiKey !== 'string' || !adminEmail || typeof adminEmail !== 'string') {
        return res.status(401).json({ message: 'API key and admin email are required' });
    }

    try {
        const admin = await prisma.admin.findUnique({
            where: { email: adminEmail },
        });

        if (!admin) {
            return res.status(401).json({ message: 'Invalid admin email' });
        }

        const isApiKeyValid = await AuthService.comparePasswords(apiKey, admin.apiKey);

        if (!isApiKeyValid) {
            return res.status(401).json({ message: 'Invalid API key' });
        }

        // @ts-ignore
        req.user = admin;

        next();
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
