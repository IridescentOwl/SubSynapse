# Database Setup Guide

This guide will help you set up the database schema, run migrations, and seed test data.

## Prerequisites

1. MongoDB database (local or cloud)
2. Node.js and npm installed
3. Environment variables configured

## Environment Variables

Create a `.env` file in the `backend` directory with the following:

```env
DATABASE_URL="mongodb://localhost:27017/subsynapse"
# Or for MongoDB Atlas:
# DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/subsynapse?retryWrites=true&w=majority"

JWT_SECRET="your-jwt-secret-key"
JWT_REFRESH_SECRET="your-jwt-refresh-secret-key"
PORT=4000
```

## Database Schema

The database includes the following models:

- **Users**: User accounts with authentication and credit balance
- **Subscription_Groups**: Subscription sharing groups
- **Group_Memberships**: User memberships in subscription groups
- **Transactions**: Financial transactions (credits, payments, withdrawals)
- **Withdrawal_Requests**: User withdrawal requests
- **Encrypted_Credentials**: Encrypted subscription credentials
- **Reviews**: User reviews for subscription groups
- **Audit_Logs**: System audit trail
- **Email_Verifications**: Email verification tokens
- **Password_Reset_Tokens**: Password reset tokens
- **Active_Sessions**: Active user sessions

## Setup Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Generate Prisma Client

```bash
npm run db:generate
```

### 3. Push Database Schema

```bash
npm run db:push
```
or
```bash
npm run db:migrate
```

This will:
- Create the database schema (collections and indexes)
- Sync your Prisma schema with MongoDB
- Generate the Prisma Client

**Note**: For MongoDB, Prisma uses `db push` instead of traditional migrations. This command syncs your schema directly to the database without creating migration files.

### 4. Seed Test Data (Optional)

To populate the database with test data:

```bash
npm run db:seed
```

This will create:
- 3 test users (John Doe, Jane Smith, Bob Johnson)
- 3 subscription groups
- Sample transactions, memberships, reviews, and more

**Default test user password**: `password123`

### 5. Verify Database Connection

The server automatically checks the database connection on startup. If the connection fails, the server will not start.

## Database Connection Pooling

The application uses Prisma Client with automatic connection pooling. MongoDB connection pooling is handled by the MongoDB driver and configured through the connection string.

Connection pooling settings can be adjusted in the `DATABASE_URL`:
```
mongodb://host:port/database?maxPoolSize=10&minPoolSize=5
```

## Useful Commands

### Generate Prisma Client
```bash
npm run db:generate
```

### Push schema changes to database
```bash
npm run db:push
```
or
```bash
npm run db:migrate
```

### Open Prisma Studio (Database GUI)
```bash
npm run db:studio
```

### Seed database
```bash
npm run db:seed
```

### Reset database (WARNING: Deletes all data)
```bash
npx prisma migrate reset
```
Note: For MongoDB, you may need to manually drop collections if reset doesn't work as expected.

## Indexes

The following indexes are automatically created for performance:

- **Users**: `email`, `isVerified`, `createdAt`
- **Subscription_Groups**: `ownerId`, `serviceType`, `isActive`, `adminApproved`, `createdAt`
- **Group_Memberships**: `userId`, `groupId`, `isActive`, `joinDate` (unique constraint on `userId` + `groupId`)
- **Transactions**: `userId`, `type`, `status`, `createdAt`
- **Withdrawal_Requests**: `userId`, `status`, `requestedAt`, `cooldownExpiresAt`
- **Encrypted_Credentials**: `groupId`, `encryptionKeyId`
- **Reviews**: `groupId`, `userId`, `rating`, `createdAt` (unique constraint on `userId` + `groupId`)
- **Audit_Logs**: `userId`, `action`, `tableName`, `createdAt`
- **Email_Verifications**: `userId`, `token`, `expiresAt`, `usedAt`
- **Password_Reset_Tokens**: `userId`, `token`, `expiresAt`, `usedAt`
- **Active_Sessions**: `userId`, `sessionToken`, `expiresAt`

## Troubleshooting

### Connection Issues

1. Verify MongoDB is running
2. Check the `DATABASE_URL` in `.env`
3. Ensure network connectivity to MongoDB server
4. Check MongoDB authentication credentials

### Migration Issues

1. Make sure Prisma Client is generated: `npm run db:generate`
2. Check schema syntax: `npx prisma validate`
3. For MongoDB, schema changes are applied automatically - no explicit migration files needed

### Seed Data Issues

1. Ensure database is empty or you're okay with clearing existing data
2. Check that all dependencies are installed
3. Verify database connection before seeding

## Production Considerations

1. **Backup**: Always backup your database before running migrations
2. **Environment**: Use different databases for development and production
3. **Connection Pooling**: Configure appropriate pool sizes for your workload
4. **Indexes**: Monitor query performance and add indexes as needed
5. **Monitoring**: Set up database monitoring and alerts

## Next Steps

After setting up the database:
1. Start the development server: `npm run dev`
2. Test the API endpoints
3. Use Prisma Studio to inspect the database: `npm run db:studio`

