import { prisma } from '../../shared/database/prisma';
import { CreateBotDto, UpdateBotDto, BotResponse, BotListResponse } from './dto';
import { Prisma, BotStatus, Tier } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

export class BotsService {
  // Subscription limits
  private readonly BOT_LIMITS = {
    [Tier.FREE]: 1,
    [Tier.BASIC]: 5,
    [Tier.PRO]: 20,
    [Tier.ELITE]: 50,
  };

  /**
   * Create a new bot with indicators
   */
  async create(userId: string, createBotDto: CreateBotDto): Promise<BotResponse> {
    // Check user's bot limit
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: { bots: true }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const botLimit = this.BOT_LIMITS[user.subscriptionTier];
    if (user._count.bots >= botLimit) {
      throw new Error(`Bot limit reached. ${user.subscriptionTier} tier allows ${botLimit} bots.`);
    }

    // Generate webhook secret
    const webhookSecret = crypto.randomBytes(32).toString('hex');

    // Create bot with indicators
    const bot = await prisma.bot.create({
      data: {
        userId,
        name: createBotDto.name,
        description: createBotDto.description,
        symbol: createBotDto.symbol,
        assetType: createBotDto.assetType,
        exchange: createBotDto.exchange,
        timeframe: createBotDto.timeframe || '1h',
        signalMode: createBotDto.signalMode || 'ALL',
        tradingMode: createBotDto.tradingMode || 'PAPER',
        webhookSecret,
        positionSizing: createBotDto.positionSizing,
        riskManagement: createBotDto.riskManagement || {},
        status: BotStatus.STOPPED,
        // Create indicators if provided
        indicators: createBotDto.indicators ? {
          create: createBotDto.indicators.map(ind => ({
            indicator: ind.indicator,
            parameters: ind.parameters,
            weight: ind.weight || 1.0,
            enabled: ind.enabled !== false,
            buySignal: ind.buySignal || undefined,
            sellSignal: ind.sellSignal || undefined,
          }))
        } : undefined,
      },
      include: {
        indicators: true,
      }
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'bot_created',
        resourceType: 'bot',
        resourceId: bot.id,
        metadata: { botName: bot.name, exchange: bot.exchange }
      }
    });

    return new BotResponse(bot, this.getBaseUrl());
  }

  /**
   * Get all bots for a user
   */
  async findAll(
    userId: string,
    page = 1,
    limit = 10,
    status?: BotStatus
  ): Promise<BotListResponse> {
    const skip = (page - 1) * limit;
    
    const where: Prisma.BotWhereInput = {
      userId,
      ...(status && { status })
    };

    const [bots, total] = await Promise.all([
      prisma.bot.findMany({
        where,
        include: {
          indicators: true,
          performance: {
            orderBy: { date: 'desc' },
            take: 1
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.bot.count({ where })
    ]);

    // Add performance summaries to metadata
    const botsWithPerformance = bots.map(bot => {
      if (bot.performance.length > 0) {
        const latestPerf = bot.performance[0];
        return {
          ...bot,
          metadata: {
            ...bot.metadata,
            performance: {
              totalTrades: latestPerf.totalTrades,
              winRate: latestPerf.winningTrades / Math.max(latestPerf.totalTrades, 1) * 100,
              totalReturn: Number(latestPerf.totalReturn),
              isDemo: (bot.metadata as any)?.isDemo || false
            }
          }
        };
      }
      return bot;
    });

    const botResponses = botsWithPerformance.map(bot => 
      new BotResponse(bot, this.getBaseUrl())
    );

    return new BotListResponse(botResponses, total, page, limit);
  }

  /**
   * Get a single bot by ID
   */
  async findOne(id: string, userId: string): Promise<BotResponse> {
    const bot = await prisma.bot.findFirst({
      where: {
        id,
        userId
      },
      include: {
        indicators: true,
        performance: {
          orderBy: { date: 'desc' },
          take: 1
        }
      }
    });

    if (!bot) {
      throw new Error('Bot not found');
    }

    // Add performance summary
    if (bot.performance.length > 0) {
      const latestPerf = bot.performance[0];
      bot.metadata = {
        ...bot.metadata,
        performance: {
          totalTrades: latestPerf.totalTrades,
          winRate: latestPerf.winningTrades / Math.max(latestPerf.totalTrades, 1) * 100,
          totalReturn: Number(latestPerf.totalReturn),
          isDemo: (bot.metadata as any)?.isDemo || false
        }
      };
    }

    return new BotResponse(bot, this.getBaseUrl());
  }

  /**
   * Update a bot
   */
  async update(id: string, userId: string, updateBotDto: UpdateBotDto): Promise<BotResponse> {
    // Verify ownership
    const bot = await prisma.bot.findFirst({
      where: { id, userId }
    });

    if (!bot) {
      throw new Error('Bot not found');
    }

    // Handle indicator updates separately
    const { indicators, ...botData } = updateBotDto;

    // Update bot
    const updatedBot = await prisma.bot.update({
      where: { id },
      data: botData,
      include: {
        indicators: true
      }
    });

    // Update indicators if provided
    if (indicators) {
      // Delete existing indicators
      await prisma.botIndicator.deleteMany({
        where: { botId: id }
      });

      // Create new indicators
      if (indicators.length > 0) {
        await prisma.botIndicator.createMany({
          data: indicators.map(ind => ({
            botId: id,
            indicator: ind.indicator,
            parameters: ind.parameters,
            weight: ind.weight || 1.0,
            enabled: ind.enabled !== false,
            buySignal: ind.buySignal || undefined,
            sellSignal: ind.sellSignal || undefined,
          }))
        });
      }

      // Fetch updated bot with new indicators
      const botWithIndicators = await prisma.bot.findUnique({
        where: { id },
        include: { indicators: true }
      });

      return new BotResponse(botWithIndicators!, this.getBaseUrl());
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'bot_updated',
        resourceType: 'bot',
        resourceId: id,
        metadata: { changes: Object.keys(updateBotDto) }
      }
    });

    return new BotResponse(updatedBot, this.getBaseUrl());
  }

  /**
   * Delete a bot
   */
  async remove(id: string, userId: string): Promise<void> {
    const bot = await prisma.bot.findFirst({
      where: { id, userId }
    });

    if (!bot) {
      throw new Error('Bot not found');
    }

    // Stop bot if active
    if (bot.status === BotStatus.ACTIVE) {
      throw new Error('Cannot delete an active bot. Please stop it first.');
    }

    await prisma.bot.delete({
      where: { id }
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'bot_deleted',
        resourceType: 'bot',
        resourceId: id,
        metadata: { botName: bot.name }
      }
    });
  }

  /**
   * Start/stop a bot
   */
  async updateStatus(id: string, userId: string, status: BotStatus): Promise<BotResponse> {
    const bot = await prisma.bot.findFirst({
      where: { id, userId },
      include: { indicators: true }
    });

    if (!bot) {
      throw new Error('Bot not found');
    }

    // Validate bot configuration before starting
    if (status === BotStatus.ACTIVE) {
      // Check if bot has valid configuration
      if (!bot.symbol) {
        throw new Error('Bot must have a symbol configured');
      }

      // Check if live trading requires exchange credentials
      if (bot.tradingMode === 'LIVE') {
        const hasCredentials = await prisma.exchangeCredential.findFirst({
          where: {
            userId,
            exchange: bot.exchange
          }
        });

        if (!hasCredentials) {
          throw new Error(`Live trading requires ${bot.exchange} credentials`);
        }
      }
    }

    const updatedBot = await prisma.bot.update({
      where: { id },
      data: { status },
      include: { indicators: true }
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: `bot_${status.toLowerCase()}`,
        resourceType: 'bot',
        resourceId: id,
        metadata: { botName: bot.name, previousStatus: bot.status }
      }
    });

    return new BotResponse(updatedBot, this.getBaseUrl());
  }

  /**
   * Get bot by webhook secret (for webhook processing)
   */
  async findByWebhookSecret(webhookSecret: string) {
    return prisma.bot.findUnique({
      where: { webhookSecret },
      include: {
        indicators: true,
        user: {
          select: {
            id: true,
            subscriptionTier: true
          }
        }
      }
    });
  }

  /**
   * Clone a bot
   */
  async clone(id: string, userId: string, newName: string): Promise<BotResponse> {
    const originalBot = await prisma.bot.findFirst({
      where: { id, userId },
      include: { indicators: true }
    });

    if (!originalBot) {
      throw new Error('Bot not found');
    }

    // Check bot limit
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: { bots: true }
        }
      }
    });

    const botLimit = this.BOT_LIMITS[user!.subscriptionTier];
    if (user!._count.bots >= botLimit) {
      throw new Error(`Bot limit reached. ${user!.subscriptionTier} tier allows ${botLimit} bots.`);
    }

    // Create clone
    const webhookSecret = crypto.randomBytes(32).toString('hex');
    
    const clonedBot = await prisma.bot.create({
      data: {
        userId,
        name: newName,
        description: `Clone of ${originalBot.name}`,
        symbol: originalBot.symbol,
        assetType: originalBot.assetType,
        exchange: originalBot.exchange,
        timeframe: originalBot.timeframe,
        signalMode: originalBot.signalMode,
        tradingMode: 'PAPER', // Always start clones in paper mode
        webhookSecret,
        positionSizing: originalBot.positionSizing,
        riskManagement: originalBot.riskManagement,
        status: BotStatus.STOPPED,
        metadata: {
          ...originalBot.metadata,
          clonedFrom: originalBot.id,
          clonedAt: new Date()
        },
        // Clone indicators
        indicators: {
          create: originalBot.indicators.map(ind => ({
            indicator: ind.indicator,
            parameters: ind.parameters,
            weight: ind.weight,
            enabled: ind.enabled,
            buySignal: ind.buySignal,
            sellSignal: ind.sellSignal,
          }))
        }
      },
      include: {
        indicators: true
      }
    });

    return new BotResponse(clonedBot, this.getBaseUrl());
  }

  /**
   * Get base URL for webhook URLs
   */
  private getBaseUrl(): string {
    return process.env.API_BASE_URL || 'http://localhost:3001/api';
  }
}
