import { User, Session } from '@prisma/client';
import { prisma } from '@/shared/database/prisma';
import { PasswordUtil, TokenUtil, TwoFactorUtil } from '@/shared/security';
import type { TwoFactorSecret } from '@/shared/security';

interface RegisterData {
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
  totpCode?: string;
  device?: string;
  browser?: string;
  ipAddress?: string;
  location?: string;
}

interface AuthResponse {
  user: Partial<User>;
  accessToken: string;
  refreshToken: string;
  requiresTwoFactor?: boolean;
}

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegisterData): Promise<AuthResponse> {
    const { email, password } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Validate password strength
    if (!PasswordUtil.isStrongEnough(password)) {
      throw new Error('Password does not meet security requirements');
    }

    // Hash password
    const passwordHash = await PasswordUtil.hash(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });

    // Create session
    const session = await this.createSession(user.id, {
      device: 'Unknown',
      browser: 'Unknown',
      ipAddress: 'Unknown',
    });

    // Generate tokens
    const accessToken = TokenUtil.generateAccessToken({
      userId: user.id,
      email: user.email,
      sessionId: session.id,
    });

    const refreshToken = TokenUtil.generateRefreshToken({
      userId: user.id,
      sessionId: session.id,
    });

    // Log audit event
    await this.logAuditEvent(user.id, 'user_registered', {
      email: user.email,
    });

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login a user
   */
  static async login(data: LoginData): Promise<AuthResponse> {
    const { email, password, totpCode, device, browser, ipAddress, location } = data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await PasswordUtil.verify(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Check if 2FA is enabled
    if (user.totpEnabled) {
      if (!totpCode) {
        return {
          user: { id: user.id, email: user.email },
          accessToken: '',
          refreshToken: '',
          requiresTwoFactor: true,
        };
      }

      // Verify 2FA code
      if (!user.totpSecret) {
        throw new Error('2FA is enabled but not properly configured');
      }

      const isValidTotp = TwoFactorUtil.verifyToken(user.totpSecret, totpCode);
      if (!isValidTotp) {
        // Check backup codes
        if (user.backupCodes) {
          const backupCodes = user.backupCodes as string[];
          const isValidBackup = TwoFactorUtil.verifyBackupCode(totpCode, backupCodes);
          
          if (!isValidBackup) {
            throw new Error('Invalid 2FA code');
          }

          // Remove used backup code
          const updatedCodes = backupCodes.filter(code => code !== totpCode.toUpperCase());
          await prisma.user.update({
            where: { id: user.id },
            data: { backupCodes: updatedCodes },
          });
        } else {
          throw new Error('Invalid 2FA code');
        }
      }
    }

    // Create session
    const session = await this.createSession(user.id, {
      device: device || 'Unknown',
      browser: browser || 'Unknown',
      ipAddress: ipAddress || 'Unknown',
      location,
    });

    // Generate tokens
    const accessToken = TokenUtil.generateAccessToken({
      userId: user.id,
      email: user.email,
      sessionId: session.id,
    });

    const refreshToken = TokenUtil.generateRefreshToken({
      userId: user.id,
      sessionId: session.id,
    });

    // Log audit event
    await this.logAuditEvent(user.id, 'user_login', {
      device,
      browser,
      ipAddress,
      location,
    });

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Setup 2FA for a user
   */
  static async setup2FA(userId: string): Promise<TwoFactorSecret> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.totpEnabled) {
      throw new Error('2FA is already enabled');
    }

    const secret = await TwoFactorUtil.generateSecret(user.email);

    // Don't save the secret yet - wait for verification
    return secret;
  }

  /**
   * Enable 2FA after verification
   */
  static async enable2FA(userId: string, totpCode: string, secret: string): Promise<{ backupCodes: string[] }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.totpEnabled) {
      throw new Error('2FA is already enabled');
    }

    // Verify the code
    const isValid = TwoFactorUtil.verifyToken(secret, totpCode);
    if (!isValid) {
      throw new Error('Invalid verification code');
    }

    // Generate backup codes
    const backupCodes = TwoFactorUtil.generateBackupCodes();

    // Update user
    await prisma.user.update({
      where: { id: userId },
      data: {
        totpSecret: secret, // In production, encrypt this
        totpEnabled: true,
        backupCodes,
      },
    });

    // Log audit event
    await this.logAuditEvent(userId, '2fa_enabled');

    return { backupCodes };
  }

  /**
   * Disable 2FA
   */
  static async disable2FA(userId: string, totpCode: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.totpEnabled || !user.totpSecret) {
      throw new Error('2FA is not enabled');
    }

    // Verify the code
    const isValid = TwoFactorUtil.verifyToken(user.totpSecret, totpCode);
    if (!isValid) {
      throw new Error('Invalid verification code');
    }

    // Update user
    await prisma.user.update({
      where: { id: userId },
      data: {
        totpSecret: null,
        totpEnabled: false,
        backupCodes: null,
      },
    });

    // Log audit event
    await this.logAuditEvent(userId, '2fa_disabled');
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<Omit<AuthResponse, 'requiresTwoFactor'>> {
    try {
      const payload = TokenUtil.verifyRefreshToken(refreshToken);

      // Verify session still exists and is valid
      const session = await prisma.session.findUnique({
        where: { id: payload.sessionId },
        include: { user: true },
      });

      if (!session || session.expiresAt < new Date()) {
        throw new Error('Session expired');
      }

      // Update session last active
      await prisma.session.update({
        where: { id: session.id },
        data: { lastActive: new Date() },
      });

      // Generate new access token
      const accessToken = TokenUtil.generateAccessToken({
        userId: session.user.id,
        email: session.user.email,
        sessionId: session.id,
      });

      return {
        user: this.sanitizeUser(session.user),
        accessToken,
        refreshToken, // Return same refresh token
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Get user sessions
   */
  static async getUserSessions(userId: string): Promise<Session[]> {
    return prisma.session.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastActive: 'desc' },
    });
  }

  /**
   * Revoke a session
   */
  static async revokeSession(userId: string, sessionId: string): Promise<void> {
    const session = await prisma.session.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    await prisma.session.delete({
      where: { id: sessionId },
    });

    // Log audit event
    await this.logAuditEvent(userId, 'session_revoked', { sessionId });
  }

  /**
   * Revoke all sessions except current
   */
  static async revokeAllSessions(userId: string, currentSessionId: string): Promise<void> {
    await prisma.session.deleteMany({
      where: {
        userId,
        id: { not: currentSessionId },
      },
    });

    // Log audit event
    await this.logAuditEvent(userId, 'all_sessions_revoked');
  }

  /**
   * Logout
   */
  static async logout(sessionId: string): Promise<void> {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (session) {
      await prisma.session.delete({
        where: { id: sessionId },
      });

      // Log audit event
      await this.logAuditEvent(session.userId, 'user_logout', { sessionId });
    }
  }

  /**
   * Create a new session
   */
  private static async createSession(
    userId: string,
    sessionInfo: {
      device: string;
      browser: string;
      ipAddress: string;
      location?: string;
    }
  ): Promise<Session> {
    const token = TokenUtil.generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    return prisma.session.create({
      data: {
        userId,
        token,
        device: sessionInfo.device,
        browser: sessionInfo.browser,
        ipAddress: sessionInfo.ipAddress,
        location: sessionInfo.location,
        expiresAt,
      },
    });
  }

  /**
   * Log audit event
   */
  private static async logAuditEvent(
    userId: string,
    action: string,
    metadata?: any
  ): Promise<void> {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        metadata,
      },
    });
  }

  /**
   * Remove sensitive fields from user object
   */
  private static sanitizeUser(user: User): Partial<User> {
    const { passwordHash, totpSecret, backupCodes, ...sanitized } = user;
    return sanitized;
  }
}
