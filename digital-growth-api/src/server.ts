import { app } from './app';
import { connectDatabase } from './config/database';
import { logger } from './config/logger';
import { env } from './config/env';

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    
    // Start server
    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      logger.info(`📚 API Documentation: http://localhost:${env.PORT}/api/v1`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      logger.info(`📡 Received ${signal}, shutting down gracefully...`);
      server.close(() => {
        logger.info('✅ Process terminated gracefully');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();