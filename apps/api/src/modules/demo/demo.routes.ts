import { Router } from 'express';
import { DemoController } from './demo.controller';
import { authenticate } from '../auth/auth.middleware';

const router = Router();
const demoController = new DemoController();

// Public route - check demo status
router.get('/status', demoController.getStatus);

// Protected routes - require authentication
router.use(authenticate);

// Initialize demo environment for user
router.post('/initialize', demoController.initialize);

// Generate specific scenario
router.post('/scenario', demoController.generateScenario);

// Clean up demo data
router.delete('/cleanup', demoController.cleanup);

// Simulate webhook for a bot
router.post('/webhook/:botId', demoController.simulateWebhook);

// Get presentation data
router.get('/presentation', demoController.getPresentationData);

// Admin route - update configuration (should add admin middleware in production)
router.put('/config', demoController.updateConfig);

export const demoRoutes = router;
