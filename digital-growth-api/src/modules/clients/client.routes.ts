import { Router } from 'express';
import { ClientController } from './client.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validation.middleware';
import { createClientSchema, updateClientSchema, getClientSchema, listClientsSchema } from './client.schemas';
import { ROLES } from '../../common/constants';

const router = Router();

router.use(authenticate);

router.get('/', validate(listClientsSchema), ClientController.listClients);
router.post('/', authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER), validate(createClientSchema), ClientController.createClient);
router.get('/:id', validate(getClientSchema), ClientController.getClient);
router.patch('/:id', authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER), validate(updateClientSchema), ClientController.updateClient);
router.delete('/:id', authorize(ROLES.ADMIN), validate(getClientSchema), ClientController.deleteClient);

export { router as clientRoutes };