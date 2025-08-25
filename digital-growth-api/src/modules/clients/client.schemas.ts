import { z } from 'zod';

export const createClientSchema = {
  body: z.object({
    name: z.string().min(1, 'Client name is required').trim(),
    contactPerson: z.string().trim().optional(),
    contactEmail: z.string().email('Invalid email format').optional().or(z.literal('')),
  }),
};

export const updateClientSchema = {
  body: z.object({
    name: z.string().min(1).trim().optional(),
    contactPerson: z.string().trim().optional(),
    contactEmail: z.string().email('Invalid email format').optional().or(z.literal('')),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid client ID'),
  }),
};

export const getClientSchema = {
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid client ID'),
  }),
};

export const listClientsSchema = {
  query: z.object({
    page: z.string().transform(Number).default('1'),
    limit: z.string().transform(Number).default('20'),
    sort: z.string().optional(),
    isActive: z.string().transform(val => val === 'true').optional(),
    search: z.string().optional(),
  }),
};