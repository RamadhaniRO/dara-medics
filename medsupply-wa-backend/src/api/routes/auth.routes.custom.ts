import { Router, Request, Response } from 'express';
import { DatabaseService } from '../../core/database/database.service';
import { LoggerService } from '../../core/logger/logger.service';

// Simple and direct auth routes implementation
export function createAuthRoutes(databaseService: DatabaseService, logger: LoggerService) {
  console.log('🚀 Creating SIMPLE auth routes...');
  
  const router = Router();

  // Simple test endpoint
  router.get('/test', (req: Request, res: Response) => {
    console.log('✅ Test endpoint hit!');
    res.json({ message: 'Simple auth routes are working!', timestamp: new Date().toISOString() });
  });

  // Simple registration endpoint - Direct approach
  router.post('/register', async (req: Request, res: Response) => {
    console.log('🎯 SIMPLE REGISTRATION STARTED');
    console.log('📨 Request body:', req.body);
    
    try {
      const { pharmacyName, email, password, confirmPassword } = req.body;

      // Basic validation
      if (!pharmacyName || !email || !password || !confirmPassword) {
        console.log('❌ Missing fields');
        return res.status(400).json({ 
          success: false,
          error: 'All fields are required' 
        });
      }

      if (password !== confirmPassword) {
        console.log('❌ Passwords do not match');
        return res.status(400).json({ 
          success: false,
          error: 'Passwords do not match' 
        });
      }

      if (password.length < 6) {
        console.log('❌ Password too short');
        return res.status(400).json({ 
          success: false,
          error: 'Password must be at least 6 characters' 
        });
      }

      console.log('✅ Validation passed');

      // Check if user exists using direct Supabase query
      console.log('🔍 Checking if user exists...');
      const { data: existingUsers, error: userError } = await databaseService.supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .limit(1);

      if (userError) {
        console.log('❌ Error checking user:', userError);
        return res.status(500).json({ 
          success: false,
          error: 'Database error' 
        });
      }

      if (existingUsers && existingUsers.length > 0) {
        console.log('❌ User already exists');
        return res.status(400).json({ 
          success: false,
          error: 'User with this email already exists' 
        });
      }

      console.log('✅ No existing user found');

      // Create pharmacy using direct Supabase query
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

      // Hash password
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user using direct Supabase query
      console.log('👤 Creating user...');
      const userData = {
        email: email,
        name: pharmacyName,
        password_hash: hashedPassword,
        role: 'pharmacy',
        pharmacy_id: newPharmacy.id,
        phone: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newUser, error: userCreateError } = await databaseService.supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (userCreateError) {
        console.log('❌ Error creating user:', userCreateError);
        return res.status(500).json({ 
          success: false,
          error: 'Failed to create user' 
        });
      }

      console.log('✅ User created:', newUser.id);

      // Generate verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
      console.log('📧 Generated verification code:', verificationCode);

      // Store verification code in database (you could create a separate table for this)
      // For now, let's store it in the user record temporarily
      const { error: updateError } = await databaseService.supabase
        .from('users')
        .update({ 
          verification_code: verificationCode,
          verification_expires: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
        })
        .eq('id', newUser.id);

      if (updateError) {
        console.log('❌ Error storing verification code:', updateError);
        // Don't fail registration, just log the error
      }

      // Send verification email (simplified - in production, use a proper email service)
      console.log('📧 Sending verification email...');
      try {
        // For development, we'll just log the verification code
        // In production, you would integrate with SendGrid, AWS SES, or similar
        console.log('📧 VERIFICATION EMAIL CONTENT:');
        console.log('To:', email);
        console.log('Subject: Verify your DARA Medics account');
        console.log('Body: Your verification code is:', verificationCode);
        console.log('This code expires in 15 minutes.');
        
        // TODO: Replace with actual email sending service
        // await emailService.sendVerificationEmail(email, verificationCode);
        
        console.log('✅ Verification email sent (logged for development)');
      } catch (emailError) {
        console.log('❌ Error sending verification email:', emailError);
        // Don't fail registration, just log the error
      }

      console.log('🎉 SIMPLE REGISTRATION COMPLETED SUCCESSFULLY');

      const response = {
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        verificationCode: verificationCode, // Include for development testing
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          pharmacy_id: newUser.pharmacy_id
        },
        pharmacy: {
          id: newPharmacy.id,
          name: newPharmacy.name,
          email: newPharmacy.email
        }
      };

      console.log('📤 Sending success response');
      return res.status(201).json(response);

    } catch (error) {
      console.log('❌ SIMPLE REGISTRATION ERROR:', error);
      
      return res.status(500).json({ 
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed' 
      });
    }
  });

  // Simple login endpoint
  router.post('/login', async (req: Request, res: Response) => {
    console.log('🔐 SIMPLE LOGIN STARTED');
    
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          success: false,
          error: 'Email and password are required' 
        });
      }

      // Get user from database
      const { data: user, error } = await databaseService.supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !user) {
        return res.status(401).json({ 
          success: false,
          error: 'Invalid credentials' 
        });
      }

      // Verify password
      const bcrypt = require('bcryptjs');
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false,
          error: 'Invalid credentials' 
        });
      }

      // Generate JWT token
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );

      console.log('✅ SIMPLE LOGIN SUCCESSFUL');

      return res.status(200).json({
        success: true,
        token: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          pharmacy_id: user.pharmacy_id
        }
      });

    } catch (error) {
      console.log('❌ SIMPLE LOGIN ERROR:', error);
      
      return res.status(500).json({ 
        success: false,
        error: error instanceof Error ? error.message : 'Login failed' 
      });
    }
  });

  // Simple verification endpoint
  router.post('/verify', async (req: Request, res: Response) => {
    console.log('🔐 SIMPLE VERIFICATION STARTED');
    
    try {
      const { email, verificationCode } = req.body;

      if (!email || !verificationCode) {
        return res.status(400).json({ 
          success: false,
          error: 'Email and verification code are required' 
        });
      }

      // Get user from database
      const { data: user, error } = await databaseService.supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !user) {
        return res.status(404).json({ 
          success: false,
          error: 'User not found' 
        });
      }

      // Check if verification code matches
      if (user.verification_code !== verificationCode) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid verification code' 
        });
      }

      // Check if verification code is expired
      if (user.verification_expires && new Date() > new Date(user.verification_expires)) {
        return res.status(400).json({ 
          success: false,
          error: 'Verification code has expired' 
        });
      }

      // Mark user as verified
      const { error: updateError } = await databaseService.supabase
        .from('users')
        .update({ 
          is_verified: true,
          verification_code: null,
          verification_expires: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.log('❌ Error updating user verification:', updateError);
        return res.status(500).json({ 
          success: false,
          error: 'Failed to verify account' 
        });
      }

      console.log('✅ SIMPLE VERIFICATION SUCCESSFUL');

      return res.status(200).json({
        success: true,
        message: 'Account verified successfully!',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          pharmacy_id: user.pharmacy_id,
          is_verified: true
        }
      });

    } catch (error) {
      console.log('❌ SIMPLE VERIFICATION ERROR:', error);
      
      return res.status(500).json({ 
        success: false,
        error: error instanceof Error ? error.message : 'Verification failed' 
      });
    }
  });

  console.log('✅ SIMPLE auth routes created successfully');
  return router;
}
