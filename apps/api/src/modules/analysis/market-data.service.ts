import { RedisService } from '@/shared/services/redis.service';
import { logger } from '@/shared/utils/logger';
import { CandleData } from './technical-analysis.service';
import axios from 'axios';

export interface MarketDataOptions {
  symbol: string;
  exchange: 'coinbase_pro' | 'alpaca' | 'demo';
  timeframe: '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w';
  limit?: number;
  startTime?: number;
  endTime?: number;
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
      '5m': '5Min',
      '15m': '15Min',
      '30m': '30Min',
      '1h': '1Hour',
      '4h': '4Hour',
      '1d': '1Day',
      '1w': '1Week'
    };

    return map[timeframe] || '1Hour';
  }

  /**
   * Fetch candle data from exchange or cache
   */
  async getCandles(options: MarketDataOptions): Promise<CandleData[]> {
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
        return JSON.parse(cached);
      }
      
      // Fetch based on exchange
      const fetchTimeframe = options.timeframe === '1w' ? '1d' : options.timeframe;
      let candles: CandleData[];

      if (options.exchange === 'demo') {
        candles = this.generateDemoCandles(options);
      } else {
        const requestOptions = {
          ...options,
          timeframe: fetchTimeframe
        } as MarketDataOptions;

        switch (options.exchange) {
          case 'coinbase_pro':
            candles = await this.fetchCoinbaseCandles(requestOptions);
            break;
          case 'alpaca':
            candles = await this.fetchAlpacaCandles(requestOptions);
            break;
          default:
            candles = this.generateDemoCandles(requestOptions);
            break;
        }

        if (options.timeframe === '1w') {
          candles = this.aggregateCandles(candles, 7);
        }
      }
      
      // Cache the result
      await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(candles));
      
      return candles;
      
    } catch (error: any) {
      logger.error('Error fetching candles:', error.message || error);
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
    if (!this.hasAlpacaCredentials()) {
      logger.warn('Alpaca credentials missing, falling back to demo candles');
      return this.generateDemoCandles(options);
    }


    try {
      const timeframe = this.mapAlpacaTimeframe(options.timeframe);
      const limit = options.limit || 100;
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


      // Alpaca returns bars in a bars object with the symbol as key
      const bars = response.data?.bars?.[options.symbol] || response.data?.bars || [];

      if (!Array.isArray(bars) || bars.length === 0) {
        logger.warn('Alpaca returned no bars, falling back to demo data', { symbol: options.symbol, timeframe });
        return this.generateDemoCandles(options);
      }

      logger.info(`Successfully fetched ${bars.length} bars from Alpaca for ${options.symbol}`);

      return bars.map((bar: any) => ({
        time: new Date(bar.t).getTime(),
        open: bar.o,
        high: bar.h,
        low: bar.l,
        close: bar.c,
        volume: bar.v
      }));
    } catch (error: any) {
      logger.error(`Error fetching Alpaca candles: ${error.message}`, {
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      return this.generateDemoCandles(options);
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
