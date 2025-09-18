import { CoachSessionState, CoachSnapshotSource, CoachTagSeverity, Prisma } from '@prisma/client';
import { Injectable } from '@/shared/decorators/injectable.decorator';
import { prisma } from '@/shared/database/prisma';
import { logger } from '@/shared/utils/logger';
import { CoachQueueService } from './coach.queue';

export interface CoachTagInput {
  tagKey: string;
  name: string;
  category?: string | null;
  description?: string | null;
  severity?: CoachTagSeverity;
  rule: Prisma.InputJsonValue;
}

export interface CreateRuleSetDto {
  name: string;
  summary?: string | null;
  botId?: string;
  strategyId?: string;
  version?: number;
  config: Prisma.InputJsonValue;
  thresholds?: Prisma.InputJsonValue;
  tags: CoachTagInput[];
}

export interface UpdateRuleSetDto {
  name?: string;
  summary?: string | null;
  config?: Prisma.InputJsonValue;
  thresholds?: Prisma.InputJsonValue;
  status?: Prisma.CoachRuleSetUpdateInput['status'];
  tags?: CoachTagInput[];
}

export interface StartSessionDto {
  ruleSetId: string;
  botId?: string;
  symbol: string;
  timeframeMinutes: number;
  startedAt?: Date;
}

export interface IngestAlertDto {
  sessionId: string;
  payload: Prisma.InputJsonValue;
  features?: Prisma.InputJsonValue;
  capturedAt?: Date;
}

@Injectable()
export class CoachService {
  constructor(private readonly queueService: CoachQueueService) {}

  async createRuleSet(userId: string, dto: CreateRuleSetDto) {
    await this.ensureBotAccess(userId, dto.botId);
    await this.ensureStrategyAccess(userId, dto.strategyId);

    const calculatedVersion = await this.resolveRuleSetVersion(userId, dto.name, dto.version);

    const createData: Prisma.CoachRuleSetCreateInput = {
      name: dto.name,
      summary: dto.summary,
      owner: { connect: { id: userId } },
      bot: dto.botId ? { connect: { id: dto.botId } } : undefined,
      strategy: dto.strategyId ? { connect: { id: dto.strategyId } } : undefined,
      version: calculatedVersion,
      config: dto.config,
      thresholds: dto.thresholds,
      tags: {
        create: dto.tags.map((tag) => ({
          tagKey: tag.tagKey,
          name: tag.name,
          category: tag.category ?? null,
          description: tag.description ?? null,
          severity: tag.severity ?? CoachTagSeverity.INFO,
          rule: tag.rule,
        })),
      },
    };

    const ruleSet = await prisma.coachRuleSet.create({
      data: createData,
      include: {
        tags: true,
      },
    });

    logger.info('Created coach rule set', { ruleSetId: ruleSet.id, userId });
    return ruleSet;
  }

  async updateRuleSet(userId: string, ruleSetId: string, dto: UpdateRuleSetDto) {
    const existing = await prisma.coachRuleSet.findFirst({
      where: { id: ruleSetId, ownerUserId: userId },
    });

    if (!existing) {
      throw new Error('Coach rule set not found or unauthorized');
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.coachRuleSet.update({
        where: { id: ruleSetId },
        data: {
          name: dto.name ?? undefined,
          summary: dto.summary ?? undefined,
          config: dto.config ?? undefined,
          thresholds: dto.thresholds ?? undefined,
          status: dto.status ?? undefined,
        },
      });

      if (dto.tags) {
        await tx.coachTagDefinition.deleteMany({ where: { ruleSetId } });
        await tx.coachTagDefinition.createMany({
          data: dto.tags.map((tag) => ({
            ruleSetId,
            tagKey: tag.tagKey,
            name: tag.name,
            category: tag.category ?? null,
            description: tag.description ?? null,
            severity: tag.severity ?? CoachTagSeverity.INFO,
            rule: tag.rule,
          })),
        });
      }

      return tx.coachRuleSet.findUnique({
        where: { id: updated.id },
        include: { tags: true },
      });
    });
  }

  async getRuleSetById(userId: string, ruleSetId: string) {
    return prisma.coachRuleSet.findFirst({
      where: {
        id: ruleSetId,
        ownerUserId: userId,
      },
      include: {
        tags: true,
      },
    });
  }

  async startSession(userId: string, dto: StartSessionDto) {
    const ruleSet = await prisma.coachRuleSet.findFirst({
      where: { id: dto.ruleSetId },
      include: { bot: true },
    });

    if (!ruleSet || ruleSet.ownerUserId !== userId) {
      throw new Error('Rule set not found or unauthorized');
    }

    if (dto.botId && ruleSet.botId && dto.botId !== ruleSet.botId) {
      throw new Error('Session bot mismatch with rule set');
    }

    await this.ensureBotAccess(userId, dto.botId ?? ruleSet.botId ?? undefined);

    const session = await prisma.coachSession.create({
      data: {
        user: { connect: { id: userId } },
        bot: dto.botId ? { connect: { id: dto.botId } } : ruleSet.botId ? { connect: { id: ruleSet.botId } } : undefined,
        ruleSet: { connect: { id: dto.ruleSetId } },
        symbol: dto.symbol,
        timeframeMinutes: dto.timeframeMinutes,
        startedAt: dto.startedAt ?? new Date(),
        state: CoachSessionState.SCANNING,
      },
      include: {
        ruleSet: {
          include: { tags: true },
        },
      },
    });

    await this.queueService.scheduleHeartbeat(session.id);

    return session;
  }

  async getSession(userId: string, sessionId: string) {
    return prisma.coachSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        ruleSet: {
          include: { tags: true },
        },
        snapshots: {
          orderBy: { capturedAt: 'desc' },
          take: 5,
        },
      },
    });
  }

  async ingestAlert(userId: string, dto: IngestAlertDto) {
    const session = await prisma.coachSession.findFirst({
      where: {
        id: dto.sessionId,
        userId,
      },
      include: {
        ruleSet: true,
      },
    });

    if (!session) {
      throw new Error('Coach session not found or unauthorized');
    }

    const snapshot = await prisma.coachSnapshot.create({
      data: {
        sessionId: session.id,
        source: CoachSnapshotSource.ALERT,
        capturedAt: dto.capturedAt ?? new Date(),
        payload: dto.payload,
        features: dto.features,
      },
    });

    await this.queueService.enqueueEvaluationJob({
      sessionId: session.id,
      snapshotId: snapshot.id,
      trigger: 'alert',
    });

    return snapshot;
  }

  async listEvaluations(userId: string, sessionId: string, limit = 50, after?: string) {
    const session = await prisma.coachSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new Error('Coach session not found or unauthorized');
    }

    const afterTimestamp = after ? await this.fetchEvaluationTimestamp(after) : undefined;

    const evaluations = await prisma.coachEvaluation.findMany({
      where: {
        sessionId,
        ...(after && afterTimestamp
          ? {
              createdAt: {
                lt: afterTimestamp,
              },
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        tag: true,
        advice: true,
      },
    });

    return evaluations;
  }

  private async fetchEvaluationTimestamp(evaluationId: string) {
    const evaluation = await prisma.coachEvaluation.findUnique({
      where: { id: evaluationId },
      select: { createdAt: true },
    });

    return evaluation?.createdAt;
  }

  private async resolveRuleSetVersion(userId: string, name: string, proposed?: number) {
    if (proposed && proposed > 0) {
      return proposed;
    }

    const latest = await prisma.coachRuleSet.findFirst({
      where: {
        ownerUserId: userId,
        name,
      },
      orderBy: {
        version: 'desc',
      },
      select: { version: true },
    });

    return (latest?.version ?? 0) + 1;
  }

  private async ensureBotAccess(userId: string, botId?: string) {
    if (!botId) {
      return;
    }

    const bot = await prisma.bot.findFirst({
      where: {
        id: botId,
        userId,
      },
      select: { id: true },
    });

    if (!bot) {
      throw new Error('Bot not found or unauthorized');
    }
  }

  private async ensureStrategyAccess(userId: string, strategyId?: string) {
    if (!strategyId) {
      return;
    }

    const strategy = await prisma.botStrategy.findFirst({
      where: {
        id: strategyId,
        bot: {
          userId,
        },
      },
      select: { id: true },
    });

    if (!strategy) {
      throw new Error('Strategy not found or unauthorized');
    }
  }
}

export type CoachRuleSetWithTags = Prisma.CoachRuleSetGetPayload<{
  include: { tags: true };
}>;

export type CoachSessionWithRuleSet = Prisma.CoachSessionGetPayload<{
  include: { ruleSet: { include: { tags: true } }; snapshots: true };
}>;
