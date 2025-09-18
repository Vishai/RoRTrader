import { prisma } from '@/shared/database/prisma';
import { BotStatus, SignalMode, WebhookStatus, Prisma } from '@prisma/client';

interface WebhookSignal {
  action: 'buy' | 'sell' | 'close';
  symbol: string;
  quantity?: number;
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
  orderId?: string;
  message?: string;
  indicators?: Record<string, any>;
}

interface IndicatorSignal {
  indicator: string;
  value: number;
  signal: 'buy' | 'sell' | 'neutral';
  weight: number;
}

export class WebhookService {
  /**
   * Process incoming webhook
   */
  async processWebhook(
    botId: string,
    webhookSecret: string,
    signal: WebhookSignal
  ): Promise<{ success: boolean; message: string }> {
    // Verify bot and webhook secret
    const bot = await prisma.bot.findFirst({
      where: { 
        id: botId,
        webhookSecret: webhookSecret 
      }
    });
    
    if (!bot) {
      throw new Error('Invalid webhook URL');
    }

    // Check if bot is active
    if (bot.status !== BotStatus.ACTIVE) {
      console.warn(`Webhook received for inactive bot ${bot.id}`);
      return {
        success: false,
        message: `Bot is ${bot.status.toLowerCase()}. Webhook ignored.`
      };
    }

    // Verify symbol matches
    if (signal.symbol && signal.symbol !== bot.symbol) {
      console.warn(`Symbol mismatch: webhook ${signal.symbol} vs bot ${bot.symbol}`);
      return {
        success: false,
        message: `Symbol mismatch. Bot trades ${bot.symbol}, received ${signal.symbol}`
      };
    }

    // Log webhook
    const webhookLog = await prisma.webhookLog.create({
      data: {
        botId: bot.id,
        payload: signal as any,
        status: WebhookStatus.RECEIVED,
      }
    });

    // Process webhook immediately (in production, this would be queued)
    // For now, we'll process synchronously
    try {
      const result = await this.processWebhookWithIndicators(webhookLog.id);
      return {
        success: true,
        message: result.traded ? 'Trade executed' : 'Trade skipped - indicators do not agree'
      };
    } catch (error: any) {
      console.error('Error processing webhook:', error);
      return {
        success: false,
        message: 'Webhook processing failed'
      };
    }
  }

  /**
   * Process webhook with indicator checking
   */
  async processWebhookWithIndicators(webhookLogId: string) {
    const webhookLog = await prisma.webhookLog.findUnique({
      where: { id: webhookLogId },
      include: {
        bot: {
          include: {
            indicators: true,
            user: true,
          }
        }
      }
    });

    if (!webhookLog) {
      throw new Error('Webhook log not found');
    }

    const bot = webhookLog.bot;
    const signal = webhookLog.payload as WebhookSignal;

    try {
      // Update webhook status
      await prisma.webhookLog.update({
        where: { id: webhookLogId },
        data: { status: WebhookStatus.PROCESSING }
      });

      // Check indicators if configured
      let shouldTrade = true;
      let indicatorResults: IndicatorSignal[] = [];

      if (bot.indicators.length > 0) {
        console.log(`Checking ${bot.indicators.length} indicators for bot ${bot.id}`);
        
        // Get current market data for indicator calculation
        const marketData = await this.getMarketData(bot.symbol, bot.timeframe);
        
        // Calculate indicator signals
        indicatorResults = await this.calculateIndicatorSignals(
          bot.indicators,
          marketData,
          signal.action
        );

        // Evaluate signals based on signal mode
        shouldTrade = this.evaluateSignals(indicatorResults, bot.signalMode, signal.action);
        
        console.log(`Indicator evaluation result: ${shouldTrade ? 'TRADE' : 'NO TRADE'}`);
      }

      if (!shouldTrade) {
        await prisma.webhookLog.update({
          where: { id: webhookLogId },
          data: {
            status: WebhookStatus.COMPLETED,
            processedAt: new Date(),
            metadata: {
              indicatorResults,
              decision: 'NO_TRADE',
              reason: 'Indicators do not agree'
            }
          }
        });

        return {
          traded: false,
          reason: 'Indicators do not support trade'
        };
      }

      // TODO: Execute trade through exchange
      // For now, just log the trade
      const trade = await prisma.trade.create({
        data: {
          botId: bot.id,
          webhookLogId: webhookLogId,
          exchange: bot.exchange,
          symbol: bot.symbol,
          side: signal.action === 'buy' ? 'BUY' : 'SELL',
          orderType: 'market',
          quantity: signal.quantity || 0.001,
          price: signal.price,
          status: 'PENDING',
          metadata: {
            isDemo: bot.tradingMode === 'PAPER',
            indicatorResults
          }
        }
      });

      await prisma.webhookLog.update({
        where: { id: webhookLogId },
        data: {
          status: WebhookStatus.COMPLETED,
          processedAt: new Date(),
          metadata: {
            indicatorResults,
            decision: 'TRADE',
            tradeId: trade.id
          }
        }
      });

      return {
        traded: true,
        tradeId: trade.id
      };

    } catch (error: any) {
      console.error(`Error processing webhook: ${error.message}`, error.stack);
      
      await prisma.webhookLog.update({
        where: { id: webhookLogId },
        data: {
          status: WebhookStatus.FAILED,
          errorMessage: error.message,
          processedAt: new Date(),
        }
      });

      throw error;
    }
  }

  /**
   * Get market data for indicator calculations
   */
  private async getMarketData(symbol: string, timeframe: string): Promise<any> {
    // TODO: Implement actual market data fetching
    console.log(`Fetching market data for ${symbol} ${timeframe}`);
    
    // Mock data for now
    return {
      symbol,
      timeframe,
      candles: Array(100).fill(null).map((_, i) => ({
        time: Date.now() - (i * 60000),
        open: 50000 + Math.random() * 1000,
        high: 50500 + Math.random() * 1000,
        low: 49500 + Math.random() * 1000,
        close: 50000 + Math.random() * 1000,
        volume: Math.random() * 100
      }))
    };
  }

  /**
   * Calculate indicator signals
   */
  private async calculateIndicatorSignals(
    indicators: any[],
    marketData: any,
    action: string
  ): Promise<IndicatorSignal[]> {
    const signals: IndicatorSignal[] = [];

    for (const indicator of indicators) {
      if (!indicator.enabled) continue;

      const value = await this.calculateIndicatorValue(
        indicator.indicator,
        indicator.parameters,
        marketData
      );

      const signal = this.evaluateIndicatorSignal(
        indicator,
        value,
        action
      );

      signals.push({
        indicator: indicator.indicator,
        value,
        signal,
        weight: Number(indicator.weight)
      });
    }

    return signals;
  }

  /**
   * Calculate a single indicator value
   */
  private async calculateIndicatorValue(
    indicatorType: string,
    parameters: any,
    marketData: any
  ): Promise<number> {
    // TODO: Implement actual indicator calculations
    // This would use technical analysis libraries
    
    switch (indicatorType) {
      case 'rsi':
        // Mock RSI calculation
        return 30 + Math.random() * 40; // Random RSI between 30-70
        
      case 'macd':
        // Mock MACD calculation
        return -10 + Math.random() * 20; // Random MACD between -10 and 10
        
      case 'ema_cross':
        // Mock EMA cross calculation
        return Math.random() > 0.5 ? 1 : -1;
        
      default:
        return 0;
    }
  }

  /**
   * Evaluate if indicator gives buy/sell signal
   */
  private evaluateIndicatorSignal(
    indicator: any,
    value: number,
    action: string
  ): 'buy' | 'sell' | 'neutral' {
    if (action === 'buy' && indicator.buySignal) {
      const signal = indicator.buySignal as any;
      
      switch (signal.operator) {
        case 'lt':
          return value < signal.value ? 'buy' : 'neutral';
        case 'gt':
          return value > signal.value ? 'buy' : 'neutral';
        case 'crosses_above':
          return value > 0 ? 'buy' : 'neutral';
        default:
          return 'neutral';
      }
    }

    if (action === 'sell' && indicator.sellSignal) {
      const signal = indicator.sellSignal as any;
      
      switch (signal.operator) {
        case 'lt':
          return value < signal.value ? 'sell' : 'neutral';
        case 'gt':
          return value > signal.value ? 'sell' : 'neutral';
        case 'crosses_below':
          return value < 0 ? 'sell' : 'neutral';
        default:
          return 'neutral';
      }
    }

    return 'neutral';
  }

  /**
   * Evaluate multiple indicator signals based on signal mode
   */
  private evaluateSignals(
    signals: IndicatorSignal[],
    signalMode: SignalMode,
    action: string
  ): boolean {
    const targetSignal = action === 'buy' ? 'buy' : 'sell';
    const activeSignals = signals.filter(s => s.signal === targetSignal);
    const totalWeight = signals.reduce((sum, s) => sum + s.weight, 0);
    const activeWeight = activeSignals.reduce((sum, s) => sum + s.weight, 0);

    switch (signalMode) {
      case SignalMode.ANY:
        // Any indicator signaling is enough
        return activeSignals.length > 0;
        
      case SignalMode.ALL:
        // All indicators must agree
        return activeSignals.length === signals.length;
        
      case SignalMode.MAJORITY:
        // Weighted majority must agree
        return activeWeight > totalWeight / 2;
        
      case SignalMode.CUSTOM:
        // TODO: Implement custom logic
        return false;
        
      default:
        return false;
    }
  }

  /**
   * Get webhook logs for a bot
   */
  async getWebhookLogs(botId: string, userId: string, limit = 50) {
    // Verify bot ownership
    const bot = await prisma.bot.findFirst({
      where: { id: botId, userId }
    });

    if (!bot) {
      throw new Error('Bot not found');
    }

    const logs = await prisma.webhookLog.findMany({
      where: { botId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        trades: {
          select: {
            id: true,
            status: true,
            executedPrice: true,
            quantity: true,
          }
        }
      }
    });

    return logs;
  }

  /**
   * Test webhook (for authenticated users)
   */
  async testWebhook(botId: string, userId: string, signal: WebhookSignal) {
    // Verify bot ownership
    const bot = await prisma.bot.findFirst({
      where: { id: botId, userId }
    });

    if (!bot) {
      throw new Error('Bot not found');
    }

    // Process as a real webhook but mark as test
    const testSignal = {
      ...signal,
      message: `TEST: ${signal.message || 'Test webhook'}`
    };

    return this.processWebhook(bot.id, bot.webhookSecret, testSignal);
  }
}
