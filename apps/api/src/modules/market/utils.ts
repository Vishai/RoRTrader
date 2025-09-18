import { MarketDataOptions } from '../analysis/market-data.service';

export const EXCHANGE_MAP: Record<string, MarketDataOptions['exchange']> = {
  coinbase: 'coinbase_pro',
  coinbase_pro: 'coinbase_pro',
  alpaca: 'alpaca',
  binance: 'demo',
  demo: 'demo',
  mock: 'demo'
};

export const SUPPORTED_TIMEFRAMES: Record<string, MarketDataOptions['timeframe']> = {
  '1m': '1m',
  '5m': '5m',
  '15m': '15m',
  '30m': '30m',
  '1h': '1h',
  '4h': '4h',
  '1d': '1d',
  '1w': '1w'
};

export function normalizeExchange(exchange: string): MarketDataOptions['exchange'] {
  return EXCHANGE_MAP[exchange] || 'demo';
}

export function normalizeTimeframe(timeframe: string): MarketDataOptions['timeframe'] {
  return SUPPORTED_TIMEFRAMES[timeframe] || '1h';
}
