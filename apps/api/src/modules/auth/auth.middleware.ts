import { Request, Response, NextFunction } from 'express';
import { TokenUtil } from '@/shared/security/token';
import { prisma } from '@/shared/database/prisma';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        sessionId: string;
      };
    }
  }
}

export class AuthMiddleware {
  /**
   * Verify JWT token and attach user to request
   */
  static async authenticate(req: Request, res: Response, next: NextFunction) {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Verify token
      try {
        const payload = TokenUtil.verifyAccessToken(token);

        // Verify session is still valid
        const session = await prisma.session.findUnique({
          where: { id: payload.sessionId },
          include: { user: true },
        });

        if (!session || session.expiresAt < new Date()) {
          return res.status(401).json({ error: 'Session expired' });
        }

        // Update session last active
        await prisma.session.update({
          where: { id: session.id },
          data: { lastActive: new Date() },
        });

        // Attach user to request
        req.user = {
          userId: payload.userId,
          email: payload.email,
          sessionId: payload.sessionId,
        };

        next();
      } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check if user has 2FA enabled (for sensitive operations)
   */
  static async require2FA(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { totpEnabled: true },
      });

      if (!user?.totpEnabled) {
        return res.status(403).json({ 
          error: '2FA required', 
          message: 'This operation requires two-factor authentication to be enabled' 
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check subscription tier
   */
  static requireTier(allowedTiers: string[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        const user = await prisma.user.findUnique({
          where: { id: req.user.userId },
          select: { 
            subscriptionTier: true,
            subscriptionExpiresAt: true,
          },
        });

        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Check if subscription is expired
        if (user.subscriptionExpiresAt && user.subscriptionExpiresAt < new Date()) {
          return res.status(403).json({ 
            error: 'Subscription expired',
            message: 'Please renew your subscription to continue'
          });
        }

        // Check tier
        if (!allowedTiers.includes(user.subscriptionTier)) {
          return res.status(403).json({ 
            error: 'Insufficient subscription tier',
            message: `This feature requires one of the following tiers: ${allowedTiers.join(', ')}`
          });
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Rate limiting middleware (in addition to global rate limiting)
   * For specific endpoints that need stricter limits
   */
  static rateLimit(maxRequests: number, windowMs: number) {
    const requests = new Map<string, { count: number; resetTime: number }>();

    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const key = req.user.userId;
      const now = Date.now();
      const userRequests = requests.get(key);

      if (!userRequests || now > userRequests.resetTime) {
        // Reset counter
        requests.set(key, {
          count: 1,
          resetTime: now + windowMs,
        });
        return next();
      }

      if (userRequests.count >= maxRequests) {
        const retryAfter = Math.ceil((userRequests.resetTime - now) / 1000);
        res.setHeader('Retry-After', retryAfter.toString());
        return res.status(429).json({ 
          error: 'Too many requests',
          message: `Please try again in ${retryAfter} seconds`
        });
      }

      userRequests.count++;
      next();
    };
  }
}
