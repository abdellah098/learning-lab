import mongoose from 'mongoose';
import { Project, IProject, IObjective } from './project.model';
import { User } from '../users/user.model';
import { Client } from '../clients/client.model';
import { ApiError } from '../../common/errors';
import { buildSortQuery, buildFilterQuery } from '../../common/utils';
import { ROLES, TASK_STATUS } from '../../common/constants';
import { AuthUser } from '../../types';

export class ProjectService {
  static async createProject(projectData: Partial<IProject>): Promise<IProject> {
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
   
    project.tasks = project.tasks.map(task => {
      return {

        ...task.toObject(),
        assigneeId: task.assigneeId ? task.assigneeId._id : undefined
      };
    });

    return project;
  }

  static async updateProject(id: string, updateData: Partial<IProject>, user: AuthUser): Promise<void> {
    const project = await Project.findById(id);

    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    if (!this.canModifyProject(project, user)) {
      throw ApiError.forbidden('Cannot modify this project');
    }

    Object.assign(project, updateData);
    await project.save();

    await this.getProjectById(id);
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

  static async listProjects(filters: any = {}, user: AuthUser): Promise<any[]> {

    // Build the base query
    let query = buildFilterQuery(filters);

    // Restrict results for project members
    if (user.role === ROLES.PROJECT_MEMBER) {
      query.teamMembers = { $in: [user._id] };
    }

    // Build sort query with default fallback
    const sort = buildSortQuery(filters.sortBy);

    // Execute query and count in parallel
    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate('clientId', 'name contactPerson')
        .populate('teamMembers', 'firstName lastName email')
        .sort(sort),
      Project.countDocuments(query),
    ]);

    // Map IProject to ShortProject
    const mappedProjects = projects.map((project) => ({
      _id: project._id.toString(),
      name: project.name,
      clientName: (project.clientId as any)?.name ?? 'Unknown',
      description: project.description ?? '',
      status: project.status,
      createdAt: project.createdAt?.toISOString() ?? '',
      endDate: project.endDate?.toISOString() ?? '',
      teamSize: project.teamMembers.length,
      progress: ProjectService.calculateProjectProgress(project),
      channel: project.channel,
    }));

    return mappedProjects;
  }

  static calculateProjectProgress = (project: IProject): number => {
    const totalTasks = project.tasks.length;
    if (totalTasks === 0) return 0;

    const completedTasks = project.tasks.filter(task => task.status === TASK_STATUS.COMPLETED).length;
    return Math.round((completedTasks / totalTasks) * 100);
  };

  static async updateTeamMember(
    projectId: string,
    userIds: string[],
    user: AuthUser
  ): Promise<void> {
    const project = await Project.findById(projectId);

    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    if (!this.canModifyProject(project, user)) {
      throw ApiError.forbidden('Cannot modify project team');
    }

    const usersToAssign = await User.find({
      _id: { $in: userIds },
      isActive: true
    });

    if (usersToAssign.length !== userIds.length) {
      throw ApiError.badRequest('Some users not found or inactive');
    }

    project.teamMembers = userIds.map(id => new mongoose.Types.ObjectId(id));

    await project.save();

  }

  static async createObjective(projectId: string, objectiveData: any, user: AuthUser): Promise<IObjective> {
    const project = await Project.findById(projectId);

    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    if (!this.canModifyProject(project, user)) {
      throw ApiError.forbidden('Cannot modify project objectives');
    }

    project.objectives.push(objectiveData);
    await project.save();

    // Return the newly created objective
    return project.objectives[project.objectives.length - 1];
  }

  static async updateObjective(
    projectId: string,
    objectiveId: string,
    updateData: any,
    user: AuthUser
  ): Promise<void> {
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
  }

  static async deleteObjective(projectId: string, objectiveId: string, user: AuthUser): Promise<void> {
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

  }

  static async createTask(projectId: string, taskData: any, user: AuthUser): Promise<any> {
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

    return project.tasks[project.tasks.length - 1];
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

  static async deleteTask(projectId: string, taskId: string, user: AuthUser): Promise<void> {
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