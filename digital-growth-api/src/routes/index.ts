import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.routes';
import { userRoutes } from '../modules/users/user.routes';
import { clientRoutes } from '../modules/clients/client.routes';
import { projectRoutes } from '../modules/projects/project.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/clients', clientRoutes);
router.use('/projects', projectRoutes);

export { router as apiRoutes };