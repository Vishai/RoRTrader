import Joi from 'joi';

// Candle data schema
const candleSchema = Joi.object({
  time: Joi.number().required(),
  open: Joi.number().positive().required(),
  high: Joi.number().positive().required(),
  low: Joi.number().positive().required(),
  close: Joi.number().positive().required(),
  volume: Joi.number().min(0).required()
});

// Single indicator calculation schema
export const calculateIndicatorSchema = Joi.object({
  symbol: Joi.string().required().min(1).max(20),
  indicator: Joi.string().required().valid('SMA', 'EMA', 'RSI', 'MACD', 'BOLLINGER'),
  params: Joi.object({
    period: Joi.number().min(5).max(200),
    fastPeriod: Joi.number().min(5).max(50),
    slowPeriod: Joi.number().min(10).max(100),
    signalPeriod: Joi.number().min(5).max(50),
    stdDev: Joi.number().min(1).max(3)
  }).default({}),
  candles: Joi.array().items(candleSchema).min(50).max(1000).required()
});

// Batch indicator calculation schema
export const batchIndicatorSchema = Joi.object({
  symbol: Joi.string().required().min(1).max(20),
  indicators: Joi.array().items(
    Joi.object({
      name: Joi.string().required().valid('SMA', 'EMA', 'RSI', 'MACD', 'BOLLINGER'),
      params: Joi.object({
        period: Joi.number().min(5).max(200),
        fastPeriod: Joi.number().min(5).max(50),
        slowPeriod: Joi.number().min(10).max(100),
        signalPeriod: Joi.number().min(5).max(50),
        stdDev: Joi.number().min(1).max(3)
      }).optional()
    })
  ).min(1).max(10).required(),
  candles: Joi.array().items(candleSchema).min(50).max(1000).required()
});

// Strategy condition schema (for future use)
export const strategyConditionSchema = Joi.object({
  indicator: Joi.string().required(),
  operator: Joi.string().valid('crosses_above', 'crosses_below', 'greater_than', 'less_than', 'equals').required(),
  value: Joi.alternatives().try(
    Joi.number(),
    Joi.string(),
    Joi.object({
      indicator: Joi.string(),
      offset: Joi.number().optional()
    })
  ).required(),
  timeframe: Joi.string().valid('1m', '5m', '15m', '30m', '1h', '4h', '1d').default('1h')
});

// Strategy validation schema (for future use)
export const strategySchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  description: Joi.string().max(500).optional(),
  conditions: Joi.object({
    entry: Joi.array().items(strategyConditionSchema).min(1).max(10),
    exit: Joi.array().items(strategyConditionSchema).max(10),
    stopLoss: Joi.object({
      type: Joi.string().valid('percentage', 'atr', 'fixed').required(),
      value: Joi.number().positive().required()
    }).optional(),
    takeProfit: Joi.object({
      type: Joi.string().valid('percentage', 'atr', 'fixed').required(),
      value: Joi.number().positive().required()
    }).optional()
  }).required(),
  indicators: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      params: Joi.object().optional()
    })
  ).required()
});
