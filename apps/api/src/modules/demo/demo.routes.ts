import { Router } from 'express';
import { DemoController } from './demo.controller';
import { AuthMiddleware } from '../auth/auth.middleware';

const router = Router();
const demoController = new DemoController();

// Public route - check demo status
router.get('/status', (req, res) => demoController.getStatus(req, res));

// Get presentation data - public for demo
router.get('/presentation', (req, res) => demoController.getPresentationData(req, res));

// Protected routes - require authentication
router.use(AuthMiddleware.authenticate);

// Initialize demo environment for user
router.post('/initialize', (req, res) => demoController.initialize(req, res));

// Generate specific scenario
router.post('/scenario', (req, res) => demoController.generateScenario(req, res));

// Clean up demo data
router.delete('/cleanup', (req, res) => demoController.cleanup(req, res));

// Simulate webhook for a bot
router.post('/webhook/:botId', (req, res) => demoController.simulateWebhook(req, res));

// Admin route - update configuration (should add admin middleware in production)
router.put('/config', (req, res) => demoController.updateConfig(req, res));

export const demoRoutes = router;
