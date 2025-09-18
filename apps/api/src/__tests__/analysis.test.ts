import request from 'supertest'
import express from 'express'
import { analysisRoutes } from '@/modules/analysis'
import axios from 'axios'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

const app = express()
app.use(express.json())
app.use('/api/analysis', analysisRoutes)

describe('POST /api/analysis/batch', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    mockedAxios.get.mockReset()

    // Use Alpaca credentials from .env file
    process.env = {
      ...originalEnv,
      ALPACA_API_KEY_ID: process.env.ALPACA_API_KEY_ID || 'MOCK_KEY',
      ALPACA_API_SECRET_KEY: process.env.ALPACA_API_SECRET_KEY || 'MOCK_SECRET',
      ALPACA_DATA_URL:
        process.env.ALPACA_DATA_URL || 'https://paper-api.alpaca.markets',
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('with mock Alpaca credentials', () => {
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

      mockedAxios.get.mockResolvedValueOnce(mockCandles as never)

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

      // Verify Alpaca API was called with correct headers
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/v2/stocks/AAPL/bars'),
        expect.objectContaining({
          params: expect.objectContaining({
            timeframe: '1Hour',
            limit: 300,
          }),
          headers: expect.objectContaining({
            'APCA-API-KEY-ID': 'MOCK_KEY',
            'APCA-API-SECRET-KEY': 'MOCK_SECRET',
          }),
        })
      )
    })

    it('should fall back to demo data when Alpaca request fails', async () => {
      // Mock Alpaca API failure
      mockedAxios.get.mockRejectedValueOnce(new Error('Alpaca API error'))

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
      expect(mockedAxios.get).toHaveBeenCalledTimes(1)
    })
  })

  describe('without Alpaca credentials', () => {
    beforeEach(() => {
      // Clear Alpaca credentials
      delete process.env.ALPACA_API_KEY_ID
      delete process.env.ALPACA_API_SECRET_KEY
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
      expect(mockedAxios.get).not.toHaveBeenCalled()
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
