import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { v4 as uuidv4 } from 'uuid';

// Ensure env is typed correctly (should match env.ts)
import type { Env } from '../config/env';

// Hash a password
export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, env.BCRYPT_ROUNDS);
}
 
// Compare a password with its hash
export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate an access token
export function generateAccessToken(payload: object): string {
  if (!env.JWT_ACCESS_SECRET) {
    throw new Error('JWT_ACCESS_SECRET is not defined');
  }
  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRES as SignOptions['expiresIn'], // Cast to correct type
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
}

// Generate a refresh token
export function generateRefreshToken(payload: object): string {
  if (!env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is not defined');
  }
    const options: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRES as SignOptions['expiresIn']
  };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
}

// Verify an access token
export function verifyAccessToken(token: string): any {
  if (!env.JWT_ACCESS_SECRET) {
    throw new Error('JWT_ACCESS_SECRET is not defined');
  }
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

// Verify a refresh token
export function verifyRefreshToken(token: string): any {
  if (!env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is not defined');
  }
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}

// Generate a unique trace ID
export function generateTraceId(): string {
  return uuidv4();
}

// Sanitize user object by removing sensitive fields
export function sanitizeUser(user: any) {
  const { password, refreshTokens, ...sanitized } = user.toObject ? user.toObject() : user;
  return sanitized;
}

// Build a sort query for database queries
export function buildSortQuery(sortParam?: string): Record<string, 1 | -1> {
  if (!sortParam) return { createdAt: -1 };

  const sortFields: Record<string, 1 | -1> = {};
  const fields = sortParam.split(',');

  fields.forEach((field) => {
    const trimmed = field.trim();
    if (trimmed.startsWith('-')) {
      sortFields[trimmed.substring(1)] = -1;
    } else {
      sortFields[trimmed] = 1;
    }
  });

  return sortFields;
}

// Build a filter query for database queries
export function buildFilterQuery(filters: Record<string, any>): Record<string, any> {
  const query: Record<string, any> = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (key === 'search') {
        query.$or = [
          { name: { $regex: value, $options: 'i' } },
          { description: { $regex: value, $options: 'i' } },
        ];
      } else {
        query[key] = value;
      }
    }
  });

  return query;
}

export const generateFriendlyPassword = (): string => {
  const adjectives = ['Quick', 'Bright', 'Swift', 'Smart', 'Bold'];
  const nouns = ['Tiger', 'Eagle', 'Storm', 'Ocean', 'Mountain'];
  const numbers = Math.floor(Math.random() * 100);
  
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${adj}${noun}${numbers}`;
};