import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../database/prisma';

export interface AuthRequest extends Request {
  user?: any;
}

/**
 * Authentication middleware
 */
export async function authenticate(req: AuthRequest): Promise<any> {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    throw new Error('No authentication token provided');
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        subscriptionTier: true,
        totpEnabled: true
      }
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    req.user = user;
    return user;
    
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Express middleware wrapper for authentication
 */
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  authenticate(req)
    .then(() => next())
    .catch(error => {
      res.status(401).json({
        success: false,
        error: error.message
      });
    });
}
