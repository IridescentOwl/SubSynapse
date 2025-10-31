import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.routes';

dotenv.config();

const prisma = new PrismaClient();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({
  origin: 'http://localhost:3000', // Allow the frontend origin
  credentials: true, // Allow cookies and authorization headers
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// Use the auth routes
app.use('/api/auth', authRoutes);

// Use the profile routes
import profileRoutes from './routes/profile.routes';
app.use('/api/profile', profileRoutes);

// Use the subscription routes
import subscriptionRoutes from './routes/subscription.routes';
app.use('/api/subscriptions', subscriptionRoutes);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
