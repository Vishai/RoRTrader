import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12; // High security standard

export class PasswordUtil {
  /**
   * Hash a plain text password
   */
  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Verify a password against a hash
   */
  static async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Validate password strength
   * Returns an array of errors, empty if valid
   */
  static validateStrength(password: string): string[] {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return errors;
  }

  /**
   * Check if password meets minimum requirements
   * (at least 3 out of 5 requirements)
   */
  static isStrongEnough(password: string): boolean {
    let metRequirements = 0;

    if (password.length >= 8) metRequirements++;
    if (/[A-Z]/.test(password)) metRequirements++;
    if (/[a-z]/.test(password)) metRequirements++;
    if (/\d/.test(password)) metRequirements++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) metRequirements++;

    return metRequirements >= 3;
  }
}
