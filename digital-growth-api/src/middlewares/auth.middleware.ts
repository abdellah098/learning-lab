import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../common/utils';
import { ApiError } from '../common/errors';
import { AuthRequest, Role } from '../types';
import { User } from '@/modules/users/user.model';

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access token required');
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    
    const user = await User.findById(decoded.sub).select('-password -refreshTokens');
    if (!user || !user.isActive) {
      throw ApiError.unauthorized('Invalid or inactive user');
    }

    req.user = {
      _id: user._id.toString(),
      email: user.email,
      role: user.role as Role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    next();
  } catch (error) {
    if (error && typeof error === 'object' && 'name' in error) {
      if ((error as { name: string }).name === 'JsonWebTokenError') {
        next(ApiError.unauthorized('Invalid access token'));
      } else if ((error as { name: string }).name === 'TokenExpiredError') {
        next(ApiError.unauthorized('Access token expired'));
      } else {
        next(error);
      }
    } else {
      next(error);
    }
  }
}

export function authorize(...allowedRoles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden('Insufficient permissions'));
    }

    next();
  };
}