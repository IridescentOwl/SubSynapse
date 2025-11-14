import prisma from '../utils/prisma.singleton';
import { EncryptionService } from './encryption.service';

const updatableUserFields = ['name'];

export class UserService {
  public static async updateProfile(userId: string, data: any) {
    const filteredData = Object.keys(data)
      .filter(key => updatableUserFields.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = data[key];
        return obj;
      }, {} as any);

    if (filteredData.name) {
        filteredData.name = EncryptionService.encrypt(filteredData.name);
    }

    return prisma.user.update({
      where: { id: userId },
      data: filteredData,
    });
  }

  public static async uploadAvatar(userId: string, file: any) {
    // In a real application, you would handle the file upload here
    // For now, we'll just update the user's avatar URL with a placeholder
    const avatarUrl = `https://example.com/avatars/${userId}.jpg`;
    return prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
    });
  }

  public static async getTransactions(userId: string) {
    return prisma.transaction.findMany({
      where: { userId },
    });
  }

  public static async deactivateAccount(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
  }

  public static async getMySubscriptions(userId: string) {
    const memberships = await prisma.groupMembership.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        group: {
          include: {
            owner: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    
    // Decrypt owner names
    return memberships.map(membership => ({
      ...membership,
      group: {
        ...membership.group,
        owner: {
          ...membership.group.owner,
          name: membership.group.owner.name ? EncryptionService.decrypt(membership.group.owner.name) : 'Unknown',
        },
      },
    }));
  }
}
