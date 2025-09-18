import { Injectable } from '@/shared/decorators/injectable.decorator';
import { prisma } from '@/shared/database/prisma';
import { logger } from '@/shared/utils/logger';
import { Prisma } from '@prisma/client';

export interface CreateStrategyDto {
  botId: string;
  name: string;
  description?: string;
  templateId?: string;
  indicators: {
    type: string;
    params: Record<string, any>;
    color?: string;
  }[];
  entryConditions: {
    indicatorId?: string;
    operator: string;
    compareToType: string;
    compareToValue: any;
    logicalOperator?: string;
  }[];
  exitConditions?: {
    indicatorId?: string;
    operator: string;
    compareToType: string;
    compareToValue: any;
    logicalOperator?: string;
  }[];
}

export interface UpdateStrategyDto {
  name?: string;
  description?: string;
  isActive?: boolean;
  indicators?: CreateStrategyDto['indicators'];
  entryConditions?: CreateStrategyDto['entryConditions'];
  exitConditions?: CreateStrategyDto['exitConditions'];
}

@Injectable()
export class StrategyService {
  /**
   * Create a new strategy for a bot
   */
  async createStrategy(userId: string, data: CreateStrategyDto) {
    try {
      // Verify bot ownership
      const bot = await prisma.bot.findFirst({
        where: {
          id: data.botId,
          userId
        }
      });
      
      if (!bot) {
        throw new Error('Bot not found or unauthorized');
      }
      
      // Check if bot already has a strategy
      const existingStrategy = await prisma.botStrategy.findUnique({
        where: { botId: data.botId }
      });
      
      if (existingStrategy) {
        throw new Error('Bot already has a strategy. Update or delete existing strategy first.');
      }
      
      // Create strategy with indicators and conditions
      const strategy = await prisma.botStrategy.create({
        data: {
          botId: data.botId,
          name: data.name,
          description: data.description,
          templateId: data.templateId,
          indicators: {
            create: data.indicators.map((ind, index) => ({
              indicatorType: ind.type as any,
              params: ind.params,
              color: ind.color,
              displayOrder: index
            }))
          }
        },
        include: {
          indicators: true
        }
      });
      
      // Create conditions with proper indicator references
      const indicatorMap = new Map(
        strategy.indicators.map((ind, index) => [index, ind.id])
      );
      
      // Create entry conditions
      if (data.entryConditions.length > 0) {
        await prisma.strategyCondition.createMany({
          data: data.entryConditions.map((cond, index) => ({
            strategyId: strategy.id,
            exitStrategyId: null,
            type: 'ENTRY',
            indicatorId: cond.indicatorId ? indicatorMap.get(parseInt(cond.indicatorId)) : null,
            operator: cond.operator as any,
            compareToType: cond.compareToType as any,
            compareToValue: cond.compareToValue,
            logicalOperator: cond.logicalOperator as any,
            orderIndex: index
          }))
        });
      }
      
      // Create exit conditions
      if (data.exitConditions && data.exitConditions.length > 0) {
        await prisma.strategyCondition.createMany({
          data: data.exitConditions.map((cond, index) => ({
            strategyId: strategy.id,
            exitStrategyId: strategy.id,
            type: 'EXIT',
            indicatorId: cond.indicatorId ? indicatorMap.get(parseInt(cond.indicatorId)) : null,
            operator: cond.operator as any,
            compareToType: cond.compareToType as any,
            compareToValue: cond.compareToValue,
            logicalOperator: cond.logicalOperator as any,
            orderIndex: index
          }))
        });
      }
      
      // Return complete strategy
      return this.getStrategyById(strategy.id);
      
    } catch (error) {
      logger.error('Error creating strategy:', error);
      throw error;
    }
  }

  /**
   * Get strategy by ID
   */
  async getStrategyById(strategyId: string) {
    return prisma.botStrategy.findUnique({
      where: { id: strategyId },
      include: {
        bot: true,
        template: true,
        indicators: {
          orderBy: { displayOrder: 'asc' }
        },
        entryConditions: {
          where: { type: 'ENTRY' },
          orderBy: { orderIndex: 'asc' },
          include: { indicator: true }
        },
        exitConditions: {
          where: { type: 'EXIT' },
          orderBy: { orderIndex: 'asc' },
          include: { indicator: true }
        },
        backtests: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });
  }

  /**
   * Get strategy by bot ID
   */
  async getStrategyByBotId(botId: string, userId: string) {
    const bot = await prisma.bot.findFirst({
      where: { id: botId, userId }
    });
    
    if (!bot) {
      throw new Error('Bot not found or unauthorized');
    }
    
    return prisma.botStrategy.findUnique({
      where: { botId },
      include: {
        indicators: {
          orderBy: { displayOrder: 'asc' }
        },
        entryConditions: {
          where: { type: 'ENTRY' },
          orderBy: { orderIndex: 'asc' },
          include: { indicator: true }
        },
        exitConditions: {
          where: { type: 'EXIT' },
          orderBy: { orderIndex: 'asc' },
          include: { indicator: true }
        },
        backtests: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });
  }

  /**
   * Update strategy
   */
  async updateStrategy(strategyId: string, userId: string, data: UpdateStrategyDto) {
    // Verify ownership through bot
    const strategy = await prisma.botStrategy.findFirst({
      where: {
        id: strategyId,
        bot: { userId }
      }
    });
    
    if (!strategy) {
      throw new Error('Strategy not found or unauthorized');
    }
    
    // Start transaction for complex update
    return prisma.$transaction(async (tx) => {
      // Update basic strategy info
      const updated = await tx.botStrategy.update({
        where: { id: strategyId },
        data: {
          name: data.name,
          description: data.description,
          isActive: data.isActive,
          version: { increment: 1 },
          updatedAt: new Date()
        }
      });
      
      // Update indicators if provided
      if (data.indicators) {
        // Delete existing indicators
        await tx.strategyIndicator.deleteMany({
          where: { strategyId }
        });
        
        // Create new indicators
        await tx.strategyIndicator.createMany({
          data: data.indicators.map((ind, index) => ({
            strategyId,
            indicatorType: ind.type as any,
            params: ind.params,
            color: ind.color,
            displayOrder: index
          }))
        });
      }
      
      // Update conditions if provided
      if (data.entryConditions || data.exitConditions) {
        // Delete existing conditions
        await tx.strategyCondition.deleteMany({
          where: { strategyId }
        });
        
        // Get new indicator IDs
        const newIndicators = await tx.strategyIndicator.findMany({
          where: { strategyId },
          orderBy: { displayOrder: 'asc' }
        });
        
        const indicatorMap = new Map(
          newIndicators.map((ind, index) => [index, ind.id])
        );
        
        // Create entry conditions
        if (data.entryConditions) {
          await tx.strategyCondition.createMany({
            data: data.entryConditions.map((cond, index) => ({
              strategyId,
              exitStrategyId: null,
              type: 'ENTRY' as const,
              indicatorId: cond.indicatorId ? indicatorMap.get(parseInt(cond.indicatorId)) : null,
              operator: cond.operator as any,
              compareToType: cond.compareToType as any,
              compareToValue: cond.compareToValue,
              logicalOperator: cond.logicalOperator as any,
              orderIndex: index
            }))
          });
        }
        
        // Create exit conditions
        if (data.exitConditions) {
          await tx.strategyCondition.createMany({
            data: data.exitConditions.map((cond, index) => ({
              strategyId,
              exitStrategyId: strategyId,
              type: 'EXIT' as const,
              indicatorId: cond.indicatorId ? indicatorMap.get(parseInt(cond.indicatorId)) : null,
              operator: cond.operator as any,
              compareToType: cond.compareToType as any,
              compareToValue: cond.compareToValue,
              logicalOperator: cond.logicalOperator as any,
              orderIndex: index
            }))
          });
        }
      }
      
      return updated;
    });
  }

  /**
   * Delete strategy
   */
  async deleteStrategy(strategyId: string, userId: string) {
    // Verify ownership
    const strategy = await prisma.botStrategy.findFirst({
      where: {
        id: strategyId,
        bot: { userId }
      }
    });
    
    if (!strategy) {
      throw new Error('Strategy not found or unauthorized');
    }
    
    await prisma.botStrategy.delete({
      where: { id: strategyId }
    });
    
    return { success: true };
  }

  /**
   * Get available strategy templates
   */
  async getTemplates(filters?: {
    category?: string;
    difficulty?: string;
    assetType?: string;
  }) {
    const where: Prisma.StrategyTemplateWhereInput = {
      isPublic: true
    };
    
    if (filters?.category) {
      where.category = filters.category as any;
    }
    
    if (filters?.difficulty) {
      where.difficulty = filters.difficulty as any;
    }
    
    if (filters?.assetType) {
      where.assetTypes = {
        has: filters.assetType as any
      };
    }
    
    return prisma.strategyTemplate.findMany({
      where,
      orderBy: [
        { usageCount: 'desc' },
        { rating: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }

  /**
   * Get template by ID
   */
  async getTemplateById(templateId: string) {
    const template = await prisma.strategyTemplate.findUnique({
      where: { id: templateId }
    });
    
    if (!template) {
      throw new Error('Template not found');
    }
    
    // Increment usage count
    await prisma.strategyTemplate.update({
      where: { id: templateId },
      data: { usageCount: { increment: 1 } }
    });
    
    return template;
  }

  /**
   * Create strategy from template
   */
  async createFromTemplate(userId: string, botId: string, templateId: string) {
    const template = await this.getTemplateById(templateId);
    
    if (!template) {
      throw new Error('Template not found');
    }
    
    const config = template.configuration as any;
    
    return this.createStrategy(userId, {
      botId,
      name: template.displayName,
      description: template.description,
      templateId,
      indicators: config.indicators || [],
      entryConditions: config.entryConditions || [],
      exitConditions: config.exitConditions || []
    });
  }
}
