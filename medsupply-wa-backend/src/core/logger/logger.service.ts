import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

export class LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = this.createLogger();
  }

  private createLogger(): winston.Logger {
    const logDir = process.env.LOG_FILE ? path.dirname(process.env.LOG_FILE) : './logs';
    const logLevel = process.env.LOG_LEVEL || 'info';

    // Define log format
    const logFormat = winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
        
        if (Object.keys(meta).length > 0) {
          log += ` ${JSON.stringify(meta)}`;
        }
        
        if (stack) {
          log += `\n${stack}`;
        }
        
        return log;
      })
    );

    // Define transports
    const transports: winston.transport[] = [
      // Console transport
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      })
    ];

    // File transport with rotation
    if (process.env.NODE_ENV !== 'test') {
      transports.push(
        new DailyRotateFile({
          filename: path.join(logDir, 'app-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          maxSize: process.env.LOG_MAX_SIZE || '20m',
          maxFiles: process.env.LOG_MAX_FILES || '14d',
          format: logFormat,
          level: logLevel
        }),
        new DailyRotateFile({
          filename: path.join(logDir, 'error-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          maxSize: process.env.LOG_MAX_SIZE || '20m',
          maxFiles: process.env.LOG_MAX_FILES || '30d',
          format: logFormat,
          level: 'error'
        })
      );
    }

    // Create logger instance
    return winston.createLogger({
      level: logLevel,
      format: logFormat,
      transports,
      exitOnError: false
    });
  }

  public info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  public error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  public warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  public debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  public verbose(message: string, meta?: any): void {
    this.logger.verbose(message, meta);
  }

  public silly(message: string, meta?: any): void {
    this.logger.silly(message, meta);
  }

  public log(level: string, message: string, meta?: any): void {
    this.logger.log(level, message, meta);
  }

  public profile(id: string | number, meta?: any): void {
    this.logger.profile(id, meta);
  }

  public startTimer(_label: string): winston.Profiler {
    return this.logger.startTimer();
  }

  public child(options: winston.LoggerOptions): winston.Logger {
    return this.logger.child(options);
  }

  public add(transport: winston.transport): void {
    this.logger.add(transport);
  }

  public remove(transport: winston.transport): void {
    this.logger.remove(transport);
  }

  public clear(): void {
    this.logger.clear();
  }

  public close(): void {
    this.logger.close();
  }

  // Convenience methods for structured logging
  public logRequest(req: any, res: any, responseTime: number): void {
    this.info('HTTP Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id
    });
  }

  public logError(error: Error, context?: any): void {
    this.error('Application Error', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      context
    });
  }

  public logDatabaseQuery(query: string, parameters: any[], duration: number): void {
    this.debug('Database Query', {
      query,
      parameters,
      duration: `${duration}ms`
    });
  }

  public logWhatsAppMessage(message: any, direction: 'inbound' | 'outbound'): void {
    this.info('WhatsApp Message', {
      direction,
      messageId: message.id,
      from: message.from,
      to: message.to,
      type: message.type,
      timestamp: message.timestamp
    });
  }

  public logAgentAction(agentName: string, action: string, details: any): void {
    this.info('Agent Action', {
      agent: agentName,
      action,
      details,
      timestamp: new Date().toISOString()
    });
  }

  public logPaymentEvent(event: string, paymentId: string, details: any): void {
    this.info('Payment Event', {
      event,
      paymentId,
      details,
      timestamp: new Date().toISOString()
    });
  }

  public logOrderEvent(event: string, orderId: string, details: any): void {
    this.info('Order Event', {
      event,
      orderId,
      details,
      timestamp: new Date().toISOString()
    });
  }

  // Method to get logger instance for external use
  public getLogger(): winston.Logger {
    return this.logger;
  }
}
