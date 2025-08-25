import mongoose from 'mongoose';
import { Project, IProject } from './project.model';
import { User } from '../users/user.model';
import { Client } from '../clients/client.model';
import { ApiError } from '../../common/errors';
import { buildSortQuery, buildFilterQuery } from '../../common/utils';
import { DEFAULT_PAGINATION, ROLES, TASK_STATUS } from '../../common/constants';
import { AuthUser } from '../../types';

export class ProjectService {
  static async createProject(projectData: Partial<IProject>): Promise<IProject> {
    // Verify client exists and is active
    const client = await Client.findOne({ _id: projectData.clientId, isActive: true });
    if (!client) {
      throw ApiError.badRequest('Client not found or inactive');
    }

    // Verify team members exist and are active
    if (projectData.teamMembers && projectData.teamMembers.length > 0) {
      const users = await User.find({
        _id: { $in: projectData.teamMembers },
        isActive: true
      });
      
      if (users.length !== projectData.teamMembers.length) {
        throw ApiError.badRequest('One or more team members not found or inactive');
      }
    }

    const project = new Project(projectData);
    await project.save();
    
    return await this.getProjectById(project._id.toString());
  }

  static async getProjectById(id: string, user?: AuthUser): Promise<IProject> {
    const project = await Project.findById(id)
      .populate('clientId', 'name contactPerson contactEmail')
      .populate('teamMembers', 'firstName lastName email role')
      .populate('tasks.assigneeId', 'firstName lastName email');
    
    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    // Check access permissions
    if (user && !this.canAccessProject(project, user)) {
      throw ApiError.forbidden('Access denied to this project');
    }

    return project;
  }

  static async updateProject(id: string, updateData: Partial<IProject>, user: AuthUser): Promise<IProject> {
    const project = await Project.findById(id);
    
    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    if (!this.canModifyProject(project, user)) {
      throw ApiError.forbidden('Cannot modify this project');
    }

    // Verify client if being updated
    if (updateData.clientId) {
      const client = await Client.findOne({ _id: updateData.clientId, isActive: true });
      if (!client) {
        throw ApiError.badRequest('Client not found or inactive');
      }
    }

    Object.assign(project, updateData);
    await project.save();
    
    return await this.getProjectById(id);
  }

  static async deleteProject(id: string, user: AuthUser): Promise<void> {
    const project = await Project.findById(id);
    
    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    if (!this.canModifyProject(project, user)) {
      throw ApiError.forbidden('Cannot delete this project');
    }

    await Project.findByIdAndDelete(id);
  }

  static async listProjects(filters: any = {}, pagination: any = {}, user: AuthUser): Promise<{
    projects: IProject[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const page = Math.max(1, pagination.page || DEFAULT_PAGINATION.PAGE);
    const limit = Math.min(
      pagination.limit || DEFAULT_PAGINATION.LIMIT,
      DEFAULT_PAGINATION.MAX_LIMIT
    );
    const skip = (page - 1) * limit;

    let query = buildFilterQuery(filters);

    // Apply user-specific filters
    if (user.role === ROLES.PROJECT_MEMBER) {
      query.teamMembers = user._id;
    }
    // Admins and project managers can see all projects

    const sort = buildSortQuery(pagination.sort);

    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate('clientId', 'name contactPerson')
        .populate('teamMembers', 'firstName lastName email')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Project.countDocuments(query),
    ]);

    return {
      projects,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async addTeamMember(projectId: string, userId: string, user: AuthUser): Promise<IProject> {
    const project = await Project.findById(projectId);
    
    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    if (!this.canModifyProject(project, user)) {
      throw ApiError.forbidden('Cannot modify project team');
    }

    // Verify user exists and is active
    const userToAdd = await User.findOne({ _id: userId, isActive: true });
    if (!userToAdd) {
      throw ApiError.badRequest('User not found or inactive');
    }

    // Check if user is already a team member
    if (project.teamMembers.includes(new mongoose.Types.ObjectId(userId))) {
      throw ApiError.conflict('User is already a team member');
    }

    project.teamMembers.push(new mongoose.Types.ObjectId(userId));
    await project.save();
    
    return await this.getProjectById(projectId);
  }

  static async removeTeamMember(projectId: string, userId: string, user: AuthUser): Promise<IProject> {
    const project = await Project.findById(projectId);
    
    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    if (!this.canModifyProject(project, user)) {
      throw ApiError.forbidden('Cannot modify project team');
    }

    project.teamMembers = project.teamMembers.filter(
      memberId => memberId.toString() !== userId
    );
    await project.save();
    
    return await this.getProjectById(projectId);
  }

  static async createObjective(projectId: string, objectiveData: any, user: AuthUser): Promise<IProject> {
    const project = await Project.findById(projectId);
    
    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    if (!this.canModifyProject(project, user)) {
      throw ApiError.forbidden('Cannot modify project objectives');
    }

    project.objectives.push(objectiveData);
    await project.save();
    
    return await this.getProjectById(projectId);
  }

  static async updateObjective(
    projectId: string, 
    objectiveId: string, 
    updateData: any, 
    user: AuthUser
  ): Promise<IProject> {
    const project = await Project.findById(projectId);
    
    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    if (!this.canModifyProject(project, user)) {
      throw ApiError.forbidden('Cannot modify project objectives');
    }

    const objective = project.objectives.id(objectiveId);
    if (!objective) {
      throw ApiError.notFound('Objective not found');
    }

    Object.assign(objective, updateData);
    await project.save();
    
    return await this.getProjectById(projectId);
  }

  static async deleteObjective(projectId: string, objectiveId: string, user: AuthUser): Promise<IProject> {
    const project = await Project.findById(projectId);
    
    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    if (!this.canModifyProject(project, user)) {
      throw ApiError.forbidden('Cannot modify project objectives');
    }

    const objective = project.objectives.id(objectiveId);
    if (!objective) {
      throw ApiError.notFound('Objective not found');
    }

    project.objectives.pull(objectiveId);
    await project.save();
    
    return await this.getProjectById(projectId);
  }

  static async createTask(projectId: string, taskData: any, user: AuthUser): Promise<IProject> {
    const project = await Project.findById(projectId);
    
    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    if (!this.canModifyProject(project, user)) {
      throw ApiError.forbidden('Cannot modify project tasks');
    }

    // Verify assignee if provided
    if (taskData.assigneeId) {
      const assignee = await User.findOne({ _id: taskData.assigneeId, isActive: true });
      if (!assignee) {
        throw ApiError.badRequest('Assignee not found or inactive');
      }
    }

    // Convert dueDate string to Date object
    if (taskData.dueDate) {
      taskData.dueDate = new Date(taskData.dueDate);
    }

    project.tasks.push(taskData);
    await project.save();
    
    return await this.getProjectById(projectId);
  }

  static async updateTask(
    projectId: string, 
    taskId: string, 
    updateData: any, 
    user: AuthUser
  ): Promise<IProject> {
    const project = await Project.findById(projectId);
    
    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    const task = project.tasks.id(taskId);
    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    // Check permissions
    const canModify = this.canModifyProject(project, user) || 
                     (user.role === ROLES.PROJECT_MEMBER && 
                      task.assigneeId?.toString() === user._id);

    if (!canModify) {
      throw ApiError.forbidden('Cannot modify this task');
    }

    // Verify assignee if being updated
    if (updateData.assigneeId) {
      const assignee = await User.findOne({ _id: updateData.assigneeId, isActive: true });
      if (!assignee) {
        throw ApiError.badRequest('Assignee not found or inactive');
      }
    }

    // Convert dueDate string to Date object if provided
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }

    // Handle task completion
    if (updateData.status === TASK_STATUS.COMPLETED && task.status !== TASK_STATUS.COMPLETED) {
      updateData.completedAt = new Date();
    }

    Object.assign(task, updateData);
    await project.save();
    
    return await this.getProjectById(projectId);
  }

  static async deleteTask(projectId: string, taskId: string, user: AuthUser): Promise<IProject> {
    const project = await Project.findById(projectId);
    
    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    if (!this.canModifyProject(project, user)) {
      throw ApiError.forbidden('Cannot modify project tasks');
    }

    const task = project.tasks.id(taskId);
    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    project.tasks.pull(taskId);
    await project.save();
    
    return await this.getProjectById(projectId);
  }

  private static canAccessProject(project: IProject, user: AuthUser): boolean {
    if (user.role === ROLES.ADMIN || user.role === ROLES.PROJECT_MANAGER) {
      return true;
    }
    
    if (user.role === ROLES.PROJECT_MEMBER) {
      return project.teamMembers.some(memberId => memberId.toString() === user._id);
    }
    
    return false;
  }

  private static canModifyProject(project: IProject, user: AuthUser): boolean {
    return user.role === ROLES.ADMIN || user.role === ROLES.PROJECT_MANAGER;
  }
}