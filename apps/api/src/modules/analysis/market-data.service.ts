import { RedisService } from '@/shared/services/redis.service';
import { logger } from '@/shared/utils/logger';
import { CandleData } from './technical-analysis.service';
import axios from 'axios';
import { Counter, register } from 'prom-client';

const getOrCreateCounter = (name: string, help: string, labelNames: string[]): Counter<string> => {
  const existing = register.getSingleMetric(name) as Counter<string> | undefined;
  return existing ?? new Counter({ name, help, labelNames });
};

const candleCacheHitCounter = getOrCreateCounter('market_candle_cache_hits_total', 'Number of candle cache hits', ['requested_exchange', 'timeframe']);
const candleCacheMissCounter = getOrCreateCounter('market_candle_cache_misses_total', 'Number of candle cache misses', ['requested_exchange', 'timeframe']);
const candleFallbackCounter = getOrCreateCounter('market_candle_fallback_total', 'Number of times market data fell back to demo candles', ['requested_exchange', 'timeframe', 'actual_source']);


export interface MarketDataOptions {
  symbol: string;
  exchange: 'coinbase_pro' | 'alpaca' | 'demo';
  timeframe: '1m' | '2m' | '3m' | '5m' | '10m' | '15m' | '30m' | '45m' | '1h' | '2h' | '3h' | '4h' | '1d' | '5d' | '1w' | '1M' | '1y';
  limit?: number;
  startTime?: number;
  endTime?: number;
}

export type MarketDataSource = 'alpaca' | 'coinbase_pro' | 'demo';

interface CandleFetchResult {
  candles: CandleData[];
  source: MarketDataSource;
  fallback: boolean;
}

export class MarketDataService {
  private readonly CACHE_TTL = 60; // 1 minute cache
  private get alpacaKey(): string {
    return process.env.ALPACA_API_KEY || process.env.ALPACA_API_KEY_ID || process.env.APCA_API_KEY_ID || '';
  }

  private get alpacaSecret(): string {
    return process.env.ALPACA_API_SECRET || process.env.ALPACA_API_SECRET_KEY || process.env.APCA_API_SECRET_KEY || '';
  }

  private get alpacaBaseUrl(): string {
    return process.env.ALPACA_DATA_URL || 'https://data.alpaca.markets';
  }
  
  constructor(private readonly redis: RedisService) {}

  private hasAlpacaCredentials(): boolean {
    return Boolean(this.alpacaKey && this.alpacaSecret);
  }

  private alpacaHeaders() {
    return {
      'APCA-API-KEY-ID': this.alpacaKey,
      'APCA-API-SECRET-KEY': this.alpacaSecret
    };
  }

  private mapAlpacaTimeframe(timeframe: MarketDataOptions['timeframe']): string {
    const map: Record<MarketDataOptions['timeframe'], string> = {
      '1m': '1Min',
      '2m': '2Min',
      '3m': '3Min',
      '5m': '5Min',
      '10m': '10Min',
      '15m': '15Min',
      '30m': '30Min',
      '45m': '45Min',
      '1h': '1Hour',
      '2h': '2Hour',
      '3h': '3Hour',
      '4h': '4Hour',
      '1d': '1Day',
      '5d': '1Day', // Will aggregate 5 days
      '1w': '1Week',
      '1M': '1Month',
      '1y': '1Day' // Will aggregate to yearly
    };

    return map[timeframe] || '1Hour';
  }

  /**
   * Fetch candle data from exchange or cache
   */
  async getCandles(options: MarketDataOptions): Promise<{ candles: CandleData[]; source: MarketDataSource; cached: boolean; fallback: boolean }> {
    const cacheKey = [
      'candles',
      options.exchange,
      options.symbol,
      options.timeframe,
      options.limit || 100,
      options.startTime ? options.startTime : 'start',
      options.endTime ? options.endTime : 'end'
    ].join(':');


    try {
      // Check cache first
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        logger.debug(`Cache hit for ${cacheKey}`);
        candleCacheHitCounter.inc({ requested_exchange: options.exchange, timeframe: options.timeframe });
        return {
          candles: JSON.parse(cached),
          source: options.exchange,
          cached: true,
          fallback: false
        };
      }
      
      // Fetch based on exchange
      const fetchTimeframe = options.timeframe === '1w' ? '1d' : options.timeframe;
      let candles: CandleData[];
      let source: MarketDataSource = options.exchange;
      let fallback = false;

      if (options.exchange === 'demo') {
        candles = this.generateDemoCandles(options);
        source = 'demo';
      } else {
        const requestOptions = {
          ...options,
          timeframe: fetchTimeframe
        } as MarketDataOptions;

        switch (options.exchange) {
          case 'coinbase_pro':
            ({ candles, source } = await this.fetchCoinbaseCandles(requestOptions));
            break;
          case 'alpaca':
            ({ candles, source, fallback } = await this.fetchAlpacaCandles(requestOptions));
            break;
          default:
            candles = this.generateDemoCandles(requestOptions);
            source = 'demo';
            break;
        }

        if (options.timeframe === '1w') {
          candles = this.aggregateCandles(candles, 7);
        }
      }
      
      // Cache the result
      await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(candles));
      
      candleCacheMissCounter.inc({ requested_exchange: options.exchange, timeframe: options.timeframe });
      if (fallback) {
        candleFallbackCounter.inc({
          requested_exchange: options.exchange,
          timeframe: options.timeframe,
          actual_source: source
        });
      }

      return {
        candles,
        source,
        cached: false,
        fallback
      };
      
    } catch (error: any) {
      logger.error('Error fetching candles:', error.message || error);
      // Fallback to demo data on error
      candleCacheMissCounter.inc({ requested_exchange: options.exchange, timeframe: options.timeframe });
      candleFallbackCounter.inc({
        requested_exchange: options.exchange,
        timeframe: options.timeframe,
        actual_source: 'demo'
      });
      return {
        candles: this.generateDemoCandles(options),
        source: 'demo',
        cached: false,
        fallback: true
      };
    }
  }

  /**
   * Fetch candles from Coinbase Pro
   */
  private async fetchCoinbaseCandles(options: MarketDataOptions): Promise<CandleFetchResult> {
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
    const candles = response.data.map((candle: number[]) => ({
      time: candle[0] * 1000, // Convert to milliseconds
      open: candle[3],
      high: candle[2],
      low: candle[1],
      close: candle[4],
      volume: candle[5]
    })).reverse(); // Coinbase returns newest first

    return {
      candles,
      source: 'coinbase_pro',
      fallback: false
    };
  }

  /**
   * Fetch candles from Alpaca
   */
  private async fetchAlpacaCandles(options: MarketDataOptions): Promise<CandleFetchResult> {
    if (!this.hasAlpacaCredentials()) {
      logger.warn('Alpaca credentials missing, falling back to demo candles');
      return {
        candles: this.generateDemoCandles(options),
        source: 'demo',
        fallback: true
      };
    }


    try {
      const timeframe = this.mapAlpacaTimeframe(options.timeframe);
      const limit = Math.max(options.limit || 100, 100); // Ensure at least 100 bars
      const params: Record<string, string | number> = {
        timeframe,
        limit
      };

      if (options.startTime) {
        params.start = new Date(options.startTime).toISOString();
      }
      if (options.endTime) {
        params.end = new Date(options.endTime).toISOString();
      }

      const url = `${this.alpacaBaseUrl}/v2/stocks/${encodeURIComponent(options.symbol)}/bars`;

      logger.debug(`Alpaca request URL: ${url}`, { params });

      const client = axios.create({
        baseURL: this.alpacaBaseUrl,
        headers: this.alpacaHeaders()
      });

      const response = await client.get(`/v2/stocks/${encodeURIComponent(options.symbol)}/bars`, {
        params
      });

      logger.debug('Alpaca response structure:', {
        hasData: !!response.data,
        hasBars: !!response.data?.bars,
        keys: Object.keys(response.data || {}),
        symbol: options.symbol
      });

      // Alpaca returns bars in different formats depending on the endpoint
      let bars = response.data?.bars || [];

      // If bars is an object with symbol as key
      if (!Array.isArray(bars) && typeof bars === 'object') {
        bars = bars[options.symbol] || bars[options.symbol.toUpperCase()] || [];
      }

      if (!Array.isArray(bars) || bars.length === 0) {
        logger.warn('Alpaca returned no bars, falling back to demo data', {
          symbol: options.symbol,
          timeframe,
          responseKeys: Object.keys(response.data || {}),
          barsType: typeof bars
        });
        return {
          candles: this.generateDemoCandles(options),
          source: 'demo',
          fallback: true
        };
      }

      logger.info(`Successfully fetched ${bars.length} bars from Alpaca for ${options.symbol}`);

      const candles = bars.map((bar: any) => ({
        time: new Date(bar.t).getTime(),
        open: bar.o,
        high: bar.h,
        low: bar.l,
        close: bar.c,
        volume: bar.v
      }));

      return {
        candles,
        source: 'alpaca',
        fallback: false
      };
    } catch (error: any) {
      logger.error(`Error fetching Alpaca candles: ${error.message}`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: `${this.alpacaBaseUrl}/v2/stocks/${encodeURIComponent(options.symbol)}/bars`,
        params
      });
      return {
        candles: this.generateDemoCandles(options),
        source: 'demo',
        fallback: true
      };
    }
  }

  private aggregateCandles(candles: CandleData[], groupSize: number): CandleData[] {
    if (groupSize <= 1) {
      return candles;
    }

    const aggregated: CandleData[] = [];

    for (let i = 0; i < candles.length; i += groupSize) {
      const batch = candles.slice(i, i + groupSize);
      if (!batch.length) {
        continue;
      }

      aggregated.push({
        time: batch[0].time,
        open: batch[0].open,
        high: Math.max(...batch.map(c => c.high)),
        low: Math.min(...batch.map(c => c.low)),
        close: batch[batch.length - 1].close,
        volume: batch.reduce((sum, c) => sum + c.volume, 0)
      });
    }

    return aggregated;
  }

  getDemoStartingPrice(symbol: string): number {
    const normalized = symbol.toUpperCase();

    const basePrices: Record<string, number> = {
      'BTC-USD': 50000,
      'ETH-USD': 3000,
      'AAPL': 150,
      'GOOGL': 2800
    };

    if (basePrices[normalized]) {
      return basePrices[normalized];
    }

    if (normalized.includes('BTC')) return 50000;
    if (normalized.includes('ETH')) return 3000;
    if (normalized.includes('AAPL')) return 150;
    if (normalized.includes('GOOGL')) return 2800;

    return 100;
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
      '1d': 24 * 60 * 60 * 1000,
      '1w': 7 * 24 * 60 * 60 * 1000
    };
    
    const interval = intervals[options.timeframe] || intervals['1h'];
    
    let basePrice = this.getDemoStartingPrice(options.symbol);
    
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
    const { candles } = await this.getCandles({
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
    
    const { candles } = await this.getCandles({
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

  async getOrderBook(
    symbol: string,
    exchange: 'coinbase_pro' | 'alpaca' | 'demo',
    depth: number = 20
  ): Promise<{
    bids: Array<{ price: number; size: number }>;
    asks: Array<{ price: number; size: number }>;
    midpoint: number;
  }> {
    const cacheKey = `orderbook:${exchange}:${symbol}:${depth}`;

    try {
      if (exchange === 'alpaca' && this.hasAlpacaCredentials()) {
        const quote = await this.fetchAlpacaLatestQuote(symbol);
        if (quote) {
          const orderBook = this.expandQuoteToOrderBook(quote, depth);
          await this.redis.setex(cacheKey, 5, JSON.stringify(orderBook));
          return orderBook;
        }
      }

      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const currentPrice = await this.getCurrentPrice(symbol, exchange);
      const midpoint = currentPrice || this.getDemoStartingPrice(symbol);
      const synthetic = this.generateSyntheticOrderBook(midpoint, depth);

      await this.redis.setex(cacheKey, 5, JSON.stringify(synthetic));
      return synthetic;
    } catch (error) {
      logger.error('Error fetching order book:', error);
      const fallbackPrice = this.getDemoStartingPrice(symbol);
      return this.generateSyntheticOrderBook(fallbackPrice, depth);
    }
  }

  private generateSyntheticOrderBook(midpoint: number, depth: number) {
    const tickSize = midpoint * 0.001;
    const bids: Array<{ price: number; size: number }> = [];
    const asks: Array<{ price: number; size: number }> = [];

    for (let i = 0; i < depth; i++) {
      const baseSize = Math.random() * 3 + 0.5;
      bids.push({
        price: parseFloat((midpoint - tickSize * (i + 1)).toFixed(2)),
        size: parseFloat(baseSize.toFixed(4))
      });
      asks.push({
        price: parseFloat((midpoint + tickSize * (i + 1)).toFixed(2)),
        size: parseFloat((baseSize * (0.8 + Math.random() * 0.4)).toFixed(4))
      });
    }

    return {
      bids,
      asks,
      midpoint: parseFloat(midpoint.toFixed(2))
    };
  }

  private async fetchAlpacaLatestQuote(symbol: string): Promise<{
    bidPrice: number;
    bidSize: number;
    askPrice: number;
    askSize: number;
    timestamp: string;
  } | null> {
    if (!this.hasAlpacaCredentials()) {
      return null;
    }

    try {
      const url = `${this.alpacaBaseUrl}/v2/stocks/${encodeURIComponent(symbol)}/quotes/latest`;
      const response = await axios.get(url, {
        headers: this.alpacaHeaders()
      });

      const quote = response.data?.quote;
      if (!quote || (!quote.bp && !quote.ap)) {
        return null;
      }

      return {
        bidPrice: quote.bp || quote.ap,
        bidSize: quote.bs || 1,
        askPrice: quote.ap || quote.bp,
        askSize: quote.as || 1,
        timestamp: quote.t
      };
    } catch (error) {
      logger.error('Error fetching Alpaca quote', error);
      return null;
    }
  }

  private expandQuoteToOrderBook(
    quote: { bidPrice: number; bidSize: number; askPrice: number; askSize: number; timestamp: string },
    depth: number
  ) {
    const midpoint = (quote.bidPrice + quote.askPrice) / 2;
    const tickSize = midpoint * 0.0005;

    const bids: Array<{ price: number; size: number }> = [];
    const asks: Array<{ price: number; size: number }> = [];

    for (let i = 0; i < depth; i++) {
      bids.push({
        price: parseFloat((quote.bidPrice - tickSize * i).toFixed(2)),
        size: parseFloat((Math.max(quote.bidSize, 0.1) * (1 - i * 0.02)).toFixed(4))
      });
      asks.push({
        price: parseFloat((quote.askPrice + tickSize * i).toFixed(2)),
        size: parseFloat((Math.max(quote.askSize, 0.1) * (1 - i * 0.02)).toFixed(4))
      });
    }

    return {
      bids,
      asks,
      midpoint: parseFloat(midpoint.toFixed(2))
    };
  }
}
