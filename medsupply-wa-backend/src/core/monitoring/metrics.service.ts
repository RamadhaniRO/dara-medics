import { LoggerService } from '../logger/logger.service';
import { DatabaseService } from '../database/database.service';

export interface MetricData {
  name: string;
  value: number;
  unit?: string;
  tags?: Record<string, string>;
  timestamp: Date;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    database: 'up' | 'down';
    llm: 'up' | 'down';
    whatsapp: 'up' | 'down';
    rag: 'up' | 'down';
  };
  metrics: {
    uptime: number;
    memoryUsage: number;
    cpuUsage: number;
    activeConnections: number;
    errorRate: number;
  };
  lastChecked: Date;
}

export class MetricsService {
  private logger: LoggerService;
  private databaseService: DatabaseService;
  private startTime: Date;
  private metrics: Map<string, MetricData[]> = new Map();
  private healthChecks: Map<string, boolean> = new Map();

  constructor(databaseService?: DatabaseService) {
    this.logger = new LoggerService();
    this.databaseService = databaseService || new DatabaseService();
    this.startTime = new Date();
    
    // Initialize health checks
    this.healthChecks.set('database', false);
    this.healthChecks.set('llm', false);
    this.healthChecks.set('whatsapp', false);
    this.healthChecks.set('rag', false);
  }

  public async recordMetric(name: string, value: number, unit?: string, tags?: Record<string, string>): Promise<void> {
    try {
      const metric: MetricData = {
        name,
        value,
        unit,
        tags,
        timestamp: new Date()
      };

      // Store in memory
      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }
      
      const metricsArray = this.metrics.get(name)!;
      metricsArray.push(metric);
      
      // Keep only last 1000 metrics per name
      if (metricsArray.length > 1000) {
        metricsArray.splice(0, metricsArray.length - 1000);
      }

      // Store in database
      await this.databaseService.createSystemMetric({
        metric_name: name,
        metric_value: value,
        metric_unit: unit,
        tags,
        timestamp: new Date().toISOString()
      });

      this.logger.debug('Metric recorded', { name, value, unit, tags });
    } catch (error) {
      this.logger.error('Failed to record metric', { error, name, value });
    }
  }

  public async getMetrics(name?: string, limit: number = 100): Promise<MetricData[]> {
    try {
      if (name) {
        return this.metrics.get(name)?.slice(-limit) || [];
      }

      // Return all metrics
      const allMetrics: MetricData[] = [];
      for (const metricsArray of this.metrics.values()) {
        allMetrics.push(...metricsArray.slice(-limit));
      }

      return allMetrics.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      this.logger.error('Failed to get metrics', { error, name });
      return [];
    }
  }

  public async getSystemHealth(): Promise<SystemHealth> {
    try {
      const now = new Date();
      const uptime = now.getTime() - this.startTime.getTime();

      // Get system metrics
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      // Calculate error rate (simplified)
      const errorRate = await this.calculateErrorRate();

      // Determine overall health status
      const healthyServices = Array.from(this.healthChecks.values()).filter(status => status).length;
      const totalServices = this.healthChecks.size;
      
      let status: 'healthy' | 'degraded' | 'unhealthy';
      if (healthyServices === totalServices) {
        status = 'healthy';
      } else if (healthyServices > totalServices / 2) {
        status = 'degraded';
      } else {
        status = 'unhealthy';
      }

      const health: SystemHealth = {
        status,
        services: {
          database: this.healthChecks.get('database') ? 'up' : 'down',
          llm: this.healthChecks.get('llm') ? 'up' : 'down',
          whatsapp: this.healthChecks.get('whatsapp') ? 'up' : 'down',
          rag: this.healthChecks.get('rag') ? 'up' : 'down'
        },
        metrics: {
          uptime,
          memoryUsage: memoryUsage.heapUsed / memoryUsage.heapTotal,
          cpuUsage: (cpuUsage.user + cpuUsage.system) / 1000000, // Convert to seconds
          activeConnections: 0, // TODO: Implement connection tracking
          errorRate
        },
        lastChecked: now
      };

      return health;
    } catch (error) {
      this.logger.error('Failed to get system health', { error });
      
      return {
        status: 'unhealthy',
        services: {
          database: 'down',
          llm: 'down',
          whatsapp: 'down',
          rag: 'down'
        },
        metrics: {
          uptime: 0,
          memoryUsage: 0,
          cpuUsage: 0,
          activeConnections: 0,
          errorRate: 1
        },
        lastChecked: new Date()
      };
    }
  }

  public async updateServiceHealth(service: string, isHealthy: boolean): Promise<void> {
    try {
      this.healthChecks.set(service, isHealthy);
      
      await this.recordMetric('service_health', isHealthy ? 1 : 0, 'boolean', { service });
      
      this.logger.info('Service health updated', { service, isHealthy });
    } catch (error) {
      this.logger.error('Failed to update service health', { error, service, isHealthy });
    }
  }

  public async recordRequestMetrics(req: any, res: any, responseTime: number): Promise<void> {
    try {
      const method = req.method;
      const route = req.route?.path || req.path;
      const statusCode = res.statusCode;
      // const _userAgent = req.get('User-Agent') || 'unknown';

      // Record response time
      await this.recordMetric('http_response_time', responseTime, 'ms', {
        method,
        route,
        status_code: statusCode.toString()
      });

      // Record request count
      await this.recordMetric('http_requests_total', 1, 'count', {
        method,
        route,
        status_code: statusCode.toString()
      });

      // Record error count if status >= 400
      if (statusCode >= 400) {
        await this.recordMetric('http_errors_total', 1, 'count', {
          method,
          route,
          status_code: statusCode.toString(),
          error_type: statusCode >= 500 ? 'server_error' : 'client_error'
        });
      }

      this.logger.debug('Request metrics recorded', { method, route, statusCode, responseTime });
    } catch (error) {
      this.logger.error('Failed to record request metrics', { error });
    }
  }

  public async recordAgentMetrics(agentType: string, processingTime: number, success: boolean): Promise<void> {
    try {
      // Record processing time
      await this.recordMetric('agent_processing_time', processingTime, 'ms', {
        agent_type: agentType,
        success: success.toString()
      });

      // Record success/failure count
      await this.recordMetric('agent_requests_total', 1, 'count', {
        agent_type: agentType,
        success: success.toString()
      });

      this.logger.debug('Agent metrics recorded', { agentType, processingTime, success });
    } catch (error) {
      this.logger.error('Failed to record agent metrics', { error });
    }
  }

  public async recordWhatsAppMetrics(messageType: string, direction: 'inbound' | 'outbound', success: boolean): Promise<void> {
    try {
      // Record message count
      await this.recordMetric('whatsapp_messages_total', 1, 'count', {
        message_type: messageType,
        direction,
        success: success.toString()
      });

      this.logger.debug('WhatsApp metrics recorded', { messageType, direction, success });
    } catch (error) {
      this.logger.error('Failed to record WhatsApp metrics', { error });
    }
  }

  private async calculateErrorRate(): Promise<number> {
    try {
      const errorMetrics = this.metrics.get('http_errors_total') || [];
      const totalMetrics = this.metrics.get('http_requests_total') || [];

      if (totalMetrics.length === 0) {
        return 0;
      }

      const totalErrors = errorMetrics.reduce((sum, metric) => sum + metric.value, 0);
      const totalRequests = totalMetrics.reduce((sum, metric) => sum + metric.value, 0);

      return totalErrors / totalRequests;
    } catch (error) {
      this.logger.error('Failed to calculate error rate', { error });
      return 0;
    }
  }

  public async getDashboardMetrics(): Promise<any> {
    try {
      const health = await this.getSystemHealth();
      const recentMetrics = await this.getMetrics(undefined, 50);

      // Calculate some aggregated metrics
      const responseTimeMetrics = recentMetrics.filter(m => m.name === 'http_response_time');
      const avgResponseTime = responseTimeMetrics.length > 0 
        ? responseTimeMetrics.reduce((sum, m) => sum + m.value, 0) / responseTimeMetrics.length 
        : 0;

      const requestMetrics = recentMetrics.filter(m => m.name === 'http_requests_total');
      const totalRequests = requestMetrics.reduce((sum, m) => sum + m.value, 0);

      const errorMetrics = recentMetrics.filter(m => m.name === 'http_errors_total');
      const totalErrors = errorMetrics.reduce((sum, m) => sum + m.value, 0);

      return {
        health,
        metrics: {
          avgResponseTime: Math.round(avgResponseTime),
          totalRequests,
          totalErrors,
          errorRate: totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0,
          uptime: health.metrics.uptime,
          memoryUsage: Math.round(health.metrics.memoryUsage * 100),
          cpuUsage: Math.round(health.metrics.cpuUsage * 100)
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Failed to get dashboard metrics', { error });
      return null;
    }
  }
}
