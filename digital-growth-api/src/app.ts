import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { logger } from './config/logger';
import { generateTraceId } from './common/utils';
import { globalLimiter } from './middlewares/rateLimiter.middleware';
import { errorHandler, notFound } from './middlewares/error.middleware';
import { apiRoutes } from './routes';
import { AuthRequest } from './types';

const app = express();

// Trust proxy for rate limiting and IP detection
app.set('trust proxy', 1);

// Remove X-Powered-By header
app.disable('x-powered-by');

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
}));

// CORS
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Request logging
app.use(pinoHttp({
  logger,
  customLogLevel: function (req, res, err) {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn';
    } else if (res.statusCode >= 500 || err) {
      return 'error';
    } else if (res.statusCode >= 300 && res.statusCode < 400) {
      return 'silent';
    }
    return 'info';
  },
}));

// Add trace ID to requests
app.use((req: AuthRequest, res, next) => {
  req.traceId = generateTraceId();
  res.setHeader('X-Trace-ID', req.traceId);
  next();
});

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(globalLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// API routes
app.use('/api/v1', apiRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

export { app };