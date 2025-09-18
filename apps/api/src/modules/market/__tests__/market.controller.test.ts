import request from 'supertest';
import express from 'express';

const redisStore = new Map<string, string>();

jest.mock('@/shared/services/redis.service', () => {
  return {
    RedisService: jest.fn().mockImplementation(() => ({
      get: jest.fn((key: string) => Promise.resolve(redisStore.get(key) ?? null)),
      set: jest.fn((key: string, value: string) => {
        redisStore.set(key, value);
        return Promise.resolve('OK');
      }),
      setex: jest.fn((key: string, _seconds: number, value: string) => {
        redisStore.set(key, value);
        return Promise.resolve('OK');
      }),
      del: jest.fn((key: string) => {
        const existed = redisStore.delete(key);
        return Promise.resolve(existed ? 1 : 0);
      })
    }))
  };
});

import { marketRoutes } from '..';

const app = express();
app.use(express.json());
app.use('/api/market', marketRoutes);

describe('Market Routes', () => {
  beforeEach(() => {
    redisStore.clear();
  });

  it('returns candle data for demo exchange', async () => {
    const response = await request(app)
      .get('/api/market/candles')
      .query({ symbol: 'BTC-USD', exchange: 'demo', timeframe: '1h', limit: 50 });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.symbol).toBe('BTC-USD');
    expect(response.body.data.candles).toHaveLength(50);
    expect(response.body.data.metadata.count).toBe(50);
    expect(response.body.data.metadata).toMatchObject({
      dataSource: 'demo',
      cached: false,
      fallback: false
    });
  });

  it('validates required query parameters', async () => {
    const response = await request(app).get('/api/market/candles');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Validation failed');
  });

  it('returns ticker information', async () => {
    const response = await request(app)
      .get('/api/market/ticker/demo/BTC-USD');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.symbol).toBe('BTC-USD');
    expect(response.body.data).toHaveProperty('price');
    expect(response.body.data).toHaveProperty('change24h');
    expect(response.body.data).toHaveProperty('timestamp');
  });

  it('returns order book with requested depth', async () => {
    const response = await request(app)
      .get('/api/market/orderbook/demo/BTC-USD')
      .query({ depth: 10 });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.bids).toHaveLength(10);
    expect(response.body.data.asks).toHaveLength(10);
    expect(typeof response.body.data.midpoint).toBe('number');
  });
});
