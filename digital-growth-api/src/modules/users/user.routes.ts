import { Router } from 'express';
import { UserController } from './user.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validation.middleware';
import { createUserSchema, updateUserSchema, getUserSchema, listUsersSchema } from './user.schemas';
import { ROLES } from '../../common/constants';

const router = Router();

router.use(authenticate);

router.get('/', authorize(ROLES.ADMIN), validate(listUsersSchema), UserController.listUsers);
router.post('/', authorize(ROLES.ADMIN), validate(createUserSchema), UserController.createUser);
router.get('/:id', validate(getUserSchema), UserController.getUser);
router.patch('/:id', validate(updateUserSchema), UserController.updateUser);
router.delete('/:id', authorize(ROLES.ADMIN), validate(getUserSchema), UserController.deleteUser);

export { router as userRoutes };