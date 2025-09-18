import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { MarketDataService, MarketDataOptions } from '../analysis/market-data.service';
import { normalizeExchange, normalizeTimeframe } from './utils';
import { RedisService } from '@/shared/services/redis.service';
import { logger } from '@/shared/utils/logger';

interface Subscription {
  clients: Set<WebSocket>;
  cleanup?: () => void;
}

type SubscriptionType = 'price' | 'candle';

type SubscriptionKey = string;

interface SubscriptionMessage {
  action: 'subscribe' | 'unsubscribe';
  type: SubscriptionType;
  symbol: string;
  exchange: string;
  timeframe?: string;
}

export class MarketGateway {
  private readonly marketDataService: MarketDataService;
  private wss?: WebSocketServer;
  private readonly subscriptions: Map<SubscriptionKey, Subscription> = new Map();

  constructor(private readonly server: HttpServer) {
    this.marketDataService = new MarketDataService(new RedisService());
  }

  initialize() {
    if (this.wss) {
      return;
    }

    this.wss = new WebSocketServer({ server: this.server, path: '/market' });

    this.wss.on('connection', (socket: WebSocket) => {
      logger.info('Client connected to /market WebSocket');

      socket.on('message', (message: Buffer) => {
        this.handleMessage(socket, message.toString());
      });

      socket.on('close', () => {
        this.handleDisconnect(socket);
      });

      socket.on('error', (error) => {
        logger.error('Market WebSocket error:', error);
        socket.close();
      });
    });
  }

  private handleMessage(socket: WebSocket, rawMessage: string) {
    let payload: SubscriptionMessage;

    try {
      payload = JSON.parse(rawMessage);
    } catch (error) {
      logger.warn('Invalid WebSocket message', { rawMessage });
      this.sendError(socket, 'Invalid JSON payload');
      return;
    }

    if (!payload.action || !payload.type || !payload.symbol || !payload.exchange) {
      this.sendError(socket, 'Missing required subscription fields');
      return;
    }

    const exchange = normalizeExchange(payload.exchange.toLowerCase());
    const timeframe = normalizeTimeframe(payload.timeframe || '1h');
    const key = this.getSubscriptionKey(payload.type, payload.symbol, exchange, timeframe);

    if (payload.action === 'subscribe') {
      this.handleSubscribe(socket, payload.type, {
        symbol: payload.symbol.toUpperCase(),
        exchange,
        timeframe,
        limit: 1
      }, key);
      return;
    }

    if (payload.action === 'unsubscribe') {
      this.handleUnsubscribe(socket, key);
      return;
    }

    this.sendError(socket, `Unsupported action: ${payload.action}`);
  }

  private handleSubscribe(
    socket: WebSocket,
    type: SubscriptionType,
    options: MarketDataOptions,
    key: SubscriptionKey
  ) {
    const existing = this.subscriptions.get(key);

    if (existing) {
      existing.clients.add(socket);
      this.sendAck(socket, 'subscribed', key);
      return;
    }

    const clients = new Set<WebSocket>([socket]);

    if (type === 'candle') {
      this.createCandleSubscription(key, clients, options);
      this.sendAck(socket, 'subscribed', key);
      return;
    }

    if (type === 'price') {
      this.createPriceSubscription(key, clients, options);
      this.sendAck(socket, 'subscribed', key);
      return;
    }

    this.sendError(socket, `Unsupported subscription type: ${type}`);
  }

  private createCandleSubscription(
    key: SubscriptionKey,
    clients: Set<WebSocket>,
    options: MarketDataOptions
  ) {
    this.marketDataService.subscribeToCandles(options, (candle) => {
      const payload = JSON.stringify({
        type: 'candle',
        symbol: options.symbol,
        exchange: options.exchange,
        timeframe: options.timeframe,
        payload: {
          time: Math.floor(candle.time / 1000),
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          volume: candle.volume
        }
      });

      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(payload);
        }
      });
    }).then((cleanup) => {
      this.subscriptions.set(key, { clients, cleanup });
    }).catch((error) => {
      logger.error('Failed to create candle subscription', error);
    });
  }

  private createPriceSubscription(
    key: SubscriptionKey,
    clients: Set<WebSocket>,
    options: MarketDataOptions
  ) {
    const interval = setInterval(async () => {
      try {
        const [price, stats] = await Promise.all([
          this.marketDataService.getCurrentPrice(options.symbol, options.exchange),
          this.marketDataService.getPriceStats(options.symbol, options.exchange, '24h')
        ]);

        const tickerPrice =
          price ||
          stats.currentPrice ||
          this.marketDataService.getDemoStartingPrice(options.symbol);

        const payload = JSON.stringify({
          type: 'price',
          symbol: options.symbol,
          exchange: options.exchange,
          payload: {
            price: tickerPrice,
            change24h: stats.change,
            changePercent24h: stats.changePercent,
            high24h: stats.high,
            low24h: stats.low,
            volume24h: stats.volume,
            timestamp: new Date().toISOString()
          }
        });

        clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
          }
        });
      } catch (error) {
        logger.error('Error broadcasting price update', error);
      }
    }, 5000);

    const cleanup = () => clearInterval(interval);
    this.subscriptions.set(key, { clients, cleanup });
  }

  private handleUnsubscribe(socket: WebSocket, key: SubscriptionKey) {
    const subscription = this.subscriptions.get(key);

    if (!subscription) {
      return;
    }

    subscription.clients.delete(socket);

    if (subscription.clients.size === 0) {
      subscription.cleanup?.();
      this.subscriptions.delete(key);
    }

    this.sendAck(socket, 'unsubscribed', key);
  }

  private handleDisconnect(socket: WebSocket) {
    this.subscriptions.forEach((subscription, key) => {
      if (subscription.clients.has(socket)) {
        subscription.clients.delete(socket);

        if (subscription.clients.size === 0) {
          subscription.cleanup?.();
          this.subscriptions.delete(key);
        }
      }
    });

    logger.info('Client disconnected from /market WebSocket');
  }

  private sendAck(socket: WebSocket, status: 'subscribed' | 'unsubscribed', key: string) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ status, key }));
    }
  }

  private sendError(socket: WebSocket, message: string) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ status: 'error', message }));
    }
  }

  private getSubscriptionKey(
    type: SubscriptionType,
    symbol: string,
    exchange: MarketDataOptions['exchange'],
    timeframe: MarketDataOptions['timeframe']
  ): SubscriptionKey {
    const components = [type, symbol.toUpperCase(), exchange];

    if (type === 'candle') {
      components.push(timeframe);
    }

    return components.join(':');
  }
}
