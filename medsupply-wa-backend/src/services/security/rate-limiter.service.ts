import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../../core/logger/logger.service';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;
}

export class RateLimiterService {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();
  private logger: LoggerService;

  constructor(logger: LoggerService) {
    this.logger = logger;
    
    // Clean up expired entries every minute
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, 60000);
  }

  /**
   * Create a rate limiting middleware
   */
  public createRateLimit(config: RateLimitConfig) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const key = this.generateKey(req, config);
        const now = Date.now();
        // const _windowStart = now - config.windowMs;

        // Get or create rate limit data for this key
        let rateLimitData = this.requests.get(key);
        
        if (!rateLimitData || rateLimitData.resetTime <= now) {
          // Create new window
          rateLimitData = {
            count: 0,
            resetTime: now + config.windowMs
          };
        }

        // Increment request count
        rateLimitData.count++;
        this.requests.set(key, rateLimitData);

        // Check if limit exceeded
        if (rateLimitData.count > config.maxRequests) {
          const retryAfter = Math.ceil((rateLimitData.resetTime - now) / 1000);
          
          this.logger.warn(`Rate limit exceeded for key: ${key}, count: ${rateLimitData.count}, limit: ${config.maxRequests}`);
          
          // Set rate limit headers
          res.set({
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimitData.resetTime).toISOString(),
            'Retry-After': retryAfter.toString()
          });

          return res.status(429).json({
            error: config.message || 'Too many requests',
            retryAfter
          });
        }

        // Set rate limit headers
        const remaining = Math.max(0, config.maxRequests - rateLimitData.count);
        res.set({
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitData.resetTime).toISOString()
        });

        next();
        return;
      } catch (error) {
        this.logger.error('Rate limiter error:', error);
        next(); // Continue on error to avoid blocking requests
        return;
      }
    };
  }

  /**
   * Create a strict rate limiter for authentication endpoints
   */
  public createAuthRateLimit() {
    return this.createRateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5, // 5 attempts per 15 minutes
      message: 'Too many authentication attempts. Please try again later.',
      keyGenerator: (req) => {
        // Use IP address and user agent for auth endpoints
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        const userAgent = req.get('User-Agent') || 'unknown';
        return `auth:${ip}:${userAgent}`;
      }
    });
  }

  /**
   * Create a general API rate limiter
   */
  public createApiRateLimit() {
    return this.createRateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100, // 100 requests per 15 minutes
      message: 'API rate limit exceeded. Please slow down your requests.',
      keyGenerator: (req) => {
        // Use user ID if authenticated, otherwise IP
        const userId = (req as any).user?.userId;
        if (userId) {
          return `api:user:${userId}`;
        }
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        return `api:ip:${ip}`;
      }
    });
  }

  /**
   * Create a strict rate limiter for password reset
   */
  public createPasswordResetRateLimit() {
    return this.createRateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 3, // 3 attempts per hour
      message: 'Too many password reset attempts. Please try again later.',
      keyGenerator: (req) => {
        const email = req.body?.email || 'unknown';
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        return `password-reset:${email}:${ip}`;
      }
    });
  }

  /**
   * Create a rate limiter for 2FA attempts
   */
  public createTwoFactorRateLimit() {
    return this.createRateLimit({
      windowMs: 5 * 60 * 1000, // 5 minutes
      maxRequests: 5, // 5 attempts per 5 minutes
      message: 'Too many 2FA attempts. Please try again later.',
      keyGenerator: (req) => {
        const userId = (req as any).user?.userId || 'unknown';
        return `2fa:${userId}`;
      }
    });
  }

  /**
   * Create a rate limiter for file uploads
   */
  public createUploadRateLimit() {
    return this.createRateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 50, // 50 uploads per hour
      message: 'Upload rate limit exceeded. Please try again later.',
      keyGenerator: (req) => {
        const userId = (req as any).user?.userId;
        if (userId) {
          return `upload:user:${userId}`;
        }
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        return `upload:ip:${ip}`;
      }
    });
  }

  /**
   * Create a rate limiter for WhatsApp webhook
   */
  public createWebhookRateLimit() {
    return this.createRateLimit({
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100, // 100 webhook calls per minute
      message: 'Webhook rate limit exceeded.',
      keyGenerator: (req) => {
        // Use WhatsApp phone number if available
        const phoneNumber = req.body?.from || req.ip || 'unknown';
        return `webhook:${phoneNumber}`;
      }
    });
  }

  /**
   * Get rate limit info for a key
   */
  public getRateLimitInfo(key: string): RateLimitInfo | null {
    const data = this.requests.get(key);
    if (!data) {
      return null;
    }

    return {
      limit: 0, // This would need to be passed from the config
      remaining: Math.max(0, 100 - data.count), // This would need to be passed from the config
      resetTime: new Date(data.resetTime),
      retryAfter: data.resetTime > Date.now() ? Math.ceil((data.resetTime - Date.now()) / 1000) : undefined
    };
  }

  /**
   * Reset rate limit for a key
   */
  public resetRateLimit(key: string): void {
    this.requests.delete(key);
    this.logger.info(`Rate limit reset for key: ${key}`);
  }

  /**
   * Get all rate limit entries (for monitoring)
   */
  public getAllRateLimits(): Map<string, { count: number; resetTime: number }> {
    return new Map(this.requests);
  }

  /**
   * Clear all rate limits
   */
  public clearAllRateLimits(): void {
    this.requests.clear();
    this.logger.info('All rate limits cleared');
  }

  private generateKey(req: Request, config: RateLimitConfig): string {
    if (config.keyGenerator) {
      return config.keyGenerator(req);
    }

    // Default key generation
    const userId = (req as any).user?.userId;
    if (userId) {
      return `default:user:${userId}`;
    }

    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    return `default:ip:${ip}`;
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, data] of this.requests.entries()) {
      if (data.resetTime <= now) {
        this.requests.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.debug(`Cleaned up ${cleanedCount} expired rate limit entries`);
    }
  }
}
