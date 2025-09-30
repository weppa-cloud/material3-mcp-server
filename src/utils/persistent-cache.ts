import flatCache from 'flat-cache';
import { join } from 'path';
import { homedir } from 'os';
import { logger } from './logger.js';
import { userConfig } from '../config/user-config.js';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Type definition for flat-cache
interface Cache {
  getKey(key: string): any;
  setKey(key: string, value: any): void;
  removeKey(key: string): void;
  save(noPrune?: boolean): void;
  destroy(): void;
  keys(): string[];
}

export class PersistentCache {
  private cache: Cache;
  private stats: {
    hits: number;
    misses: number;
    writes: number;
  };
  private cacheDir: string;
  private cacheName: string;

  constructor(cacheName: string) {
    this.cacheName = cacheName;
    this.cacheDir = join(homedir(), '.material3-mcp', 'cache');
    this.cache = (flatCache as any).create(cacheName, this.cacheDir);
    this.stats = {
      hits: 0,
      misses: 0,
      writes: 0
    };

    logger.info(`Persistent cache initialized: ${cacheName}`, { dir: this.cacheDir });
  }

  /**
   * Get value from cache if not expired
   */
  get<T>(key: string): T | undefined {
    if (!userConfig.isCacheEnabled()) {
      return undefined;
    }

    const entry = this.cache.getKey(key) as CacheEntry<T> | undefined;

    if (!entry) {
      this.stats.misses++;
      logger.debug(`Cache MISS: ${key}`);
      return undefined;
    }

    // Check if expired
    const now = Date.now();
    const age = now - entry.timestamp;
    if (age > entry.ttl * 1000) {
      this.cache.removeKey(key);
      this.stats.misses++;
      logger.debug(`Cache EXPIRED: ${key} (age: ${Math.round(age / 1000)}s)`);
      return undefined;
    }

    this.stats.hits++;
    logger.debug(`Cache HIT: ${key} (age: ${Math.round(age / 1000)}s)`);
    return entry.data;
  }

  /**
   * Set value in cache with TTL
   */
  set<T>(key: string, value: T, ttl?: number): void {
    if (!userConfig.isCacheEnabled()) {
      return;
    }

    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      ttl: ttl || 3600 // default 1 hour
    };

    this.cache.setKey(key, entry);
    this.cache.save(true); // Save synchronously
    this.stats.writes++;
    logger.debug(`Cache SET: ${key} (TTL: ${entry.ttl}s)`);
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Delete specific key
   */
  del(key: string): void {
    this.cache.removeKey(key);
    this.cache.save(true);
    logger.debug(`Cache DEL: ${key}`);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.destroy();
    this.cache = (flatCache as any).create(this.cacheName, this.cacheDir);
    this.stats.hits = 0;
    this.stats.misses = 0;
    this.stats.writes = 0;
    logger.info(`Cache cleared: ${this.cacheName}`);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0
      ? ((this.stats.hits / total) * 100).toFixed(2) + '%'
      : '0%';

    return {
      ...this.stats,
      hitRate,
      size: this.cache.keys().length
    };
  }

  /**
   * Async helper wrapper with automatic caching
   */
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

  /**
   * Get all cache keys
   */
  keys(): string[] {
    return this.cache.keys();
  }

  /**
   * Get cache size in entries
   */
  size(): number {
    return this.cache.keys().length;
  }

  /**
   * Prune expired entries
   */
  prune(): number {
    const keys = this.cache.keys();
    let pruned = 0;

    keys.forEach((key: string) => {
      const entry = this.cache.getKey(key) as CacheEntry<any> | undefined;
      if (entry) {
        const now = Date.now();
        const age = now - entry.timestamp;
        if (age > entry.ttl * 1000) {
          this.cache.removeKey(key);
          pruned++;
        }
      }
    });

    if (pruned > 0) {
      this.cache.save(true);
      logger.info(`Pruned ${pruned} expired cache entries from ${this.cacheName}`);
    }

    return pruned;
  }
}

// Create persistent cache instances
export const persistentComponentCache = new PersistentCache('components');
export const persistentIconCache = new PersistentCache('icons');
export const persistentDocsCache = new PersistentCache('docs');

// Prune expired entries on startup
setInterval(() => {
  persistentComponentCache.prune();
  persistentIconCache.prune();
  persistentDocsCache.prune();
}, 3600000); // Every hour