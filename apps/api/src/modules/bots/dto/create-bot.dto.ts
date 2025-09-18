import { AssetType, Exchange, TradingMode, SignalMode } from '@prisma/client';

// Position sizing configuration
export class PositionSizingDto {
  type: 'fixed' | 'percentage';
  value: number;
}

// Risk management configuration
export class RiskManagementDto {
  stopLoss?: number; // Percentage
  takeProfit?: number; // Percentage
  maxDailyLoss?: number; // Dollar amount
}

// Indicator signal configuration
export class IndicatorSignalDto {
  operator: string;
  value?: number;
  value2?: number; // For 'between' operator
}

// Bot indicator configuration
export class BotIndicatorDto {
  indicator: string; // e.g., "rsi", "macd", "ema"
  parameters: Record<string, any>; // e.g., { period: 14, overbought: 70 }
  weight?: number; // Default 1.0
  enabled?: boolean; // Default true
  buySignal?: IndicatorSignalDto;
  sellSignal?: IndicatorSignalDto;
}

export class CreateBotDto {
  name: string;
  description?: string;

  // Trading Configuration
  symbol: string; // e.g., "BTC-USD", "AAPL"
  assetType: AssetType;
  exchange: Exchange;
  timeframe?: string; // Default "1h"

  // Strategy & Indicators
  signalMode?: SignalMode; // Default ALL
  indicators?: BotIndicatorDto[];

  // Trading Settings
  tradingMode?: TradingMode; // Default PAPER
  positionSizing: PositionSizingDto;
  riskManagement?: RiskManagementDto;
}
