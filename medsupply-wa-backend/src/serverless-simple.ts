import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

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
    version: '1.0.0'
  });
});

// Basic auth routes (simplified for serverless)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // For now, return a simple response
    // This will be replaced with actual Supabase auth once env vars are set
    res.status(200).json({
      message: 'Login endpoint working',
      email: email,
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

    // For now, return a simple response
    res.status(200).json({
      message: 'Register endpoint working',
      email: email,
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

// Catch-all route for testing
app.get('*', (req, res) => {
  res.status(200).json({
    message: 'DARA Medics Backend API',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
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
