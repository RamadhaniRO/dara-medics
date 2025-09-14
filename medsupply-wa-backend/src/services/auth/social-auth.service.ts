import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import { Strategy as AppleStrategy } from 'passport-apple';
import { DatabaseService } from '../../core/database/database.service';
import { LoggerService } from '../../core/logger/logger.service';

export interface SocialUser {
  id: string;
  email: string;
  name: string;
  provider: 'google' | 'microsoft' | 'apple';
  profilePicture?: string;
}

export interface SocialAuthResult {
  success: boolean;
  user?: SocialUser;
  token?: string;
  error?: string;
}

export class SocialAuthService {
  private databaseService: DatabaseService;
  private logger: LoggerService;

  constructor(databaseService: DatabaseService, logger: LoggerService) {
    this.databaseService = databaseService;
    this.logger = logger;
    this.initializeStrategies();
  }

  private initializeStrategies() {
    this.logger.info('Initializing social authentication strategies...');

    // Google OAuth Strategy
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.API_BASE_URL || 'http://localhost:3001'}/api/auth/google/callback`
      }, async (_accessToken, _refreshToken, profile, done) => {
        try {
          const socialUser = await this.handleSocialLogin(profile, 'google');
          return done(null, socialUser);
        } catch (error) {
          this.logger.error('Google OAuth error:', error);
          return done(error, undefined);
        }
      }));
    }

    // Microsoft OAuth Strategy
    if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
      passport.use(new MicrosoftStrategy({
        clientID: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        callbackURL: `${process.env.API_BASE_URL || 'http://localhost:3001'}/api/auth/microsoft/callback`,
        scope: ['user.read']
      }, async (_accessToken: any, _refreshToken: any, profile: any, done: any) => {
        try {
          const socialUser = await this.handleSocialLogin(profile, 'microsoft');
          return done(null, socialUser);
        } catch (error) {
          this.logger.error('Microsoft OAuth error:', error);
          return done(error, undefined);
        }
      }));
    }

    // Apple OAuth Strategy
    if (process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY) {
      passport.use(new AppleStrategy({
        clientID: process.env.APPLE_CLIENT_ID,
        teamID: process.env.APPLE_TEAM_ID,
        keyID: process.env.APPLE_KEY_ID,
        privateKeyString: process.env.APPLE_PRIVATE_KEY,
        callbackURL: `${process.env.API_BASE_URL || 'http://localhost:3001'}/api/auth/apple/callback`
      }, async (_accessToken: any, _refreshToken: any, profile: any, done: any) => {
        try {
          const socialUser = await this.handleSocialLogin(profile, 'apple');
          return done(null, socialUser);
        } catch (error) {
          this.logger.error('Apple OAuth error:', error);
          return done(error, undefined);
        }
      }));
    }
  }

  private async handleSocialLogin(profile: any, provider: 'google' | 'microsoft' | 'apple'): Promise<SocialUser> {
    const email = profile.emails?.[0]?.value || profile.email;
    const name = profile.displayName || profile.name?.givenName + ' ' + profile.name?.familyName || 'Unknown User';
    const profilePicture = profile.photos?.[0]?.value || profile.picture;

    if (!email) {
      throw new Error('No email found in social profile');
    }

    this.logger.info(`Processing ${provider} login for user: ${email}`);

    // Check if user already exists
    const { data: existingUser, error: userError } = await this.databaseService.supabase!
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError && userError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Database error: ${userError.message}`);
    }

    if (existingUser) {
      // Update user with social provider info if needed
      const { error: updateError } = await this.databaseService.supabase!
        .from('users')
        .update({
          social_provider: provider,
          social_id: profile.id,
          profile_picture: profilePicture,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id);

      if (updateError) {
        this.logger.warn(`Failed to update user social info: ${updateError.message}`);
      }

      return {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name || name,
        provider,
        profilePicture
      };
    }

    // Create new user
    const { data: newUser, error: createError } = await this.databaseService.supabase!
      .from('users')
      .insert({
        email: email,
        name: name,
        social_provider: provider,
        social_id: profile.id,
        profile_picture: profilePicture,
        is_verified: true, // Social logins are considered verified
        role: 'pharmacy',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      throw new Error(`Failed to create user: ${createError.message}`);
    }

    this.logger.info(`Created new user via ${provider}: ${email}`);

    return {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      provider,
      profilePicture
    };
  }

  async generateJWTToken(user: SocialUser): Promise<string> {
    const jwt = require('jsonwebtoken');
    const payload = {
      userId: user.id,
      email: user.email,
      provider: user.provider,
      role: 'pharmacy'
    };

    return jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret', {
      expiresIn: '24h'
    });
  }

  async processSocialCallback(user: SocialUser): Promise<SocialAuthResult> {
    try {
      const token = await this.generateJWTToken(user);
      
      this.logger.info(`Social login successful for ${user.provider} user: ${user.email}`);

      return {
        success: true,
        user,
        token
      };
    } catch (error) {
      this.logger.error('Social callback processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Social authentication failed'
      };
    }
  }

  // Get OAuth URLs for frontend
  getOAuthUrls(): { google?: string; microsoft?: string; apple?: string } {
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
    const urls: { google?: string; microsoft?: string; apple?: string } = {};

    if (process.env.GOOGLE_CLIENT_ID) {
      urls.google = `${baseUrl}/api/auth/google`;
    }

    if (process.env.MICROSOFT_CLIENT_ID) {
      urls.microsoft = `${baseUrl}/api/auth/microsoft`;
    }

    if (process.env.APPLE_CLIENT_ID) {
      urls.apple = `${baseUrl}/api/auth/apple`;
    }

    return urls;
  }

  // Check if social auth is configured
  isSocialAuthConfigured(): boolean {
    return !!(
      process.env.GOOGLE_CLIENT_ID ||
      process.env.MICROSOFT_CLIENT_ID ||
      process.env.APPLE_CLIENT_ID
    );
  }

  getAvailableProviders(): string[] {
    const providers: string[] = [];
    
    if (process.env.GOOGLE_CLIENT_ID) providers.push('google');
    if (process.env.MICROSOFT_CLIENT_ID) providers.push('microsoft');
    if (process.env.APPLE_CLIENT_ID) providers.push('apple');
    
    return providers;
  }
}

export default SocialAuthService;
