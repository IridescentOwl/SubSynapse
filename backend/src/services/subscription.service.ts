import { PrismaClient, Subscription } from '@prisma/client';
import { encrypt, decrypt } from '../utils/encryption.util';

const prisma = new PrismaClient();

// Omit the 'password' field from the Subscription type and add a 'password' field of type string.
type SubscriptionWithDecryptedPassword = Omit<Subscription, 'password'> & { password?: string };

export class SubscriptionService {
  public static async createSubscription(
    userId: string,
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

  public static async getSubscriptions(userId: string): Promise<SubscriptionWithDecryptedPassword[]> {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
    });
    return subscriptions.map((sub) => ({ ...sub, password: decrypt(sub.password) }));
  }

  public static async getSubscription(userId: string, subscriptionId: string): Promise<SubscriptionWithDecryptedPassword | null> {
    const subscription = await prisma.subscription.findFirst({
      where: { id: subscriptionId, userId },
    });
    if (subscription) {
      return { ...subscription, password: decrypt(subscription.password) };
    }
    return null;
  }

  public static async updateSubscription(
    userId: string,
    subscriptionId: string,
    name?: string,
    username?: string,
    password?: string
  ): Promise<SubscriptionWithDecryptedPassword | null> {
    const data: { name?: string; username?: string; password?: string } = {};
    if (name) data.name = name;
    if (username) data.username = username;
    if (password) data.password = encrypt(password);

    // For MongoDB, you need to use the `updateMany` or find the unique record first to update.
    // Here, we'll find the record first to ensure it belongs to the user.
    const existingSubscription = await prisma.subscription.findFirst({
      where: { id: subscriptionId, userId },
    });

    if (!existingSubscription) {
      return null;
    }

    const subscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data,
    });
    if (subscription) {
      return { ...subscription, password: decrypt(subscription.password) };
    }
    return null;
  }

  public static async deleteSubscription(userId: string, subscriptionId: string): Promise<void> {
    // For MongoDB, you need to use the `deleteMany` or find the unique record first to delete.
    // Here, we'll find the record first to ensure it belongs to the user.
    const existingSubscription = await prisma.subscription.findFirst({
      where: { id: subscriptionId, userId },
    });

    if (existingSubscription) {
      await prisma.subscription.delete({
        where: { id: subscriptionId },
      });
    }
  }
}
