import { TechnicalAnalysisService } from '../technical-analysis.service';
import { CandleData } from '../technical-analysis.service';

describe('TechnicalAnalysisService', () => {
  let service: TechnicalAnalysisService;
  let mockRedis: any;
  
  // Sample candle data for testing
  const sampleCandles: CandleData[] = Array.from({ length: 50 }, (_, i) => ({
    time: Date.now() - (50 - i) * 60000,
    open: 100 + Math.sin(i * 0.1) * 5,
    high: 105 + Math.sin(i * 0.1) * 5,
    low: 95 + Math.sin(i * 0.1) * 5,
    close: 100 + Math.sin((i + 1) * 0.1) * 5,
    volume: 1000000 + Math.random() * 500000
  }));
  
  beforeEach(() => {
    mockRedis = {
      get: jest.fn().mockResolvedValue(null),
      setex: jest.fn().mockResolvedValue('OK')
    };
    
    service = new TechnicalAnalysisService(mockRedis);
  });
  
  describe('calculateSMA', () => {
    it('should calculate Simple Moving Average correctly', async () => {
      const period = 10;
      const result = await service.calculateSMA(sampleCandles, period);
      
      expect(result).toBeDefined();
      expect(result.length).toBe(sampleCandles.length - period + 1);
      
      // Verify first SMA value
      const firstSMA = sampleCandles.slice(0, period)
        .reduce((sum, candle) => sum + candle.close, 0) / period;
      expect(result[0]).toBeCloseTo(firstSMA, 2);
    });
    
    it('should return empty array for insufficient data', async () => {
      const result = await service.calculateSMA(sampleCandles.slice(0, 5), 10);
      expect(result).toEqual([]);
    });
  });
  
  describe('calculateEMA', () => {
    it('should calculate Exponential Moving Average correctly', async () => {
      const period = 10;
      const result = await service.calculateEMA(sampleCandles, period);
      
      expect(result).toBeDefined();
      expect(result.length).toBe(sampleCandles.length - period + 1);
    });
  });
  
  describe('calculateRSI', () => {
    it('should calculate RSI correctly', async () => {
      const period = 14;
      const result = await service.calculateRSI(sampleCandles, period);
      
      expect(result).toBeDefined();
      expect(result.length).toBe(sampleCandles.length - period);
      
      // RSI should be between 0 and 100
      result.forEach(rsi => {
        expect(rsi).toBeGreaterThanOrEqual(0);
        expect(rsi).toBeLessThanOrEqual(100);
      });
    });
  });
  
  describe('calculateMACD', () => {
    it('should calculate MACD correctly', async () => {
      const result = await service.calculateMACD(sampleCandles);
      
      expect(result).toBeDefined();
      expect(result.macd).toBeDefined();
      expect(result.signal).toBeDefined();
      expect(result.histogram).toBeDefined();
      
      // Histogram should be the difference between MACD and signal
      result.histogram.forEach((hist, i) => {
        const macdIndex = result.macd.length - result.histogram.length + i;
        expect(hist).toBeCloseTo(result.macd[macdIndex] - result.signal[i], 5);
      });
    });
  });
  
  describe('calculateBollingerBands', () => {
    it('should calculate Bollinger Bands correctly', async () => {
      const period = 20;
      const stdDev = 2;
      const result = await service.calculateBollingerBands(sampleCandles, period, stdDev);
      
      expect(result).toBeDefined();
      expect(result.upper).toBeDefined();
      expect(result.middle).toBeDefined();
      expect(result.lower).toBeDefined();
      
      // Upper band should be above middle, lower should be below
      result.upper.forEach((upper, i) => {
        expect(upper).toBeGreaterThan(result.middle[i]);
        expect(result.lower[i]).toBeLessThan(result.middle[i]);
      });
    });
  });
  
  describe('calculateIndicators', () => {
    it('should calculate and cache indicator results', async () => {
      const input = {
        symbol: 'BTC-USD',
        indicator: 'RSI',
        params: { period: 14 },
        candles: sampleCandles
      };
      
      const result = await service.calculateIndicators(input);
      
      expect(result).toBeDefined();
      expect(result.indicator).toBe('RSI');
      expect(result.symbol).toBe('BTC-USD');
      expect(result.values).toBeDefined();
      expect(result.signal).toBeDefined();
      expect(result.strength).toBeDefined();
      
      // Verify caching
      expect(mockRedis.setex).toHaveBeenCalled();
    });
    
    it('should return cached results when available', async () => {
      const cachedResult = JSON.stringify({
        indicator: 'SMA',
        symbol: 'ETH-USD',
        timestamp: Date.now(),
        values: [100, 101, 102],
        signal: 'bullish',
        strength: 75
      });
      
      mockRedis.get.mockResolvedValue(cachedResult);
      
      const input = {
        symbol: 'ETH-USD',
        indicator: 'SMA',
        params: { period: 20 },
        candles: sampleCandles
      };
      
      const result = await service.calculateIndicators(input);
      
      expect(result).toEqual(JSON.parse(cachedResult));
      expect(mockRedis.setex).not.toHaveBeenCalled();
    });
    
    it('should determine correct signals for RSI', async () => {
      // Create candles that will produce oversold RSI
      const oversoldCandles = sampleCandles.map((c, i) => ({
        ...c,
        close: 100 - i * 2 // Decreasing prices
      }));
      
      const result = await service.calculateIndicators({
        symbol: 'BTC-USD',
        indicator: 'RSI',
        params: { period: 14 },
        candles: oversoldCandles
      });
      
      expect(result.signal).toBe('bullish'); // Oversold = bullish signal
    });

    it('should gracefully handle Redis outages and still compute results', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis connection refused'));
      mockRedis.setex.mockRejectedValue(new Error('Redis connection refused'));

      const input = {
        symbol: 'AAPL',
        indicator: 'EMA',
        params: { period: 10 },
        candles: sampleCandles
      };

      await expect(service.calculateIndicators(input)).resolves.toMatchObject({
        indicator: 'EMA',
        symbol: 'AAPL'
      });
    });
  });
});
