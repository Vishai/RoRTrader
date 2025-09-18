import { apiCall } from '@/lib/api-client';

// Types for Market Data
export interface Candle {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketDataRequest {
  symbol: string;
  exchange: 'coinbase' | 'alpaca' | 'binance';
  timeframe: '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w';
  start?: string; // ISO date string
  end?: string; // ISO date string
  limit?: number; // Number of candles to return
}

export interface MarketDataResponse {
  symbol: string;
  exchange: string;
  timeframe: string;
  candles: Candle[];
  metadata: {
    firstTimestamp: string;
    lastTimestamp: string;
    count: number;
  };
}

export interface TickerData {
  symbol: string;
  exchange: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  timestamp: string;
}

export interface OrderBook {
  symbol: string;
  exchange: string;
  bids: Array<{ price: number; size: number }>;
  asks: Array<{ price: number; size: number }>;
  timestamp: string;
}

// Market Data Service Class
export class MarketDataService {
  private static wsConnection: WebSocket | null = null;
  private static subscriptions: Map<string, Set<(data: any) => void>> = new Map();
  private static reconnectAttempts = 0;
  private static maxReconnectAttempts = 5;
  private static reconnectDelay = 1000; // Start with 1 second

  private static buildKey(
    type: string,
    symbol: string,
    exchange: string,
    timeframe?: string
  ): string {
    return timeframe ? `${type}:${symbol}:${exchange}:${timeframe}` : `${type}:${symbol}:${exchange}`;
  }

  private static parseKey(key: string): {
    type: string;
    symbol: string;
    exchange: string;
    timeframe?: string;
  } {
    const [type, symbol, exchange, timeframe] = key.split(':');
    return {
      type,
      symbol,
      exchange,
      timeframe: timeframe || undefined,
    };
  }

  // Get historical candles
  static async getCandles(request: MarketDataRequest): Promise<MarketDataResponse> {
    return apiCall<MarketDataResponse>('get', '/api/market/candles', null, {
      params: request,
    });
  }

  // Get current ticker data
  static async getTicker(symbol: string, exchange: string): Promise<TickerData> {
    return apiCall<TickerData>('get', `/api/market/ticker/${exchange}/${symbol}`);
  }

  // Get order book
  static async getOrderBook(
    symbol: string,
    exchange: string,
    depth: number = 20
  ): Promise<OrderBook> {
    return apiCall<OrderBook>('get', `/api/market/orderbook/${exchange}/${symbol}`, null, {
      params: { depth },
    });
  }

  // Initialize WebSocket connection
  static initializeWebSocket(): void {
    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
    this.wsConnection = new WebSocket(`${wsUrl}/market`);

    this.wsConnection.onopen = () => {
      console.log('Market data WebSocket connected');
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;

      // Resubscribe to all active subscriptions
      this.subscriptions.forEach((_, key) => {
        const { type, symbol, exchange, timeframe } = this.parseKey(key);
        this.sendSubscription(type, symbol, exchange, timeframe);
      });
    };

    this.wsConnection.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.wsConnection.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.wsConnection.onclose = () => {
      console.log('Market data WebSocket disconnected');
      this.handleReconnect();
    };
  }

  // Handle incoming WebSocket messages
  private static handleMessage(data: any): void {
    const { type, symbol, exchange, timeframe, payload } = data;
    const key = this.buildKey(type, symbol, exchange, timeframe);
    const handlers = this.subscriptions.get(key);

    if (handlers) {
      handlers.forEach(handler => handler(payload));
    }
  }

  // Handle reconnection logic
  private static handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.initializeWebSocket();
    }, delay);
  }

  // Send subscription message
  private static sendSubscription(
    type: string,
    symbol: string,
    exchange: string,
    timeframe?: string
  ): void {
    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      this.wsConnection.send(
        JSON.stringify({
          action: 'subscribe',
          type,
          symbol,
          exchange,
          timeframe,
        })
      );
    }
  }

  // Send unsubscription message
  private static sendUnsubscription(
    type: string,
    symbol: string,
    exchange: string,
    timeframe?: string
  ): void {
    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      this.wsConnection.send(
        JSON.stringify({
          action: 'unsubscribe',
          type,
          symbol,
          exchange,
          timeframe,
        })
      );
    }
  }

  // Subscribe to price updates
  static subscribeToPrices(
    symbol: string,
    exchange: string,
    handler: (price: TickerData) => void
  ): () => void {
    this.initializeWebSocket();
    
    const key = this.buildKey('price', symbol, exchange);
    
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, new Set());
      this.sendSubscription('price', symbol, exchange);
    }

    this.subscriptions.get(key)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.subscriptions.get(key);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.subscriptions.delete(key);
          this.sendUnsubscription('price', symbol, exchange);
        }
      }
    };
  }

  // Subscribe to candle updates
  static subscribeToCandles(
    symbol: string,
    exchange: string,
    timeframe: string,
    handler: (candle: Candle) => void
  ): () => void {
    this.initializeWebSocket();
    
    const key = this.buildKey('candle', symbol, exchange, timeframe);
    
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, new Set());
      this.sendSubscription('candle', symbol, exchange, timeframe);
    }

    this.subscriptions.get(key)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.subscriptions.get(key);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.subscriptions.delete(key);
          this.sendUnsubscription('candle', symbol, exchange, timeframe);
        }
      }
    };
  }

  // Convert timeframe to milliseconds
  static timeframeToMs(timeframe: string): number {
    const map: Record<string, number> = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '30m': 30 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000,
      '1w': 7 * 24 * 60 * 60 * 1000,
    };
    return map[timeframe] || 60 * 1000;
  }

  // Generate mock candles for testing (when backend is not ready)
  static generateMockCandles(
    symbol: string,
    timeframe: string,
    count: number = 100
  ): Candle[] {
    const candles: Candle[] = [];
    const now = Date.now();
    const interval = this.timeframeToMs(timeframe);
    
    // Starting price based on symbol
    let basePrice = symbol.includes('BTC') ? 50000 : 
                   symbol.includes('ETH') ? 3000 : 
                   symbol.includes('AAPL') ? 150 : 100;
    
    for (let i = count - 1; i >= 0; i--) {
      const timestamp = Math.floor((now - i * interval) / 1000);
      const volatility = 0.002; // 0.2% volatility
      
      // Random walk
      const change = (Math.random() - 0.5) * 2 * volatility;
      basePrice *= (1 + change);
      
      const open = basePrice;
      const close = basePrice * (1 + (Math.random() - 0.5) * volatility);
      const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
      const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);
      const volume = Math.random() * 1000000;
      
      candles.push({
        time: timestamp,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: parseFloat(volume.toFixed(0)),
      });
      
      basePrice = close;
    }
    
    return candles;
  }

  // Close WebSocket connection
  static disconnect(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    this.subscriptions.clear();
    this.reconnectAttempts = 0;
  }
}

// Export convenience functions
export const {
  getCandles,
  getTicker,
  getOrderBook,
  subscribeToPrices,
  subscribeToCandles,
  generateMockCandles,
  disconnect: disconnectMarketData,
} = MarketDataService;
