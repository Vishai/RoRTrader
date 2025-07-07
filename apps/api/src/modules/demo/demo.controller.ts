import { Request, Response } from 'express';
import { demoService } from './demoService';
import { prisma } from '@/shared/database/prisma';

export class DemoController {
  /**
   * Get demo mode status and configuration
   */
  async getStatus(req: Request, res: Response) {
    try {
      const stats = await demoService.getDemoStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Demo status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get demo status'
      });
    }
  }

  /**
   * Initialize demo environment for authenticated user
   */
  async initialize(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      // Check if user already has demo data
      const existingBots = await prisma.bot.count({
        where: {
          userId,
          metadata: {
            path: ['isDemo'],
            equals: true
          }
        }
      });

      if (existingBots > 0) {
        return res.status(400).json({
          success: false,
          error: 'Demo data already exists. Please cleanup first.'
        });
      }

      const result = await demoService.initializeDemoUser(userId);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Demo initialization error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to initialize demo environment'
      });
    }
  }

  /**
   * Generate a specific demo scenario
   */
  async generateScenario(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { scenario } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      if (!['winning', 'volatile', 'steady'].includes(scenario)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid scenario. Choose: winning, volatile, or steady'
        });
      }

      const result = await demoService.generateDemoScenario(userId, scenario);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Demo scenario error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate demo scenario'
      });
    }
  }

  /**
   * Clean up demo data for authenticated user
   */
  async cleanup(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const result = await demoService.cleanupDemoUser(userId);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Demo cleanup error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cleanup demo data'
      });
    }
  }

  /**
   * Update demo configuration
   */
  async updateConfig(req: Request, res: Response) {
    try {
      // This should be admin-only in production
      const { config } = req.body;
      
      if (!config || typeof config !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'Invalid configuration'
        });
      }

      demoService.updateConfig(config);
      
      res.json({
        success: true,
        data: {
          message: 'Demo configuration updated',
          config: demoService.getConfig()
        }
      });
    } catch (error) {
      console.error('Demo config update error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update demo configuration'
      });
    }
  }

  /**
   * Trigger webhook simulation for a specific bot
   */
  async simulateWebhook(req: Request, res: Response) {
    try {
      const { botId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      // Verify bot ownership
      const bot = await prisma.bot.findFirst({
        where: {
          id: botId,
          userId
        }
      });

      if (!bot) {
        return res.status(404).json({
          success: false,
          error: 'Bot not found'
        });
      }

      // Import webhook simulator directly to avoid circular dependency
      const { WebhookSimulator } = await import('./webhookSimulator');
      const simulator = new WebhookSimulator();
      
      await simulator.simulateRandomWebhook(userId);
      
      res.json({
        success: true,
        data: {
          message: 'Webhook simulation triggered',
          botId
        }
      });
    } catch (error) {
      console.error('Webhook simulation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to simulate webhook'
      });
    }
  }

  /**
   * Get demo presentation data
   */
  async getPresentationData(req: Request, res: Response) {
    try {
      // For demo purposes, we'll return mock data without requiring auth
      const userId = req.user?.id || 'demo-user';

      // Get aggregate stats for impressive presentation
      const [bots, trades, performance] = await Promise.all([
        prisma.bot.findMany({
          where: {
            metadata: {
              path: ['isDemo'],
              equals: true
            }
          },
          include: {
            _count: {
              select: {
                trades: true,
                webhookLogs: true
              }
            }
          },
          take: 6 // Limit to 6 bots for demo
        }),
        prisma.trade.aggregate({
          where: {
            bot: {
              metadata: {
                path: ['isDemo'],
                equals: true
              }
            }
          },
          _sum: {
            fees: true
          },
          _count: {
            _all: true
          }
        }),
        prisma.botPerformance.findMany({
          where: {
            bot: {
              metadata: {
                path: ['isDemo'],
                equals: true
              }
            }
          },
          orderBy: {
            date: 'desc'
          },
          take: 30
        })
      ]);

      // If no demo data exists, return mock data
      if (bots.length === 0) {
        return res.json({
          success: true,
          data: {
            overview: {
              totalBots: 5,
              activeBots: 4,
              totalTrades: 1234,
              totalWebhooks: 5678,
              totalReturn: '+42.5%',
              avgSharpeRatio: '2.1',
              totalFees: 123.45
            },
            bots: [
              {
                id: '1',
                name: 'BTC Momentum Scanner',
                status: 'active',
                assetType: 'CRYPTO',
                exchange: 'COINBASE_PRO',
                tradingMode: 'paper',
                tradeCount: 342,
                webhookCount: 1234
              },
              {
                id: '2',
                name: 'ETH Grid Trading Bot',
                status: 'active',
                assetType: 'CRYPTO',
                exchange: 'COINBASE_PRO',
                tradingMode: 'live',
                tradeCount: 256,
                webhookCount: 890
              },
              {
                id: '3',
                name: 'AAPL Swing Trader',
                status: 'active',
                assetType: 'STOCKS',
                exchange: 'ALPACA',
                tradingMode: 'paper',
                tradeCount: 89,
                webhookCount: 234
              },
              {
                id: '4',
                name: 'Tech Stock Scalper',
                status: 'paused',
                assetType: 'STOCKS',
                exchange: 'ALPACA',
                tradingMode: 'live',
                tradeCount: 456,
                webhookCount: 1567
              },
              {
                id: '5',
                name: 'Crypto DCA Strategy',
                status: 'active',
                assetType: 'CRYPTO',
                exchange: 'COINBASE_PRO',
                tradingMode: 'paper',
                tradeCount: 91,
                webhookCount: 753
              }
            ],
            recentPerformance: [
              { date: new Date('2025-01-20'), return: 2.5, sharpeRatio: 2.1 },
              { date: new Date('2025-01-19'), return: -0.8, sharpeRatio: 1.9 },
              { date: new Date('2025-01-18'), return: 3.2, sharpeRatio: 2.3 },
              { date: new Date('2025-01-17'), return: 1.5, sharpeRatio: 2.0 },
              { date: new Date('2025-01-16'), return: -1.2, sharpeRatio: 1.8 },
              { date: new Date('2025-01-15'), return: 4.1, sharpeRatio: 2.5 },
              { date: new Date('2025-01-14'), return: 0.9, sharpeRatio: 2.1 }
            ]
          }
        });
      }

      // Calculate impressive stats
      const totalReturn = performance.reduce((sum, p) => 
        sum + (p.metricsSnapshot as any)?.dailyReturn || 0, 0
      );

      const avgSharpeRatio = performance.reduce((sum, p) => 
        sum + (p.sharpeRatio || 0), 0
      ) / Math.max(1, performance.length);

      res.json({
        success: true,
        data: {
          overview: {
            totalBots: bots.length,
            activeBots: bots.filter(b => b.status === 'active').length,
            totalTrades: trades._count._all,
            totalWebhooks: bots.reduce((sum, b) => sum + b._count.webhookLogs, 0),
            totalReturn: `${totalReturn.toFixed(2)}%`,
            avgSharpeRatio: avgSharpeRatio.toFixed(2),
            totalFees: trades._sum.fees || 0
          },
          bots: bots.map(bot => ({
            id: bot.id,
            name: bot.name,
            status: bot.status,
            assetType: bot.assetType,
            exchange: bot.exchange,
            tradingMode: bot.tradingMode,
            tradeCount: bot._count.trades,
            webhookCount: bot._count.webhookLogs
          })),
          recentPerformance: performance.slice(0, 7).map(p => ({
            date: p.date,
            return: (p.metricsSnapshot as any)?.dailyReturn || 0,
            sharpeRatio: p.sharpeRatio
          }))
        }
      });
    } catch (error) {
      console.error('Presentation data error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get presentation data'
      });
    }
  }
}
