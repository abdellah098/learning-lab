import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authLimiter } from '../../middlewares/rateLimiter.middleware';
import { validate } from '../../middlewares/validation.middleware';
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.schemas';

const router = Router();

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', authLimiter, validate(loginSchema), AuthController.login);
router.post('/refresh', authLimiter, validate(refreshTokenSchema), AuthController.refresh);
router.post('/logout', validate(refreshTokenSchema), AuthController.logout);
router.get('/me', authenticate, AuthController.me);

export { router as authRoutes };