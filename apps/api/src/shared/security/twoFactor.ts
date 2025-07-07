import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { randomBytes } from 'crypto';

export interface TwoFactorSecret {
  secret: string;
  otpauthUrl: string;
  qrCode: string;
  backupCodes: string[];
}

export class TwoFactorUtil {
  private static readonly APP_NAME = 'RoR Trader';
  
  /**
   * Generate a new 2FA secret for a user
   */
  static async generateSecret(email: string): Promise<TwoFactorSecret> {
    // Generate TOTP secret
    const secret = speakeasy.generateSecret({
      name: `${this.APP_NAME} (${email})`,
      issuer: this.APP_NAME,
      length: 32,
    });

    // Generate QR code
    const qrCode = await qrcode.toDataURL(secret.otpauth_url);

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();

    return {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url,
      qrCode,
      backupCodes,
    };
  }

  /**
   * Verify a TOTP token
   */
  static verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 1 step before/after (30 seconds each way)
    });
  }

  /**
   * Generate backup codes
   */
  static generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    
    for (let i = 0; i < count; i++) {
      // Generate 8-character codes in format: XXXX-XXXX
      const code = randomBytes(4).toString('hex').toUpperCase();
      codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
    }
    
    return codes;
  }

  /**
   * Verify if a backup code is valid
   * Note: In production, backup codes should be hashed in the database
   */
  static verifyBackupCode(providedCode: string, storedCodes: string[]): boolean {
    const normalizedCode = providedCode.toUpperCase().replace(/\s/g, '');
    return storedCodes.some(code => code === normalizedCode);
  }

  /**
   * Get current TOTP token (for testing)
   */
  static getCurrentToken(secret: string): string {
    return speakeasy.totp({
      secret,
      encoding: 'base32',
    });
  }
}
