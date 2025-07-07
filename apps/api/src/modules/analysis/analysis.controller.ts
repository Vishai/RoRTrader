import { Request, Response, NextFunction } from 'express';
import { Injectable } from '@/shared/decorators/injectable.decorator';
import { Controller } from '@/shared/decorators/controller.decorator';
import { Get, Post } from '@/shared/decorators/http-methods.decorator';
import { TechnicalAnalysisService } from './technical-analysis.service';
import { validate } from '@/shared/middleware/validation.middleware';
import { calculateIndicatorSchema, batchIndicatorSchema } from './analysis.validation';
import { asyncHandler } from '@/shared/utils/async-handler';

@Injectable()
@Controller('/api/analysis')
export class AnalysisController {
  constructor(private readonly analysisService: TechnicalAnalysisService) {}

  /**
   * Calculate a single indicator
   * POST /api/analysis/indicator
   */
  @Post('/indicator')
  async calculateIndicator(req: Request, res: Response, next: NextFunction) {
    return asyncHandler(async () => {
      const { symbol, indicator, params, candles } = validate(calculateIndicatorSchema, req.body);
      
      const result = await this.analysisService.calculateIndicators({
        symbol,
        indicator,
        params,
        candles
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
  @Post('/batch')
  async calculateBatchIndicators(req: Request, res: Response, next: NextFunction) {
    return asyncHandler(async () => {
      const { symbol, indicators, candles } = validate(batchIndicatorSchema, req.body);
      
      const results = await Promise.all(
        indicators.map(ind => 
          this.analysisService.calculateIndicators({
            symbol,
            indicator: ind.name,
            params: ind.params || {},
            candles
          })
        )
      );
      
      // Calculate overall market sentiment
      const signals = results.map(r => r.signal);
      const bullishCount = signals.filter(s => s === 'bullish').length;
      const bearishCount = signals.filter(s => s === 'bearish').length;
      
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
            neutral: signals.filter(s => s === 'neutral').length
          }
        }
      });
    })(req, res, next);
  }

  /**
   * Get supported indicators and their parameters
   * GET /api/analysis/indicators
   */
  @Get('/indicators')
  async getSupportedIndicators(req: Request, res: Response) {
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
  @Get('/stream/:symbol')
  async streamIndicators(req: Request, res: Response) {
    res.json({
      success: true,
      message: 'WebSocket endpoint - connect via ws:// protocol',
      url: `ws://localhost:3001/analysis/stream/${req.params.symbol}`
    });
  }
}
