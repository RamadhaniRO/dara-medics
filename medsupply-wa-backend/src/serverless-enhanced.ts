import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: any = null;
let supabaseAdmin: any = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('✅ Supabase client initialized');
  
  if (supabaseServiceKey) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    console.log('✅ Supabase admin client initialized');
  }
} else {
  console.warn('⚠️ Supabase environment variables not found - running in mock mode');
}

// Basic middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://dara-medics-frontend.vercel.app',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check route (always works)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    supabase_connected: !!supabase,
    supabase_admin_connected: !!supabaseAdmin
  });
});

// Authentication routes with Supabase integration
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    if (!supabase) {
      return res.status(500).json({
        error: 'Supabase not configured',
        message: 'Please add SUPABASE_URL and SUPABASE_ANON_KEY environment variables'
      });
    }

    // Use Supabase authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: error.message
      });
    }

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: data.user?.id,
        email: data.user?.email,
        full_name: data.user?.user_metadata?.full_name,
        pharmacy_name: data.user?.user_metadata?.pharmacy_name
      },
      session: data.session,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, full_name, pharmacy_name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    if (!supabase) {
      return res.status(500).json({
        error: 'Supabase not configured',
        message: 'Please add SUPABASE_URL and SUPABASE_ANON_KEY environment variables'
      });
    }

    // Use Supabase authentication
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: full_name || email.split('@')[0],
          pharmacy_name: pharmacy_name || 'My Pharmacy'
        },
        emailRedirectTo: `${process.env.EMAIL_REDIRECT_TO || 'https://dara-medics-frontend.vercel.app'}/auth/verify`
      }
    });

    if (error) {
      return res.status(400).json({
        error: 'Registration failed',
        message: error.message
      });
    }

    res.status(200).json({
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: data.user?.id,
        email: data.user?.email,
        full_name: data.user?.user_metadata?.full_name,
        pharmacy_name: data.user?.user_metadata?.pharmacy_name
      },
      needs_verification: !data.session,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Email verification endpoint
app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { token, type } = req.body;
    
    if (!token || !type) {
      return res.status(400).json({
        error: 'Token and type are required'
      });
    }

    if (!supabase) {
      return res.status(500).json({
        error: 'Supabase not configured'
      });
    }

    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type as any
    });

    if (error) {
      return res.status(400).json({
        error: 'Email verification failed',
        message: error.message
      });
    }

    res.status(200).json({
      message: 'Email verified successfully',
      user: data.user,
      session: data.session,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Resend verification email
app.post('/api/auth/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        error: 'Email is required'
      });
    }

    if (!supabase) {
      return res.status(500).json({
        error: 'Supabase not configured'
      });
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${process.env.EMAIL_REDIRECT_TO || 'https://dara-medics-frontend.vercel.app'}/auth/verify`
      }
    });

    if (error) {
      return res.status(400).json({
        error: 'Failed to resend verification email',
        message: error.message
      });
    }

    res.status(200).json({
      message: 'Verification email sent successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Social authentication endpoints
app.post('/api/auth/google', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({
        error: 'Supabase not configured'
      });
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.CORS_ORIGIN || 'https://dara-medics-frontend.vercel.app'}/auth/callback`
      }
    });

    if (error) {
      return res.status(400).json({
        error: 'Google authentication failed',
        message: error.message
      });
    }

    res.status(200).json({
      message: 'Redirecting to Google authentication',
      url: data.url,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Catch-all route for testing
app.get('*', (req, res) => {
  res.status(200).json({
    message: 'DARA Medics Backend API',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    supabase_connected: !!supabase,
    endpoints: [
      'GET /health - Health check',
      'POST /api/auth/login - User login',
      'POST /api/auth/register - User registration',
      'POST /api/auth/verify-email - Email verification',
      'POST /api/auth/resend-verification - Resend verification',
      'POST /api/auth/google - Google OAuth'
    ]
  });
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error instanceof Error ? error.message : 'Unknown error',
    timestamp: new Date().toISOString()
  });
});

// Export for Vercel
export default app;
