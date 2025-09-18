import { Router } from 'express';
import { CoachQueueService } from './coach.queue';
import { CoachService } from './coach.service';
import { CoachController } from './coach.controller';

const queueService = new CoachQueueService();
const coachService = new CoachService(queueService);
const coachController = new CoachController(coachService);

const router = Router();

router.post('/rulesets', coachController.createRuleSet.bind(coachController));
router.patch('/rulesets/:id', coachController.updateRuleSet.bind(coachController));
router.get('/rulesets/:id', coachController.getRuleSet.bind(coachController));

router.post('/sessions', coachController.startSession.bind(coachController));
router.get('/sessions/:id', coachController.getSession.bind(coachController));
router.get('/sessions/:id/evaluations', coachController.listEvaluations.bind(coachController));

router.post('/alerts', coachController.ingestAlert.bind(coachController));

export const coachRoutes = router;

export const CoachModule = {
  controllers: [CoachController],
  services: [CoachService, CoachQueueService],
  exports: [CoachService, CoachQueueService],
};

export { CoachService } from './coach.service';
export { CoachController } from './coach.controller';
export { CoachQueueService } from './coach.queue';
export type { CoachRuleSetWithTags, CoachSessionWithRuleSet } from './coach.service';

