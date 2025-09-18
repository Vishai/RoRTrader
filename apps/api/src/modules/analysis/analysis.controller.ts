import { Request, Response, NextFunction } from 'express';
import { TechnicalAnalysisService } from './technical-analysis.service';
import { MarketDataService, type MarketDataSource } from './market-data.service';
import { validate, ValidationError } from '@/shared/middleware/validation.middleware';
import {
  calculateIndicatorSchema,
  batchIndicatorSchema,
  type CalculateIndicatorPayload,
  type BatchIndicatorPayload
} from './analysis.validation';
import { asyncHandler } from '@/shared/utils/async-handler';

type CandleMetaSource = MarketDataSource | 'provided';

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

  private normalizeTimeframe(timeframe: string | undefined): any {
    const valid = ['1m', '2m', '3m', '5m', '10m', '15m', '30m', '45m', '1h', '2h', '3h', '4h', '1d', '5d', '1w', '1M', '1y'];
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

      let resolvedCandles = candles;
      let dataSource: CandleMetaSource = 'provided';
      let cached = false;
      let fallback = false;

      if (!resolvedCandles) {
        const candleResult = await this.marketDataService.getCandles({
          symbol,
          exchange: normalizedExchange,
          timeframe: normalizedTimeframe,
          limit
        });

        resolvedCandles = candleResult.candles;
        dataSource = candleResult.source;
        cached = candleResult.cached;
        fallback = candleResult.fallback;
      }
      
      const result = await this.analysisService.calculateIndicators({
        symbol,
        indicator: this.normalizeIndicatorName(indicator),
        params,
        candles: resolvedCandles
      });
      
      res.json({
        success: true,
        data: result,
        meta: {
          dataSource,
          cached,
          fallback
        }
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

      let resolvedCandles = candles;
      let dataSource: MarketDataSource | 'provided' = 'provided';
      let cached = false;
      let fallback = false;

      if (!resolvedCandles) {
        const candleResult = await this.marketDataService.getCandles({
          symbol,
          exchange: normalizedExchange,
          timeframe: normalizedTimeframe,
          limit: candleLimit
        });

        resolvedCandles = candleResult.candles;
        dataSource = candleResult.source;
        cached = candleResult.cached;
        fallback = candleResult.fallback;
      }
      
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

      // Format results for UI consumption
      const formattedResults = results.map((result, index) => {
        // Debug logging
        console.log(`${result.indicator} values:`, {
          isArray: Array.isArray(result.values),
          length: Array.isArray(result.values) ? result.values.length : 'not array',
          sample: Array.isArray(result.values) ? result.values.slice(-3) : result.values
        });

        const lastValue = Array.isArray(result.values) && result.values.length > 0
          ? result.values[result.values.length - 1]
          : 0;

        // Determine trend based on recent values
        let trend: 'up' | 'down' | 'neutral' = 'neutral';
        if (Array.isArray(result.values) && result.values.length > 1) {
          const previousValue = result.values[result.values.length - 2];
          if (lastValue > previousValue * 1.01) trend = 'up';
          else if (lastValue < previousValue * 0.99) trend = 'down';
        }

        return {
          indicator: result.indicator,
          currentValue: lastValue,
          signal: {
            type: result.signal === 'bullish' ? 'buy' :
                  result.signal === 'bearish' ? 'sell' : 'neutral',
            strength: result.strength || 50,
            message: `${result.indicator}: ${lastValue.toFixed(2)}`
          },
          trend,
          parameters: indicators[index].params || {}
        };
      });

      // Calculate overall market sentiment
      const signals = results.map(result => result.signal ?? 'neutral');
      const bullishCount = signals.filter(signal => signal === 'bullish').length;
      const bearishCount = signals.filter(signal => signal === 'bearish').length;

      let overallSentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
      let overallStrength = 50;
      if (bullishCount > bearishCount * 1.5) {
        overallSentiment = 'bullish';
        overallStrength = Math.min(100, 50 + (bullishCount - bearishCount) * 10);
      } else if (bearishCount > bullishCount * 1.5) {
        overallSentiment = 'bearish';
        overallStrength = Math.min(100, 50 + (bearishCount - bullishCount) * 10);
      }

      // Get current price and price change from candles
      const currentPrice = resolvedCandles.length > 0 ? resolvedCandles[resolvedCandles.length - 1].close : 0;
      const previousPrice = resolvedCandles.length > 1 ? resolvedCandles[resolvedCandles.length - 2].close : currentPrice;
      const priceChange = currentPrice - previousPrice;
      const priceChangePercent = previousPrice > 0 ? ((priceChange / previousPrice) * 100) : 0;
      const currentVolume = resolvedCandles.length > 0 ? resolvedCandles[resolvedCandles.length - 1].volume : 0;

      // Determine key levels and warnings
      const rsiIndicator = formattedResults.find(r => r.indicator === 'RSI');
      const macdIndicator = formattedResults.find(r => r.indicator === 'MACD');
      const atrIndicator = formattedResults.find(r => r.indicator === 'ATR');
      const warnings: string[] = [];

      // RSI warnings
      if (rsiIndicator) {
        const rsiValue = rsiIndicator.currentValue;
        if (rsiValue > 80) {
          warnings.push('⚠️ RSI Extreme Overbought (>80) - High reversal risk');
        } else if (rsiValue > 70) {
          warnings.push('📊 RSI Overbought (>70) - Watch for reversal');
        } else if (rsiValue < 20) {
          warnings.push('⚠️ RSI Extreme Oversold (<20) - High bounce potential');
        } else if (rsiValue < 30) {
          warnings.push('📊 RSI Oversold (<30) - Potential bounce zone');
        } else if (rsiValue > 45 && rsiValue < 55) {
          warnings.push('⚖️ RSI Neutral (45-55) - No clear direction');
        }
      }

      // Check for moving average crossovers
      const sma = formattedResults.find(r => r.indicator === 'SMA');
      const ema = formattedResults.find(r => r.indicator === 'EMA');

      if (sma && ema) {
        const smaDiff = ((ema.currentValue - sma.currentValue) / currentPrice) * 100;
        if (Math.abs(smaDiff) < 0.2) {
          warnings.push('🎯 SMA/EMA convergence - Potential breakout imminent');
        } else if (smaDiff > 1) {
          warnings.push('📈 EMA above SMA - Bullish momentum building');
        } else if (smaDiff < -1) {
          warnings.push('📉 EMA below SMA - Bearish momentum building');
        }
      }

      // Price vs moving averages
      if (sma && currentPrice > sma.currentValue * 1.02) {
        warnings.push('🚀 Price >2% above SMA - Strong bullish trend');
      } else if (sma && currentPrice < sma.currentValue * 0.98) {
        warnings.push('⬇️ Price >2% below SMA - Strong bearish trend');
      }

      // ATR volatility warnings
      if (atrIndicator && currentPrice > 0) {
        const atrPercent = (atrIndicator.currentValue / currentPrice) * 100;
        if (atrPercent > 2) {
          warnings.push('🌊 High volatility detected - Wider stops recommended');
        } else if (atrPercent < 0.5) {
          warnings.push('😴 Low volatility - Potential for breakout');
        }
      }

      res.json({
        success: true,
        data: {
          symbol,
          timeframe,
          timestamp: new Date().toISOString(),
          currentPrice,
          priceChange,
          priceChangePercent,
          volume: currentVolume,
          indicators: formattedResults,
          overallSignal: {
            type: overallSentiment === 'bullish' ? 'buy' :
                  overallSentiment === 'bearish' ? 'sell' : 'neutral',
            strength: overallStrength,
            bullishCount,
            bearishCount,
            neutralCount: signals.filter(signal => signal === 'neutral').length,
            warnings
          }
        },
        meta: {
          dataSource,
          cached,
          fallback
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
