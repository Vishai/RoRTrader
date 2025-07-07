import { Injectable } from '@/shared/decorators/injectable.decorator';
import { RedisService } from '@/shared/services/redis.service';
import { logger } from '@/shared/utils/logger';
import { CandleData } from './technical-analysis.service';
import axios from 'axios';

export interface MarketDataOptions {
  symbol: string;
  exchange: 'coinbase_pro' | 'alpaca' | 'demo';
  timeframe: '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d';
  limit?: number;
  startTime?: number;
  endTime?: number;
}

@Injectable()
export class MarketDataService {
  private readonly CACHE_TTL = 60; // 1 minute cache
  
  constructor(private readonly redis: RedisService) {}

  /**
   * Fetch candle data from exchange or cache
   */
  async getCandles(options: MarketDataOptions): Promise<CandleData[]> {
    const cacheKey = `candles:${options.exchange}:${options.symbol}:${options.timeframe}:${options.limit || 100}`;
    
    try {
      // Check cache first
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        logger.debug(`Cache hit for ${cacheKey}`);
        return JSON.parse(cached);
      }
      
      // Fetch based on exchange
      let candles: CandleData[];
      
      switch (options.exchange) {
        case 'coinbase_pro':
          candles = await this.fetchCoinbaseCandles(options);
          break;
        case 'alpaca':
          candles = await this.fetchAlpacaCandles(options);
          break;
        case 'demo':
        default:
          candles = this.generateDemoCandles(options);
          break;
      }
      
      // Cache the result
      await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(candles));
      
      return candles;
      
    } catch (error) {
      logger.error('Error fetching candles:', error);
      // Fallback to demo data on error
      return this.generateDemoCandles(options);
    }
  }

  /**
   * Fetch candles from Coinbase Pro
   */
  private async fetchCoinbaseCandles(options: MarketDataOptions): Promise<CandleData[]> {
    const granularityMap: Record<string, number> = {
      '1m': 60,
      '5m': 300,
      '15m': 900,
      '30m': 1800,
      '1h': 3600,
      '4h': 14400,
      '1d': 86400
    };
    
    const granularity = granularityMap[options.timeframe];
    const limit = options.limit || 100;
    
    // Coinbase Pro API endpoint
    const url = `https://api.exchange.coinbase.com/products/${options.symbol}/candles`;
    
    const params = {
      granularity,
      end: options.endTime ? new Date(options.endTime).toISOString() : new Date().toISOString(),
      start: options.startTime ? new Date(options.startTime).toISOString() : new Date(Date.now() - (limit * granularity * 1000)).toISOString()
    };
    
    const response = await axios.get(url, { params });
    
    // Coinbase returns: [timestamp, low, high, open, close, volume]
    return response.data.map((candle: number[]) => ({
      time: candle[0] * 1000, // Convert to milliseconds
      open: candle[3],
      high: candle[2],
      low: candle[1],
      close: candle[4],
      volume: candle[5]
    })).reverse(); // Coinbase returns newest first
  }

  /**
   * Fetch candles from Alpaca
   */
  private async fetchAlpacaCandles(options: MarketDataOptions): Promise<CandleData[]> {
    // This would require Alpaca API credentials
    // For now, return demo data
    logger.warn('Alpaca integration not yet implemented, returning demo data');
    return this.generateDemoCandles(options);
  }

  /**
   * Generate demo candle data for testing
   */
  private generateDemoCandles(options: MarketDataOptions): CandleData[] {
    const limit = options.limit || 100;
    const candles: CandleData[] = [];
    const now = Date.now();
    
    // Time intervals in milliseconds
    const intervals: Record<string, number> = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '30m': 30 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000
    };
    
    const interval = intervals[options.timeframe];
    
    // Base price for different symbols
    const basePrices: Record<string, number> = {
      'BTC-USD': 50000,
      'ETH-USD': 3000,
      'AAPL': 150,
      'GOOGL': 2800,
      'DEFAULT': 100
    };
    
    let basePrice = basePrices[options.symbol] || basePrices.DEFAULT;
    
    // Generate candles
    for (let i = limit - 1; i >= 0; i--) {
      const time = now - (i * interval);
      
      // Add some randomness
      const volatility = 0.002; // 0.2% volatility
      const trend = Math.sin(i * 0.1) * 0.001; // Sinusoidal trend
      
      const open = basePrice;
      const change = (Math.random() - 0.5) * 2 * volatility + trend;
      const close = open * (1 + change);
      const high = Math.max(open, close) * (1 + Math.random() * volatility);
      const low = Math.min(open, close) * (1 - Math.random() * volatility);
      const volume = Math.random() * 1000000;
      
      candles.push({
        time,
        open,
        high,
        low,
        close,
        volume
      });
      
      basePrice = close; // Next candle opens at previous close
    }
    
    return candles;
  }

  /**
   * Subscribe to real-time candle updates (WebSocket)
   */
  async subscribeToCandles(
    options: MarketDataOptions,
    callback: (candle: CandleData) => void
  ): Promise<() => void> {
    // This would implement WebSocket connections to exchanges
    // For now, simulate with interval updates
    
    const interval = setInterval(() => {
      const lastCandle = this.generateDemoCandles({ ...options, limit: 1 })[0];
      callback(lastCandle);
    }, 5000); // Update every 5 seconds
    
    // Return unsubscribe function
    return () => clearInterval(interval);
  }

  /**
   * Get current price for a symbol
   */
  async getCurrentPrice(symbol: string, exchange: string): Promise<number> {
    const candles = await this.getCandles({
      symbol,
      exchange: exchange as any,
      timeframe: '1m',
      limit: 1
    });
    
    return candles.length > 0 ? candles[0].close : 0;
  }

  /**
   * Get price change statistics
   */
  async getPriceStats(symbol: string, exchange: string, period: '24h' | '7d' | '30d'): Promise<{
    currentPrice: number;
    change: number;
    changePercent: number;
    high: number;
    low: number;
    volume: number;
  }> {
    const timeframes: Record<string, { timeframe: MarketDataOptions['timeframe'], limit: number }> = {
      '24h': { timeframe: '1h', limit: 24 },
      '7d': { timeframe: '1d', limit: 7 },
      '30d': { timeframe: '1d', limit: 30 }
    };
    
    const { timeframe, limit } = timeframes[period];
    
    const candles = await this.getCandles({
      symbol,
      exchange: exchange as any,
      timeframe,
      limit
    });
    
    if (candles.length === 0) {
      return {
        currentPrice: 0,
        change: 0,
        changePercent: 0,
        high: 0,
        low: 0,
        volume: 0
      };
    }
    
    const currentPrice = candles[candles.length - 1].close;
    const startPrice = candles[0].open;
    const change = currentPrice - startPrice;
    const changePercent = (change / startPrice) * 100;
    
    const high = Math.max(...candles.map(c => c.high));
    const low = Math.min(...candles.map(c => c.low));
    const volume = candles.reduce((sum, c) => sum + c.volume, 0);
    
    return {
      currentPrice,
      change,
      changePercent,
      high,
      low,
      volume
    };
  }
}
