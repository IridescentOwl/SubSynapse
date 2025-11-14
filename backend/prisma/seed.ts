import { PrismaClient } from '@prisma/client';
import { AuthService } from '../src/services/auth.service';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  await prisma.user.deleteMany();
  await prisma.subscriptionGroup.deleteMany();
  await prisma.groupMembership.deleteMany();
  await prisma.admin.deleteMany();

  const password = await AuthService.hashPassword('password123');
  const apiKey = crypto.randomBytes(32).toString('hex');
  const hashedApiKey = await AuthService.hashPassword(apiKey);


  // Create an admin user
    await prisma.admin.create({
        data: {
            email: 'admin@thapar.edu',
            password,
            apiKey: hashedApiKey,
        },
    });

  console.log(`Created admin user with email: admin@thapar.edu`);
    console.log(`API Key: ${apiKey}`);


  // Create a user
  const user1 = await prisma.user.create({
    data: {
      email: 'testuser1@thapar.edu',
      name: 'Test User 1',
      password,
      emailVerified: true,
      creditBalance: 1000,
    },
  });

  console.log(`Created user: ${user1.name} with id: ${user1.id}`);

  // Create another user
  const user2 = await prisma.user.create({
    data: {
      email: 'testuser2@thapar.edu',
      name: 'Test User 2',
      password,
      emailVerified: true,
      creditBalance: 500,
    },
  });

  console.log(`Created user: ${user2.name} with id: ${user2.id}`);

  // Create a subscription group
  const group1 = await prisma.subscriptionGroup.create({
    data: {
      ownerId: user1.id,
      name: 'Netflix Premium Family',
      serviceType: 'Streaming',
      totalPrice: 649,
      slotsTotal: 4,
      slotsFilled: 2,
      adminApproved: true,
    },
  });

  console.log(`Created subscription group: ${group1.name} with id: ${group1.id}`);

  // Add the owner as a member
  await prisma.groupMembership.create({
    data: {
      userId: user1.id,
      groupId: group1.id,
      shareAmount: group1.totalPrice / group1.slotsTotal,
    },
  });

  // Add the second user as a member
  await prisma.groupMembership.create({
    data: {
      userId: user2.id,
      groupId: group1.id,
      shareAmount: group1.totalPrice / group1.slotsTotal,
    },
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
