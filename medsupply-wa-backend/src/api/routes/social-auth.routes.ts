import { Router, Request, Response } from 'express';
import passport from 'passport';
import { SocialAuthService } from '../../services/auth/social-auth.service';
import { DatabaseService } from '../../core/database/database.service';
import { LoggerService } from '../../core/logger/logger.service';

export function createSocialAuthRoutes(
  databaseService: DatabaseService, 
  logger: LoggerService
) {
  console.log('🚀 Creating Social Auth routes...');
  
  const router = Router();
  const socialAuthService = new SocialAuthService(databaseService, logger);

  // Initialize Passport
  router.use(passport.initialize());

  // Google OAuth routes
  router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
  }));

  router.get('/google/callback', 
    passport.authenticate('google', { session: false }),
    async (req: Request, res: Response) => {
      try {
        const user = req.user as any;
        const result = await socialAuthService.processSocialCallback(user);
        
        if (result.success) {
          // Redirect to frontend with token
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
          const redirectUrl = `${frontendUrl}/auth/callback?token=${result.token}&provider=google`;
          res.redirect(redirectUrl);
        } else {
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
          const redirectUrl = `${frontendUrl}/login?error=${encodeURIComponent(result.error || 'Authentication failed')}`;
          res.redirect(redirectUrl);
        }
      } catch (error) {
        console.error('Google callback error:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const redirectUrl = `${frontendUrl}/login?error=${encodeURIComponent('Authentication failed')}`;
        res.redirect(redirectUrl);
      }
    }
  );

  // Microsoft OAuth routes
  router.get('/microsoft', passport.authenticate('microsoft', {
    scope: ['user.read']
  }));

  router.get('/microsoft/callback',
    passport.authenticate('microsoft', { session: false }),
    async (req: Request, res: Response) => {
      try {
        const user = req.user as any;
        const result = await socialAuthService.processSocialCallback(user);
        
        if (result.success) {
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
          const redirectUrl = `${frontendUrl}/auth/callback?token=${result.token}&provider=microsoft`;
          res.redirect(redirectUrl);
        } else {
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
          const redirectUrl = `${frontendUrl}/login?error=${encodeURIComponent(result.error || 'Authentication failed')}`;
          res.redirect(redirectUrl);
        }
      } catch (error) {
        console.error('Microsoft callback error:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const redirectUrl = `${frontendUrl}/login?error=${encodeURIComponent('Authentication failed')}`;
        res.redirect(redirectUrl);
      }
    }
  );

  // Apple OAuth routes
  router.get('/apple', passport.authenticate('apple'));

  router.post('/apple/callback',
    passport.authenticate('apple', { session: false }),
    async (req: Request, res: Response) => {
      try {
        const user = req.user as any;
        const result = await socialAuthService.processSocialCallback(user);
        
        if (result.success) {
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
          const redirectUrl = `${frontendUrl}/auth/callback?token=${result.token}&provider=apple`;
          res.redirect(redirectUrl);
        } else {
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
          const redirectUrl = `${frontendUrl}/login?error=${encodeURIComponent(result.error || 'Authentication failed')}`;
          res.redirect(redirectUrl);
        }
      } catch (error) {
        console.error('Apple callback error:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const redirectUrl = `${frontendUrl}/login?error=${encodeURIComponent('Authentication failed')}`;
        res.redirect(redirectUrl);
      }
    }
  );

  // Get available OAuth providers
  router.get('/providers', (_req: Request, res: Response) => {
    try {
      const providers = socialAuthService.getAvailableProviders();
      const oauthUrls = socialAuthService.getOAuthUrls();
      
      res.json({
        success: true,
        providers: providers.map(provider => ({
          name: provider,
          url: oauthUrls[provider as keyof typeof oauthUrls],
          enabled: true
        }))
      });
    } catch (error) {
      console.error('Error getting OAuth providers:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get OAuth providers'
      });
    }
  });

  // Test endpoint
  router.get('/test', (_req: Request, res: Response) => {
    res.json({ 
      message: 'Social auth routes are working!', 
      timestamp: new Date().toISOString(),
      configured: socialAuthService.isSocialAuthConfigured(),
      providers: socialAuthService.getAvailableProviders()
    });
  });

  console.log('✅ Social Auth routes created successfully');
  return router;
}
