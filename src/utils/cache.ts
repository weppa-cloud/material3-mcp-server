import NodeCache from 'node-cache';
import { logger } from './logger.js';

interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
}

export class CacheManager {
  private cache: NodeCache;
  private stats: CacheStats;

  constructor(ttlSeconds: number = 3600) {
    this.cache = new NodeCache({
      stdTTL: ttlSeconds,
      checkperiod: ttlSeconds * 0.2,
      useClones: false
    });

    this.stats = {
      hits: 0,
      misses: 0,
      keys: 0
    };

    this.cache.on('set', () => {
      this.stats.keys = this.cache.keys().length;
    });

    this.cache.on('del', () => {
      this.stats.keys = this.cache.keys().length;
    });

    this.cache.on('expired', (key) => {
      logger.debug(`Cache expired: ${key}`);
      this.stats.keys = this.cache.keys().length;
    });

    logger.info(`Cache initialized with TTL: ${ttlSeconds}s`);
  }

  get<T>(key: string): T | undefined {
    const value = this.cache.get<T>(key);

    if (value !== undefined) {
      this.stats.hits++;
      logger.debug(`Cache HIT: ${key}`);
      return value;
    }

    this.stats.misses++;
    logger.debug(`Cache MISS: ${key}`);
    return undefined;
  }

  set<T>(key: string, value: T, ttl?: number): boolean {
    const success = this.cache.set(key, value, ttl || 0);
    if (success) {
      logger.debug(`Cache SET: ${key}${ttl ? ` (TTL: ${ttl}s)` : ''}`);
    }
    return success;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  del(key: string): number {
    return this.cache.del(key);
  }

  clear(): void {
    this.cache.flushAll();
    this.stats.hits = 0;
    this.stats.misses = 0;
    this.stats.keys = 0;
    logger.info('Cache cleared');
  }

  getStats(): CacheStats & { hitRate: string } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0
      ? ((this.stats.hits / total) * 100).toFixed(2) + '%'
      : '0%';

    return {
      ...this.stats,
      hitRate
    };
  }

  // Helper for async operations with automatic caching
  async wrap<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await fetchFn();
    this.set(key, value, ttl);
    return value;
  }
}

// Create cache instances with different TTLs
export const componentCache = new CacheManager(
  parseInt(process.env.COMPONENT_CACHE_TTL || '3600') // 1 hour default
);

export const iconCache = new CacheManager(
  parseInt(process.env.ICON_CACHE_TTL || '86400') // 24 hours default (icons don't change often)
);

export const docsCache = new CacheManager(
  parseInt(process.env.DOCS_CACHE_TTL || '43200') // 12 hours default
);