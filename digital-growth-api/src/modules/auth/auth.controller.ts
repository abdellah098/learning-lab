import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { AuthRequest, ApiResponse } from '../../types';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      
      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'User registered successfully',
        traceId: (req as any).traceId,
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const metadata = {
        ip: req.ip,
        ua: req.get('User-Agent'),
      };
      
      const result = await AuthService.login(email, password, metadata);
      
      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Login successful',
        traceId: (req as any).traceId,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const metadata = {
        ip: req.ip,
        ua: req.get('User-Agent'),
      };
      
      const result = await AuthService.refreshToken(refreshToken, metadata);
      
      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Tokens refreshed successfully',
        traceId: (req as any).traceId,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      await AuthService.logout(refreshToken);
      
      const response: ApiResponse = {
        success: true,
        message: 'Logout successful',
        traceId: (req as any).traceId,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getCurrentUser(req.user!._id);
      
      const response: ApiResponse = {
        success: true,
        data: user,
        traceId: req.traceId!,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}