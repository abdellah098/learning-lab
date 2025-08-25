export const ROLES = {
  ADMIN: 'admin',
  PROJECT_MANAGER: 'project_manager',
  PROJECT_MEMBER: 'project_member',
} as const;

export const PROJECT_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;

export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const MAX_REFRESH_TOKENS = 5;