import { PrismaClient } from '@prisma/client';

class PrismaSingleton {
  private static instance: PrismaClient;

  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!PrismaSingleton.instance) {
      PrismaSingleton.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });

      // Handle graceful shutdown
      process.on('beforeExit', async () => {
        await PrismaSingleton.instance.$disconnect();
      });
    }

    return PrismaSingleton.instance;
  }

  public static async disconnect(): Promise<void> {
    if (PrismaSingleton.instance) {
      await PrismaSingleton.instance.$disconnect();
    }
  }
}

export const prisma = PrismaSingleton.getInstance();
export default prisma;