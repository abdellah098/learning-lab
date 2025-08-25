import dotenv from 'dotenv';
import { z } from 'zod';
import { ZodError } from 'zod';

// Load .env file, with fallback for production
const dotenvResult = dotenv.config();
if (dotenvResult.error && process.env.NODE_ENV !== 'production') {
  console.warn('⚠️ Failed to load .env file:', dotenvResult.error.message);
}

/**
 * Schema for environment variables with validation rules
 */
const envSchema = z.object({
  /** Node environment (development, production, or test) */
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  /** Application port number */
  PORT: z
    .string()
    .transform(val => Number(val))
    .refine(val => !isNaN(val) && val > 0 && val <= 65535, {
      message: 'PORT must be a valid number between 1 and 65535',
    })
    .default('3000'),
  
  /** MongoDB connection URI */
  MONGO_URI: z.string().min(1, 'MONGO_URI is required').url('MONGO_URI must be a valid URL'),
  
  /** JWT secret for access tokens */
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  
  /** JWT secret for refresh tokens */
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  
  /** Access token expiration time (e.g., '15m', '1h', '1d') */
 JWT_ACCESS_EXPIRES: z
    .string()
    .regex(/^\d+(s|m|h|d)$/, 'JWT_ACCESS_EXPIRES must be in format like "15m" or "1h"')
    .default('15m'),
  
  /** Refresh token expiration time (e.g., '7d', '30d') */
  JWT_REFRESH_EXPIRES: z.string().regex(/^\d+(s|m|h|d)$/, 'JWT_REFRESH_EXPIRES must be in format like "7d" or "30d"').default('7d'),
  
  /** Allowed CORS origins (comma-separated URLs or '*') */
  CORS_ORIGIN: z
    .string()
    .transform(val => val.split(',').map(url => url.trim()))
    .refine(val => val.every(url => url === '*' || z.string().url().safeParse(url).success), {
      message: 'CORS_ORIGIN must be a comma-separated list of valid URLs or "*"',
    })
    .default('http://localhost:5173'),
  
  /** Rate limit window in milliseconds */
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .transform(val => Number(val))
    .refine(val => !isNaN(val) && val > 0, {
      message: 'RATE_LIMIT_WINDOW_MS must be a positive number',
    })
    .default('900000'),
  
  /** Maximum requests per window */
  RATE_LIMIT_MAX: z
    .string()
    .transform(val => Number(val))
    .refine(val => !isNaN(val) && val > 0, {
      message: 'RATE_LIMIT_MAX must be a positive number',
    })
    .default('100'),
  
  /** Number of bcrypt salt rounds */
  BCRYPT_ROUNDS: z
    .string()
    .transform(val => Number(val))
    .refine(val => !isNaN(val) && val >= 10 && val <= 20, {
      message: 'BCRYPT_ROUNDS must be a number between 10 and 20',
    })
    .default('12'),
  
  /** Optional: Log level (debug, info, warn, error) */
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional().default('info'),
}).superRefine((data, ctx) => {
  // Additional validation for production environment
  if (data.NODE_ENV === 'production') {
    if (data.JWT_ACCESS_SECRET === data.JWT_REFRESH_SECRET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['JWT_REFRESH_SECRET'],
        message: 'JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different in production',
      });
    }
    if (data.CORS_ORIGIN.includes('http://localhost:5173')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['CORS_ORIGIN'],
        message: 'CORS_ORIGIN should not include localhost in production',
      });
    }
  }
});

/** Type definition for environment variables */
export type Env = z.infer<typeof envSchema>;

/**
 * Validates environment variables and returns a typed Env object
 * @throws {Error} If validation fails, logs errors and exits process
 * @returns {Env} Validated environment variables
 */
function validateEnv(): Env {
  try {
    const parsed = envSchema.parse(process.env);
    console.info(`✅ Environment variables loaded successfully for ${parsed.NODE_ENV} environment`);
    return parsed;
  } catch (error) {
    if (error instanceof ZodError) {
      console.error('❌ Environment variable validation failed:');
      error.errors.forEach(err => {
        const path = err.path.join('.');
        const message = err.message;
        console.error(`  - ${path}: ${message}`);
      });
      console.error('\nPlease check your .env file or environment configuration.');
      process.exit(1);
    }
    console.error('❌ Unexpected error during environment validation:', error);
    throw error;
  }
}

export const env = validateEnv();