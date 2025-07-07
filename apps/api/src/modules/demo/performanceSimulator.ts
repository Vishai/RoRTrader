import { prisma } from '@/shared/database/prisma';

interface PerformancePattern {
  returnProfile: number[];
  volatility: number;
  sharpeRatio: number;
  winRate: number;
  maxDrawdown: number;
}

export class PerformanceSimulator {
  private prisma = prisma;

  // Predefined performance patterns for demos
  private patterns: Record<string, PerformancePattern> = {
    winning: {
      returnProfile: [2, 3, -0.5, 4, 1.5, -1, 5, 2.5, 3.5, 4],
      volatility: 12,
      sharpeRatio: 2.1,
      winRate: 0.68,
      maxDrawdown: 8
    },
    steady: {
      returnProfile: [1, 1.2, 0.8, 1.5, 1, 1.3, 0.9, 1.4, 1.1, 1.6],
      volatility: 8,
      sharpeRatio: 1.8,
      winRate: 0.62,
      maxDrawdown: 5
    },
    volatile: {
      returnProfile: [5, -3, 8, -4, 6, -2, 7, -5, 9, -1],
      volatility: 25,
      sharpeRatio: 1.2,
      winRate: 0.55,
      maxDrawdown: 15
    },
    breakout: {
      returnProfile: [0.5, 0.8, 1, 1.5, 3, 5, 8, 6, 7, 10],
      volatility: 18,
      sharpeRatio: 2.5,
      winRate: 0.72,
      maxDrawdown: 6
    }
  };

  constructor() {
    // Use shared prisma instance
  }

  /**
   * Generate initial performance boost for demo
   */
  async generateInitialBoost(userId: string) {
    const bots = await this.prisma.bot.findMany({
      where: {
        userId,
        metadata: {
          path: '$.isDemo',
          equals: true
        }
      }
    });

    for (const bot of bots) {
      // Add some initial positive performance
      const pattern = this.getPatternForBot(bot);
      await this.applyPerformancePattern(bot.id, pattern, 1);
    }
  }

  /**
   * Generate a winning streak scenario
   */
  async generateWinningStreak(userId: string) {
    const bots = await this.getActiveDemoBots(userId);
    
    for (const bot of bots) {
      await this.applyPerformancePattern(bot.id, this.patterns.winning, 5);
      
      // Add some impressive recent trades
      await this.generateImpressiveTrades(bot.id, 10, 0.8);
    }
  }

  /**
   * Generate steady growth scenario
   */
  async generateSteadyGrowth(userId: string) {
    const bots = await this.getActiveDemoBots(userId);
    
    for (const bot of bots) {
      await this.applyPerformancePattern(bot.id, this.patterns.steady, 10);
      
      // Add consistent winning trades
      await this.generateImpressiveTrades(bot.id, 20, 0.65);
    }
  }

  /**
   * Generate volatile performance scenario
   */
  async generateVolatilePerformance(userId: string) {
    const bots = await this.getActiveDemoBots(userId);
    
    for (const bot of bots) {
      await this.applyPerformancePattern(bot.id, this.patterns.volatile, 7);
      
      // Mix of big wins and losses
      await this.generateVolatileTrades(bot.id, 15);
    }
  }

  /**
   * Apply a performance pattern to a bot
   */
  private async applyPerformancePattern(
    botId: string, 
    pattern: PerformancePattern, 
    days: number
  ) {
    const now = new Date();
    let cumulativeReturn = 0;
    let peakValue = 10000;
    let currentValue = 10000;

    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (days - i - 1));
      
      // Get daily return from pattern
      const dailyReturn = pattern.returnProfile[i % pattern.returnProfile.length];
      const adjustedReturn = dailyReturn + (Math.random() - 0.5) * 2;
      
      cumulativeReturn += adjustedReturn;
      currentValue *= (1 + adjustedReturn / 100);
      peakValue = Math.max(peakValue, currentValue);
      
      const drawdown = ((peakValue - currentValue) / peakValue) * 100;
      
      // Create or update performance record
      await this.prisma.botPerformance.upsert({
        where: {
          botId_date: {
            botId,
            date
          }
        },
        create: {
          botId,
          date,
          totalTrades: Math.floor(Math.random() * 20) + 5,
          winningTrades: Math.floor((Math.random() * 20 + 5) * pattern.winRate),
          totalReturn: cumulativeReturn,
          sharpeRatio: pattern.sharpeRatio + (Math.random() - 0.5) * 0.5,
          sortinoRatio: pattern.sharpeRatio * 1.2,
          maxDrawdown: Math.min(drawdown, pattern.maxDrawdown),
          profitFactor: 1.5 + Math.random(),
          metricsSnapshot: {
            dailyReturn: adjustedReturn,
            cumulativeReturn,
            currentValue,
            peakValue,
            volatility: pattern.volatility + (Math.random() - 0.5) * 5,
            winRate: pattern.winRate,
            avgWin: 2.5 + Math.random(),
            avgLoss: -1.2 - Math.random() * 0.5,
            expectancy: 0.5 + Math.random() * 0.3
          }
        },
        update: {
          totalReturn: cumulativeReturn,
          metricsSnapshot: {
            dailyReturn: adjustedReturn,
            cumulativeReturn,
            currentValue,
            peakValue,
            volatility: pattern.volatility + (Math.random() - 0.5) * 5
          }
        }
      });
    }
  }

  /**
   * Generate impressive winning trades
   */
  private async generateImpressiveTrades(botId: string, count: number, winRate: number) {
    const bot = await this.prisma.bot.findUnique({ where: { id: botId } });
    if (!bot) return;

    const symbols = bot.assetType === 'CRYPTO' 
      ? ['BTC-USD', 'ETH-USD', 'SOL-USD']
      : ['AAPL', 'NVDA', 'TSLA'];

    for (let i = 0; i < count; i++) {
      const isWin = Math.random() < winRate;
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const side = Math.random() > 0.5 ? 'BUY' : 'SELL';
      
      // Calculate prices to show profit/loss
      const entryPrice = 100;
      const exitPrice = isWin 
        ? entryPrice * (1 + (Math.random() * 0.05 + 0.02)) // 2-7% win
        : entryPrice * (1 - (Math.random() * 0.02 + 0.01)); // 1-3% loss

      const quantity = bot.assetType === 'CRYPTO' 
        ? parseFloat((Math.random() * 0.1).toFixed(8))
        : Math.floor(Math.random() * 100) + 10;

      await this.prisma.trade.create({
        data: {
          botId,
          exchange: bot.exchange,
          symbol,
          side,
          orderType: 'limit',
          quantity,
          price: side === 'BUY' ? entryPrice : exitPrice,
          executedPrice: side === 'BUY' ? entryPrice : exitPrice,
          status: 'COMPLETED',
          exchangeOrderId: `demo-${Date.now()}-${i}`,
          fees: quantity * entryPrice * 0.001,
          metadata: {
            isDemo: true,
            isWin,
            pnl: isWin ? (exitPrice - entryPrice) * quantity : (entryPrice - exitPrice) * quantity
          },
          createdAt: new Date(Date.now() - Math.random() * 86400000), // Random time in last 24h
          executedAt: new Date(Date.now() - Math.random() * 86400000)
        }
      });
    }
  }

  /**
   * Generate volatile trades with big wins and losses
   */
  private async generateVolatileTrades(botId: string, count: number) {
    const bot = await this.prisma.bot.findUnique({ where: { id: botId } });
    if (!bot) return;

    for (let i = 0; i < count; i++) {
      const isBigMove = Math.random() < 0.3; // 30% chance of big move
      const isWin = Math.random() < 0.5;
      
      const moveSize = isBigMove 
        ? (0.1 + Math.random() * 0.15) // 10-25% move
        : (0.02 + Math.random() * 0.03); // 2-5% move

      await this.generateImpressiveTrades(botId, 1, isWin ? 1 : 0);
    }
  }

  /**
   * Get active demo bots for a user
   */
  private async getActiveDemoBots(userId: string) {
    return this.prisma.bot.findMany({
      where: {
        userId,
        status: 'active',
        metadata: {
          path: '$.isDemo',
          equals: true
        }
      }
    });
  }

  /**
   * Get pattern based on bot configuration
   */
  private getPatternForBot(bot: any): PerformancePattern {
    const performance = bot.metadata?.performance || 'mixed';
    
    switch (performance) {
      case 'winning':
        return this.patterns.winning;
      case 'mixed':
        return Math.random() > 0.5 ? this.patterns.steady : this.patterns.volatile;
      case 'losing':
        return {
          ...this.patterns.volatile,
          returnProfile: this.patterns.volatile.returnProfile.map(r => r * -0.5),
          winRate: 0.35
        };
      default:
        return this.patterns.steady;
    }
  }

  /**
   * Generate real-time performance update
   */
  async generateRealtimeUpdate(botId: string) {
    const lastPerformance = await this.prisma.botPerformance.findFirst({
      where: { botId },
      orderBy: { date: 'desc' }
    });

    if (!lastPerformance) return;

    // Generate a small intraday move
    const intradayReturn = (Math.random() - 0.5) * 2;
    const updatedMetrics = {
      ...lastPerformance.metricsSnapshot,
      intradayReturn,
      lastUpdate: new Date().toISOString()
    };

    await this.prisma.botPerformance.update({
      where: { id: lastPerformance.id },
      data: {
        metricsSnapshot: updatedMetrics
      }
    });

    return updatedMetrics;
  }
}
