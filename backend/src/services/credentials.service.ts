import prisma from '../client';
import { encrypt, decrypt } from '../utils/encryption.util';
import { log } from '../utils/logging.util';

export const storeCredentials = async (userId: string, groupId: string, username: string, password: string): Promise<void> => {
    const group = await prisma.subscriptionGroup.findUnique({
        where: { id: groupId },
    });

    if (!group) {
        throw new Error('Subscription group not found');
    }

    if (group.ownerId !== userId) {
        throw new Error('Only the group owner can store credentials');
    }

    const existingCredentials = await prisma.encryptedCredentials.findUnique({
        where: { groupId },
    });

    if (existingCredentials) {
        throw new Error('Credentials already exist for this group');
    }

    const encryptedUsername = encrypt(username);
    const encryptedPassword = encrypt(password);

    await prisma.encryptedCredentials.create({
        data: {
            groupId,
            encryptedUsername,
            encryptedPassword,
        },
    });

    await prisma.auditLog.create({
        data: {
            userId,
            action: 'store_credentials',
            tableName: 'EncryptedCredentials',
            newValues: JSON.stringify({ groupId }),
        },
    });
};

export const getCredentials = async (userId: string, groupId: string): Promise<{ username: string; password: string }> => {
    const group = await prisma.subscriptionGroup.findUnique({
        where: { id: groupId },
        include: {
            members: true,
            credentials: true,
        },
    });

    if (!group) {
        throw new Error('Subscription group not found');
    }

    const isMember = group.members.some((member) => member.userId === userId);
    if (group.ownerId !== userId && !isMember) {
        throw new Error('Only group members can retrieve credentials');
    }

    if (!group.credentials) {
        throw new Error('Credentials not found for this group');
    }

    const username = decrypt(group.credentials.encryptedUsername);
    const password = decrypt(group.credentials.encryptedPassword);

    await prisma.auditLog.create({
        data: {
            userId,
            action: 'get_credentials',
            tableName: 'EncryptedCredentials',
            newValues: JSON.stringify({ groupId }),
        },
    });

    return { username, password };
};

export const updateCredentials = async (userId: string, groupId: string, username?: string, password?: string): Promise<void> => {
    const group = await prisma.subscriptionGroup.findUnique({
        where: { id: groupId },
    });

    if (!group) {
        throw new Error('Subscription group not found');
    }

    if (group.ownerId !== userId) {
        throw new Error('Only the group owner can update credentials');
    }

    const credentials = await prisma.encryptedCredentials.findUnique({
        where: { groupId },
    });

    if (!credentials) {
        throw new Error('Credentials not found for this group');
    }

    const data: { encryptedUsername?: string; encryptedPassword?: string } = {};
    if (username) {
        data.encryptedUsername = encrypt(username);
    }
    if (password) {
        data.encryptedPassword = encrypt(password);
    }

    await prisma.encryptedCredentials.update({
        where: { groupId },
        data,
    });

    await prisma.auditLog.create({
        data: {
            userId,
            action: 'update_credentials',
            tableName: 'EncryptedCredentials',
            oldValues: JSON.stringify(credentials),
            newValues: JSON.stringify({ groupId, ...data }),
        },
    });
};

export const deleteCredentials = async (userId: string, groupId: string): Promise<void> => {
    const group = await prisma.subscriptionGroup.findUnique({
        where: { id: groupId },
    });

    if (!group) {
        throw new Error('Subscription group not found');
    }

    if (group.ownerId !== userId) {
        throw new Error('Only the group owner can delete credentials');
    }

    const credentials = await prisma.encryptedCredentials.findUnique({
        where: { groupId },
    });

    if (!credentials) {
        throw new Error('Credentials not found for this group');
    }

    await prisma.encryptedCredentials.delete({
        where: { groupId },
    });

    await prisma.auditLog.create({
        data: {
            userId,
            action: 'delete_credentials',
            tableName: 'EncryptedCredentials',
            oldValues: JSON.stringify(credentials),
        },
    });
};
