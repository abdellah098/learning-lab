import { z } from 'zod';
import { PROJECT_STATUS, TASK_STATUS } from '../../common/constants';

export const listProjectsSchema = {
  query: z.object({
    search: z.string().trim().optional(),
    sortBy: z.enum(['name', 'status', 'createdAt', 'endDate']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
};

export const createProjectSchema = {
  body: z.object({
    name: z.string().min(1, 'Project name is required').trim(),
    description: z.string().trim().optional(),
    channel: z.string().min(1, 'Channel is required').trim(),
    status: z.enum(Object.values(PROJECT_STATUS) as [string, ...string[]]).optional(),
    clientId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid client ID').optional(),
    objectives: z.array(z.object({
      title: z.string().min(1, 'Objective title is required').trim(),
      kpi: z.string().min(1, 'KPI is required').trim(),
      targetValue: z.number().min(0, 'Target value must be positive'),
      currentValue: z.number().min(0, 'Current value must be positive').optional(),
    })).min(1, 'At least one objective is required'),
    teamMembers: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID')).optional(),
  }),
};

export const addTeamMemberSchema = {
  body: z.object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID'),
  }),
};

export const removeTeamMemberSchema = {
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID'),
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
  }),
};

export const createObjectiveSchema = {
  body: z.object({
    title: z.string().min(1, 'Objective title is required').trim(),
    kpi: z.string().min(1, 'KPI is required').trim(),
    targetValue: z.number().min(0, 'Target value must be positive'),
    currentValue: z.number().min(0, 'Current value must be positive').optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID'),
  }),
};

export const updateObjectiveSchema = {
  body: z.object({
    title: z.string().min(1).trim().optional(),
    kpi: z.string().min(1).trim().optional(),
    targetValue: z.number().min(0).optional(),
    currentValue: z.number().min(0).optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID'),
    objectiveId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid objective ID'),
  }),
};

export const createTaskSchema = {
  body: z.object({
    name: z.string().min(1, 'Task name is required').trim(),
    description: z.string().trim().optional(),
    assigneeId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID').optional(),
    dueDate: z.string().datetime('Invalid due date format'),
    status: z.enum(Object.values(TASK_STATUS) as [string, ...string[]]).optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID'),
  }),
};

export const updateTaskSchema = {
  body: z.object({
    name: z.string().min(1).trim().optional(),
    description: z.string().trim().optional(),
    assigneeId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID').optional(),
    dueDate: z.string().datetime().optional(),
    status: z.enum(Object.values(TASK_STATUS) as [string, ...string[]]).optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID'),
    taskId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid task ID'),
  }),
};

export const getProjectSchema = {
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID'),
  }),
};