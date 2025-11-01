import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.create({
    data: {
      name: 'Alice',
      email: 'alice@example.com',
      password_hash: hashedPassword,
      is_verified: true,
      credit_balance: 100,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Bob',
      email: 'bob@example.com',
      password_hash: hashedPassword,
      is_verified: true,
      credit_balance: 50,
    },
  });

  const group1 = await prisma.subscription_Group.create({
    data: {
      owner_id: user1.id,
      name: 'Netflix Premium',
      service_type: 'Streaming',
      total_price: 15.99,
      slots_total: 4,
      slots_filled: 2,
      is_active: true,
      admin_approved: true,
    },
  });

  await prisma.group_Membership.create({
    data: {
      user_id: user1.id,
      group_id: group1.id,
      share_amount: 3.99,
    },
  });

  await prisma.group_Membership.create({
    data: {
      user_id: user2.id,
      group_id: group1.id,
      share_amount: 3.99,
    },
  });

  await prisma.transaction.create({
    data: {
      user_id: user1.id,
      type: 'deposit',
      amount: 100,
      status: 'completed',
    },
  });

  await prisma.transaction.create({
    data: {
      user_id: user2.id,
      type: 'deposit',
      amount: 50,
      status: 'completed',
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
