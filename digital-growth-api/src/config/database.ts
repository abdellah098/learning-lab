import mongoose from 'mongoose';
import { logger } from './logger';
import { env } from './env';

export async function connectDatabase(): Promise<void> {
  try {
    mongoose.set('strictQuery', true);
    
    const connection = await mongoose.connect(env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });

    logger.info(`✅ MongoDB connected: ${connection.connection.host}`);

    mongoose.connection.on('error', (error) => {
      logger.error('❌ MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️  MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('📦 MongoDB connection closed due to app termination');
      process.exit(0);
    });

  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
}