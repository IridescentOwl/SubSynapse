# Setup Guide for SubSynapse

## Prerequisites

1. **Node.js** (v18 or higher)
2. **MongoDB** (local or cloud instance)
3. **npm** or **yarn**

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install

# Create environment file
cp .env.example .env
# Edit .env with your actual values

# Generate Prisma Client
npx prisma generate

# (Optional) Run database migrations if needed
# npx prisma migrate deploy

# (Optional) Seed the database
# npm run seed

# Start the backend server
npm run dev
```

The backend will run on `http://localhost:4000`

### 2. Frontend Setup

```bash
# From project root
npm install

# (Optional) Create .env.local for custom API URL
# VITE_API_BASE_URL=http://localhost:4000/api

# Start the frontend dev server
npm run dev
```

The frontend will run on `http://localhost:3000`

## Environment Variables

### Backend (.env)

**Required:**
- `DATABASE_URL` - MongoDB connection string
- `JWT_SECRET` - At least 32 characters
- `JWT_REFRESH_SECRET` - At least 32 characters  
- `ENCRYPTION_KEY` - Exactly 32 bytes
- `RAZORPAY_KEY_ID` - Your Razorpay key
- `RAZORPAY_KEY_SECRET` - Your Razorpay secret
- `SENDGRID_API_KEY` - For email sending
- `EMAIL_FROM` - Sender email address
- `ADMIN_EMAIL` - Admin email address
- `FRONTEND_URL` - Frontend URL (http://localhost:3000 for dev)

**Optional:**
- `PORT` - Server port (default: 4000)
- `NODE_ENV` - Environment (development/production)
- `TWILIO_*` - For SMS notifications
- `SENTRY_DSN` - For error tracking

### Frontend (.env.local)

**Optional:**
- `VITE_API_BASE_URL` - Backend API URL (defaults to relative `/api`)
- `VITE_API_PROXY_TARGET` - Dev server proxy target (default: http://localhost:4000)

## Database Setup

1. **Install MongoDB** locally or use MongoDB Atlas (cloud)

2. **Update DATABASE_URL** in `backend/.env`:
   ```
   DATABASE_URL="mongodb://localhost:27017/subsynapse"
   # Or for MongoDB Atlas:
   DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/subsynapse"
   ```

3. **Generate Prisma Client**:
   ```bash
   cd backend
   npx prisma generate
   ```

4. **Run Migrations** (if needed):
   ```bash
   npx prisma migrate deploy
   ```

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Build
```bash
npm run build
```

## Production Deployment

1. Set `NODE_ENV=production` in backend `.env`
2. Update all production URLs and secrets
3. Build frontend: `npm run build`
4. Build backend: `cd backend && npm run build`
5. Use Docker Compose: `docker-compose -f docker-compose.prod.yml up`

## Common Issues

### Backend won't start
- Check all required environment variables are set
- Verify MongoDB is running and accessible
- Run `npx prisma generate` in backend directory

### Frontend can't connect to backend
- Ensure backend is running on port 4000
- Check CORS settings in backend
- Verify `FRONTEND_URL` in backend `.env` matches frontend URL

### Database connection errors
- Verify MongoDB is running
- Check `DATABASE_URL` format
- Ensure network/firewall allows connection

