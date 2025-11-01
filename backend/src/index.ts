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

import { log } from './utils/logging.util';

app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  log('info', `Incoming request: ${req.method} ${req.url}`, { body: req.body });
  next();
});

app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Use the auth routes
app.use('/api/auth', authRoutes);

// Use the user routes
import userRoutes from './routes/user.routes';
app.use('/api/users', userRoutes);

// Use the subscription group routes
import subscriptionGroupRoutes from './routes/subscriptionGroup.routes';
app.use('/api/subscription-groups', subscriptionGroupRoutes);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
