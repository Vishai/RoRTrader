import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

interface MockBotConfig {
  name: string;
  assetType: 'crypto' | 'stocks';
  exchange: 'coinbase_pro' | 'alpaca';
  tradingMode: 'paper' | 'live';
  performance: 'winning' | 'losing' | 'mixed';
  tradeFrequency: 'high' | 'medium' | 'low';
}

interface MockTradeData {
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  executedPrice: number;
  status: 'completed' | 'pending' | 'failed';
  timestamp: Date;
}

export class MockDataGenerator {
  private prisma: PrismaClient;

  // Realistic bot configurations
  private botTemplates: MockBotConfig[] = [
    {
      name: 'BTC Momentum Scanner',
      assetType: 'crypto',
      exchange: 'coinbase_pro',
      tradingMode: 'paper',
      performance: 'winning',
      tradeFrequency: 'high'
    },
    {
      name: 'ETH Grid Trading Bot',
      assetType: 'crypto',
      exchange: 'coinbase_pro',
      tradingMode: 'live',
      performance: 'mixed',
      tradeFrequency: 'medium'
    },
    {
      name: 'AAPL Swing Trader',
      assetType: 'stocks',
      exchange: 'alpaca',
      tradingMode: 'paper',
      performance: 'winning',
      tradeFrequency: 'low'
    },
    {
      name: 'Tech Stock Scalper',
      assetType: 'stocks',
      exchange: 'alpaca',
      tradingMode: 'live',
      performance: 'mixed',
      tradeFrequency: 'high'
    },
    {
      name: 'Crypto DCA Strategy',
      assetType: 'crypto',
      exchange: 'coinbase_pro',
      tradingMode: 'paper',
      performance: 'winning',
      tradeFrequency: 'low'
    }
  ];

  // Realistic crypto symbols
  private cryptoSymbols = ['BTC-USD', 'ETH-USD', 'SOL-USD', 'MATIC-USD', 'LINK-USD'];
  
  // Realistic stock symbols
  private stockSymbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'META'];

  // Current prices for consistent demo data
  private basePrices: Record<string, number> = {
    'BTC-USD': 50000,
    'ETH-USD': 3000,
    'SOL-USD': 100,
    'MATIC-USD': 1.5,
    'LINK-USD': 15,
    'AAPL': 180,
    'GOOGL': 140,
    'MSFT': 380,
    'AMZN': 170,
    'TSLA': 250,
    'NVDA': 550,
    'META': 350
  };

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Generate complete demo dataset for a user
   */
  async generateDemoData(userId: string) {
    console.log('🎯 Generating impressive demo data for user:', userId);

    // Create 5 bots with varying performance
    const bots = await this.createDemoBots(userId);

    // Generate trade history for each bot
    for (const bot of bots) {
      await this.generateTradeHistory(bot);
      await this.generateWebhookLogs(bot);
      await this.generatePerformanceMetrics(bot);
    }

    // Generate some real-time webhook activity
    await this.generateRecentWebhooks(bots[0]); // Use the most active bot

    console.log('✅ Demo data generation complete!');
    return {
      bots: bots.length,
      message: 'Demo data successfully generated'
    };
  }

  /**
   * Create demo bots with realistic configurations
   */
  private async createDemoBots(userId: string) {
    const bots = [];

    for (const template of this.botTemplates) {
      const webhookSecret = crypto.randomBytes(32).toString('hex');
      
      const bot = await this.prisma.bot.create({
        data: {
          userId,
          name: template.name,
          description: `Automated ${template.assetType} trading strategy`,
          assetType: template.assetType,
          exchange: template.exchange,
          tradingMode: template.tradingMode,
          webhookSecret,
          positionSizing: {
            type: template.tradeFrequency === 'high' ? 'percentage' : 'fixed',
            value: template.tradeFrequency === 'high' ? 2 : 1000
          },
          riskManagement: {
            stopLoss: template.performance === 'winning' ? 2 : 5,
            takeProfit: template.performance === 'winning' ? 5 : 3,
            maxDailyLoss: 500,
            maxOpenPositions: template.tradeFrequency === 'high' ? 10 : 3
          },
          status: Math.random() > 0.3 ? 'active' : 'paused',
          metadata: {
            isDemo: true,
            performance: template.performance,
            tradeFrequency: template.tradeFrequency
          }
        }
      });

      bots.push({
        ...bot,
        template
      });
    }

    return bots;
  }

  /**
   * Generate realistic trade history
   */
  private async generateTradeHistory(bot: any) {
    const { template } = bot;
    const symbols = template.assetType === 'crypto' ? this.cryptoSymbols : this.stockSymbols;
    
    // Determine number of trades based on frequency
    const tradeCount = {
      high: 50 + Math.floor(Math.random() * 50),
      medium: 20 + Math.floor(Math.random() * 20),
      low: 5 + Math.floor(Math.random() * 10)
    }[template.tradeFrequency];

    const trades: MockTradeData[] = [];
    const now = new Date();
    
    // Generate trades over the past 30 days
    for (let i = 0; i < tradeCount; i++) {
      const daysAgo = Math.random() * 30;
      const timestamp = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const basePrice = this.basePrices[symbol];
      
      // Add price volatility
      const priceVariation = 1 + (Math.random() - 0.5) * 0.1;
      const price = basePrice * priceVariation;
      
      // Determine if trade is winning based on bot performance
      const isWinning = this.shouldTradeWin(template.performance);
      const slippage = 1 + (Math.random() - 0.5) * 0.002; // 0.2% slippage
      
      const trade: MockTradeData = {
        symbol,
        side: Math.random() > 0.5 ? 'buy' : 'sell',
        quantity: template.assetType === 'crypto' 
          ? parseFloat((Math.random() * 0.5).toFixed(8))
          : Math.floor(Math.random() * 100) + 1,
        price,
        executedPrice: price * slippage,
        status: Math.random() > 0.95 ? 'failed' : 'completed',
        timestamp
      };

      trades.push(trade);
    }

    // Sort trades by timestamp
    trades.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Create trades in database
    for (const trade of trades) {
      await this.prisma.trade.create({
        data: {
          botId: bot.id,
          exchange: bot.exchange,
          symbol: trade.symbol,
          side: trade.side,
          orderType: Math.random() > 0.7 ? 'limit' : 'market',
          quantity: trade.quantity,
          price: trade.price,
          executedPrice: trade.executedPrice,
          status: trade.status,
          exchangeOrderId: crypto.randomBytes(16).toString('hex'),
          fees: trade.quantity * trade.executedPrice * 0.001, // 0.1% fees
          createdAt: trade.timestamp,
          executedAt: trade.status === 'completed' 
            ? new Date(trade.timestamp.getTime() + Math.random() * 5000)
            : undefined
        }
      });
    }
  }

  /**
   * Generate webhook logs for bot activity
   */
  private async generateWebhookLogs(bot: any) {
    const trades = await this.prisma.trade.findMany({
      where: { botId: bot.id },
      orderBy: { createdAt: 'asc' }
    });

    // Create webhook log for each trade
    for (const trade of trades) {
      await this.prisma.webhookLog.create({
        data: {
          botId: bot.id,
          payload: {
            action: trade.side,
            symbol: trade.symbol,
            quantity: trade.quantity,
            price: trade.price,
            orderId: crypto.randomBytes(8).toString('hex'),
            timestamp: trade.createdAt.toISOString()
          },
          status: trade.status === 'completed' ? 'completed' : 'failed',
          processedAt: trade.executedAt,
          createdAt: trade.createdAt
        }
      });
    }
  }

  /**
   * Calculate and store performance metrics
   */
  private async generatePerformanceMetrics(bot: any) {
    const trades = await this.prisma.trade.findMany({
      where: { 
        botId: bot.id,
        status: 'completed'
      },
      orderBy: { createdAt: 'asc' }
    });

    if (trades.length === 0) return;

    // Calculate daily performance
    const tradesByDay = new Map<string, typeof trades>();
    
    trades.forEach(trade => {
      const day = trade.createdAt.toISOString().split('T')[0];
      if (!tradesByDay.has(day)) {
        tradesByDay.set(day, []);
      }
      tradesByDay.get(day)!.push(trade);
    });

    // Generate performance metrics for each day
    let cumulativeReturn = 0;
    let peakValue = 10000; // Starting capital
    let currentValue = 10000;
    
    for (const [date, dayTrades] of tradesByDay) {
      const winningTrades = this.calculateWinningTrades(dayTrades, bot.template.performance);
      const dailyReturn = this.calculateDailyReturn(dayTrades, bot.template.performance);
      
      cumulativeReturn += dailyReturn;
      currentValue *= (1 + dailyReturn / 100);
      peakValue = Math.max(peakValue, currentValue);
      
      const drawdown = ((peakValue - currentValue) / peakValue) * 100;
      
      await this.prisma.botPerformance.create({
        data: {
          botId: bot.id,
          date: new Date(date),
          totalTrades: dayTrades.length,
          winningTrades,
          totalReturn: cumulativeReturn,
          sharpeRatio: this.calculateSharpeRatio(cumulativeReturn, trades.length),
          maxDrawdown: drawdown,
          profitFactor: winningTrades / Math.max(1, dayTrades.length - winningTrades),
          metricsSnapshot: {
            dailyReturn,
            cumulativeReturn,
            currentValue,
            peakValue,
            volatility: Math.random() * 20 + 10
          }
        }
      });
    }
  }

  /**
   * Generate recent webhook activity for live demo
   */
  private async generateRecentWebhooks(bot: any) {
    const symbols = bot.assetType === 'crypto' ? this.cryptoSymbols : this.stockSymbols;
    
    // Generate 5-10 recent webhooks in the last hour
    const recentCount = 5 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < recentCount; i++) {
      const minutesAgo = Math.random() * 60;
      const timestamp = new Date(Date.now() - minutesAgo * 60 * 1000);
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      
      await this.prisma.webhookLog.create({
        data: {
          botId: bot.id,
          payload: {
            action: Math.random() > 0.5 ? 'buy' : 'sell',
            symbol,
            quantity: bot.assetType === 'crypto' 
              ? parseFloat((Math.random() * 0.1).toFixed(8))
              : Math.floor(Math.random() * 50) + 1,
            price: this.basePrices[symbol] * (1 + (Math.random() - 0.5) * 0.02),
            orderId: crypto.randomBytes(8).toString('hex'),
            timestamp: timestamp.toISOString()
          },
          status: 'received',
          createdAt: timestamp
        }
      });
    }
  }

  /**
   * Helper: Determine if trade should be winning based on performance profile
   */
  private shouldTradeWin(performance: string): boolean {
    const winRates = {
      winning: 0.65,
      mixed: 0.50,
      losing: 0.35
    };
    return Math.random() < winRates[performance];
  }

  /**
   * Helper: Calculate winning trades
   */
  private calculateWinningTrades(trades: any[], performance: string): number {
    const winRate = {
      winning: 0.65,
      mixed: 0.50,
      losing: 0.35
    }[performance];
    
    return Math.floor(trades.length * winRate);
  }

  /**
   * Helper: Calculate daily return
   */
  private calculateDailyReturn(trades: any[], performance: string): number {
    const baseReturn = {
      winning: 2.5,
      mixed: 0.5,
      losing: -1.5
    }[performance];
    
    // Add some randomness
    return baseReturn + (Math.random() - 0.5) * 2;
  }

  /**
   * Helper: Calculate mock Sharpe ratio
   */
  private calculateSharpeRatio(totalReturn: number, tradeCount: number): number {
    // Simplified Sharpe ratio calculation for demo
    const riskFreeRate = 0.02;
    const volatility = 15 + Math.random() * 10;
    return ((totalReturn / 100) - riskFreeRate) / (volatility / 100);
  }

  /**
   * Clean up demo data for a user
   */
  async cleanupDemoData(userId: string) {
    // Delete all demo bots and related data
    await this.prisma.bot.deleteMany({
      where: {
        userId,
        metadata: {
          path: '$.isDemo',
          equals: true
        }
      }
    });
  }
}
