import Bull, { type Queue as BullQueue, type QueueOptions } from 'bull';
import { Injectable } from '@/shared/decorators/injectable.decorator';
import { logger } from '@/shared/utils/logger';

export const COACH_EVALUATION_QUEUE = 'coach:evaluator';

export type CoachEvaluationJob = {
  sessionId: string;
  snapshotId?: string;
  trigger?: 'alert' | 'snapshot' | 'heartbeat';
};

const defaultQueueOptions: QueueOptions = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },
  prefix: process.env.BULL_QUEUE_PREFIX || 'rortrader',
};

export function createCoachQueue() {
  return new Bull<CoachEvaluationJob>(COACH_EVALUATION_QUEUE, defaultQueueOptions);
}

@Injectable()
export class CoachQueueService {
  private evaluationQueue: BullQueue<CoachEvaluationJob>;

  constructor() {
    this.evaluationQueue = createCoachQueue();
  }

  async enqueueEvaluationJob(job: CoachEvaluationJob) {
    try {
      await this.evaluationQueue.add('evaluate', job, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      });
    } catch (error) {
      logger.error('Failed to enqueue coach evaluation job', { error, job });
      throw error;
    }
  }

  async scheduleHeartbeat(sessionId: string, delayMs = 5000) {
    try {
      await this.evaluationQueue.add(
        'heartbeat',
        { sessionId, trigger: 'heartbeat' },
        {
          delay: delayMs,
          removeOnComplete: true,
          attempts: 1,
        }
      );
    } catch (error) {
      logger.error('Failed to schedule coach heartbeat job', { error, sessionId });
    }
  }
}
