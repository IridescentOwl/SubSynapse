import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (optional - be careful in production!)
  console.log('🗑️  Clearing existing data...');
  await prisma.activeSession.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.emailVerification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.review.deleteMany();
  await prisma.encryptedCredential.deleteMany();
  await prisma.groupMembership.deleteMany();
  await prisma.withdrawalRequest.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.subscriptionGroup.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.user.deleteMany();

  // Create test users
  console.log('👤 Creating test users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: hashedPassword,
      creditBalance: 1000.0,
      isVerified: true,
      lastLogin: new Date(),
      emailVerified: true,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      password: hashedPassword,
      creditBalance: 500.0,
      isVerified: true,
      lastLogin: new Date(),
      emailVerified: true,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      password: hashedPassword,
      creditBalance: 250.0,
      isVerified: false,
      emailVerified: false,
    },
  });

  // Create subscription groups
  console.log('📦 Creating subscription groups...');
  const group1 = await prisma.subscriptionGroup.create({
    data: {
      ownerId: user1.id,
      name: 'Netflix Premium Family',
      serviceType: 'Netflix',
      totalPrice: 999.0,
      slotsTotal: 4,
      slotsFilled: 2,
      isActive: true,
      adminApproved: true,
      proofDocument: 'https://example.com/proof1.pdf',
    },
  });

  const group2 = await prisma.subscriptionGroup.create({
    data: {
      ownerId: user2.id,
      name: 'Spotify Family Plan',
      serviceType: 'Spotify',
      totalPrice: 149.0,
      slotsTotal: 6,
      slotsFilled: 3,
      isActive: true,
      adminApproved: true,
      proofDocument: 'https://example.com/proof2.pdf',
    },
  });

  const group3 = await prisma.subscriptionGroup.create({
    data: {
      ownerId: user1.id,
      name: 'Disney+ Hotstar Premium',
      serviceType: 'Disney+',
      totalPrice: 299.0,
      slotsTotal: 4,
      slotsFilled: 1,
      isActive: true,
      adminApproved: false,
    },
  });

  // Create group memberships
  console.log('👥 Creating group memberships...');
  await prisma.groupMembership.create({
    data: {
      userId: user2.id,
      groupId: group1.id,
      shareAmount: 249.75, // 999 / 4
      isActive: true,
    },
  });

  await prisma.groupMembership.create({
    data: {
      userId: user3.id,
      groupId: group2.id,
      shareAmount: 24.83, // 149 / 6
      isActive: true,
    },
  });

  // Create transactions
  console.log('💰 Creating transactions...');
  await prisma.transaction.create({
    data: {
      userId: user1.id,
      type: 'credit_purchase',
      amount: 1000.0,
      status: 'completed',
      paymentGatewayId: 'pay_gw_123',
      metadata: {
        paymentMethod: 'credit_card',
        currency: 'INR',
      },
    },
  });

  await prisma.transaction.create({
    data: {
      userId: user2.id,
      type: 'payment',
      amount: -249.75,
      status: 'completed',
      metadata: {
        relatedGroupId: group1.id,
        relatedMembershipId: group1.id,
      },
    },
  });

  await prisma.transaction.create({
    data: {
      userId: user1.id,
      type: 'withdrawal',
      amount: -500.0,
      status: 'pending',
    },
  });

  // Create withdrawal requests
  console.log('💸 Creating withdrawal requests...');
  await prisma.withdrawalRequest.create({
    data: {
      userId: user1.id,
      amount: 500.0,
      upiId: 'user1@upi',
      status: 'pending',
      requestedAt: new Date(),
    },
  });

  await prisma.withdrawalRequest.create({
    data: {
      userId: user2.id,
      amount: 200.0,
      upiId: 'user2@upi',
      status: 'completed',
      requestedAt: new Date(Date.now() - 86400000), // Yesterday
      processedAt: new Date(),
    },
  });

  // Create encrypted credentials
  console.log('🔐 Creating encrypted credentials...');
  await prisma.encryptedCredential.create({
    data: {
      groupId: group1.id,
      encryptedUsername: 'encrypted_username_123',
      encryptedPassword: 'encrypted_password_456',
      encryptionKeyId: 'key_001',
    },
  });

  await prisma.encryptedCredential.create({
    data: {
      groupId: group2.id,
      encryptedUsername: 'encrypted_username_789',
      encryptedPassword: 'encrypted_password_012',
      encryptionKeyId: 'key_002',
    },
  });

  // Create reviews
  console.log('⭐ Creating reviews...');
  await prisma.review.create({
    data: {
      userId: user2.id,
      groupId: group1.id,
      rating: 5,
      comment: 'Great group, very reliable!',
    },
  });

  await prisma.review.create({
    data: {
      userId: user3.id,
      groupId: group2.id,
      rating: 4,
      comment: 'Good experience overall.',
    },
  });

  // Create audit logs
  console.log('📋 Creating audit logs...');
  await prisma.auditLog.create({
    data: {
      userId: user1.id,
      action: 'user_registered',
      tableName: 'users',
      newValues: {
        email: user1.email,
        name: user1.name,
      },
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user1.id,
      action: 'group_created',
      tableName: 'subscription_groups',
      newValues: {
        groupId: group1.id,
        name: group1.name,
      },
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
    },
  });

  // Create email verifications
  console.log('📧 Creating email verifications...');
  await prisma.emailVerification.create({
    data: {
      userId: user1.id,
      token: 'verify_token_123',
      expiresAt: new Date(Date.now() + 86400000), // 24 hours from now
    },
  });

  await prisma.emailVerification.create({
    data: {
      userId: user3.id,
      token: 'verify_token_456',
      expiresAt: new Date(Date.now() + 86400000),
      usedAt: null, // Not yet used
    },
  });

  // Create password reset tokens
  console.log('🔑 Creating password reset tokens...');
  await prisma.passwordResetToken.create({
    data: {
      userId: user2.id,
      token: 'reset_token_789',
      expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
    },
  });

  // Create active sessions
  console.log('🔐 Creating active sessions...');
  await prisma.activeSession.create({
    data: {
      userId: user1.id,
      sessionToken: 'session_token_user1_abc123',
      expiresAt: new Date(Date.now() + 604800000), // 7 days from now
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  });

  await prisma.activeSession.create({
    data: {
      userId: user2.id,
      sessionToken: 'session_token_user2_def456',
      expiresAt: new Date(Date.now() + 604800000),
      ipAddress: '192.168.1.2',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: 3`);
  console.log(`   - Subscription Groups: 3`);
  console.log(`   - Group Memberships: 2`);
  console.log(`   - Transactions: 3`);
  console.log(`   - Withdrawal Requests: 2`);
  console.log(`   - Encrypted Credentials: 2`);
  console.log(`   - Reviews: 2`);
  console.log(`   - Audit Logs: 2`);
  console.log(`   - Email Verifications: 2`);
  console.log(`   - Password Reset Tokens: 1`);
  console.log(`   - Active Sessions: 2`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

