import { Router, Request, Response, NextFunction } from 'express';
import { BotsService } from './bots.service';
import { AuthMiddleware } from '../auth/auth.middleware';
import { CreateBotDto, UpdateBotDto } from './dto';
import { BotStatus } from '@prisma/client';
import { validateCreateBot, validateUpdateBot } from './bot.validation';

const router = Router();
const botsService = new BotsService();

// Apply authentication to all routes
router.use(AuthMiddleware.authenticate);

/**
 * Create a new bot
 */
router.post('/',
  validateCreateBot,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const botData: CreateBotDto = req.body;
      
      const bot = await botsService.create(userId, botData);
      res.status(201).json(bot);
    } catch (error: any) {
      if (error.message.includes('Bot limit reached')) {
        return res.status(403).json({ error: error.message });
      }
      next(error);
    }
  }
);

/**
 * Get all bots for the authenticated user
 */
router.get('/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as BotStatus | undefined;
      
      const result = await botsService.findAll(userId, page, limit, status);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get a specific bot by ID
 */
router.get('/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      
      const bot = await botsService.findOne(id, userId);
      res.json(bot);
    } catch (error: any) {
      if (error.message === 'Bot not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }
);

/**
 * Update a bot
 */
router.put('/:id',
  validateUpdateBot,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const updateData: UpdateBotDto = req.body;
      
      const bot = await botsService.update(id, userId, updateData);
      res.json(bot);
    } catch (error: any) {
      if (error.message === 'Bot not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }
);

/**
 * Delete a bot
 */
router.delete('/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      
      await botsService.remove(id, userId);
      res.status(204).send();
    } catch (error: any) {
      if (error.message === 'Bot not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('Cannot delete an active bot')) {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }
);

/**
 * Start/stop a bot
 */
router.post('/:id/status',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status || !['ACTIVE', 'PAUSED', 'STOPPED'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      
      const bot = await botsService.updateStatus(id, userId, status as BotStatus);
      res.json(bot);
    } catch (error: any) {
      if (error.message === 'Bot not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('requires') || error.message.includes('must have')) {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }
);

/**
 * Clone a bot
 */
router.post('/:id/clone',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const { name } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Name is required for cloning' });
      }
      
      const bot = await botsService.clone(id, userId, name);
      res.json(bot);
    } catch (error: any) {
      if (error.message === 'Bot not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('Bot limit reached')) {
        return res.status(403).json({ error: error.message });
      }
      next(error);
    }
  }
);

/**
 * Get bot performance metrics (placeholder)
 */
router.get('/:id/performance',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { period, startDate, endDate } = req.query;
      
      // TODO: Implement performance endpoint
      res.json({
        message: 'Performance endpoint coming soon',
        botId: id,
        period,
        startDate,
        endDate
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get bot trades (placeholder)
 */
router.get('/:id/trades',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      
      // TODO: Implement trades endpoint
      res.json({
        message: 'Trades endpoint coming soon',
        botId: id,
        page,
        limit
      });
    } catch (error) {
      next(error);
    }
  }
);

export const botRoutes = router;
