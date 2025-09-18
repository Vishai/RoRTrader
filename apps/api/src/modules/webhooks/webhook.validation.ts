import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const webhookSignalSchema = Joi.object({
  action: Joi.string().valid('buy', 'sell', 'close').required(),
  symbol: Joi.string().required(),
  quantity: Joi.number().positive().optional(),
  price: Joi.number().positive().optional(),
  stopLoss: Joi.number().positive().optional(),
  takeProfit: Joi.number().positive().optional(),
  orderId: Joi.string().optional(),
  message: Joi.string().optional(),
  indicators: Joi.object().optional(),
});

export const validateWebhookSignal = (req: Request, res: Response, next: NextFunction) => {
  const { error } = webhookSignalSchema.validate(req.body);
  
  if (error) {
    // Still return 200 for webhooks to prevent retries
    return res.status(200).json({
      success: false,
      message: 'Invalid webhook payload',
      error: error.details[0].message
    });
  }
  
  next();
};
