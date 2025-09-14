import { Router, Request, Response } from 'express';
import { DatabaseService } from '../../core/database/database.service';
import { LoggerService } from '../../core/logger/logger.service';
import { authConfig } from '../../core/config/auth.config';

// Minimal auth routes - Supabase handles everything
export function createAuthRoutes(databaseService: DatabaseService, logger: LoggerService) {
  console.log('🚀 Creating MINIMAL SUPABASE AUTH routes...');
  console.log('🌍 Environment:', authConfig.environment);
  console.log('📧 Email confirmation enabled:', authConfig.supabase.enableEmailConfirmation);
  console.log('🔗 Email redirect to:', authConfig.supabase.emailRedirectTo || 'disabled');
  
  const router = Router();

  // Test endpoint
  router.get('/test', (req: Request, res: Response) => {
    console.log('✅ Test endpoint hit!');
    res.json({ message: 'Minimal Supabase auth routes are working!', timestamp: new Date().toISOString() });
  });

  // Registration - Let Supabase handle everything
  router.post('/register', async (req: Request, res: Response) => {
    console.log('🎯 MINIMAL REGISTRATION STARTED');
    console.log('📨 Request body:', req.body);
    
    try {
      const { pharmacyName, email, password, confirmPassword } = req.body;

      // Basic validation
      if (!pharmacyName || !email || !password || !confirmPassword) {
        return res.status(400).json({ 
          success: false,
          error: 'All fields are required' 
        });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ 
          success: false,
          error: 'Passwords do not match' 
        });
      }

      if (password.length < 6) {
        return res.status(400).json({ 
          success: false,
          error: 'Password must be at least 6 characters' 
        });
      }

      console.log('✅ Validation passed');

      // Create pharmacy first
      console.log('🏥 Creating pharmacy...');
      const pharmacyData = {
        name: pharmacyName,
        contact_person: pharmacyName,
        phone: '',
        email: email,
        address: '',
        city: '',
        state: '',
        country: 'Tanzania',
        postal_code: '',
        license_number: `LIC-${Date.now()}`,
        delivery_radius: 50,
        delivery_fee: 0,
        min_order_amount: 0,
        active: true,
        verified: false
      };

      const { data: newPharmacy, error: pharmacyError } = await databaseService.supabase
        .from('pharmacies')
        .insert(pharmacyData)
        .select()
        .single();

      if (pharmacyError) {
        console.log('❌ Error creating pharmacy:', pharmacyError);
        return res.status(500).json({ 
          success: false,
          error: 'Failed to create pharmacy' 
        });
      }

      console.log('✅ Pharmacy created:', newPharmacy.id);

      // Let Supabase Auth handle user creation and email verification
      console.log('👤 Creating user with Supabase Auth...');
      
      // For localhost development, disable email confirmation
      const { data: authData, error: authError } = await databaseService.supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            name: pharmacyName,
            pharmacy_id: newPharmacy.id,
            role: 'pharmacy'
          },
          // Use environment-specific email redirect configuration
          emailRedirectTo: authConfig.supabase.emailRedirectTo
        }
      });

      if (authError) {
        console.log('❌ Supabase Auth error:', authError);
        return res.status(500).json({ 
          success: false,
          error: authError.message || 'Failed to create user account' 
        });
      }

      console.log('✅ User created with Supabase Auth:', authData.user?.id);
      console.log('📧 Supabase will send verification email automatically');

      // Note: We don't need to create a user record in our users table
      // since Supabase Auth handles all user management
      // The user data is available through authData.user and authData.session

      console.log('🎉 MINIMAL REGISTRATION COMPLETED SUCCESSFULLY');

      return res.status(201).json({
        success: true,
        message: 'Registration successful! You can now log in.',
        user: {
          id: authData.user?.id,
          name: pharmacyName,
          email: email,
          role: 'pharmacy',
          pharmacy_id: newPharmacy.id,
          email_confirmed: authData.user?.email_confirmed_at ? true : false
        },
        pharmacy: {
          id: newPharmacy.id,
          name: newPharmacy.name,
          email: newPharmacy.email
        }
      });

    } catch (error) {
      console.log('❌ MINIMAL REGISTRATION ERROR:', error);
      
      return res.status(500).json({ 
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed' 
      });
    }
  });

  // Login - Let Supabase handle everything
  router.post('/login', async (req: Request, res: Response) => {
    console.log('🔐 MINIMAL LOGIN STARTED');
    console.log('📨 Request body:', req.body);
    console.log('📨 Request headers:', req.headers);
    
    try {
      const { email, password } = req.body;

      console.log('📧 Extracted email:', email);
      console.log('🔑 Extracted password:', password ? '***' : 'undefined');

      if (!email || !password) {
        console.log('❌ Missing email or password:', { email: !!email, password: !!password });
        return res.status(400).json({ 
          success: false,
          error: 'Email and password are required' 
        });
      }

      // Try Supabase Auth first
      const { data: authData, error: authError } = await databaseService.supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (authError) {
        console.log('❌ Supabase Auth login error:', authError);
        
        // Fallback: Check database directly for development/testing
        if (authConfig.environment === 'development') {
          console.log('🔧 Development mode: Checking database directly...');
          
          const { data: user, error: userError } = await databaseService.supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

          if (!userError && user) {
            // Verify password
            const bcrypt = require('bcryptjs');
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            
            if (isValidPassword) {
              console.log('✅ Database login successful');
              
              // Generate JWT token for database user
              const jwt = require('jsonwebtoken');
              const token = jwt.sign(
                { userId: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET || 'fallback-secret',
                { expiresIn: '24h' }
              );
              
              return res.status(200).json({
                success: true,
                token: token,
                user: {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  role: user.role,
                  pharmacy: user.pharmacy_id,
                  email_confirmed: user.is_verified
                }
              });
            }
          }
        }
        
        return res.status(401).json({ 
          success: false,
          error: authError.message || 'Invalid credentials' 
        });
      }

      console.log('✅ MINIMAL LOGIN SUCCESSFUL');

      return res.status(200).json({
        success: true,
        token: authData.session?.access_token,
        user: {
          id: authData.user?.id,
          email: authData.user?.email,
          email_confirmed: authData.user?.email_confirmed_at ? true : false,
          user_metadata: authData.user?.user_metadata
        }
      });

    } catch (error) {
      console.log('❌ MINIMAL LOGIN ERROR:', error);
      
      return res.status(500).json({ 
        success: false,
        error: error instanceof Error ? error.message : 'Login failed' 
      });
    }
  });

  // Logout - Let Supabase handle everything
  router.post('/logout', async (req: Request, res: Response) => {
    console.log('🚪 MINIMAL LOGOUT STARTED');
    
    try {
      const { error } = await databaseService.supabase.auth.signOut();

      if (error) {
        console.log('❌ Supabase Auth logout error:', error);
        return res.status(500).json({ 
          success: false,
          error: error.message || 'Logout failed' 
        });
      }

      console.log('✅ MINIMAL LOGOUT SUCCESSFUL');

      return res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });

    } catch (error) {
      console.log('❌ MINIMAL LOGOUT ERROR:', error);
      
      return res.status(500).json({ 
        success: false,
        error: error instanceof Error ? error.message : 'Logout failed' 
      });
    }
  });

  // Token validation endpoint
  router.get('/validate', async (req: Request, res: Response) => {
    console.log('🔍 TOKEN VALIDATION STARTED');
    
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('❌ No token provided');
        return res.status(401).json({ error: 'No token provided' });
      }

      const token = authHeader.substring(7);
      console.log('🔑 Token extracted:', token ? '***' : 'undefined');
      
      try {
        // First try Supabase Auth validation
        const { data: { user }, error } = await databaseService.supabase.auth.getUser(token);
        
        if (!error && user) {
          console.log('✅ Supabase token validation successful for user:', user.email);
          return res.status(200).json({
            id: user.id,
            name: user.user_metadata?.name || user.email,
            email: user.email,
            role: user.user_metadata?.role || 'user',
            pharmacy: user.user_metadata?.pharmacy_id
          });
        }
        
        // Fallback: Try custom JWT validation
        console.log('🔧 Supabase validation failed, trying custom JWT...');
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
        
        // Get user from database
        const { data: userData, error: userError } = await databaseService.supabase
          .from('users')
          .select('*')
          .eq('id', decoded.userId)
          .single();
          
        if (userError || !userData) {
          console.log('❌ User not found in database:', userError?.message);
          return res.status(401).json({ error: 'Invalid token' });
        }
        
        console.log('✅ Custom JWT validation successful for user:', userData.email);
        return res.status(200).json({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          pharmacy: userData.pharmacy_id
        });
        
      } catch (jwtError) {
        console.log('❌ JWT validation error:', jwtError);
        return res.status(401).json({ error: 'Invalid token' });
      }
    } catch (error) {
      console.log('❌ TOKEN VALIDATION ERROR:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  console.log('✅ MINIMAL SUPABASE auth routes created successfully');
  return router;
}