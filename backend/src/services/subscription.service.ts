import { PrismaClient, Subscription } from '@prisma/client';
import { encrypt, decrypt } from '../utils/encryption.util';

const prisma = new PrismaClient();

// Omit the 'password' field from the Subscription type and add a 'password' field of type string.
type SubscriptionWithDecryptedPassword = Omit<Subscription, 'password'> & { password?: string };

export class SubscriptionService {
  public static async createSubscription(
    userId: number,
    name: string,
    username: string,
    password: string
  ): Promise<SubscriptionWithDecryptedPassword> {
    const encryptedPassword = encrypt(password);
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        name,
        username,
        password: encryptedPassword,
      },
    });
    return { ...subscription, password: decrypt(subscription.password) };
  }

  public static async getSubscriptions(userId: number): Promise<SubscriptionWithDecryptedPassword[]> {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
    });
    return subscriptions.map((sub) => ({ ...sub, password: decrypt(sub.password) }));
  }

  public static async getSubscription(userId: number, subscriptionId: number): Promise<SubscriptionWithDecryptedPassword | null> {
    const subscription = await prisma.subscription.findFirst({
      where: { id: subscriptionId, userId },
    });
    if (subscription) {
      return { ...subscription, password: decrypt(subscription.password) };
    }
    return null;
  }

  public static async updateSubscription(
    userId: number,
    subscriptionId: number,
    name?: string,
    username?: string,
    password?: string
  ): Promise<SubscriptionWithDecryptedPassword | null> {
    const data: { name?: string; username?: string; password?: string } = {};
    if (name) data.name = name;
    if (username) data.username = username;
    if (password) data.password = encrypt(password);

    const subscription = await prisma.subscription.update({
      where: { id: subscriptionId, userId },
      data,
    });
    if (subscription) {
      return { ...subscription, password: decrypt(subscription.password) };
    }
    return null;
  }

  public static async deleteSubscription(userId: number, subscriptionId: number): Promise<void> {
    await prisma.subscription.delete({
      where: { id: subscriptionId, userId },
    });
  }
}
