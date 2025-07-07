import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const positionSizingSchema = Joi.object({
  type: Joi.string().valid('fixed', 'percentage').required(),
  value: Joi.number().positive().required(),
});

const riskManagementSchema = Joi.object({
  stopLoss: Joi.number().min(0).max(100).optional(),
  takeProfit: Joi.number().min(0).max(100).optional(),
  maxDailyLoss: Joi.number().positive().optional(),
});

const indicatorSignalSchema = Joi.object({
  operator: Joi.string().valid('lt', 'gt', 'eq', 'crosses_above', 'crosses_below', 'between').required(),
  value: Joi.number().optional(),
  value2: Joi.number().optional(),
});

const botIndicatorSchema = Joi.object({
  indicator: Joi.string().required(),
  parameters: Joi.object().required(),
  weight: Joi.number().min(0).max(10).default(1.0),
  enabled: Joi.boolean().default(true),
  buySignal: indicatorSignalSchema.optional(),
  sellSignal: indicatorSignalSchema.optional(),
});

const createBotSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).optional(),
  symbol: Joi.string().required(),
  assetType: Joi.string().valid('CRYPTO', 'STOCKS').required(),
  exchange: Joi.string().valid('COINBASE_PRO', 'ALPACA').required(),
  timeframe: Joi.string().valid('1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w').default('1h'),
  signalMode: Joi.string().valid('ANY', 'ALL', 'MAJORITY', 'CUSTOM').default('ALL'),
  indicators: Joi.array().items(botIndicatorSchema).optional(),
  tradingMode: Joi.string().valid('PAPER', 'LIVE').default('PAPER'),
  positionSizing: positionSizingSchema.required(),
  riskManagement: riskManagementSchema.optional(),
});

const updateBotSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  description: Joi.string().max(500).optional(),
  symbol: Joi.string().optional(),
  assetType: Joi.string().valid('CRYPTO', 'STOCKS').optional(),
  exchange: Joi.string().valid('COINBASE_PRO', 'ALPACA').optional(),
  timeframe: Joi.string().valid('1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w').optional(),
  signalMode: Joi.string().valid('ANY', 'ALL', 'MAJORITY', 'CUSTOM').optional(),
  indicators: Joi.array().items(botIndicatorSchema).optional(),
  tradingMode: Joi.string().valid('PAPER', 'LIVE').optional(),
  positionSizing: positionSizingSchema.optional(),
  riskManagement: riskManagementSchema.optional(),
  status: Joi.string().valid('ACTIVE', 'PAUSED', 'STOPPED').optional(),
});

export const validateCreateBot = (req: Request, res: Response, next: NextFunction) => {
  const { error } = createBotSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details[0].message
    });
  }
  
  next();
};

export const validateUpdateBot = (req: Request, res: Response, next: NextFunction) => {
  const { error } = updateBotSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details[0].message
    });
  }
  
  next();
};
