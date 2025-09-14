import { Router, Request, Response } from 'express';

const router = Router();

// Health check endpoint
router.get('/', async (req: Request, res: Response) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: 'unknown',
        supabase: 'unknown',
        whatsapp: 'unknown',
        rag: 'unknown',
        llm: 'unknown'
      }
    };

    // Check database health if available
    if (req.app.locals.services?.database) {
      try {
        const dbHealth = await req.app.locals.services.database.isHealthy();
        health.services.database = dbHealth ? 'healthy' : 'unhealthy';
      } catch (error) {
        health.services.database = 'error';
      }
    }

    // Check Supabase health if available
    if (req.app.locals.services?.supabase) {
      try {
        const supabaseHealth = await req.app.locals.services.supabase.getServiceHealth();
        health.services.supabase = supabaseHealth.isHealthy ? 'healthy' : 'unhealthy';
      } catch (error) {
        health.services.supabase = 'error';
      }
    }

    // Check WhatsApp service health if available
    if (req.app.locals.services?.whatsapp) {
      try {
        const whatsappHealth = await req.app.locals.services.whatsapp.getServiceHealth();
        health.services.whatsapp = whatsappHealth.isHealthy ? 'healthy' : 'unhealthy';
      } catch (error) {
        health.services.whatsapp = 'error';
      }
    }

    // Check RAG service health if available
    if (req.app.locals.services?.rag) {
      try {
        const ragHealth = await req.app.locals.services.rag.getServiceHealth();
        health.services.rag = ragHealth.isHealthy ? 'healthy' : 'unhealthy';
      } catch (error) {
        health.services.rag = 'error';
      }
    }

    // Check LLM service health
    try {
      const llmProvider = process.env.LLM_PROVIDER || 'unknown';
      if (llmProvider === 'ollama') {
        const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
        const response = await fetch(`${ollamaUrl}/api/tags`);
        health.services.llm = response.ok ? 'healthy' : 'unhealthy';
      } else if (llmProvider === 'openai') {
        health.services.llm = process.env.OPENAI_API_KEY ? 'configured' : 'not_configured';
      } else {
        health.services.llm = 'not_configured';
      }
    } catch (error) {
      health.services.llm = 'error';
    }

    // Determine overall health
    const allServicesHealthy = Object.values(health.services).every(
      service => service === 'healthy' || service === 'configured'
    );

    if (!allServicesHealthy) {
      health.status = 'degraded';
    }

    const statusCode = allServicesHealthy ? 200 : 503;
    res.status(statusCode).json(health);

  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Detailed health check
router.get('/detailed', async (req: Request, res: Response) => {
  try {
    const detailedHealth: any = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        external: process.memoryUsage().external,
        rss: process.memoryUsage().rss
      },
      services: {}
    };

    // Database details
    if (req.app.locals.services?.database) {
      try {
        const dbInfo = await req.app.locals.services.database.getConnectionInfo();
        detailedHealth.services.database = {
          status: dbInfo.isConnected ? 'healthy' : 'unhealthy',
          host: dbInfo.host,
          port: dbInfo.port,
          database: dbInfo.database,
          version: dbInfo.version,
          connected: dbInfo.isConnected
        };
      } catch (error) {
        detailedHealth.services.database = {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    // Supabase details
    if (req.app.locals.services?.supabase) {
      try {
        const supabaseInfo = await req.app.locals.services.supabase.getServiceHealth();
        detailedHealth.services.supabase = {
          status: supabaseInfo.isHealthy ? 'healthy' : 'unhealthy',
          connected: supabaseInfo.isConnected,
          lastError: supabaseInfo.lastError
        };
      } catch (error) {
        detailedHealth.services.supabase = {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    // WhatsApp details
    if (req.app.locals.services?.whatsapp) {
      try {
        const whatsappHealth = await req.app.locals.services.whatsapp.getServiceHealth();
        detailedHealth.services.whatsapp = {
          status: whatsappHealth.isHealthy ? 'healthy' : 'unhealthy',
          phoneNumberId: whatsappHealth.phoneNumberId,
          apiUrl: whatsappHealth.apiUrl,
          lastError: whatsappHealth.lastError
        };
      } catch (error) {
        detailedHealth.services.whatsapp = {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    // RAG details
    if (req.app.locals.services?.rag) {
      try {
        const ragHealth = await req.app.locals.services.rag.getServiceHealth();
        detailedHealth.services.rag = {
          status: ragHealth.isHealthy ? 'healthy' : 'unhealthy',
          vectorDbConnected: ragHealth.vectorDbConnected,
          embeddingsWorking: ragHealth.embeddingsWorking,
          lastError: ragHealth.lastError
        };
      } catch (error) {
        detailedHealth.services.rag = {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    // System information
    detailedHealth.system = {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      pid: process.pid,
      title: process.title
    };

    // Environment information
    detailedHealth.environment = {
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT,
      host: process.env.HOST,
      llmProvider: process.env.LLM_PROVIDER,
      vectorDbUrl: process.env.WEAVIATE_URL,
      databaseUrl: process.env.DATABASE_URL ? 'configured' : 'not_configured'
    };

    // Determine overall health
    const allServicesHealthy = Object.values(detailedHealth.services).every(
      (service: any) => service.status === 'healthy'
    );

    if (!allServicesHealthy) {
      detailedHealth.status = 'degraded';
    }

    const statusCode = allServicesHealthy ? 200 : 503;
    res.status(statusCode).json(detailedHealth);

  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Readiness probe for Kubernetes
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Check if all critical services are ready
    const criticalServices = ['database', 'supabase'];
    let allReady = true;

    for (const serviceName of criticalServices) {
      if (req.app.locals.services?.[serviceName]) {
        try {
          const isHealthy = await req.app.locals.services[serviceName].isHealthy();
          if (!isHealthy) {
            allReady = false;
            break;
          }
        } catch (error) {
          allReady = false;
          break;
        }
      } else {
        allReady = false;
        break;
      }
    }

    if (allReady) {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        message: 'Critical services are not ready'
      });
    }

  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Liveness probe for Kubernetes
router.get('/live', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export { router as HealthRoutes };
