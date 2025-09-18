import { Request, Response, NextFunction } from 'express';
import { TechnicalAnalysisService } from './technical-analysis.service';
import { MarketDataService } from './market-data.service';
import { validate, ValidationError } from '@/shared/middleware/validation.middleware';
import {
  calculateIndicatorSchema,
  batchIndicatorSchema,
  type CalculateIndicatorPayload,
  type BatchIndicatorPayload
} from './analysis.validation';
import { asyncHandler } from '@/shared/utils/async-handler';

export class AnalysisController {
  constructor(
    private readonly analysisService: TechnicalAnalysisService,
    private readonly marketDataService: MarketDataService
  ) {}

  private normalizeIndicatorName(indicator: string): string {
    return indicator.trim().toUpperCase();
  }

  private normalizeExchange(exchange: string | undefined): 'coinbase_pro' | 'alpaca' | 'demo' {
    switch ((exchange || 'demo').toLowerCase()) {
      case 'coinbase':
      case 'coinbase_pro':
        return 'coinbase_pro';
      case 'alpaca':
        return 'alpaca';
      default:
        return 'demo';
    }
  }

  private normalizeTimeframe(timeframe: string | undefined): '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' {
    const valid: Array<'1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w'> = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'];
    if (!timeframe) return '1h';
    const match = valid.find(tf => tf === timeframe);
    return match || '1h';
  }

  /**
   * Calculate a single indicator
   * POST /api/analysis/indicator
   */
  async calculateIndicator(req: Request, res: Response, next: NextFunction) {
    let payload: CalculateIndicatorPayload;
    try {
      payload = validate<CalculateIndicatorPayload>(calculateIndicatorSchema, req.body);
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

    return asyncHandler(async () => {
      const { symbol, indicator, params, candles, timeframe, exchange, limit } = payload;

      const normalizedExchange = this.normalizeExchange(exchange);
      const normalizedTimeframe = this.normalizeTimeframe(timeframe);
      const resolvedCandles = candles ??
        (await this.marketDataService.getCandles({
          symbol,
          exchange: normalizedExchange,
          timeframe: normalizedTimeframe,
          limit
        }));
      
      const result = await this.analysisService.calculateIndicators({
        symbol,
        indicator: this.normalizeIndicatorName(indicator),
        params,
        candles: resolvedCandles
      });
      
      res.json({
        success: true,
        data: result
      });
    })(req, res, next);
  }

  /**
   * Calculate multiple indicators at once
   * POST /api/analysis/batch
   */
  async calculateBatchIndicators(req: Request, res: Response, next: NextFunction) {
    let payload: BatchIndicatorPayload;
    try {
      payload = validate<BatchIndicatorPayload>(batchIndicatorSchema, req.body);
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

    return asyncHandler(async () => {
      const {
        symbol,
        indicators,
        candles,
        timeframe,
        exchange,
        limit,
        bars
      } = payload;

      const normalizedExchange = this.normalizeExchange(exchange);
      const normalizedTimeframe = this.normalizeTimeframe(timeframe);
      const candleLimit = bars ?? limit;

      const resolvedCandles = candles ??
        (await this.marketDataService.getCandles({
          symbol,
          exchange: normalizedExchange,
          timeframe: normalizedTimeframe,
          limit: candleLimit
        }));
      
      const results = await Promise.all(
        indicators.map(ind => 
          this.analysisService.calculateIndicators({
            symbol,
            indicator: this.normalizeIndicatorName(ind.indicator),
            params: ind.params || {},
            candles: resolvedCandles
          })
        )
      );
      
      // Calculate overall market sentiment
      const signals = results.map(result => result.signal ?? 'neutral');
      const bullishCount = signals.filter(signal => signal === 'bullish').length;
      const bearishCount = signals.filter(signal => signal === 'bearish').length;
      
      let overallSentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
      if (bullishCount > bearishCount * 1.5) {
        overallSentiment = 'bullish';
      } else if (bearishCount > bullishCount * 1.5) {
        overallSentiment = 'bearish';
      }
      
      res.json({
        success: true,
        data: {
          indicators: results,
          sentiment: {
            overall: overallSentiment,
            bullish: bullishCount,
            bearish: bearishCount,
            neutral: signals.filter(signal => signal === 'neutral').length
          },
          timestamp: new Date().toISOString()
        }
      });
    })(req, res, next);
  }

  /**
   * Get supported indicators and their parameters
   * GET /api/analysis/indicators
   */
  async getSupportedIndicators(_req: Request, res: Response) {
    const indicators = [
      {
        name: 'SMA',
        displayName: 'Simple Moving Average',
        category: 'trend',
        params: [
          { name: 'period', type: 'number', default: 20, min: 5, max: 200 }
        ]
      },
      {
        name: 'EMA',
        displayName: 'Exponential Moving Average',
        category: 'trend',
        params: [
          { name: 'period', type: 'number', default: 20, min: 5, max: 200 }
        ]
      },
      {
        name: 'RSI',
        displayName: 'Relative Strength Index',
        category: 'momentum',
        params: [
          { name: 'period', type: 'number', default: 14, min: 5, max: 50 }
        ]
      },
      {
        name: 'MACD',
        displayName: 'MACD',
        category: 'trend',
        params: [
          { name: 'fastPeriod', type: 'number', default: 12, min: 5, max: 50 },
          { name: 'slowPeriod', type: 'number', default: 26, min: 10, max: 100 },
          { name: 'signalPeriod', type: 'number', default: 9, min: 5, max: 50 }
        ]
      },
      {
        name: 'BOLLINGER',
        displayName: 'Bollinger Bands',
        category: 'volatility',
        params: [
          { name: 'period', type: 'number', default: 20, min: 5, max: 50 },
          { name: 'stdDev', type: 'number', default: 2, min: 1, max: 3 }
        ]
      }
    ];
    
    res.json({
      success: true,
      data: indicators
    });
  }

  /**
   * Real-time indicator streaming endpoint (for WebSocket)
   * This is a placeholder for WebSocket implementation
   */
  async streamIndicators(req: Request, res: Response) {
    res.json({
      success: true,
      message: 'WebSocket endpoint - connect via ws:// protocol',
      url: `ws://localhost:3001/analysis/stream/${req.params.symbol}`
    });
  }
}
