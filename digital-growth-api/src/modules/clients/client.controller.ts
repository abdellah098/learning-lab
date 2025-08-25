import { Response, NextFunction } from 'express';
import { ClientService } from './client.service';
import { AuthRequest, ApiResponse } from '../../types';

export class ClientController {
  static async createClient(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const client = await ClientService.createClient(req.body);
      
      const response: ApiResponse = {
        success: true,
        data: client,
        message: 'Client created successfully',
        traceId: req.traceId!,
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async getClient(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const client = await ClientService.getClientById(req.params.id);
      
      const response: ApiResponse = {
        success: true,
        data: client,
        traceId: req.traceId!,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async updateClient(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const client = await ClientService.updateClient(req.params.id, req.body);
      
      const response: ApiResponse = {
        success: true,
        data: client,
        message: 'Client updated successfully',
        traceId: req.traceId!,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async deleteClient(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await ClientService.deleteClient(req.params.id);
      
      const response: ApiResponse = {
        success: true,
        message: 'Client deactivated successfully',
        traceId: req.traceId!,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async listClients(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { clients, meta } = await ClientService.listClients(req.query, req.query);
      
      const response: ApiResponse = {
        success: true,
        data: clients,
        meta,
        traceId: req.traceId!,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}