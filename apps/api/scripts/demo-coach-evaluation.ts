import 'reflect-metadata';
import path from 'path';
import dotenv from 'dotenv';
import { PrismaClient, CoachTagSeverity } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { CoachEvaluatorService } from '../src/modules/coach/coach-evaluator.service';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const prisma = new PrismaClient();

async function ensureDemoUser() {
  const email = 'coach-demo@local.dev';
  const passwordHash = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      totpEnabled: false,
      subscriptionTier: 'FREE',
    },
  });

  return user;
}

async function createRuleSet(userId: string) {
  const name = 'Demo EMA Cross';

  const existing = await prisma.coachRuleSet.findFirst({
    where: { ownerUserId: userId, name },
    orderBy: { version: 'desc' },
  });

  const version = (existing?.version ?? 0) + 1;

  const rule = {
    when: {
      all_of: [
        {
          cross: {
            a: 'EMA(9)',
            b: 'EMA(20)',
            direction: 'up',
            lookback_candles: 3,
          },
        },
      ],
    },
    score: {
      base: 1,
      decay_per_candle_since_cross: 0.2,
    },
    traffic: {
      green_if_score_gte: 0.8,
      yellow_if_score_between: [0.5, 0.8],
    },
  };

  const thresholds = {
    green_if_score_gte: 0.8,
    yellow_if_score_between: [0.5, 0.8],
  };

  const ruleSet = await prisma.coachRuleSet.create({
    data: {
      ownerUserId: userId,
      name,
      version,
      summary: 'Detects recent EMA(9) cross above EMA(20) for long entries.',
      config: { demo: true },
      thresholds,
      tags: {
        create: [
          {
            tagKey: 'ema_cross_recent',
            name: 'EMA Cross Recent',
            severity: CoachTagSeverity.ENTRY,
            rule,
          },
        ],
      },
    },
    include: {
      tags: true,
    },
  });

  return ruleSet;
}

async function createSession(userId: string, ruleSetId: string) {
  return prisma.coachSession.create({
    data: {
      userId,
      ruleSetId,
      symbol: 'AAPL',
      timeframeMinutes: 5,
      state: 'SCANNING',
    },
  });
}

async function createSnapshot(sessionId: string) {
  const features = {
    series: {
      'EMA(9)': [99.8, 100.2, 101.5, 102.4],
      'EMA(20)': [100.5, 100.3, 100.1, 100.0],
    },
    meta: {
      candlesSinceCross: 1,
    },
    price: {
      close: 102.5,
    },
  };

  const payload = {
    symbol: 'AAPL',
    timeframe: '5',
  };

  return prisma.coachSnapshot.create({
    data: {
      sessionId,
      source: 'ALERT',
      features,
      payload,
    },
  });
}

async function main() {
  const user = await ensureDemoUser();
  const ruleSet = await createRuleSet(user.id);
  const session = await createSession(user.id, ruleSet.id);
  const snapshot = await createSnapshot(session.id);

  const evaluator = new CoachEvaluatorService();
  await evaluator.handleJob({ sessionId: session.id, snapshotId: snapshot.id });

  const evaluations = await prisma.coachEvaluation.findMany({
    where: { sessionId: session.id },
    include: {
      tag: true,
      advice: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log('=== Coach Evaluations ===');
  evaluations.forEach((evaluation) => {
    console.log({
      id: evaluation.id,
      status: evaluation.status,
      score: evaluation.score,
      tag: evaluation.tag?.name,
      advice: evaluation.advice?.headline,
      body: evaluation.advice?.body,
    });
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
