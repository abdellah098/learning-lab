import { z } from 'zod';
import { ROLES } from '../../common/constants';

export const createUserSchema = {
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain at least 1 letter and 1 digit'),
    firstName: z.string().min(1, 'First name is required').trim(),
    lastName: z.string().min(1, 'Last name is required').trim(),
    role: z.enum([ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.PROJECT_MEMBER]),
  }),
};

export const updateUserSchema = {
  body: z.object({
    firstName: z.string().min(1).trim().optional(),
    lastName: z.string().min(1).trim().optional(),
    role: z.enum([ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.PROJECT_MEMBER]).optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
  }),
};

export const getUserSchema = {
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
  }),
};

export const listUsersSchema = {
  query: z.object({
    page: z.string().transform(Number).default('1'),
    limit: z.string().transform(Number).default('20'),
    sort: z.string().optional(),
    role: z.enum([ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.PROJECT_MEMBER]).optional(),
    isActive: z.string().transform(val => val === 'true').optional(),
    search: z.string().optional(),
  }),
};