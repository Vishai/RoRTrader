import { Router } from 'express';
import { StrategyService } from './strategy.service';
import { StrategyController } from './strategy.controller';
import { StrategyEvaluationService } from './strategy-evaluation.service';
import { TechnicalAnalysisService } from '../analysis/technical-analysis.service';
import { RedisService } from '@/shared/services/redis.service';

// Create instances
const redisService = new RedisService();
const technicalAnalysisService = new TechnicalAnalysisService(redisService);
const strategyService = new StrategyService();
const strategyEvaluationService = new StrategyEvaluationService(technicalAnalysisService);
const strategyController = new StrategyController(strategyService);

// Create router
const router = Router();

// Register routes
router.post('/', strategyController.createStrategy.bind(strategyController));
router.get('/templates', strategyController.getTemplates.bind(strategyController));
router.get('/templates/:id', strategyController.getTemplate.bind(strategyController));
router.get('/bot/:botId', strategyController.getStrategyByBot.bind(strategyController));
router.get('/:id', strategyController.getStrategy.bind(strategyController));
router.put('/:id', strategyController.updateStrategy.bind(strategyController));
router.delete('/:id', strategyController.deleteStrategy.bind(strategyController));
router.post('/from-template', strategyController.createFromTemplate.bind(strategyController));

export const strategyRoutes = router;

export const StrategyModule = {
  controllers: [StrategyController],
  services: [StrategyService, StrategyEvaluationService],
  exports: [StrategyService, StrategyEvaluationService]
};

export { StrategyService } from './strategy.service';
export { StrategyEvaluationService } from './strategy-evaluation.service';
export { StrategyController } from './strategy.controller';
export type { CreateStrategyDto, UpdateStrategyDto } from './strategy.service';
export type { StrategyEvaluationResult } from './strategy-evaluation.service';
