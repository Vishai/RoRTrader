import Joi from 'joi';

// Indicator configuration schema
const indicatorSchema = Joi.object({
  type: Joi.string().required().valid(
    'SMA', 'EMA', 'RSI', 'MACD', 'BOLLINGER',
    'STOCHASTIC', 'ATR', 'VOLUME', 'VWAP',
    'PIVOT_POINTS', 'FIBONACCI', 'CUSTOM'
  ),
  params: Joi.object().required(),
  color: Joi.string().optional()
});

// Condition schema
const conditionSchema = Joi.object({
  indicatorId: Joi.string().optional(),
  operator: Joi.string().required().valid(
    'CROSSES_ABOVE', 'CROSSES_BELOW',
    'GREATER_THAN', 'LESS_THAN',
    'EQUALS', 'BETWEEN'
  ),
  compareToType: Joi.string().required().valid('VALUE', 'INDICATOR', 'PRICE'),
  compareToValue: Joi.alternatives().try(
    Joi.number(),
    Joi.object({
      value: Joi.number()
    }),
    Joi.object({
      indicatorId: Joi.string(),
      offset: Joi.number().optional()
    })
  ).required(),
  logicalOperator: Joi.string().optional().valid('AND', 'OR')
});

// Create strategy schema
export const createStrategySchema = Joi.object({
  botId: Joi.string().uuid().required(),
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500).optional(),
  templateId: Joi.string().uuid().optional(),
  indicators: Joi.array().items(indicatorSchema).min(1).max(10).required(),
  entryConditions: Joi.array().items(conditionSchema).min(1).max(20).required(),
  exitConditions: Joi.array().items(conditionSchema).max(20).optional()
});

// Update strategy schema
export const updateStrategySchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  description: Joi.string().max(500).optional().allow(''),
  isActive: Joi.boolean().optional(),
  indicators: Joi.array().items(indicatorSchema).min(1).max(10).optional(),
  entryConditions: Joi.array().items(conditionSchema).min(1).max(20).optional(),
  exitConditions: Joi.array().items(conditionSchema).max(20).optional()
}).min(1); // At least one field required

// Template filters schema
export const templateFiltersSchema = Joi.object({
  category: Joi.string().valid(
    'TREND_FOLLOWING', 'MEAN_REVERSION', 'MOMENTUM',
    'VOLATILITY', 'VOLUME', 'SCALPING', 'SWING', 'POSITION'
  ).optional(),
  difficulty: Joi.string().valid(
    'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'
  ).optional(),
  assetType: Joi.string().valid('CRYPTO', 'STOCKS').optional()
});

// Strategy execution validation (for webhook processor)
export const strategyExecutionSchema = Joi.object({
  strategyId: Joi.string().uuid().required(),
  candles: Joi.array().items(
    Joi.object({
      time: Joi.number().required(),
      open: Joi.number().positive().required(),
      high: Joi.number().positive().required(),
      low: Joi.number().positive().required(),
      close: Joi.number().positive().required(),
      volume: Joi.number().min(0).required()
    })
  ).min(20).required(),
  currentPrice: Joi.number().positive().required(),
  timestamp: Joi.number().optional()
});

// Backtest request schema
export const backtestRequestSchema = Joi.object({
  strategyId: Joi.string().uuid().required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
  initialCapital: Joi.number().positive().min(100).max(1000000).default(10000),
  settings: Joi.object({
    slippage: Joi.number().min(0).max(1).default(0.001), // 0.1%
    commission: Joi.number().min(0).max(1).default(0.001), // 0.1%
    marginRequirement: Joi.number().min(0).max(1).default(1), // 100% = no leverage
    includeSpread: Joi.boolean().default(true)
  }).optional()
});
