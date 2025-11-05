import prisma from '../utils/prisma.util';

const updatableUserFields = ['name'];

export class UserService {
  public static async updateProfile(userId: string, data: any) {
    const filteredData = Object.keys(data)
      .filter(key => updatableUserFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = data[key];
        return obj;
      }, {});

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
    return prisma.groupMembership.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        group: true,
      },
    });
  }
}
