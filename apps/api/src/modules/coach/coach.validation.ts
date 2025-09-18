import Joi from 'joi';

const tagDefinitionSchema = Joi.object({
  tagKey: Joi.string().trim().min(1).max(64).required(),
  name: Joi.string().trim().min(2).max(120).required(),
  category: Joi.string().trim().max(60).optional(),
  description: Joi.string().trim().max(500).allow('').optional(),
  severity: Joi.string().valid('INFO', 'SETUP', 'ENTRY', 'EXIT').default('INFO'),
  rule: Joi.object().required(),
});

export const createRuleSetSchema = Joi.object({
  name: Joi.string().trim().min(3).max(120).required(),
  summary: Joi.string().trim().max(500).allow('').optional(),
  botId: Joi.string().uuid({ version: 'uuidv4' }).optional(),
  strategyId: Joi.string().uuid({ version: 'uuidv4' }).optional(),
  version: Joi.number().integer().min(1).optional(),
  config: Joi.object().required(),
  thresholds: Joi.object().optional(),
  tags: Joi.array().items(tagDefinitionSchema).min(1).required(),
}).or('botId', 'strategyId');

export const updateRuleSetSchema = Joi.object({
  name: Joi.string().trim().min(3).max(120).optional(),
  summary: Joi.string().trim().max(500).allow('').optional(),
  config: Joi.object().optional(),
  thresholds: Joi.object().optional(),
  status: Joi.string().valid('DRAFT', 'ACTIVE', 'ARCHIVED').optional(),
  tags: Joi.array().items(tagDefinitionSchema).min(1).optional(),
}).min(1);

export const startSessionSchema = Joi.object({
  ruleSetId: Joi.string().uuid({ version: 'uuidv4' }).required(),
  botId: Joi.string().uuid({ version: 'uuidv4' }).optional(),
  symbol: Joi.string().trim().min(1).max(20).required(),
  timeframeMinutes: Joi.number().integer().min(1).max(240).required(),
  startedAt: Joi.date().optional(),
});

export const ingestAlertSchema = Joi.object({
  sessionId: Joi.string().uuid({ version: 'uuidv4' }).required(),
  payload: Joi.object().unknown(true).required(),
  features: Joi.object().unknown(true).optional(),
  capturedAt: Joi.date().optional(),
});

export const listEvaluationsQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(200).default(50),
  after: Joi.string().uuid({ version: 'uuidv4' }).optional(),
});

export interface ListEvaluationsQuery {
  limit: number;
  after?: string;
}
