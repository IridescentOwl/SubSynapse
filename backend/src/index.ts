import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
// import * as Sentry from '@sentry/node'; // Removed due to version incompatibility
import { AuthenticatedRequest } from './types/express';
import { validateEnvironment } from './config/env.validation';
import { log } from './utils/logging.util';
import { defaultRateLimiter } from './middleware/rateLimiter.middleware';
import { startSuspiciousActivityCheck } from './cron';
import { startDailyChecks } from './cron/dailyChecks';

// Route imports
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import subscriptionGroupRoutes from './routes/subscriptionGroup.routes';
import paymentsRoutes from './routes/payments.routes';
import credentialRoutes from './routes/credential.routes';
import reviewRoutes from './routes/review.routes';
import adminRoutes from './routes/admin.routes';
import healthRoutes from './routes/health.routes';
import unsubscribeRoutes from './routes/unsubscribe.routes';
import staticRoutes from './routes/static.routes';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './utils/swagger.util';

dotenv.config();

// Validate environment variables before starting
const envConfig = validateEnvironment();

// Sentry initialization removed due to version incompatibility

const app = express();
const port = envConfig.PORT;

// Sentry middleware removed

// CORS configuration based on environment
const corsOptions = {
  origin: envConfig.NODE_ENV === 'development' 
    ? /http:\/\/localhost:\d+/ 
    : envConfig.FRONTEND_URL,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(defaultRateLimiter);

app.use(express.json());

// Logging middleware
app.use((req: AuthenticatedRequest, res, next) => {
  log('info', `Incoming request: ${req.method} ${req.url}`, { body: req.body });
  next();
});

app.get('/', (req, res) => {
  res.send('Server is running!');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subscription-groups', subscriptionGroupRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/credentials', credentialRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', healthRoutes);
app.use('/api/unsubscribe', unsubscribeRoutes);
app.use('/api/static', staticRoutes);

// Swagger API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Sentry error handler removed

// Import error handling middleware
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

// Handle 404 routes
app.use(notFoundHandler);

// Global error handling middleware (must be last)
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  startSuspiciousActivityCheck();
  startDailyChecks();
});
