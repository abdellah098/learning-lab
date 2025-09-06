import { Response, NextFunction } from 'express';
import { ProjectService } from './project.service';
import { AuthRequest, ApiResponse } from '../../types';

export class ProjectController {
  static async createProject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.createProject(req.body);

      const response: ApiResponse = {
        success: true,
        data: project,
        message: 'Project created successfully',
        traceId: req.traceId!,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async getProject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.getProjectById(req.params.id, req.user);

      const response: ApiResponse = {
        success: true,
        data: project,
        traceId: req.traceId!,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async updateProject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      console.log('Updating project with ID: *****************', req.body);

      await ProjectService.updateProject(req.params.id, req.body, req.user!);

      const response: ApiResponse = {
        success: true,
        message: 'Project updated successfully',
        traceId: req.traceId!,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async deleteProject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await ProjectService.deleteProject(req.params.id, req.user!);

      const response: ApiResponse = {
        success: true,
        message: 'Project deleted successfully',
        traceId: req.traceId!,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async listProjects(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projects = await ProjectService.listProjects(req.query, req.user!);

      const response: ApiResponse = {
        success: true,
        data: projects,
        traceId: req.traceId!,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async updateTeamMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await ProjectService.updateTeamMember(req.params.id, req.body.userIds, req.user!);

      const response: ApiResponse = {
        success: true,
        message: 'Team members updated successfully',
        traceId: req.traceId!,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async createObjective(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.createObjective(req.params.id, req.body, req.user!);

      const response: ApiResponse = {
        success: true,
        data: project,
        message: 'Objective created successfully',
        traceId: req.traceId!,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async updateObjective(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.updateObjective(
        req.params.id,
        req.params.objectiveId,
        req.body,
        req.user!
      );

      const response: ApiResponse = {
        success: true,
        data: project,
        message: 'Objective updated successfully',
        traceId: req.traceId!,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async deleteObjective(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.deleteObjective(req.params.id, req.params.objectiveId, req.user!);

      const response: ApiResponse = {
        success: true,
        data: project,
        message: 'Objective deleted successfully',
        traceId: req.traceId!,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async createTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.createTask(req.params.id, req.body, req.user!);

      const response: ApiResponse = {
        success: true,
        data: project,
        message: 'Task created successfully',
        traceId: req.traceId!,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async updateTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.updateTask(
        req.params.id,
        req.params.taskId,
        req.body,
        req.user!
      );

      const response: ApiResponse = {
        success: true,
        data: project,
        message: 'Task updated successfully',
        traceId: req.traceId!,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async deleteTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.deleteTask(req.params.id, req.params.taskId, req.user!);

      const response: ApiResponse = {
        success: true,
        data: project,
        message: 'Task deleted successfully',
        traceId: req.traceId!,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}