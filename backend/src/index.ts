import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/node';
import authRoutes from './routes/auth.routes';
import { defaultRateLimiter } from './middleware/rateLimiter.middleware';
import { startSuspiciousActivityCheck } from './cron';
import { startDailyChecks } from './cron/dailyChecks';

dotenv.config();

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Sentry.Integrations.Express({ app: express() }),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});

const prisma = new PrismaClient();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({
  origin: 'http://localhost:3000', // Allow the frontend origin
  credentials: true, // Allow cookies and authorization headers
}));

app.use(helmet());

app.use(defaultRateLimiter);

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

// Use the payments routes
import paymentsRoutes from './routes/payments.routes';
app.use('/api/payments', paymentsRoutes);

// Use the credentials routes
import credentialRoutes from './routes/credential.routes';
app.use('/api/credentials', credentialRoutes);

// Use the review routes
import reviewRoutes from './routes/review.routes';
app.use('/api/reviews', reviewRoutes);

// Use the admin routes
import adminRoutes from './routes/admin.routes';
app.use('/api/admin', adminRoutes);

// Use the unsubscribe routes
import unsubscribeRoutes from './routes/unsubscribe.routes';
app.use('/api/unsubscribe', unsubscribeRoutes);

// Swagger API documentation
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './utils/swagger.util';
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// The Sentry request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());

// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

// The Sentry error handler must be registered before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  res.statusCode = 500;
  res.end(res.sentry + "\n");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  startSuspiciousActivityCheck();
  startDailyChecks();
});
