import { Router } from 'express';
import { ClientController } from './client.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validation.middleware';
import { createClientSchema, updateClientSchema, getClientSchema, listClientsSchema } from './client.schemas';
import { ROLES } from '../../common/constants';

const router = Router();

router.use(authenticate);
router.use(authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER));

router.get('/', validate(listClientsSchema), ClientController.listClients);
router.post('/', validate(createClientSchema), ClientController.createClient);
router.get('/:id', validate(getClientSchema), ClientController.getClient);
router.patch('/:id', validate(updateClientSchema), ClientController.updateClient);
router.delete('/:id', validate(getClientSchema), ClientController.deleteClient);

export { router as clientRoutes };