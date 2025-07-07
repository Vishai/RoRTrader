import { prisma } from '@/shared/database/prisma';
import * as crypto from 'crypto';
import axios from 'axios';

export class WebhookSimulator {
  private prisma = prisma;
  private baseUrl: string;

  // Trading patterns for realistic simulation
  private tradingPatterns = {
    scalping: {
      interval: 5000, // 5 seconds
      symbols: ['BTC-USD', 'ETH-USD'],
      quantity: () => 0.001 + Math.random() * 0.005,
      description: 'High-frequency small trades'
    },
    swing: {
      interval: 60000, // 1 minute
      symbols: ['AAPL', 'GOOGL', 'MSFT'],
      quantity: () => Math.floor(Math.random() * 50) + 10,
      description: 'Medium-frequency position trades'
    },
    momentum: {
      interval: 30000, // 30 seconds
      symbols: ['TSLA', 'NVDA', 'SOL-USD'],
      quantity: () => Math.random() > 0.5 ? 100 : 50,
      description: 'Trend-following trades'
    }
  };

  // Market events for demo narratives
  private marketEvents = [
    { type: 'breakout', message: 'Price breakout detected!' },
    { type: 'support', message: 'Bounced off support level' },
    { type: 'resistance', message: 'Testing resistance' },
    { type: 'volume', message: 'Unusual volume spike' },
    { type: 'pattern', message: 'Chart pattern completed' }
  ];

  constructor() {
    // Use shared prisma instance
    this.baseUrl = process.env.API_URL || 'http://localhost:3000';
  }

  /**
   * Simulate a random webhook for a user's active bots
   */
  async simulateRandomWebhook(userId: string) {
    try {
      // Get user's active demo bots
      const activeBots = await this.prisma.bot.findMany({
        where: {
          userId,
          status: 'ACTIVE',
          metadata: {
            path: ['isDemo'],
            equals: true
          }
        }
      });

      if (activeBots.length === 0) return;

      // Pick a random bot
      const bot = activeBots[Math.floor(Math.random() * activeBots.length)];
      
      // Generate webhook based on bot's trading pattern
      const pattern = this.getPatternForBot(bot);
      await this.sendWebhook(bot, pattern);

    } catch (error) {
      console.error('Webhook simulation error:', error);
    }
  }

  /**
   * Simulate a specific trading scenario
   */
  async simulateScenario(botId: string, scenario: 'rally' | 'dump' | 'chop') {
    const bot = await this.prisma.bot.findUnique({ where: { id: botId } });
    if (!bot) return;

    console.log(`📊 Simulating ${scenario} scenario for bot: ${bot.name}`);

    switch (scenario) {
      case 'rally':
        // Simulate a series of buy signals
        for (let i = 0; i < 5; i++) {
          await this.sendWebhook(bot, null, 'BUY');
          await this.delay(2000);
        }
        break;

      case 'dump':
        // Simulate a series of sell signals
        for (let i = 0; i < 5; i++) {
          await this.sendWebhook(bot, null, 'SELL');
          await this.delay(2000);
        }
        break;

      case 'chop':
        // Simulate alternating buy/sell signals
        for (let i = 0; i < 6; i++) {
          await this.sendWebhook(bot, null, i % 2 === 0 ? 'BUY' : 'SELL');
          await this.delay(3000);
        }
        break;
    }
  }

  /**
   * Send a simulated webhook to the API
   */
  private async sendWebhook(
    bot: any, 
    pattern: any = null,
    forcedAction: 'BUY' | 'SELL' | null = null
  ) {
    const symbols = bot.assetType === 'CRYPTO' 
      ? ['BTC-USD', 'ETH-USD', 'SOL-USD']
      : ['AAPL', 'GOOGL', 'MSFT', 'TSLA'];

    const symbol = pattern?.symbols?.[Math.floor(Math.random() * pattern.symbols.length)] 
      || symbols[Math.floor(Math.random() * symbols.length)];

    const action = forcedAction || (Math.random() > 0.5 ? 'BUY' : 'SELL');
    const marketEvent = this.marketEvents[Math.floor(Math.random() * this.marketEvents.length)];

    const webhookPayload = {
      action,
      symbol,
      quantity: pattern?.quantity?.() || (Math.random() * 0.1),
      price: this.getCurrentPrice(symbol),
      orderId: crypto.randomBytes(8).toString('hex'),
      message: marketEvent.message,
      timestamp: new Date().toISOString()
    };

    try {
      // Log the webhook in database
      await this.prisma.webhookLog.create({
        data: {
          botId: bot.id,
          payload: webhookPayload,
          status: 'RECEIVED',
          metadata: {
            simulated: true,
            pattern: pattern?.description,
            event: marketEvent.type
          }
        }
      });

      // In a real implementation, this would call the actual webhook endpoint
      // For demo, we'll just log it
      console.log(`🎯 Webhook sent: ${bot.name} - ${action} ${webhookPayload.quantity} ${symbol}`);

      // Simulate processing delay
      setTimeout(async () => {
        await this.prisma.webhookLog.updateMany({
          where: {
            botId: bot.id,
            payload: {
              path: '$.orderId',
              equals: webhookPayload.orderId
            }
          },
          data: {
            status: 'COMPLETED',
            processedAt: new Date()
          }
        });
      }, Math.random() * 1000 + 500);

    } catch (error) {
      console.error('Failed to send webhook:', error);
    }
  }

  /**
   * Get trading pattern for a bot based on its configuration
   */
  private getPatternForBot(bot: any) {
    const tradeFrequency = bot.metadata?.tradeFrequency || 'medium';
    
    switch (tradeFrequency) {
      case 'high':
        return this.tradingPatterns.scalping;
      case 'medium':
        return this.tradingPatterns.swing;
      case 'low':
        return this.tradingPatterns.momentum;
      default:
        return this.tradingPatterns.swing;
    }
  }

  /**
   * Get current price for a symbol (mock)
   */
  private getCurrentPrice(symbol: string): number {
    const basePrices: Record<string, number> = {
      'BTC-USD': 50000,
      'ETH-USD': 3000,
      'SOL-USD': 100,
      'AAPL': 180,
      'GOOGL': 140,
      'MSFT': 380,
      'TSLA': 250
    };

    const basePrice = basePrices[symbol] || 100;
    const volatility = 0.02; // 2% volatility
    return basePrice * (1 + (Math.random() - 0.5) * volatility);
  }

  /**
   * Helper: Delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate a burst of webhook activity
   */
  async generateWebhookBurst(botId: string, count: number = 10) {
    const bot = await this.prisma.bot.findUnique({ where: { id: botId } });
    if (!bot) return;

    console.log(`💥 Generating webhook burst for ${bot.name}: ${count} webhooks`);

    for (let i = 0; i < count; i++) {
      await this.sendWebhook(bot);
      await this.delay(Math.random() * 2000 + 500); // 0.5-2.5s between webhooks
    }
  }

  /**
   * Simulate a failed webhook scenario
   */
  async simulateFailedWebhook(botId: string) {
    const bot = await this.prisma.bot.findUnique({ where: { id: botId } });
    if (!bot) return;

    const webhookPayload = {
      action: 'BUY',
      symbol: 'INVALID-SYMBOL',
      quantity: -1, // Invalid quantity
      price: 0,
      orderId: crypto.randomBytes(8).toString('hex'),
      message: 'Simulated failure',
      timestamp: new Date().toISOString()
    };

    await this.prisma.webhookLog.create({
      data: {
        botId: bot.id,
        payload: webhookPayload,
        status: 'FAILED',
        errorMessage: 'Invalid symbol or quantity',
        metadata: {
          simulated: true,
          failureType: 'validation'
        }
      }
    });

    console.log(`❌ Failed webhook simulated for ${bot.name}`);
  }
}
