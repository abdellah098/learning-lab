import { Router } from 'express';
import { ProjectController } from './project.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validation.middleware';
import { 
  createProjectSchema, 
  updateProjectSchema, 
  getProjectSchema, 
  //listProjectsSchema,
  updateTeamMemberSchema,
  createObjectiveSchema,
  updateObjectiveSchema,
  createTaskSchema,
  updateTaskSchema,
  listProjectsSchema
} from './project.schemas';
import { ROLES } from '../../common/constants';

const router = Router();

router.use(authenticate);

// Main project routes
router.get('/', validate(listProjectsSchema), ProjectController.listProjects);

router.post('/', authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER), validate(createProjectSchema), ProjectController.createProject);

router.get('/:id', validate(getProjectSchema), ProjectController.getProject);

router.patch('/:id', authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER), validate(updateProjectSchema), 
ProjectController.updateProject);

/*router.delete('/:id', authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER), validate(getProjectSchema), ProjectController.deleteProject);*/

// Team management routes
router.patch('/:id/members', authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER), validate(updateTeamMemberSchema), ProjectController.updateTeamMember);

// Objectives routes
router.post('/:id/objectives', authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER), validate(createObjectiveSchema), ProjectController.createObjective);

router.patch('/:id/objectives/:objectiveId', authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER), validate(updateObjectiveSchema), ProjectController.updateObjective);

/*router.delete('/:id/objectives/:objectiveId', authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER), validate(getProjectSchema), ProjectController.deleteObjective);*/

// Tasks routes
router.post('/:id/tasks', authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER), validate(createTaskSchema), ProjectController.createTask);

router.patch('/:id/tasks/:taskId', validate(updateTaskSchema), ProjectController.updateTask);

/*router.delete('/:id/tasks/:taskId', authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER), validate(getProjectSchema), ProjectController.deleteTask);*/

export { router as projectRoutes };