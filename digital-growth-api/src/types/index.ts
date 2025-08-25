import { Request } from 'express';
import { ROLES } from '../common/constants';

export type Role = typeof ROLES[keyof typeof ROLES];

export interface AuthUser {
  _id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
  traceId?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any[];
  };
  traceId: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
}

export interface RefreshTokenData {
  tokenHash: string;
  createdAt: Date;
  ip?: string;
  ua?: string;
}