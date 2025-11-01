import { Subscription } from '@prisma/client';
import { encrypt, decrypt } from '../utils/encryption.util';
import { prisma } from '../utils/prisma.util';

// Omit 'username' and 'password' fields and add them back as optional strings
type SubscriptionWithDecryptedCredentials = Omit<Subscription, 'username' | 'password'> & {
  username?: string;
  password?: string;
};

export class SubscriptionService {
  public static async createSubscription(
    userId: string,
    name: string,
    username: string,
    password: string
  ): Promise<SubscriptionWithDecryptedCredentials> {
    const encryptedUsername = encrypt(username);
    const encryptedPassword = encrypt(password);

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        name,
        username: encryptedUsername,
        password: encryptedPassword,
      },
    });

    return {
      ...subscription,
      username: decrypt(subscription.username),
      password: decrypt(subscription.password),
    };
  }

  public static async getSubscriptions(userId: string): Promise<SubscriptionWithDecryptedCredentials[]> {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
    });

    return subscriptions.map((sub) => ({
      ...sub,
      username: decrypt(sub.username),
      password: decrypt(sub.password),
    }));
  }

  public static async getSubscription(userId: string, subscriptionId: string): Promise<SubscriptionWithDecryptedCredentials | null> {
    const subscription = await prisma.subscription.findFirst({
      where: { id: subscriptionId, userId },
    });

    if (subscription) {
      return {
        ...subscription,
        username: decrypt(subscription.username),
        password: decrypt(subscription.password),
      };
    }
    return null;
  }

  public static async updateSubscription(
    userId: string,
    subscriptionId: string,
    name?: string,
    username?: string,
    password?: string
  ): Promise<SubscriptionWithDecryptedCredentials | null> {
    const data: { name?: string; username?: string; password?: string } = {};
    if (name) data.name = name;
    if (username) data.username = encrypt(username);
    if (password) data.password = encrypt(password);

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
      return {
        ...subscription,
        username: decrypt(subscription.username),
        password: decrypt(subscription.password),
      };
    }
    return null;
  }

  public static async deleteSubscription(userId: string, subscriptionId: string): Promise<void> {
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
