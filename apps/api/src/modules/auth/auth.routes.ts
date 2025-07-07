import { Router } from 'express';
import { AuthController } from './auth.controller';
import { AuthMiddleware } from './auth.middleware';

const router = Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refreshToken);

// Protected routes (require authentication)
router.use(AuthMiddleware.authenticate);

router.post('/logout', AuthController.logout);

// 2FA routes
router.get('/2fa/setup', AuthController.setup2FA);
router.post('/2fa/enable', AuthController.enable2FA);
router.post('/2fa/disable', AuthController.disable2FA);

// Session management
router.get('/sessions', AuthController.getSessions);
router.delete('/sessions/:sessionId', AuthController.revokeSession);
router.post('/sessions/revoke-all', AuthController.revokeAllSessions);

export default router;
