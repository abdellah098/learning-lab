import { z } from 'zod';
import { ROLES } from '../../common/constants';

export const registerSchema = {
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain at least 1 letter and 1 digit'),
    firstName: z.string().min(1, 'First name is required').trim(),
    lastName: z.string().min(1, 'Last name is required').trim(),
    role: z.enum([ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.PROJECT_MEMBER]).optional(),
  }),
};

export const loginSchema = {
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
};

export const refreshTokenSchema = {
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
};

export const resetPasswordSchema = {
  body: z.object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
    newPassword: z.string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'New password must contain at least 1 letter and 1 digit')
  }),
};
