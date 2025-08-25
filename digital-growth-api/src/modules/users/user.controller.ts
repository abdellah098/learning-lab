import { Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { AuthRequest, ApiResponse } from '../../types';
import { ROLES } from '../../common/constants';

export class UserController {
  static async createUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await UserService.createUser(req.body);
      
      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'User created successfully',
        traceId: req.traceId!,
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async getUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await UserService.getUserById(req.params.id, req.user!);
      
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

  static async updateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await UserService.updateUser(req.params.id, req.body, req.user!);
      
      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'User updated successfully',
        traceId: req.traceId!,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await UserService.deleteUser(req.params.id);
      
      const response: ApiResponse = {
        success: true,
        message: 'User deactivated successfully',
        traceId: req.traceId!,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async listUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { users, meta } = await UserService.listUsers(req.query, req.query);
      
      const response: ApiResponse = {
        success: true,
        data: users,
        meta,
        traceId: req.traceId!,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}