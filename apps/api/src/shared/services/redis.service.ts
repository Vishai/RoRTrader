import Redis from 'ioredis';
import { logger } from '../utils/logger';

export class RedisService {
  private client: Redis;
  
  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });
    
    this.client.on('connect', () => {
      logger.info('Connected to Redis');
    });
    
    this.client.on('error', (error) => {
      logger.error('Redis error:', error);
    });
  }
  
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }
  
  async set(key: string, value: string): Promise<'OK'> {
    return this.client.set(key, value);
  }
  
  async setex(key: string, seconds: number, value: string): Promise<'OK'> {
    return this.client.setex(key, seconds, value);
  }
  
  async del(key: string): Promise<number> {
    return this.client.del(key);
  }
  
  async exists(key: string): Promise<number> {
    return this.client.exists(key);
  }
  
  async expire(key: string, seconds: number): Promise<number> {
    return this.client.expire(key, seconds);
  }
  
  async hset(key: string, field: string, value: string): Promise<number> {
    return this.client.hset(key, field, value);
  }
  
  async hget(key: string, field: string): Promise<string | null> {
    return this.client.hget(key, field);
  }
  
  async hgetall(key: string): Promise<Record<string, string>> {
    return this.client.hgetall(key);
  }
  
  async keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }
  
  async flushall(): Promise<'OK'> {
    return this.client.flushall();
  }
  
  getClient(): Redis {
    return this.client;
  }
}
