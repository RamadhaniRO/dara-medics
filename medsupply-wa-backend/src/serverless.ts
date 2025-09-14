import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import core services
import { DatabaseService } from './core/database/database.service';
import { LoggerService } from './core/logger/logger.service';

// Import API routes
import { HealthRoutes } from './api/routes/health.routes';
import { createAuthRoutes } from './api/routes/auth.routes';
import { createSocialAuthRoutes } from './api/routes/social-auth.routes';

// Import middleware
import { errorHandler } from './api/middleware/error.handler';

class MedSupplyWAServerless {
  private app: express.Application;
  private logger: LoggerService;
  private databaseService: DatabaseService;

  constructor() {
    this.app = express();
    this.logger = new LoggerService();
    this.databaseService = new DatabaseService(this.logger);
  }

  private configureMiddleware(): void {
    // Basic middleware
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || 'https://dara-medics-frontend.vercel.app',
      credentials: true
    }));
    this.app.use(morgan('combined'));
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  }

  private configureRoutes(): void {
    this.logger.info('Configuring API routes...');

    // Health check route (no auth required)
    this.app.use('/health', HealthRoutes);

    // Authentication routes (no auth required)
    console.log('🔧 Creating auth routes...');
    const authRoutes = createAuthRoutes(this.databaseService, this.logger);
    this.app.use('/api/auth', authRoutes);
    console.log('✅ Auth routes registered at /api/auth');

    // Social Authentication routes (no auth required)
    console.log('🔧 Creating social auth routes...');
    const socialAuthRoutes = createSocialAuthRoutes(this.databaseService, this.logger);
    this.app.use('/api/auth', socialAuthRoutes);
    console.log('✅ Social auth routes registered at /api/auth');

    // Error handling middleware (must be last)
    this.app.use(errorHandler);

    this.logger.info('API routes configured successfully');
  }

  private async initializeServices(): Promise<void> {
    try {
      this.logger.info('Initializing services...');
      
      // Initialize database service
      await this.databaseService.initialize();
      this.logger.info('Database service initialized');
      
      this.logger.info('All services initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize services:', error);
      throw error;
    }
  }

  public async start(): Promise<void> {
    try {
      await this.initializeServices();
      this.configureMiddleware();
      this.configureRoutes();

      const port = process.env.PORT || 3000;
      
      // For Vercel serverless, we don't start a server
      // The app is exported for Vercel to handle
      this.logger.info(`Serverless app configured for port ${port}`);
      
    } catch (error) {
      this.logger.error('Failed to start server:', error);
      throw error;
    }
  }

  public getApp(): express.Application {
    return this.app;
  }
}

// Create and start the serverless app
const serverlessApp = new MedSupplyWAServerless();

// Initialize the app
serverlessApp.start().catch((error) => {
  console.error('Failed to initialize serverless app:', error);
  process.exit(1);
});

// Export the Express app for Vercel
export default serverlessApp.getApp();
