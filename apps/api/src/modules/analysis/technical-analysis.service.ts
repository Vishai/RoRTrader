import { RedisService } from '@/shared/services/redis.service';
import { logger } from '@/shared/utils/logger';

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorInput {
  symbol: string;
  candles: CandleData[];
  indicator: string;
  params: Record<string, any>;
}

export interface IndicatorResult {
  indicator: string;
  symbol: string;
  timestamp: number;
  values: number[] | Record<string, number[]>;
  signal?: 'bullish' | 'bearish' | 'neutral';
  strength?: number; // 0-100
}

export class TechnicalAnalysisService {
  constructor(private readonly redis: RedisService) {}

  /**
   * Calculate Simple Moving Average (SMA)
   */
  async calculateSMA(candles: CandleData[], period: number): Promise<number[]> {
    const closes = candles.map(c => c.close);
    const sma: number[] = [];
    
    for (let i = period - 1; i < closes.length; i++) {
      const sum = closes.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    
    return sma;
  }

  /**
   * Calculate Exponential Moving Average (EMA)
   */
  async calculateEMA(candles: CandleData[], period: number): Promise<number[]> {
    const closes = candles.map(c => c.close);
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);
    
    // Start with SMA for the first value
    const firstSMA = closes.slice(0, period).reduce((a, b) => a + b, 0) / period;
    ema.push(firstSMA);
    
    // Calculate EMA for remaining values
    for (let i = period; i < closes.length; i++) {
      const emaValue = (closes[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1];
      ema.push(emaValue);
    }
    
    return ema;
  }

  /**
   * Calculate Relative Strength Index (RSI)
   */
  async calculateRSI(candles: CandleData[], period: number = 14): Promise<number[]> {
    const closes = candles.map(c => c.close);
    const rsi: number[] = [];
    
    if (closes.length < period + 1) {
      return rsi;
    }
    
    let gains = 0;
    let losses = 0;
    
    // Calculate initial average gain/loss
    for (let i = 1; i <= period; i++) {
      const difference = closes[i] - closes[i - 1];
      if (difference > 0) {
        gains += difference;
      } else {
        losses += Math.abs(difference);
      }
    }
    
    let avgGain = gains / period;
    let avgLoss = losses / period;
    
    // Calculate RSI values
    for (let i = period; i < closes.length; i++) {
      const difference = closes[i] - closes[i - 1];
      
      if (difference > 0) {
        avgGain = (avgGain * (period - 1) + difference) / period;
        avgLoss = (avgLoss * (period - 1)) / period;
      } else {
        avgGain = (avgGain * (period - 1)) / period;
        avgLoss = (avgLoss * (period - 1) + Math.abs(difference)) / period;
      }
      
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const rsiValue = 100 - (100 / (1 + rs));
      rsi.push(rsiValue);
    }
    
    return rsi;
  }

  /**
   * Calculate MACD (Moving Average Convergence Divergence)
   */
  async calculateMACD(
    candles: CandleData[], 
    fastPeriod: number = 12, 
    slowPeriod: number = 26, 
    signalPeriod: number = 9
  ): Promise<{ macd: number[], signal: number[], histogram: number[] }> {
    const fastEMA = await this.calculateEMA(candles, fastPeriod);
    const slowEMA = await this.calculateEMA(candles, slowPeriod);
    
    // Calculate MACD line
    const macd: number[] = [];
    const startIndex = slowPeriod - fastPeriod;
    
    for (let i = 0; i < fastEMA.length && i + startIndex < slowEMA.length; i++) {
      macd.push(fastEMA[i] - slowEMA[i + startIndex]);
    }
    
    // Calculate signal line (EMA of MACD)
    const signal: number[] = [];
    if (macd.length >= signalPeriod) {
      const signalMultiplier = 2 / (signalPeriod + 1);
      signal.push(macd.slice(0, signalPeriod).reduce((a, b) => a + b, 0) / signalPeriod);
      
      for (let i = signalPeriod; i < macd.length; i++) {
        const signalValue = (macd[i] - signal[signal.length - 1]) * signalMultiplier + signal[signal.length - 1];
        signal.push(signalValue);
      }
    }
    
    // Calculate histogram
    const histogram: number[] = [];
    for (let i = 0; i < signal.length; i++) {
      histogram.push(macd[i + macd.length - signal.length] - signal[i]);
    }
    
    return { macd, signal, histogram };
  }

  /**
   * Calculate Bollinger Bands
   */
  async calculateBollingerBands(
    candles: CandleData[], 
    period: number = 20, 
    stdDev: number = 2
  ): Promise<{ upper: number[], middle: number[], lower: number[] }> {
    const sma = await this.calculateSMA(candles, period);
    const closes = candles.map(c => c.close);
    
    const upper: number[] = [];
    const lower: number[] = [];
    
    for (let i = period - 1; i < closes.length; i++) {
      const slice = closes.slice(i - period + 1, i + 1);
      const mean = sma[i - period + 1];
      
      // Calculate standard deviation
      const squaredDifferences = slice.map(value => Math.pow(value - mean, 2));
      const variance = squaredDifferences.reduce((a, b) => a + b, 0) / period;
      const standardDeviation = Math.sqrt(variance);
      
      upper.push(mean + (standardDeviation * stdDev));
      lower.push(mean - (standardDeviation * stdDev));
    }
    
    return { upper, middle: sma, lower };
  }

  /**
   * Calculate all indicators for a symbol
   */
  async calculateIndicators(input: IndicatorInput): Promise<IndicatorResult> {
    const cacheKey = `ta:${input.symbol}:${input.indicator}:${JSON.stringify(input.params)}`;

    // Check cache first, but fall back gracefully if Redis is unavailable
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (error) {
          logger.warn('Failed to parse cached indicator payload, recalculating', {
            cacheKey,
            error: (error as Error).message
          });
        }
      }
    } catch (error) {
      logger.warn('Redis unavailable when reading indicator cache, proceeding without cache', {
        cacheKey,
        error: (error as Error).message
      });
    }

    try {
      let values: any;
      let signal: 'bullish' | 'bearish' | 'neutral' = 'neutral';
      let strength = 50;

      // Calculate based on indicator type
      switch (input.indicator.toUpperCase()) {
        case 'SMA':
          values = await this.calculateSMA(input.candles, input.params.period || 20);
          signal = this.determineTrendSignal(input.candles, values);
          break;
          
        case 'EMA':
          values = await this.calculateEMA(input.candles, input.params.period || 20);
          signal = this.determineTrendSignal(input.candles, values);
          break;
          
        case 'RSI':
          values = await this.calculateRSI(input.candles, input.params.period || 14);
          const lastRSI = values[values.length - 1];
          signal = lastRSI > 70 ? 'bearish' : lastRSI < 30 ? 'bullish' : 'neutral';
          strength = lastRSI > 70 ? 80 : lastRSI < 30 ? 80 : 50;
          break;
          
        case 'MACD':
          const macdResult = await this.calculateMACD(
            input.candles,
            input.params.fastPeriod || 12,
            input.params.slowPeriod || 26,
            input.params.signalPeriod || 9
          );
          values = macdResult;
          signal = this.determineMACDSignal(macdResult);
          break;
          
        case 'BOLLINGER':
          values = await this.calculateBollingerBands(
            input.candles,
            input.params.period || 20,
            input.params.stdDev || 2
          );
          signal = this.determineBollingerSignal(input.candles, values);
          break;
          
        default:
          throw new Error(`Indicator ${input.indicator} not implemented`);
      }
      
      const result: IndicatorResult = {
        indicator: input.indicator,
        symbol: input.symbol,
        timestamp: Date.now(),
        values,
        signal,
        strength
      };

      // Cache for 1 minute, but do not fail if Redis is down
      try {
        await this.redis.setex(cacheKey, 60, JSON.stringify(result));
      } catch (cacheError) {
        logger.warn('Redis unavailable when writing indicator cache, continuing without cache', {
          cacheKey,
          error: (cacheError as Error).message
        });
      }

      return result;

    } catch (error) {
      logger.error('Error calculating indicator:', error);
      throw error;
    }
  }

  /**
   * Determine trend signal based on price vs moving average
   */
  private determineTrendSignal(candles: CandleData[], ma: number[]): 'bullish' | 'bearish' | 'neutral' {
    if (!ma.length || !candles.length) return 'neutral';
    
    const lastPrice = candles[candles.length - 1].close;
    const lastMA = ma[ma.length - 1];
    const previousMA = ma[ma.length - 2];
    
    if (!previousMA) return 'neutral';
    
    const priceAboveMA = lastPrice > lastMA;
    const maTrending = lastMA > previousMA;
    
    if (priceAboveMA && maTrending) return 'bullish';
    if (!priceAboveMA && !maTrending) return 'bearish';
    return 'neutral';
  }

  /**
   * Determine MACD signal
   */
  private determineMACDSignal(macdResult: { macd: number[], signal: number[], histogram: number[] }): 'bullish' | 'bearish' | 'neutral' {
    const { histogram } = macdResult;
    if (!histogram.length) return 'neutral';
    
    const lastHistogram = histogram[histogram.length - 1];
    const previousHistogram = histogram[histogram.length - 2];
    
    if (!previousHistogram) return 'neutral';
    
    // Bullish: histogram crossing above zero or increasing
    if (lastHistogram > 0 && previousHistogram <= 0) return 'bullish';
    if (lastHistogram > previousHistogram && lastHistogram > 0) return 'bullish';
    
    // Bearish: histogram crossing below zero or decreasing  
    if (lastHistogram < 0 && previousHistogram >= 0) return 'bearish';
    if (lastHistogram < previousHistogram && lastHistogram < 0) return 'bearish';
    
    return 'neutral';
  }

  /**
   * Determine Bollinger Band signal
   */
  private determineBollingerSignal(
    candles: CandleData[], 
    bands: { upper: number[], middle: number[], lower: number[] }
  ): 'bullish' | 'bearish' | 'neutral' {
    if (!bands.upper.length || !candles.length) return 'neutral';
    
    const lastPrice = candles[candles.length - 1].close;
    const lastUpper = bands.upper[bands.upper.length - 1];
    const lastLower = bands.lower[bands.lower.length - 1];
    
    // Oversold condition (price near lower band)
    if (lastPrice <= lastLower * 1.02) return 'bullish';
    
    // Overbought condition (price near upper band)
    if (lastPrice >= lastUpper * 0.98) return 'bearish';
    
    return 'neutral';
  }
}
