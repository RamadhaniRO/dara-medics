import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../../core/logger/logger.service';

const logger = new LoggerService();

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Log request start
  const startTime = Date.now();
  logger.info('Request started', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Log response when it completes
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      contentLength: res.get('Content-Length')
    });
  });

  next();
};
