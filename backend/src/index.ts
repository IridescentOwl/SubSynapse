import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma, { checkDatabaseConnection } from './utils/database.util';
import authRoutes from './routes/auth.routes';

dotenv.config();

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


// Initialize database connection and start server
async function startServer() {
  try {
    // Check database connection
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      console.error('Failed to connect to database');
      process.exit(1);
    }
    console.log('Database connection established');

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer();
