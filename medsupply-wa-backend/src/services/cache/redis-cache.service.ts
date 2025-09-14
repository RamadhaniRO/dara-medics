import Redis from 'ioredis';
import { LoggerService } from '../../core/logger/logger.service';

export interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  defaultTTL?: number; // Default TTL in seconds
}

export interface CacheOptions {
  ttl?: number; // TTL in seconds
  tags?: string[]; // For cache invalidation by tags
}

export class RedisCacheService {
  private redis: Redis;
  private logger: LoggerService;
  private defaultTTL: number;

  constructor(config: CacheConfig, logger: LoggerService) {
    this.logger = logger;
    this.defaultTTL = config.defaultTTL || 3600; // 1 hour default

    this.redis = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
      db: config.db || 0,
      keyPrefix: config.keyPrefix || 'medsupply:',
      maxRetriesPerRequest: 3,
      lazyConnect: true
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.redis.on('connect', () => {
      this.logger.info('Redis connected successfully');
    });

    this.redis.on('error', (error) => {
      this.logger.error('Redis connection error:', error);
    });

    this.redis.on('close', () => {
      this.logger.warn('Redis connection closed');
    });

    this.redis.on('reconnecting', () => {
      this.logger.info('Redis reconnecting...');
    });
  }

  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      if (value === null) {
        return null;
      }
      return JSON.parse(value);
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set a value in cache
   */
  async set(key: string, value: any, options: CacheOptions = {}): Promise<boolean> {
    try {
      const ttl = options.ttl || this.defaultTTL;
      const serializedValue = JSON.stringify(value);
      
      if (options.tags && options.tags.length > 0) {
        // Store with tags for invalidation
        const pipeline = this.redis.pipeline();
        pipeline.setex(key, ttl, serializedValue);
        
        // Add to tag sets
        for (const tag of options.tags) {
          pipeline.sadd(`tag:${tag}`, key);
          pipeline.expire(`tag:${tag}`, ttl);
        }
        
        await pipeline.exec();
      } else {
        await this.redis.setex(key, ttl, serializedValue);
      }
      
      return true;
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete a key from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      const result = await this.redis.del(key);
      return result > 0;
    } catch (error) {
      this.logger.error(`Error deleting cache key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys
   */
  async deleteMany(keys: string[]): Promise<number> {
    try {
      if (keys.length === 0) return 0;
      const result = await this.redis.del(...keys);
      return result;
    } catch (error) {
      this.logger.error(`Error deleting cache keys:`, error);
      return 0;
    }
  }

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking cache key existence ${key}:`, error);
      return false;
    }
  }

  /**
   * Get TTL of a key
   */
  async getTTL(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      this.logger.error(`Error getting TTL for key ${key}:`, error);
      return -1;
    }
  }

  /**
   * Set TTL for a key
   */
  async setTTL(key: string, ttl: number): Promise<boolean> {
    try {
      const result = await this.redis.expire(key, ttl);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error setting TTL for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Increment a numeric value
   */
  async increment(key: string, amount: number = 1): Promise<number> {
    try {
      return await this.redis.incrby(key, amount);
    } catch (error) {
      this.logger.error(`Error incrementing cache key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Decrement a numeric value
   */
  async decrement(key: string, amount: number = 1): Promise<number> {
    try {
      return await this.redis.decrby(key, amount);
    } catch (error) {
      this.logger.error(`Error decrementing cache key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Get or set a value (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    try {
      // Try to get from cache first
      const cached = await this.get<T>(key);
      if (cached !== null) {
        return cached;
      }

      // Fetch from source
      const value = await fetchFunction();
      
      // Store in cache
      await this.set(key, value, options);
      
      return value;
    } catch (error) {
      this.logger.error(`Error in getOrSet for key ${key}:`, error);
      // If cache fails, still try to fetch from source
      return await fetchFunction();
    }
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags: string[]): Promise<number> {
    try {
      let totalDeleted = 0;
      
      for (const tag of tags) {
        const keys = await this.redis.smembers(`tag:${tag}`);
        if (keys.length > 0) {
          const deleted = await this.deleteMany(keys);
          totalDeleted += deleted;
          
          // Remove the tag set
          await this.redis.del(`tag:${tag}`);
        }
      }
      
      this.logger.info(`Invalidated ${totalDeleted} cache entries by tags: ${tags.join(', ')}`);
      return totalDeleted;
    } catch (error) {
      this.logger.error(`Error invalidating cache by tags:`, error);
      return 0;
    }
  }

  /**
   * Clear all cache entries
   */
  async clearAll(): Promise<boolean> {
    try {
      await this.redis.flushdb();
      this.logger.info('All cache entries cleared');
      return true;
    } catch (error) {
      this.logger.error('Error clearing all cache:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<any> {
    try {
      const info = await this.redis.info('memory');
      const keyspace = await this.redis.info('keyspace');
      
      return {
        memory: this.parseRedisInfo(info),
        keyspace: this.parseRedisInfo(keyspace),
        connected: this.redis.status === 'ready'
      };
    } catch (error) {
      this.logger.error('Error getting cache stats:', error);
      return null;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      this.logger.error('Cache health check failed:', error);
      return false;
    }
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    try {
      await this.redis.quit();
      this.logger.info('Redis connection closed');
    } catch (error) {
      this.logger.error('Error closing Redis connection:', error);
    }
  }

  private parseRedisInfo(info: string): any {
    const result: any = {};
    const lines = info.split('\r\n');
    
    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        result[key] = value;
      }
    }
    
    return result;
  }

  // Cache key generators for common use cases
  static generateUserKey(userId: string): string {
    return `user:${userId}`;
  }

  static generateProductKey(productId: string): string {
    return `product:${productId}`;
  }

  static generateOrderKey(orderId: string): string {
    return `order:${orderId}`;
  }

  static generatePharmacyKey(pharmacyId: string): string {
    return `pharmacy:${pharmacyId}`;
  }

  static generateSearchKey(query: string, filters: any = {}): string {
    const filterString = JSON.stringify(filters);
    return `search:${Buffer.from(query + filterString).toString('base64')}`;
  }

  static generateApiKey(endpoint: string, params: any = {}): string {
    const paramString = JSON.stringify(params);
    return `api:${endpoint}:${Buffer.from(paramString).toString('base64')}`;
  }
}
