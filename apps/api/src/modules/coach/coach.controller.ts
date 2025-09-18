import { Request, Response, NextFunction } from 'express';
import { Injectable } from '@/shared/decorators/injectable.decorator';
import { Controller } from '@/shared/decorators/controller.decorator';
import { Get, Post, Patch } from '@/shared/decorators/http-methods.decorator';
import { asyncHandler } from '@/shared/utils/async-handler';
import { authenticate } from '@/shared/middleware/auth.middleware';
import { validate } from '@/shared/middleware/validation.middleware';
import {
  createRuleSetSchema,
  updateRuleSetSchema,
  startSessionSchema,
  ingestAlertSchema,
  listEvaluationsQuerySchema,
} from './coach.validation';
import { CoachService, type CreateRuleSetDto, type UpdateRuleSetDto, type StartSessionDto, type IngestAlertDto } from './coach.service';
import type { ListEvaluationsQuery } from './coach.validation';

@Injectable()
@Controller('/api/coach')
export class CoachController {
  constructor(private readonly coachService: CoachService) {}

  @Post('/rulesets')
  async createRuleSet(req: Request, res: Response, next: NextFunction) {
    return asyncHandler(async () => {
      const user = await authenticate(req);
      const data = validate<CreateRuleSetDto>(createRuleSetSchema, req.body);

      const ruleSet = await this.coachService.createRuleSet(user.id, data);

      res.status(201).json({ success: true, data: ruleSet });
    })(req, res, next);
  }

  @Patch('/rulesets/:id')
  async updateRuleSet(req: Request, res: Response, next: NextFunction) {
    return asyncHandler(async () => {
      const user = await authenticate(req);
      const { id } = req.params;
      const data = validate<UpdateRuleSetDto>(updateRuleSetSchema, req.body);

      const ruleSet = await this.coachService.updateRuleSet(user.id, id, data);

      res.json({ success: true, data: ruleSet });
    })(req, res, next);
  }

  @Get('/rulesets/:id')
  async getRuleSet(req: Request, res: Response, next: NextFunction) {
    return asyncHandler(async () => {
      const user = await authenticate(req);
      const { id } = req.params;

      const ruleSet = await this.coachService.getRuleSetById(user.id, id);

      if (!ruleSet) {
        return res.status(404).json({ success: false, error: 'Rule set not found' });
      }

      res.json({ success: true, data: ruleSet });
    })(req, res, next);
  }

  @Post('/sessions')
  async startSession(req: Request, res: Response, next: NextFunction) {
    return asyncHandler(async () => {
      const user = await authenticate(req);
      const data = validate<StartSessionDto>(startSessionSchema, req.body);

      const session = await this.coachService.startSession(user.id, data);

      res.status(201).json({ success: true, data: session });
    })(req, res, next);
  }

  @Get('/sessions/:id')
  async getSession(req: Request, res: Response, next: NextFunction) {
    return asyncHandler(async () => {
      const user = await authenticate(req);
      const { id } = req.params;

      const session = await this.coachService.getSession(user.id, id);

      if (!session) {
        return res.status(404).json({ success: false, error: 'Session not found' });
      }

      res.json({ success: true, data: session });
    })(req, res, next);
  }

  @Get('/sessions/:id/evaluations')
  async listEvaluations(req: Request, res: Response, next: NextFunction) {
    return asyncHandler(async () => {
      const user = await authenticate(req);
      const { id } = req.params;
      const { limit, after } = validate<ListEvaluationsQuery>(listEvaluationsQuerySchema, req.query);

      const evaluations = await this.coachService.listEvaluations(user.id, id, limit, after);

      res.json({ success: true, data: evaluations });
    })(req, res, next);
  }

  @Post('/alerts')
  async ingestAlert(req: Request, res: Response, next: NextFunction) {
    return asyncHandler(async () => {
      const user = await authenticate(req);
      const data = validate<IngestAlertDto>(ingestAlertSchema, req.body);

      const snapshot = await this.coachService.ingestAlert(user.id, {
        ...data,
        capturedAt: data.capturedAt ? new Date(data.capturedAt) : undefined,
      });

      res.status(202).json({ success: true, data: snapshot });
    })(req, res, next);
  }
}
