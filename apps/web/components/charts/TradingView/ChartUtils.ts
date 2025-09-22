import type { CandlestickData, LineData, HistogramData, UTCTimestamp } from 'lightweight-charts';
import type { MarketCandle } from './ChartTypes';

/**
 * Convert Unix timestamp to TradingView time format
 * TradingView expects timestamps in seconds (UTC)
 */
export function convertToChartTime(timestamp: number): UTCTimestamp {
  // If timestamp is in milliseconds, convert to seconds
  const seconds = timestamp > 9999999999 ? Math.floor(timestamp / 1000) : timestamp;
  return seconds as UTCTimestamp;
}

/**
 * Format market candle data for TradingView candlestick series
 */
export function formatCandlestickData(candles: MarketCandle[]): CandlestickData[] {
  return candles
    .map(candle => ({
      time: convertToChartTime(candle.time),
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }))
    .sort((a, b) => (a.time as number) - (b.time as number));
}

/**
 * Format market candle data for TradingView line series
 */
export function formatLineData(candles: MarketCandle[], priceField: 'open' | 'high' | 'low' | 'close' = 'close'): LineData[] {
  return candles
    .map(candle => ({
      time: convertToChartTime(candle.time),
      value: candle[priceField],
    }))
    .sort((a, b) => (a.time as number) - (b.time as number));
}

/**
 * Format volume data for TradingView histogram series
 */
export function formatVolumeData(candles: MarketCandle[]): HistogramData[] {
  return candles
    .map(candle => ({
      time: convertToChartTime(candle.time),
      value: candle.volume,
      color: candle.close >= candle.open
        ? 'rgba(0, 255, 136, 0.5)'  // Green for up
        : 'rgba(255, 51, 102, 0.5)', // Red for down
    }))
    .sort((a, b) => (a.time as number) - (b.time as number));
}

/**
 * Calculate Simple Moving Average (SMA)
 */
export function calculateSMA(data: MarketCandle[], period: number): LineData[] {
  const result: LineData[] = [];

  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    result.push({
      time: convertToChartTime(data[i].time),
      value: sum / period,
    });
  }

  return result;
}

/**
 * Calculate Exponential Moving Average (EMA)
 */
export function calculateEMA(data: MarketCandle[], period: number): LineData[] {
  const result: LineData[] = [];
  const multiplier = 2 / (period + 1);

  // Calculate initial SMA for the first EMA value
  let sum = 0;
  for (let i = 0; i < period && i < data.length; i++) {
    sum += data[i].close;
  }

  if (data.length < period) return result;

  let previousEMA = sum / period;
  result.push({
    time: convertToChartTime(data[period - 1].time),
    value: previousEMA,
  });

  // Calculate EMA for remaining data points
  for (let i = period; i < data.length; i++) {
    const currentEMA = (data[i].close - previousEMA) * multiplier + previousEMA;
    result.push({
      time: convertToChartTime(data[i].time),
      value: currentEMA,
    });
    previousEMA = currentEMA;
  }

  return result;
}

/**
 * Calculate Relative Strength Index (RSI)
 */
export function calculateRSI(data: MarketCandle[], period: number = 14): LineData[] {
  const result: LineData[] = [];

  if (data.length < period + 1) return result;

  const gains: number[] = [];
  const losses: number[] = [];

  // Calculate initial gains and losses
  for (let i = 1; i <= period; i++) {
    const difference = data[i].close - data[i - 1].close;
    gains.push(difference > 0 ? difference : 0);
    losses.push(difference < 0 ? -difference : 0);
  }

  let avgGain = gains.reduce((a, b) => a + b) / period;
  let avgLoss = losses.reduce((a, b) => a + b) / period;

  // Calculate RSI for each point
  for (let i = period; i < data.length; i++) {
    const difference = data[i].close - data[i - 1].close;
    const gain = difference > 0 ? difference : 0;
    const loss = difference < 0 ? -difference : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    result.push({
      time: convertToChartTime(data[i].time),
      value: rsi,
    });
  }

  return result;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(
  data: MarketCandle[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): {
  macd: LineData[];
  signal: LineData[];
  histogram: HistogramData[];
} {
  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);

  const macdLine: LineData[] = [];
  const macdValues: number[] = [];

  // Calculate MACD line (fast EMA - slow EMA)
  for (let i = 0; i < slowEMA.length; i++) {
    const fastValue = fastEMA.find(f => f.time === slowEMA[i].time);
    if (fastValue) {
      const macdValue = fastValue.value - slowEMA[i].value;
      macdLine.push({
        time: slowEMA[i].time,
        value: macdValue,
      });
      macdValues.push(macdValue);
    }
  }

  // Calculate signal line (EMA of MACD)
  const signalLine: LineData[] = [];
  const multiplier = 2 / (signalPeriod + 1);

  if (macdValues.length >= signalPeriod) {
    // Initial SMA for first signal value
    let sum = 0;
    for (let i = 0; i < signalPeriod; i++) {
      sum += macdValues[i];
    }
    let previousSignal = sum / signalPeriod;
    signalLine.push({
      time: macdLine[signalPeriod - 1].time,
      value: previousSignal,
    });

    // Calculate signal line EMA
    for (let i = signalPeriod; i < macdValues.length; i++) {
      const currentSignal = (macdValues[i] - previousSignal) * multiplier + previousSignal;
      signalLine.push({
        time: macdLine[i].time,
        value: currentSignal,
      });
      previousSignal = currentSignal;
    }
  }

  // Calculate histogram (MACD - Signal)
  const histogram: HistogramData[] = [];
  for (let i = 0; i < signalLine.length; i++) {
    const macdValue = macdLine.find(m => m.time === signalLine[i].time);
    if (macdValue) {
      const histValue = macdValue.value - signalLine[i].value;
      histogram.push({
        time: signalLine[i].time,
        value: histValue,
        color: histValue >= 0 ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 51, 102, 0.5)',
      });
    }
  }

  return {
    macd: macdLine,
    signal: signalLine,
    histogram,
  };
}

/**
 * Calculate Bollinger Bands
 */
export function calculateBollingerBands(
  data: MarketCandle[],
  period: number = 20,
  stdDev: number = 2
): {
  upper: LineData[];
  middle: LineData[];
  lower: LineData[];
} {
  const middle = calculateSMA(data, period);
  const upper: LineData[] = [];
  const lower: LineData[] = [];

  for (let i = period - 1; i < data.length; i++) {
    // Calculate standard deviation
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    const mean = sum / period;

    let variance = 0;
    for (let j = 0; j < period; j++) {
      variance += Math.pow(data[i - j].close - mean, 2);
    }
    const standardDeviation = Math.sqrt(variance / period);

    const time = convertToChartTime(data[i].time);
    const middleValue = middle.find(m => m.time === time);

    if (middleValue) {
      upper.push({
        time,
        value: middleValue.value + (standardDeviation * stdDev),
      });
      lower.push({
        time,
        value: middleValue.value - (standardDeviation * stdDev),
      });
    }
  }

  return { upper, middle, lower };
}

/**
 * Format number for display
 */
export function formatPrice(price: number, decimals: number = 2): string {
  return price.toFixed(decimals);
}

/**
 * Format volume for display
 */
export function formatVolume(volume: number): string {
  if (volume >= 1e9) {
    return `${(volume / 1e9).toFixed(2)}B`;
  } else if (volume >= 1e6) {
    return `${(volume / 1e6).toFixed(2)}M`;
  } else if (volume >= 1e3) {
    return `${(volume / 1e3).toFixed(2)}K`;
  }
  return volume.toFixed(0);
}

/**
 * Check if market is open (basic check - enhance based on exchange)
 */
export function isMarketOpen(exchange: string = 'NYSE'): boolean {
  const now = new Date();
  const day = now.getUTCDay();
  const hour = now.getUTCHours();
  const minute = now.getUTCMinutes();

  // Weekend check
  if (day === 0 || day === 6) return false;

  // Basic NYSE hours (9:30 AM - 4:00 PM ET = 14:30 - 21:00 UTC)
  if (exchange === 'NYSE') {
    const totalMinutes = hour * 60 + minute;
    return totalMinutes >= 870 && totalMinutes < 1260; // 14:30 - 21:00 UTC
  }

  // Crypto markets are 24/7
  if (exchange === 'CRYPTO') return true;

  return false;
}

/**
 * Get price change and percentage
 */
export function getPriceChange(currentPrice: number, previousClose: number): {
  change: number;
  changePercent: number;
  isPositive: boolean;
} {
  const change = currentPrice - previousClose;
  const changePercent = (change / previousClose) * 100;

  return {
    change,
    changePercent,
    isPositive: change >= 0,
  };
}
