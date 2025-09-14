import { LoggerService } from '../logger/logger.service';

export interface CacheConfig {
  ttl: number; // Time to live in seconds
  maxSize: number; // Maximum number of items in cache
  checkPeriod: number; // How often to check for expired items (seconds)
}

export interface CacheItem<T> {
  value: T;
  expiry: number;
  createdAt: number;
  accessCount: number;
  lastAccessed: number;
}

export class CacheService {
  private logger: LoggerService;
  private cache: Map<string, CacheItem<any>> = new Map();
  private config: CacheConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config?: Partial<CacheConfig>, logger?: LoggerService) {
    this.logger = logger || new LoggerService();
    this.config = {
      ttl: config?.ttl || 3600, // 1 hour default
      maxSize: config?.maxSize || 1000,
      checkPeriod: config?.checkPeriod || 300 // 5 minutes default
    };
    
    this.startCleanup();
  }

  public set<T>(key: string, value: T, ttl?: number): void {
    try {
      const expiry = Date.now() + ((ttl || this.config.ttl) * 1000);
      
      // If cache is at max size, remove least recently used item
      if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
        this.evictLRU();
      }

      this.cache.set(key, {
        value,
        expiry,
        createdAt: Date.now(),
        accessCount: 0,
        lastAccessed: Date.now()
      });

      this.logger.debug('Cache item set', { key, ttl: ttl || this.config.ttl });
    } catch (error) {
      this.logger.error('Failed to set cache item', { error, key });
    }
  }

  public get<T>(key: string): T | null {
    try {
      const item = this.cache.get(key);
      
      if (!item) {
        return null;
      }

      // Check if item has expired
      if (Date.now() > item.expiry) {
        this.cache.delete(key);
        return null;
      }

      // Update access statistics
      item.accessCount++;
      item.lastAccessed = Date.now();

      this.logger.debug('Cache item retrieved', { key, accessCount: item.accessCount });
      return item.value as T;
    } catch (error) {
      this.logger.error('Failed to get cache item', { error, key });
      return null;
    }
  }

  public has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) {
      return false;
    }

    // Check if item has expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  public delete(key: string): boolean {
    try {
      const deleted = this.cache.delete(key);
      this.logger.debug('Cache item deleted', { key, deleted });
      return deleted;
    } catch (error) {
      this.logger.error('Failed to delete cache item', { error, key });
      return false;
    }
  }

  public clear(): void {
    try {
      this.cache.clear();
      this.logger.info('Cache cleared');
    } catch (error) {
      this.logger.error('Failed to clear cache', { error });
    }
  }

  public getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    totalAccesses: number;
    expiredItems: number;
  } {
    const now = Date.now();
    let totalAccesses = 0;
    let expiredItems = 0;

    for (const item of this.cache.values()) {
      totalAccesses += item.accessCount;
      if (now > item.expiry) {
        expiredItems++;
      }
    }

    const hitRate = totalAccesses > 0 ? totalAccesses / (totalAccesses + this.cache.size) : 0;

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: Math.round(hitRate * 100) / 100,
      totalAccesses,
      expiredItems
    };
  }

  public getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  public getItems(): Array<{ key: string; item: CacheItem<any> }> {
    return Array.from(this.cache.entries()).map(([key, item]) => ({ key, item }));
  }

  private evictLRU(): void {
    try {
      let lruKey = '';
      let lruTime = Date.now();

      for (const [key, item] of this.cache.entries()) {
        if (item.lastAccessed < lruTime) {
          lruTime = item.lastAccessed;
          lruKey = key;
        }
      }

      if (lruKey) {
        this.cache.delete(lruKey);
        this.logger.debug('Evicted LRU cache item', { key: lruKey });
      }
    } catch (error) {
      this.logger.error('Failed to evict LRU cache item', { error });
    }
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.config.checkPeriod * 1000);
  }

  private cleanup(): void {
    try {
      const now = Date.now();
      let cleanedCount = 0;

      for (const [key, item] of this.cache.entries()) {
        if (now > item.expiry) {
          this.cache.delete(key);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        this.logger.debug('Cache cleanup completed', { cleanedCount });
      }
    } catch (error) {
      this.logger.error('Cache cleanup failed', { error });
    }
  }

  public destroy(): void {
    try {
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
        this.cleanupInterval = null;
      }
      this.cache.clear();
      this.logger.info('Cache service destroyed');
    } catch (error) {
      this.logger.error('Failed to destroy cache service', { error });
    }
  }

  // Utility methods for common caching patterns
  public async getOrSet<T>(
    key: string, 
    factory: () => Promise<T>, 
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    this.set(key, value, ttl);
    return value;
  }

  public invalidatePattern(pattern: string): number {
    try {
      const regex = new RegExp(pattern);
      let invalidatedCount = 0;

      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          this.cache.delete(key);
          invalidatedCount++;
        }
      }

      this.logger.debug('Cache pattern invalidation completed', { pattern, invalidatedCount });
      return invalidatedCount;
    } catch (error) {
      this.logger.error('Failed to invalidate cache pattern', { error, pattern });
      return 0;
    }
  }

  public warmup<T>(items: Array<{ key: string; value: T; ttl?: number }>): void {
    try {
      for (const item of items) {
        this.set(item.key, item.value, item.ttl);
      }
      this.logger.info('Cache warmup completed', { itemCount: items.length });
    } catch (error) {
      this.logger.error('Cache warmup failed', { error });
    }
  }
}
