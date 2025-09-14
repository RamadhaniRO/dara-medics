import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Load environment variables
dotenv.config();

// Import core services
import { DatabaseService } from './core/database/database.service';
import { WhatsAppService } from './messaging/whatsapp/whatsapp.service';
import { AgentOrchestrator } from './agents/orchestrator/agent.orchestrator';
import { RAGService } from './rag/rag.service';
import { OrderService } from './services/order/order.service';
import { PaymentService } from './services/payment/payment.service';
import { ConversationService } from './services/conversation/conversation.service';
import { LoggerService } from './core/logger/logger.service';
import { MetricsService } from './core/monitoring/metrics.service';

// Import API routes
import { WhatsAppRoutes } from './api/routes/whatsapp.routes';
import { OrderRoutes } from './api/routes/order.routes';
import { PaymentRoutes } from './api/routes/payment.routes';
import { AdminRoutes } from './api/routes/admin.routes';
import { HealthRoutes } from './api/routes/health.routes';
import { createAuthRoutes } from './api/routes/auth.routes';

// Import middleware
import { errorHandler } from './api/middleware/error.handler';
import { rateLimiter } from './api/middleware/rate.limiter';
import { requestLogger } from './api/middleware/request.logger';
import { authMiddleware } from './api/middleware/auth.middleware';

class MedSupplyWA {
  private app: express.Application;
  private server: any;
  private io: Server;
  private logger: LoggerService;
  private port: number;
  private metricsService: MetricsService;
  private databaseService: DatabaseService;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    });
    this.logger = new LoggerService();
    this.port = parseInt(process.env.PORT || '3000', 10);
    this.metricsService = new MetricsService();
  }

  private async initializeServices(): Promise<void> {
    try {
      this.logger.info('Initializing core services...');

      // Initialize Database
      this.databaseService = new DatabaseService();
      await this.databaseService.initialize();
      this.logger.info('Database service initialized');

      // Initialize business services (skip complex ones for now)
      const orderService = new OrderService(this.databaseService);
      const paymentService = new PaymentService(this.databaseService);
      const conversationService = new ConversationService(this.logger, this.databaseService);
      
      // Initialize payment gateways (skip if fails)
      try {
        await paymentService.initializeGateways();
        this.logger.info('Payment gateways initialized');
      } catch (error) {
        this.logger.warn('Payment gateways initialization failed, continuing in mock mode:', error);
      }

      // Initialize WhatsApp service (skip if fails)
      let whatsappService = null;
      try {
        whatsappService = new WhatsAppService();
        await whatsappService.initialize();
        this.logger.info('WhatsApp service initialized');
      } catch (error) {
        this.logger.warn('WhatsApp service initialization failed, continuing without WhatsApp:', error);
      }

      // Initialize RAG service (skip if fails)
      let ragService = null;
      try {
        ragService = new RAGService();
        await ragService.initialize();
        this.logger.info('RAG service initialized');
      } catch (error) {
        this.logger.warn('RAG service initialization failed, continuing without RAG:', error);
      }

      // Initialize agent orchestrator (skip if RAG failed)
      let agentOrchestrator = null;
      if (ragService) {
        try {
          agentOrchestrator = new AgentOrchestrator(ragService, paymentService);
          await agentOrchestrator.initialize();
          this.logger.info('Agent orchestrator initialized');
        } catch (error) {
          this.logger.warn('Agent orchestrator initialization failed:', error);
        }
      }

      // Make services available to routes
      this.app.locals.services = {
        database: this.databaseService,
        rag: ragService,
        order: orderService,
        payment: paymentService,
        conversation: conversationService,
        whatsapp: whatsappService,
        orchestrator: agentOrchestrator,
        metrics: this.metricsService
      };

      this.logger.info('Core services initialized successfully (some may be in mock mode)');
    } catch (error) {
      this.logger.error('Failed to initialize services:', error);
      // Don't throw error, continue with basic functionality
      this.logger.warn('Continuing with minimal service initialization');
    }
  }

  private configureMiddleware(): void {
    this.logger.info('Configuring middleware...');

    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors({
      origin: [
        process.env.CORS_ORIGIN || 'http://localhost:3000',
        'http://localhost:3001', // Frontend dev server
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001'
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
    }));

    // Request parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging middleware
    this.app.use(morgan('combined', {
      stream: {
        write: (message: string) => this.logger.info(message.trim())
      }
    }));

    // Custom middleware - SIMPLIFIED
    this.app.use(requestLogger);
    // Temporarily disable rate limiter to avoid blocking requests
    // this.app.use(rateLimiter);
    
    // Debug middleware removed for simplicity

    this.logger.info('Middleware configured successfully');
  }

  private configureRoutes(): void {
    this.logger.info('Configuring API routes...');

    // Health check route (no auth required)
    this.app.use('/health', HealthRoutes);

    // WhatsApp webhook (no auth required)
    this.app.use('/webhook/whatsapp', WhatsAppRoutes);

    // Authentication routes (no auth required)
    console.log('🔧 Creating auth routes...');
    console.log('📊 Database service available:', !!this.databaseService);
    console.log('📊 Logger service available:', !!this.logger);
    
    const authRoutes = createAuthRoutes(this.databaseService, this.logger);
    console.log('✅ Auth routes created:', !!authRoutes);
    
    this.app.use('/api/auth', authRoutes);
    console.log('✅ Auth routes registered at /api/auth');

    // Protected routes
    this.app.use('/api/v1/orders', authMiddleware, OrderRoutes);
    this.app.use('/api/v1/payments', authMiddleware, PaymentRoutes);
    this.app.use('/api/v1/admin', authMiddleware, AdminRoutes);

    // Serve static files AFTER API routes (so API routes take precedence)
    this.app.use(express.static('public'));

    // Catch-all handler for SPA (must be after static files)
    // Only handle GET requests that don't start with /api
    this.app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next(); // Skip SPA handling for API routes
      }
      res.sendFile('index.html', { root: 'public' });
    });

    // Error handling middleware (must be last)
    this.app.use(errorHandler);

    this.logger.info('API routes configured successfully');
  }

  private configureSocketIO(): void {
    this.logger.info('Configuring Socket.IO...');

    this.io.on('connection', (socket) => {
      this.logger.info(`Client connected: ${socket.id}`);

      socket.on('join-pharmacy', (pharmacyId: string) => {
        socket.join(`pharmacy-${pharmacyId}`);
        this.logger.info(`Client ${socket.id} joined pharmacy room: ${pharmacyId}`);
      });

      socket.on('disconnect', () => {
        this.logger.info(`Client disconnected: ${socket.id}`);
      });
    });

    // Make io available to services
    this.app.locals.io = this.io;

    this.logger.info('Socket.IO configured successfully');
  }

  private async start(): Promise<void> {
    try {
      // Initialize services with timeout
      const initPromise = this.initializeServices();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Service initialization timeout')), 30000)
      );
      
      try {
        await Promise.race([initPromise, timeoutPromise]);
      } catch (error) {
        this.logger.warn('Service initialization timed out or failed, continuing with basic setup:', error);
      }

      this.configureMiddleware();
      this.configureRoutes();
      this.configureSocketIO();

      this.server.listen(this.port, () => {
        this.logger.info(`🚀 MedSupply-WA server running on port ${this.port}`);
        this.logger.info(`📱 WhatsApp webhook: http://localhost:${this.port}/webhook/whatsapp`);
        this.logger.info(`🔍 Health check: http://localhost:${this.port}/health`);
        this.logger.info(`📊 Admin API: http://localhost:${this.port}/api/v1/admin`);
        this.logger.info(`🔐 Registration: http://localhost:${this.port}/api/auth/register`);
      });

      // Graceful shutdown
      process.on('SIGTERM', () => this.gracefulShutdown());
      process.on('SIGINT', () => this.gracefulShutdown());

    } catch (error) {
      this.logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  private async gracefulShutdown(): Promise<void> {
    this.logger.info('Received shutdown signal, starting graceful shutdown...');
    
    try {
      // Close HTTP server
      this.server.close(() => {
        this.logger.info('HTTP server closed');
      });

      // Close Socket.IO
      this.io.close(() => {
        this.logger.info('Socket.IO server closed');
      });

      // Close database connections
      const databaseService = this.app.locals.services?.database;
      if (databaseService) {
        await databaseService.close();
        this.logger.info('Database connections closed');
      }

      this.logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      this.logger.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  }

  public async run(): Promise<void> {
    await this.start();
  }
}

// Global error handlers to prevent crashes
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit immediately, log and continue
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit immediately, log and continue
});

// Start the application
const app = new MedSupplyWA();
app.run().catch((error) => {
  console.error('Failed to start MedSupply-WA:', error);
  process.exit(1);
});
