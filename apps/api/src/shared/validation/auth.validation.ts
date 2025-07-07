import Joi from 'joi';

export const authValidation = {
  // Register validation
  register: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .lowercase()
      .trim()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
    password: Joi.string()
      .min(8)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'any.required': 'Password is required',
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Please confirm your password',
      }),
  }),

  // Login validation
  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .lowercase()
      .trim()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required',
      }),
    totpCode: Joi.string()
      .length(6)
      .pattern(/^\d+$/)
      .optional()
      .messages({
        'string.length': '2FA code must be exactly 6 digits',
        'string.pattern.base': '2FA code must contain only numbers',
      }),
  }),

  // 2FA setup validation
  setup2FA: Joi.object({
    totpCode: Joi.string()
      .length(6)
      .pattern(/^\d+$/)
      .required()
      .messages({
        'string.length': '2FA code must be exactly 6 digits',
        'string.pattern.base': '2FA code must contain only numbers',
        'any.required': '2FA code is required',
      }),
  }),

  // Disable 2FA validation
  disable2FA: Joi.object({
    totpCode: Joi.string()
      .length(6)
      .pattern(/^\d+$/)
      .required()
      .messages({
        'string.length': '2FA code must be exactly 6 digits',
        'string.pattern.base': '2FA code must contain only numbers',
        'any.required': '2FA code is required',
      }),
  }),

  // Refresh token validation
  refreshToken: Joi.object({
    refreshToken: Joi.string()
      .required()
      .messages({
        'any.required': 'Refresh token is required',
      }),
  }),

  // Forgot password validation
  forgotPassword: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .lowercase()
      .trim()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
  }),

  // Reset password validation
  resetPassword: Joi.object({
    token: Joi.string()
      .required()
      .messages({
        'any.required': 'Reset token is required',
      }),
    password: Joi.string()
      .min(8)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'any.required': 'Password is required',
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Please confirm your password',
      }),
  }),
};
