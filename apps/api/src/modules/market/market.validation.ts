import Joi from 'joi';

export const candlesQuerySchema = Joi.object({
  symbol: Joi.string().trim().uppercase().min(1).max(20).required(),
  exchange: Joi.string()
    .trim()
    .lowercase()
    .valid('coinbase', 'coinbase_pro', 'alpaca', 'binance', 'demo', 'mock')
    .default('demo'),
  timeframe: Joi.string()
    .trim()
    .lowercase()
    .valid('1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w')
    .default('1h'),
  start: Joi.date().iso().optional(),
  end: Joi.date().iso().optional(),
  limit: Joi.number().integer().min(10).max(500).default(100)
});

export const tickerParamsSchema = Joi.object({
  exchange: Joi.string()
    .trim()
    .lowercase()
    .valid('coinbase', 'coinbase_pro', 'alpaca', 'binance', 'demo', 'mock')
    .required(),
  symbol: Joi.string().trim().uppercase().min(1).max(20).required()
});

export const orderBookParamsSchema = Joi.object({
  exchange: Joi.string()
    .trim()
    .lowercase()
    .valid('coinbase', 'coinbase_pro', 'alpaca', 'binance', 'demo', 'mock')
    .required(),
  symbol: Joi.string().trim().uppercase().min(1).max(20).required()
});

export const orderBookQuerySchema = Joi.object({
  depth: Joi.number().integer().min(5).max(100).default(20)
});
