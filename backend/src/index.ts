import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.routes';

dotenv.config();

const prisma = new PrismaClient();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
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


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
