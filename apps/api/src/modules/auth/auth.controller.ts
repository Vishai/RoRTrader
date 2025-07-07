import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { authValidation } from '@/shared/validation/auth.validation';

export class AuthController {
  /**
   * POST /api/auth/register
   * Register a new user
   */
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request body
      const { error, value } = authValidation.register.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.details.map(d => d.message),
        });
      }

      // Register user
      const result = await AuthService.register(value);

      res.status(201).json({
        message: 'Registration successful',
        data: result,
      });
    } catch (error: any) {
      if (error.message === 'User with this email already exists') {
        return res.status(409).json({ error: error.message });
      }
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   * Login a user
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request body
      const { error, value } = authValidation.login.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.details.map(d => d.message),
        });
      }

      // Add device info from request
      const loginData = {
        ...value,
        device: req.headers['user-agent']?.includes('Mobile') ? 'Mobile' : 'Desktop',
        browser: req.headers['user-agent'] || 'Unknown',
        ipAddress: req.ip || req.socket.remoteAddress || 'Unknown',
        // In production, use a geo-IP service for location
        location: 'Unknown',
      };

      // Login user
      const result = await AuthService.login(loginData);

      if (result.requiresTwoFactor) {
        return res.status(200).json({
          message: '2FA verification required',
          data: { requiresTwoFactor: true },
        });
      }

      res.status(200).json({
        message: 'Login successful',
        data: result,
      });
    } catch (error: any) {
      if (error.message === 'Invalid credentials' || error.message === 'Invalid 2FA code') {
        return res.status(401).json({ error: error.message });
      }
      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   * Logout a user
   */
  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // Get session ID from token
      const user = (req as any).user;
      if (user && user.sessionId) {
        await AuthService.logout(user.sessionId);
      }

      res.status(200).json({
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/refresh
   * Refresh access token
   */
  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request body
      const { error, value } = authValidation.refreshToken.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.details.map(d => d.message),
        });
      }

      // Refresh token
      const result = await AuthService.refreshToken(value.refreshToken);

      res.status(200).json({
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (error: any) {
      if (error.message === 'Invalid refresh token' || error.message === 'Session expired') {
        return res.status(401).json({ error: error.message });
      }
      next(error);
    }
  }

  /**
   * GET /api/auth/2fa/setup
   * Get 2FA setup information
   */
  static async setup2FA(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const secret = await AuthService.setup2FA(user.userId);

      res.status(200).json({
        message: '2FA setup initiated',
        data: {
          secret: secret.secret,
          qrCode: secret.qrCode,
        },
      });
    } catch (error: any) {
      if (error.message === '2FA is already enabled') {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }

  /**
   * POST /api/auth/2fa/enable
   * Enable 2FA after verification
   */
  static async enable2FA(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request body
      const { error, value } = authValidation.setup2FA.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.details.map(d => d.message),
        });
      }

      const user = (req as any).user;
      const { secret } = req.body; // Secret should be stored temporarily on client side

      if (!secret) {
        return res.status(400).json({ error: 'Secret is required' });
      }

      const result = await AuthService.enable2FA(user.userId, value.totpCode, secret);

      res.status(200).json({
        message: '2FA enabled successfully',
        data: result,
      });
    } catch (error: any) {
      if (error.message === 'Invalid verification code') {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }

  /**
   * POST /api/auth/2fa/disable
   * Disable 2FA
   */
  static async disable2FA(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request body
      const { error, value } = authValidation.disable2FA.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.details.map(d => d.message),
        });
      }

      const user = (req as any).user;
      await AuthService.disable2FA(user.userId, value.totpCode);

      res.status(200).json({
        message: '2FA disabled successfully',
      });
    } catch (error: any) {
      if (error.message === 'Invalid verification code' || error.message === '2FA is not enabled') {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }

  /**
   * GET /api/auth/sessions
   * Get user sessions
   */
  static async getSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const sessions = await AuthService.getUserSessions(user.userId);

      // Mark current session
      const currentSessionId = user.sessionId;
      const sessionsWithCurrent = sessions.map(session => ({
        ...session,
        current: session.id === currentSessionId,
      }));

      res.status(200).json({
        message: 'Sessions retrieved successfully',
        data: sessionsWithCurrent,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/auth/sessions/:sessionId
   * Revoke a specific session
   */
  static async revokeSession(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const { sessionId } = req.params;

      // Prevent revoking current session
      if (sessionId === user.sessionId) {
        return res.status(400).json({ error: 'Cannot revoke current session' });
      }

      await AuthService.revokeSession(user.userId, sessionId);

      res.status(200).json({
        message: 'Session revoked successfully',
      });
    } catch (error: any) {
      if (error.message === 'Session not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }

  /**
   * POST /api/auth/sessions/revoke-all
   * Revoke all sessions except current
   */
  static async revokeAllSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      await AuthService.revokeAllSessions(user.userId, user.sessionId);

      res.status(200).json({
        message: 'All other sessions revoked successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
