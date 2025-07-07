import { Router } from 'express';
import { TechnicalAnalysisService } from './technical-analysis.service';
import { AnalysisController } from './analysis.controller';
import { MarketDataService } from './market-data.service';
import { RedisService } from '@/shared/services/redis.service';

// Create instances
const redisService = new RedisService();
const technicalAnalysisService = new TechnicalAnalysisService(redisService);
const marketDataService = new MarketDataService(redisService);
const analysisController = new AnalysisController(technicalAnalysisService);

// Create router
const router = Router();

// Register routes
router.post('/indicator', analysisController.calculateIndicator.bind(analysisController));
router.post('/batch', analysisController.calculateBatchIndicators.bind(analysisController));
router.get('/indicators', analysisController.getSupportedIndicators.bind(analysisController));
router.get('/stream/:symbol', analysisController.streamIndicators.bind(analysisController));

export const analysisRoutes = router;

export const AnalysisModule = {
  controllers: [AnalysisController],
  services: [TechnicalAnalysisService, MarketDataService],
  exports: [TechnicalAnalysisService, MarketDataService]
};

export { TechnicalAnalysisService } from './technical-analysis.service';
export { MarketDataService } from './market-data.service';
export { AnalysisController } from './analysis.controller';
export type { CandleData, IndicatorInput, IndicatorResult } from './technical-analysis.service';
