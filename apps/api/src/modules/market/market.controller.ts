import { Request, Response, NextFunction } from 'express';
import { MarketDataService } from '../analysis/market-data.service';
import { asyncHandler } from '@/shared/utils/async-handler';
import { validate, ValidationError } from '@/shared/middleware/validation.middleware';
import {
  candlesQuerySchema,
  tickerParamsSchema,
  orderBookParamsSchema,
  orderBookQuerySchema
} from './market.validation';
import { normalizeExchange, normalizeTimeframe } from './utils';

export class MarketController {
  constructor(private readonly marketDataService: MarketDataService) {}

  /**
   * Normalize exchange identifiers from frontend to backend-supported names
   */
  private normalizeExchange(exchange: string): 'coinbase_pro' | 'alpaca' | 'demo' {
    return normalizeExchange(exchange);
  }

  /**
   * Normalize timeframe to one supported by the data service
   */
  private normalizeTimeframe(timeframe: string): '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' {
    return normalizeTimeframe(timeframe);
  }

  /**
   * GET /api/market/candles
   * Fetch historical candle data for a symbol/exchange/timeframe
   */
  getCandles(req: Request, res: Response, next: NextFunction) {
    return asyncHandler(async () => {
      let query: {
        symbol: string;
        exchange: string;
        timeframe: string;
        start?: Date;
        end?: Date;
        limit: number;
      };

      try {
        query = validate(candlesQuerySchema, req.query);
      } catch (error) {
        if (error instanceof ValidationError) {
          res.status(400).json({
            success: false,
            error: error.message,
            details: error.details
          });
          return;
        }
        throw error;
      }

      const exchange = this.normalizeExchange(query.exchange);
      const timeframe = this.normalizeTimeframe(query.timeframe);

      const candles = await this.marketDataService.getCandles({
        symbol: query.symbol,
        exchange,
        timeframe,
        limit: query.limit,
        startTime: query.start ? query.start.getTime() : undefined,
        endTime: query.end ? query.end.getTime() : undefined
      });

      const responseCandles = candles.map(candle => ({
        time: Math.floor(candle.time / 1000),
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume
      }));

      const firstCandle = candles[0];
      const lastCandle = candles[candles.length - 1];

      res.json({
        success: true,
        data: {
          symbol: query.symbol,
          exchange: query.exchange,
          timeframe: query.timeframe,
          candles: responseCandles,
          metadata: {
            firstTimestamp: firstCandle ? new Date(firstCandle.time).toISOString() : null,
            lastTimestamp: lastCandle ? new Date(lastCandle.time).toISOString() : null,
            count: responseCandles.length
          }
        }
      });
    })(req, res, next);
  }

  /**
   * GET /api/market/ticker/:exchange/:symbol
   * Fetch 24h ticker stats for a symbol
   */
  getTicker(req: Request, res: Response, next: NextFunction) {
    return asyncHandler(async () => {
      let params: { exchange: string; symbol: string };

      try {
        params = validate(tickerParamsSchema, req.params);
      } catch (error) {
        if (error instanceof ValidationError) {
          res.status(400).json({
            success: false,
            error: error.message,
            details: error.details
          });
          return;
        }
        throw error;
      }
      const exchange = this.normalizeExchange(params.exchange);

      const [currentPrice, stats] = await Promise.all([
        this.marketDataService.getCurrentPrice(params.symbol, exchange),
        this.marketDataService.getPriceStats(params.symbol, exchange, '24h')
      ]);

      const price = currentPrice || stats.currentPrice;

      res.json({
        success: true,
        data: {
          symbol: params.symbol,
          exchange: params.exchange,
          price,
          change24h: stats.change,
          changePercent24h: stats.changePercent,
          volume24h: stats.volume,
          high24h: stats.high,
          low24h: stats.low,
          timestamp: new Date().toISOString()
        }
      });
    })(req, res, next);
  }

  /**
   * GET /api/market/orderbook/:exchange/:symbol
   * Fetch synthetic order book depth data
   */
  getOrderBook(req: Request, res: Response, next: NextFunction) {
    return asyncHandler(async () => {
      let params: { exchange: string; symbol: string };
      let query: { depth: number };

      try {
        params = validate(orderBookParamsSchema, req.params);
        query = validate(orderBookQuerySchema, req.query);
      } catch (error) {
        if (error instanceof ValidationError) {
          res.status(400).json({
            success: false,
            error: error.message,
            details: error.details
          });
          return;
        }
        throw error;
      }

      const exchange = this.normalizeExchange(params.exchange);
      const orderBook = await this.marketDataService.getOrderBook(
        params.symbol,
        exchange,
        query.depth
      );

      res.json({
        success: true,
        data: {
          symbol: params.symbol,
          exchange: params.exchange,
          bids: orderBook.bids,
          asks: orderBook.asks,
          midpoint: orderBook.midpoint,
          timestamp: new Date().toISOString()
        }
      });
    })(req, res, next);
  }
}
