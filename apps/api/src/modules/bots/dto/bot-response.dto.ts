import { Bot, BotIndicator, BotStatus, AssetType, Exchange, TradingMode, SignalMode } from '@prisma/client';

export class BotIndicatorResponse {
  id: string;
  indicator: string;
  parameters: Record<string, any>;
  weight: number;
  enabled: boolean;
  buySignal?: Record<string, any>;
  sellSignal?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;

  constructor(indicator: BotIndicator) {
    this.id = indicator.id;
    this.indicator = indicator.indicator;
    this.parameters = indicator.parameters as Record<string, any>;
    this.weight = Number(indicator.weight);
    this.enabled = indicator.enabled;
    this.buySignal = indicator.buySignal as Record<string, any> | undefined;
    this.sellSignal = indicator.sellSignal as Record<string, any> | undefined;
    this.createdAt = indicator.createdAt;
    this.updatedAt = indicator.updatedAt;
  }
}

export class BotResponse {
  id: string;
  name: string;
  description?: string;
  
  // Trading Configuration
  symbol: string;
  assetType: AssetType;
  exchange: Exchange;
  timeframe: string;
  
  // Strategy & Indicators
  signalMode: SignalMode;
  indicators: BotIndicatorResponse[];
  
  // Trading Settings
  tradingMode: TradingMode;
  positionSizing: Record<string, any>;
  riskManagement?: Record<string, any>;
  status: BotStatus;
  
  // Webhook
  webhookUrl: string;
  webhookSecret: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  
  // Performance summary (optional)
  performance?: {
    totalTrades: number;
    winRate: number;
    totalReturn: number;
    isDemo?: boolean;
  };

  constructor(bot: Bot & { indicators?: BotIndicator[] }, baseUrl: string) {
    this.id = bot.id;
    this.name = bot.name;
    this.description = bot.description || undefined;
    
    this.symbol = bot.symbol;
    this.assetType = bot.assetType;
    this.exchange = bot.exchange;
    this.timeframe = bot.timeframe;
    
    this.signalMode = bot.signalMode;
    this.indicators = (bot.indicators || []).map(ind => new BotIndicatorResponse(ind));
    
    this.tradingMode = bot.tradingMode;
    this.positionSizing = bot.positionSizing as Record<string, any>;
    this.riskManagement = bot.riskManagement as Record<string, any> | undefined;
    this.status = bot.status;
    
    this.webhookUrl = `${baseUrl}/webhook/${bot.id}/${bot.webhookSecret}`;
    this.webhookSecret = bot.webhookSecret;
    
    this.createdAt = bot.createdAt;
    this.updatedAt = bot.updatedAt;
    
    // Add performance if included in metadata
    if (bot.metadata && typeof bot.metadata === 'object' && 'performance' in bot.metadata) {
      this.performance = bot.metadata.performance as any;
    }
  }
}

export class BotListResponse {
  bots: BotResponse[];
  total: number;
  page: number;
  limit: number;

  constructor(bots: BotResponse[], total: number, page: number, limit: number) {
    this.bots = bots;
    this.total = total;
    this.page = page;
    this.limit = limit;
  }
}
