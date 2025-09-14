import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { DatabaseService } from '../../core/database/database.service';
import { LoggerService } from '../../core/logger/logger.service';

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface TwoFactorVerification {
  isValid: boolean;
  backupCodeUsed?: boolean;
}

export class TwoFactorService {
  constructor(
    private databaseService: DatabaseService,
    private logger: LoggerService
  ) {
    // Configure OTP settings
    authenticator.options = {
      window: 2, // Allow 2 time steps (60 seconds) of tolerance
      step: 30   // 30 second time step
    };
  }

  /**
   * Generate a new 2FA secret for a user
   */
  async generateSecret(userId: string, userEmail: string): Promise<TwoFactorSetup> {
    try {
      // Generate secret
      const secret = authenticator.generateSecret();
      
      // Generate service name (could be configurable)
      const serviceName = 'MedSupply-WA';
      const accountName = userEmail;
      
      // Generate OTP URL
      const otpUrl = authenticator.keyuri(accountName, serviceName, secret);
      
      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(otpUrl);
      
      // Generate backup codes
      const backupCodes = this.generateBackupCodes();
      
      // Store secret and backup codes in database
      await this.storeTwoFactorData(userId, secret, backupCodes);
      
      this.logger.info(`2FA secret generated for user: ${userId}`);
      
      return {
        secret,
        qrCodeUrl,
        backupCodes
      };
    } catch (error) {
      this.logger.error('Error generating 2FA secret:', error);
      throw new Error('Failed to generate 2FA secret');
    }
  }

  /**
   * Verify a 2FA token
   */
  async verifyToken(userId: string, token: string): Promise<TwoFactorVerification> {
    try {
      // Get user's 2FA data
      const twoFactorData = await this.getTwoFactorData(userId);
      if (!twoFactorData) {
        return { isValid: false };
      }

      // Check if 2FA is enabled
      if (!twoFactorData.two_factor_enabled) {
        return { isValid: false };
      }

      // Verify the token
      const isValid = authenticator.verify({
        token,
        secret: twoFactorData.two_factor_secret
      });

      if (isValid) {
        // Update last successful verification
        await this.updateLastVerification(userId);
        this.logger.info(`2FA token verified for user: ${userId}`);
        return { isValid: true };
      }

      // If token is invalid, check backup codes
      const backupCodeUsed = await this.verifyBackupCode(userId, token);
      if (backupCodeUsed) {
        this.logger.info(`Backup code used for user: ${userId}`);
        return { isValid: true, backupCodeUsed: true };
      }

      return { isValid: false };
    } catch (error) {
      this.logger.error('Error verifying 2FA token:', error);
      throw new Error('Failed to verify 2FA token');
    }
  }

  /**
   * Enable 2FA for a user after they verify the setup
   */
  async enableTwoFactor(userId: string, token: string): Promise<boolean> {
    try {
      // Get user's 2FA data
      const twoFactorData = await this.getTwoFactorData(userId);
      if (!twoFactorData || !twoFactorData.two_factor_secret) {
        throw new Error('2FA setup not found');
      }

      // Verify the token
      const isValid = authenticator.verify({
        token,
        secret: twoFactorData.two_factor_secret
      });

      if (!isValid) {
        return false;
      }

      // Enable 2FA
      const supabase = this.databaseService.supabase;
      if (!supabase) {
        throw new Error('Database service not available');
      }
      await supabase
        .from('users')
        .update({ 
          two_factor_enabled: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      this.logger.info(`2FA enabled for user: ${userId}`);
      return true;
    } catch (error) {
      this.logger.error('Error enabling 2FA:', error);
      throw new Error('Failed to enable 2FA');
    }
  }

  /**
   * Disable 2FA for a user
   */
  async disableTwoFactor(userId: string, password: string): Promise<boolean> {
    try {
      // Verify password first
      const user = await this.getUserPasswordHash(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const bcrypt = require('bcryptjs');
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return false;
      }

      // Disable 2FA and clear secret
      const supabase = this.databaseService.supabase;
      if (!supabase) {
        throw new Error('Database service not available');
      }
      await supabase
        .from('users')
        .update({ 
          two_factor_enabled: false,
          two_factor_secret: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      this.logger.info(`2FA disabled for user: ${userId}`);
      return true;
    } catch (error) {
      this.logger.error('Error disabling 2FA:', error);
      throw new Error('Failed to disable 2FA');
    }
  }

  /**
   * Generate new backup codes
   */
  async regenerateBackupCodes(userId: string): Promise<string[]> {
    try {
      const backupCodes = this.generateBackupCodes();
      
      // Store new backup codes
      await this.storeBackupCodes(userId, backupCodes);
      
      this.logger.info(`Backup codes regenerated for user: ${userId}`);
      return backupCodes;
    } catch (error) {
      this.logger.error('Error regenerating backup codes:', error);
      throw new Error('Failed to regenerate backup codes');
    }
  }

  /**
   * Check if user has 2FA enabled
   */
  async isTwoFactorEnabled(userId: string): Promise<boolean> {
    try {
      const supabase = this.databaseService.supabase;
    if (!supabase) {
      throw new Error('Database service not available');
    }
    const { data, error } = await supabase
        .from('users')
        .select('two_factor_enabled')
        .eq('id', userId)
        .single();

      if (error) {
        this.logger.error('Error checking 2FA status:', error);
        return false;
      }

      return data?.two_factor_enabled || false;
    } catch (error) {
      this.logger.error('Error checking 2FA status:', error);
      return false;
    }
  }

  private async getTwoFactorData(userId: string): Promise<any> {
    const supabase = this.databaseService.supabase;
    if (!supabase) {
      throw new Error('Database service not available');
    }
    const { data, error } = await supabase
      .from('users')
      .select('two_factor_enabled, two_factor_secret')
      .eq('id', userId)
      .single();

    if (error) {
      this.logger.error('Error fetching 2FA data:', error);
      return null;
    }

    return data;
  }

  private async getUserPasswordHash(userId: string): Promise<any> {
    const supabase = this.databaseService.supabase;
    if (!supabase) {
      throw new Error('Database service not available');
    }
    const { data, error } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .single();

    if (error) {
      this.logger.error('Error fetching user password hash:', error);
      return null;
    }

    return data;
  }

  private async storeTwoFactorData(userId: string, secret: string, backupCodes: string[]): Promise<void> {
    // Store secret
    const supabase = this.databaseService.supabase;
    if (!supabase) {
      throw new Error('Database service not available');
    }
    await supabase
      .from('users')
      .update({ 
        two_factor_secret: secret,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    // Store backup codes (in a separate table or as JSON)
    await this.storeBackupCodes(userId, backupCodes);
  }

  private async storeBackupCodes(userId: string, backupCodes: string[]): Promise<void> {
    // Hash backup codes before storing
    const bcrypt = require('bcryptjs');
    const hashedCodes = await Promise.all(
      backupCodes.map(code => bcrypt.hash(code, 10))
    );

    // Store in a separate table or as JSON in user table
    // For simplicity, storing as JSON in user table
    const supabase = this.databaseService.supabase;
    if (!supabase) {
      throw new Error('Database service not available');
    }
    await supabase
      .from('users')
      .update({ 
        backup_codes: JSON.stringify(hashedCodes),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
  }

  private async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    try {
      const supabase = this.databaseService.supabase;
    if (!supabase) {
      throw new Error('Database service not available');
    }
    const { data, error } = await supabase
        .from('users')
        .select('backup_codes')
        .eq('id', userId)
        .single();

      if (error || !data?.backup_codes) {
        return false;
      }

      const hashedCodes = JSON.parse(data.backup_codes);
      const bcrypt = require('bcryptjs');

      // Check if code matches any backup code
      for (let i = 0; i < hashedCodes.length; i++) {
        const isValid = await bcrypt.compare(code, hashedCodes[i]);
        if (isValid) {
          // Remove used backup code
          hashedCodes.splice(i, 1);
          const supabase = this.databaseService.supabase;
      if (!supabase) {
        throw new Error('Database service not available');
      }
      await supabase
            .from('users')
            .update({ 
              backup_codes: JSON.stringify(hashedCodes),
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);
          return true;
        }
      }

      return false;
    } catch (error) {
      this.logger.error('Error verifying backup code:', error);
      return false;
    }
  }

  private async updateLastVerification(userId: string): Promise<void> {
    const supabase = this.databaseService.supabase;
    if (!supabase) {
      throw new Error('Database service not available');
    }
    await supabase
      .from('users')
      .update({ 
        last_2fa_verification: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
  }

  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      // Generate 8-character alphanumeric codes
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }
}
