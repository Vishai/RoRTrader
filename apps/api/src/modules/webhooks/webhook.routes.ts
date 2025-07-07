import { Router, Request, Response, NextFunction } from 'express';
import { WebhookService } from './webhook.service';
import { AuthMiddleware } from '@/modules/auth/auth.middleware';
import { validateWebhookSignal } from './webhook.validation';

const router = Router();
const webhookService = new WebhookService();

/**
 * Receive webhook from TradingView or other sources
 * No authentication required - security is via webhook secret
 */
router.post('/webhook/:botId/:secret', 
  validateWebhookSignal,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { botId, secret } = req.params;
      const signal = req.body;
      
      console.log(`Webhook received for bot ${botId}`);
      
      const result = await webhookService.processWebhook(botId, secret, signal);
      
      // Always return 200 to acknowledge receipt
      res.status(200).json(result);
    } catch (error) {
      // Log error but still return 200 to prevent webhook retries
      console.error('Webhook processing error:', error);
      res.status(200).json({
        success: false,
        message: 'Webhook received but processing failed'
      });
    }
  }
);

/**
 * Get webhook logs for a bot (authenticated)
 */
router.get('/api/bots/:botId/webhooks',
  AuthMiddleware.authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { botId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const userId = req.user!.userId;
      
      const logs = await webhookService.getWebhookLogs(botId, userId, limit);
      res.json(logs);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Test webhook endpoint (authenticated)
 */
router.post('/api/bots/:botId/test-webhook',
  AuthMiddleware.authenticate,
  validateWebhookSignal,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { botId } = req.params;
      const signal = req.body;
      const userId = req.user!.userId;
      
      // For testing - verify ownership and send test webhook
      const result = await webhookService.testWebhook(botId, userId, signal);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

export const webhookRoutes = router;
