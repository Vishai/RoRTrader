import Joi from 'joi';

export class ValidationError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validates request data against a Joi schema
 */
export function validate<T>(schema: Joi.Schema, data: any): T {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
  
  if (error) {
    const details = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    throw new ValidationError('Validation failed', details);
  }
  
  return value as T;
}

/**
 * Express middleware for request validation
 */
export function validateRequest(schema: Joi.Schema, property: 'body' | 'query' | 'params' = 'body') {
  return (req: any, res: any, next: any) => {
    try {
      req[property] = validate(schema, req[property]);
      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          error: error.message,
          details: error.details
        });
      }
      next(error);
    }
  };
}
