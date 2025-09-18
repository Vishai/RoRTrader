import request from 'supertest'
import express from 'express'
import { analysisRoutes } from '@/modules/analysis'
import axios from 'axios'
import dotenv from 'dotenv'
import path from 'path'
import Redis from 'ioredis'

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

jest.mock('axios')

const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn()
}

const mockedAxios = axios as jest.Mocked<typeof axios>
mockedAxios.create = jest.fn(() => mockAxiosInstance) as any
mockedAxios.get = jest.fn()

const app = express()
app.use(express.json())
app.use('/api/analysis', analysisRoutes)

// Create Redis client for test cleanup
let redis: Redis | null = null
try {
  redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    lazyConnect: true
  })
} catch (err) {
  console.log('Redis not available for test cleanup')
}

describe('POST /api/analysis/batch', () => {
  const originalEnv = process.env

  beforeAll(async () => {
    // Clear Redis cache before all tests
    if (redis) {
      try {
        await redis.connect()
        await redis.flushall()
      } catch (err) {
        // Redis not available, tests will run without cache
      }
    }
  })

  afterEach(async () => {
    process.env = originalEnv
    jest.clearAllMocks()
    // Clear Redis cache after each test to ensure clean state
    if (redis && redis.status === 'ready') {
      try {
        await redis.flushall()
      } catch (err) {
        // Ignore errors
      }
    }
  })

  afterAll(async () => {
    if (redis && redis.status === 'ready') {
      try {
        await redis.quit()
      } catch (err) {
        // Ignore errors
      }
    }
  })

  describe('with mock Alpaca credentials', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      mockAxiosInstance.get.mockReset()

      // Use Alpaca credentials from .env file
      process.env = {
        ...originalEnv,
        ALPACA_API_KEY_ID: process.env.ALPACA_API_KEY_ID || 'MOCK_KEY',
        ALPACA_API_SECRET_KEY: process.env.ALPACA_API_SECRET_KEY || 'MOCK_SECRET',
        ALPACA_DATA_URL:
          process.env.ALPACA_DATA_URL || 'https://paper-api.alpaca.markets',
      }
    })

    it('should process batch analysis with Alpaca exchange', async () => {
      // Mock successful Alpaca API response
      const mockCandles = {
        data: {
          bars: Array(100)
            .fill(null)
            .map((_, i) => ({
              t: new Date(Date.now() - i * 3600000).toISOString(),
              o: 150 + Math.random() * 5,
              h: 152 + Math.random() * 5,
              l: 148 + Math.random() * 5,
              c: 150 + Math.random() * 5,
              v: 1000000 + Math.random() * 500000,
              n: 100,
              vw: 150 + Math.random() * 2,
            })),
          next_page_token: null,
        },
      }

      mockAxiosInstance.get.mockResolvedValueOnce(mockCandles as never)

      const response = await request(app)
        .post('/api/analysis/batch')
        .send({
          symbol: 'AAPL',
          timeframe: '1h',
          exchange: 'alpaca',
          indicators: [
            { indicator: 'SMA', params: { period: 20 } },
            { indicator: 'RSI', params: { period: 14 } },
          ],
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.indicators).toHaveLength(2)
      expect(response.body.data.indicators[0].indicator).toBe('SMA')
      expect(response.body.data.indicators[1].indicator).toBe('RSI')
      expect(response.body.meta).toMatchObject({
        dataSource: 'alpaca',
        cached: false,
        fallback: false
      })

      // Verify Alpaca API was called with correct headers
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        expect.stringContaining('/v2/stocks/AAPL/bars'),
        expect.objectContaining({
          params: expect.objectContaining({
            timeframe: '1Hour',
            limit: 300,
          })
        })
      )
    })

    it('should fall back to demo data when Alpaca request fails', async () => {
      // Mock Alpaca API failure
      mockAxiosInstance.get.mockRejectedValueOnce(new Error('Alpaca API error'))

      const response = await request(app)
        .post('/api/analysis/batch')
        .send({
          symbol: 'MSFT',
          timeframe: '1h',
          exchange: 'alpaca',
          indicators: [{ indicator: 'SMA', params: { period: 20 } }],
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.indicators).toBeDefined()

      // Should have attempted Alpaca first
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1)
      expect(response.body.meta).toMatchObject({
        dataSource: 'demo',
        fallback: true
      })
    })
  })

  describe('without Alpaca credentials', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      mockAxiosInstance.get.mockReset()

      // Clear Alpaca credentials
      process.env = { ...originalEnv }
      delete process.env.ALPACA_API_KEY_ID
      delete process.env.ALPACA_API_SECRET_KEY
      delete process.env.ALPACA_API_KEY
      delete process.env.ALPACA_API_SECRET
      delete process.env.APCA_API_KEY_ID
      delete process.env.APCA_API_SECRET_KEY
      delete process.env.ALPACA_DATA_URL
    })

    it('should use demo data when exchange is alpaca but no credentials', async () => {
      const response = await request(app)
        .post('/api/analysis/batch')
        .send({
          symbol: 'AAPL',
          timeframe: '1h',
          exchange: 'alpaca',
          indicators: [{ indicator: 'SMA', params: { period: 20 } }],
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.indicators).toBeDefined()

      // Should not attempt to call Alpaca API when no credentials are present
      expect(mockedAxios.create).not.toHaveBeenCalled()
      expect(response.body.meta).toMatchObject({
        dataSource: 'demo',
        fallback: true
      })
    })
  })

  describe('validation', () => {
    it('should return 400 for invalid symbol', async () => {
      const response = await request(app)
        .post('/api/analysis/batch')
        .send({
          symbol: '',
          timeframe: '1h',
          exchange: 'demo',
          indicators: [{ indicator: 'SMA', params: { period: 20 } }],
        })

      expect(response.status).toBe(400)
    })

    it('should return 400 for invalid timeframe', async () => {
      const response = await request(app)
        .post('/api/analysis/batch')
        .send({
          symbol: 'AAPL',
          timeframe: 'invalid',
          exchange: 'demo',
          indicators: [{ indicator: 'SMA', params: { period: 20 } }],
        })

      expect(response.status).toBe(400)
    })

    it('should return 400 for empty indicators array', async () => {
      const response = await request(app).post('/api/analysis/batch').send({
        symbol: 'AAPL',
        timeframe: '1h',
        exchange: 'demo',
        indicators: [],
      })

      expect(response.status).toBe(400)
    })
  })
})

describe('POST /api/analysis/indicator', () => {
  const originalEnv = process.env

  beforeAll(async () => {
    // Clear Redis cache before all tests
    if (redis) {
      try {
        await redis.connect()
        await redis.flushall()
      } catch (err) {
        // Redis not available, tests will run without cache
      }
    }
  })

  afterEach(async () => {
    process.env = originalEnv
    jest.clearAllMocks()
    // Clear Redis cache after each test to ensure clean state
    if (redis && redis.status === 'ready') {
      try {
        await redis.flushall()
      } catch (err) {
        // Ignore errors
      }
    }
  })

  afterAll(async () => {
    if (redis && redis.status === 'ready') {
      try {
        await redis.quit()
      } catch (err) {
        // Ignore errors
      }
    }
  })

  describe('with mock Alpaca credentials', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      mockAxiosInstance.get.mockReset()

      process.env = {
        ...originalEnv,
        ALPACA_API_KEY_ID: process.env.ALPACA_API_KEY_ID || 'MOCK_KEY',
        ALPACA_API_SECRET_KEY: process.env.ALPACA_API_SECRET_KEY || 'MOCK_SECRET',
        ALPACA_DATA_URL:
          process.env.ALPACA_DATA_URL || 'https://paper-api.alpaca.markets',
      }
    })

    it('returns indicator results using Alpaca data when credentials are present', async () => {
    const mockCandles = {
      data: {
        bars: Array(120)
          .fill(null)
          .map((_, i) => ({
            t: new Date(Date.now() - i * 300000).toISOString(),
            o: 200 + i * 0.1,
            h: 205 + i * 0.1,
            l: 195 + i * 0.1,
            c: 202 + i * 0.1,
            v: 500000 + i * 1000,
          })),
        next_page_token: null,
      },
    }

    mockAxiosInstance.get.mockResolvedValueOnce(mockCandles as never)

    const response = await request(app)
      .post('/api/analysis/indicator')
      .send({
        symbol: 'TSLA',
        indicator: 'SMA',
        timeframe: '5m',
        exchange: 'alpaca',
        params: { period: 20 },
      })

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data.indicator).toBe('SMA')
    expect(response.body.data.symbol).toBe('TSLA')
    expect(response.body.meta).toMatchObject({
      dataSource: 'alpaca',
      fallback: false
    })

    expect(mockAxiosInstance.get).toHaveBeenCalledWith(
      expect.stringContaining('/v2/stocks/TSLA/bars'),
      expect.objectContaining({
        params: expect.objectContaining({ timeframe: '5Min', limit: 300 })
      })
    )
  })

    it('falls back to demo data when Alpaca request fails', async () => {
    mockAxiosInstance.get.mockRejectedValueOnce(new Error('Network down'))

    const response = await request(app)
      .post('/api/analysis/indicator')
      .send({
        symbol: 'NFLX',
        indicator: 'RSI',
        timeframe: '15m',
        exchange: 'alpaca',
        params: { period: 14 },
      })

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data.indicator).toBe('RSI')
    expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1)
    expect(response.body.meta).toMatchObject({
      dataSource: 'demo',
      fallback: true
    })
  })

    it('returns 400 when payload is invalid', async () => {
    const response = await request(app)
      .post('/api/analysis/indicator')
      .send({
        symbol: '',
        indicator: '',
        timeframe: '1x',
        exchange: 'demo',
      })

    expect(response.status).toBe(400)
    expect(response.body.success).toBe(false)
    })
  })

  describe('without Alpaca credentials', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      mockAxiosInstance.get.mockReset()

      // Clear Alpaca credentials
      process.env = { ...originalEnv }
      delete process.env.ALPACA_API_KEY_ID
      delete process.env.ALPACA_API_SECRET_KEY
      delete process.env.ALPACA_API_KEY
      delete process.env.ALPACA_API_SECRET
      delete process.env.APCA_API_KEY_ID
      delete process.env.APCA_API_SECRET_KEY
      delete process.env.ALPACA_DATA_URL
    })

    it('uses demo data when credentials are missing', async () => {
      const response = await request(app)
        .post('/api/analysis/indicator')
        .send({
          symbol: 'ETHUSD',
          indicator: 'EMA',
          timeframe: '30m',
          exchange: 'alpaca',
          params: { period: 12 },
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.indicator).toBe('EMA')
      expect(mockedAxios.create).not.toHaveBeenCalled()
      expect(response.body.meta).toMatchObject({
        dataSource: 'demo',
        fallback: true
      })
    })
  })
})
