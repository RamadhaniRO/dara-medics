import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../../core/logger/logger.service';

const logger = new LoggerService();

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message: string;
  statusCode: number;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Too many requests from this IP, please try again later.',
  statusCode: 429
};

export const rateLimiter = (config: Partial<RateLimitConfig> = {}) => {
  const finalConfig = { ...defaultConfig, ...config };
  const store: RateLimitStore = {};

  return (req: Request, res: Response, next: NextFunction) => {
    console.log('🔍 RATE LIMITER: Request intercepted:', {
      method: req.method,
      url: req.url,
      ip: req.ip
    });
    
    try {
      const key = req.ip || 'unknown';
      const now = Date.now();

      // Clean up expired entries
      if (store[key] && now > store[key].resetTime) {
        delete store[key];
      }

      if (!store[key]) {
        store[key] = {
          count: 1,
          resetTime: now + finalConfig.windowMs
        };
      } else {
        store[key].count++;
      }

      console.log('🔍 RATE LIMITER: Current count for', key, ':', store[key].count, '/', finalConfig.maxRequests);

      if (store[key].count > finalConfig.maxRequests) {
        console.log('❌ RATE LIMITER: Rate limit exceeded for', key);
        logger.warn('Rate limit exceeded:', {
          ip: req.ip,
          endpoint: req.originalUrl,
          count: store[key].count,
          limit: finalConfig.maxRequests,
          resetTime: new Date(store[key].resetTime).toISOString()
        });

        return res.status(finalConfig.statusCode || 429).json({
          error: finalConfig.message,
          retryAfter: Math.ceil((store[key].resetTime - now) / 1000)
        });
      }

      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': finalConfig.maxRequests.toString(),
        'X-RateLimit-Remaining': Math.max(0, finalConfig.maxRequests - store[key].count).toString(),
        'X-RateLimit-Reset': new Date(store[key].resetTime).toISOString()
      });

      console.log('✅ RATE LIMITER: Passing request to next middleware');
      next();
    } catch (error) {
      console.log('❌ RATE LIMITER: Error occurred:', error);
      return next(error);
    }
  };
};

export const strictRateLimiter = (config: Partial<RateLimitConfig> = {}) => {
  const strictConfig = {
    ...defaultConfig,
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    ...config
  };

  return rateLimiter(strictConfig);
};

export const authRateLimiter = (config: Partial<RateLimitConfig> = {}) => {
  const authConfig = {
    ...defaultConfig,
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many authentication attempts, please try again later.',
    ...config
  };

  return rateLimiter(authConfig);
};

export const apiRateLimiter = (config: Partial<RateLimitConfig> = {}) => {
  const apiConfig = {
    ...defaultConfig,
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    message: 'API rate limit exceeded, please try again later.',
    ...config
  };

  return rateLimiter(apiConfig);
};
