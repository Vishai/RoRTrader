import { Router } from 'express';
import { RedisService } from '@/shared/services/redis.service';
import { MarketDataService } from '../analysis/market-data.service';
import { MarketController } from './market.controller';
import { MarketGateway } from './market.gateway';

const redisService = new RedisService();
const marketDataService = new MarketDataService(redisService);
const marketController = new MarketController(marketDataService);

const router = Router();

router.get('/candles', marketController.getCandles.bind(marketController));
router.get('/ticker/:exchange/:symbol', marketController.getTicker.bind(marketController));
router.get('/orderbook/:exchange/:symbol', marketController.getOrderBook.bind(marketController));

export const marketRoutes = router;

export const MarketModule = {
  controllers: [MarketController],
  services: [MarketDataService],
  gateways: [MarketGateway],
  exports: [MarketDataService, MarketGateway]
};

export { MarketController } from './market.controller';
export { MarketDataService } from '../analysis/market-data.service';
export { MarketGateway } from './market.gateway';
export { normalizeExchange, normalizeTimeframe } from './utils';
