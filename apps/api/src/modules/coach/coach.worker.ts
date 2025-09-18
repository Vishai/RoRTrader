import 'reflect-metadata';
import path from 'path';
import dotenv from 'dotenv';
import { createCoachQueue, COACH_EVALUATION_QUEUE, type CoachEvaluationJob } from './coach.queue';
import { CoachEvaluatorService } from './coach-evaluator.service';
import { logger } from '@/shared/utils/logger';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const evaluator = new CoachEvaluatorService();
const queue = createCoachQueue();

const EVALUATION_CONCURRENCY = Number(process.env.COACH_EVALUATOR_CONCURRENCY ?? 2);
const HEARTBEAT_DELAY_MS = Number(process.env.COACH_HEARTBEAT_MS ?? 5000);

logger.info(`Coach worker attached to queue ${COACH_EVALUATION_QUEUE}`);

queue.process<CoachEvaluationJob>('evaluate', EVALUATION_CONCURRENCY, async (job) => {
  try {
    await evaluator.handleJob(job.data);
  } catch (error) {
    logger.error('Coach evaluation job failed', { error, job: job.data });
    throw error;
  }
});

queue.process<CoachEvaluationJob>('heartbeat', 1, async (job) => {
  try {
    await evaluator.handleJob({ sessionId: job.data.sessionId });
    await queue.add(
      'heartbeat',
      { sessionId: job.data.sessionId, trigger: 'heartbeat' },
      {
        delay: HEARTBEAT_DELAY_MS,
        removeOnComplete: true,
        attempts: 1,
      },
    );
  } catch (error) {
    logger.error('Coach heartbeat job failed', { error, job: job.data });
    throw error;
  }
});

process.on('SIGTERM', async () => {
  logger.info('Coach worker shutting down');
  await queue.close();
  process.exit(0);
});
