import { Request, Response, NextFunction } from 'express';
import { Injectable } from '@/shared/decorators/injectable.decorator';
import { Controller } from '@/shared/decorators/controller.decorator';
import { Get, Post, Put, Delete } from '@/shared/decorators/http-methods.decorator';
import { StrategyService } from './strategy.service';
import { authenticate } from '@/shared/middleware/auth.middleware';
import { validate } from '@/shared/middleware/validation.middleware';
import { createStrategySchema, updateStrategySchema, templateFiltersSchema } from './strategy.validation';
import { asyncHandler } from '@/shared/utils/async-handler';

@Injectable()
@Controller('/api/strategies')
export class StrategyController {
  constructor(private readonly strategyService: StrategyService) {}

  /**
   * Create a new strategy
   * POST /api/strategies
   */
  @Post('/')
  async createStrategy(req: Request, res: Response, next: NextFunction) {
    return asyncHandler(async () => {
      const user = await authenticate(req);
      const data = validate(createStrategySchema, req.body);
      
      const strategy = await this.strategyService.createStrategy(user.id, data);
      
      res.status(201).json({
        success: true,
        data: strategy
      });
    })(req, res, next);
  }

  /**
   * Get strategy by bot ID
   * GET /api/strategies/bot/:botId
   */
  @Get('/bot/:botId')
  async getStrategyByBot(req: Request, res: Response, next: NextFunction) {
    return asyncHandler(async () => {
      const user = await authenticate(req);
      const { botId } = req.params;
      
      const strategy = await this.strategyService.getStrategyByBotId(botId, user.id);
      
      res.json({
        success: true,
        data: strategy
      });
    })(req, res, next);
  }

  /**
   * Get strategy by ID
   * GET /api/strategies/:id
   */
  @Get('/:id')
  async getStrategy(req: Request, res: Response, next: NextFunction) {
    return asyncHandler(async () => {
      await authenticate(req);
      const { id } = req.params;
      
      const strategy = await this.strategyService.getStrategyById(id);
      
      if (!strategy) {
        return res.status(404).json({
          success: false,
          error: 'Strategy not found'
        });
      }
      
      res.json({
        success: true,
        data: strategy
      });
    })(req, res, next);
  }

  /**
   * Update strategy
   * PUT /api/strategies/:id
   */
  @Put('/:id')
  async updateStrategy(req: Request, res: Response, next: NextFunction) {
    return asyncHandler(async () => {
      const user = await authenticate(req);
      const { id } = req.params;
      const data = validate(updateStrategySchema, req.body);
      
      const strategy = await this.strategyService.updateStrategy(id, user.id, data);
      
      res.json({
        success: true,
        data: strategy
      });
    })(req, res, next);
  }

  /**
   * Delete strategy
   * DELETE /api/strategies/:id
   */
  @Delete('/:id')
  async deleteStrategy(req: Request, res: Response, next: NextFunction) {
    return asyncHandler(async () => {
      const user = await authenticate(req);
      const { id } = req.params;
      
      await this.strategyService.deleteStrategy(id, user.id);
      
      res.json({
        success: true,
        message: 'Strategy deleted successfully'
      });
    })(req, res, next);
  }

  /**
   * Get available strategy templates
   * GET /api/strategies/templates
   */
  @Get('/templates')
  async getTemplates(req: Request, res: Response, next: NextFunction) {
    return asyncHandler(async () => {
      const filters = validate(templateFiltersSchema, req.query);
      
      const templates = await this.strategyService.getTemplates(filters);
      
      res.json({
        success: true,
        data: templates
      });
    })(req, res, next);
  }

  /**
   * Get template by ID
   * GET /api/strategies/templates/:id
   */
  @Get('/templates/:id')
  async getTemplate(req: Request, res: Response, next: NextFunction) {
    return asyncHandler(async () => {
      const { id } = req.params;
      
      const template = await this.strategyService.getTemplateById(id);
      
      res.json({
        success: true,
        data: template
      });
    })(req, res, next);
  }

  /**
   * Create strategy from template
   * POST /api/strategies/from-template
   */
  @Post('/from-template')
  async createFromTemplate(req: Request, res: Response, next: NextFunction) {
    return asyncHandler(async () => {
      const user = await authenticate(req);
      const { botId, templateId } = req.body;
      
      if (!botId || !templateId) {
        return res.status(400).json({
          success: false,
          error: 'botId and templateId are required'
        });
      }
      
      const strategy = await this.strategyService.createFromTemplate(
        user.id,
        botId,
        templateId
      );
      
      res.status(201).json({
        success: true,
        data: strategy
      });
    })(req, res, next);
  }
}
