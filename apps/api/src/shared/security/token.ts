import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

interface TokenPayload {
  userId: string;
  email: string;
  sessionId: string;
}

interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
}

export class TokenUtil {
  private static readonly ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || randomBytes(64).toString('hex');
  private static readonly REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || randomBytes(64).toString('hex');
  private static readonly ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
  private static readonly REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

  /**
   * Generate access token
   */
  static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.ACCESS_TOKEN_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
      issuer: 'ror-trader',
      audience: 'ror-trader-api',
    });
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: RefreshTokenPayload): string {
    return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
      issuer: 'ror-trader',
      audience: 'ror-trader-api',
    });
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.ACCESS_TOKEN_SECRET, {
        issuer: 'ror-trader',
        audience: 'ror-trader-api',
      }) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      return jwt.verify(token, this.REFRESH_TOKEN_SECRET, {
        issuer: 'ror-trader',
        audience: 'ror-trader-api',
      }) as RefreshTokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Generate session token (for session management)
   */
  static generateSessionToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Decode token without verification (for debugging)
   */
  static decode(token: string): any {
    return jwt.decode(token);
  }
}
