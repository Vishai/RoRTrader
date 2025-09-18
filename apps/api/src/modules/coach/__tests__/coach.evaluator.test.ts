import 'reflect-metadata';
import { CoachEvaluatorService } from '../coach-evaluator.service';
import { prisma } from '@/shared/database/prisma';

const evaluator = new CoachEvaluatorService();

const mockedPrisma = prisma as unknown as {
  coachSession: {
    findUnique: jest.Mock;
  };
  coachSnapshot: {
    findUnique: jest.Mock;
  };
  $transaction: jest.Mock;
};

describe('CoachEvaluatorService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates evaluations and advice for satisfied tags', async () => {
    const mockSession = {
      id: 'session-1',
      ruleSet: {
        thresholds: { green_if_score_gte: 0.8, yellow_if_score_between: [0.5, 0.8] },
        tags: [
          {
            id: 'tag-1',
            tagKey: 'ema_cross_recent',
            name: 'EMA Cross Recent',
            severity: 'ENTRY',
            rule: {
              when: {
                any_of: [
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
              },
              traffic: {
                green_if_score_gte: 0.8,
              },
            },
          },
        ],
      },
    } as any;

    const mockSnapshot = {
      id: 'snapshot-1',
      sessionId: 'session-1',
      features: {
        series: {
          'EMA(9)': [98.9, 99.5, 100.2, 101.3],
          'EMA(20)': [100.5, 100.1, 99.8, 99.5],
        },
      },
      payload: {},
    } as any;

    const tx = {
      coachEvaluation: {
        create: jest.fn().mockResolvedValue({ id: 'eval-1' }),
      },
      coachAdvice: {
        create: jest.fn().mockResolvedValue({}),
      },
      coachSession: {
        update: jest.fn().mockResolvedValue({}),
      },
    } as any;

    mockedPrisma.coachSession.findUnique.mockResolvedValue(mockSession);
    mockedPrisma.coachSnapshot.findUnique.mockResolvedValue(mockSnapshot);
    mockedPrisma.$transaction.mockImplementation(async (cb: any) => cb(tx));

    await evaluator.handleJob({ sessionId: 'session-1', snapshotId: 'snapshot-1' });

    expect(tx.coachEvaluation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          sessionId: 'session-1',
          tagId: 'tag-1',
          status: 'GREEN',
        }),
      }),
    );

    expect(tx.coachAdvice.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          headline: expect.stringContaining('GREEN'),
        }),
      }),
    );

    expect(tx.coachSession.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'session-1' },
        data: expect.objectContaining({ state: 'READY' }),
      }),
    );
  });
});

