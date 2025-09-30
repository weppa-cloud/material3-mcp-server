import { logger } from './logger.js';
import { persistentComponentCache, persistentIconCache, persistentDocsCache } from './persistent-cache.js';
import { githubClient } from './http-client.js';

/**
 * Cache versioning system to ensure data freshness
 */

export interface CacheVersion {
  version: string;
  lastChecked: number;
  gitCommitSha?: string;
}

const CACHE_VERSION_KEY = 'cache:version';
const CURRENT_CACHE_VERSION = '1.0.0';
const VERSION_CHECK_INTERVAL = 3600000; // 1 hour

export class CacheVersionManager {
  /**
   * Check if cache needs to be invalidated due to version change
   */
  async checkCacheVersion(): Promise<boolean> {
    const storedVersion = persistentComponentCache.get<CacheVersion>(CACHE_VERSION_KEY);

    if (!storedVersion) {
      // First time - set version
      this.setCurrentVersion();
      return true;
    }

    // Check if version changed (e.g., after server update)
    if (storedVersion.version !== CURRENT_CACHE_VERSION) {
      logger.warn('Cache version mismatch - clearing cache', {
        stored: storedVersion.version,
        current: CURRENT_CACHE_VERSION
      });
      this.invalidateAllCaches();
      this.setCurrentVersion();
      return true;
    }

    // Check if enough time passed since last check
    const now = Date.now();
    const timeSinceCheck = now - storedVersion.lastChecked;

    if (timeSinceCheck > VERSION_CHECK_INTERVAL) {
      logger.info('Checking for upstream changes');
      const hasChanges = await this.checkUpstreamChanges(storedVersion);

      if (hasChanges) {
        logger.warn('Upstream changes detected - clearing cache');
        this.invalidateAllCaches();
        this.setCurrentVersion();
        return true;
      }

      // Update last checked time
      storedVersion.lastChecked = now;
      persistentComponentCache.set(CACHE_VERSION_KEY, storedVersion);
    }

    return false;
  }

  /**
   * Check if upstream repositories have new commits
   */
  private async checkUpstreamChanges(currentVersion: CacheVersion): Promise<boolean> {
    try {
      // Check flutter/flutter main branch
      const flutterResponse = await githubClient.get(
        '/repos/flutter/flutter/commits/master'
      );
      const flutterLatestSha = flutterResponse.data.sha;

      // Check material-web main branch
      const webResponse = await githubClient.get(
        '/repos/material-components/material-web/commits/main'
      );
      const webLatestSha = webResponse.data.sha;

      // Compare with stored SHA (if exists)
      const combinedSha = `${flutterLatestSha}:${webLatestSha}`;

      if (currentVersion.gitCommitSha && currentVersion.gitCommitSha !== combinedSha) {
        logger.info('New commits detected in upstream repositories', {
          flutter: flutterLatestSha.substring(0, 7),
          web: webLatestSha.substring(0, 7)
        });
        return true;
      }

      // Store current SHAs for next check
      currentVersion.gitCommitSha = combinedSha;
      persistentComponentCache.set(CACHE_VERSION_KEY, currentVersion);

      return false;
    } catch (error: any) {
      logger.error('Failed to check upstream changes', error);
      // Don't invalidate cache on error - better to serve stale data than fail
      return false;
    }
  }

  /**
   * Set current cache version
   */
  private setCurrentVersion(): void {
    const version: CacheVersion = {
      version: CURRENT_CACHE_VERSION,
      lastChecked: Date.now()
    };
    persistentComponentCache.set(CACHE_VERSION_KEY, version);
    logger.info('Cache version set', { version: CURRENT_CACHE_VERSION });
  }

  /**
   * Manually invalidate all caches
   */
  invalidateAllCaches(): void {
    logger.warn('Invalidating all caches');
    persistentComponentCache.clear();
    persistentIconCache.clear();
    persistentDocsCache.clear();
  }

  /**
   * Manually invalidate cache for specific component
   */
  invalidateComponent(componentName: string, framework: 'web' | 'flutter'): void {
    const key = `${framework}:${componentName}:default`;
    persistentComponentCache.del(key);
    logger.info(`Invalidated cache for ${framework}:${componentName}`);
  }

  /**
   * Get cache statistics with freshness info
   */
  getCacheHealth(): {
    version: string;
    lastChecked: Date;
    timeSinceCheck: string;
    needsCheck: boolean;
    stats: {
      components: any;
      icons: any;
      docs: any;
    };
  } {
    const storedVersion = persistentComponentCache.get<CacheVersion>(CACHE_VERSION_KEY);
    const now = Date.now();
    const timeSinceCheck = storedVersion
      ? now - storedVersion.lastChecked
      : 0;

    return {
      version: storedVersion?.version || 'unknown',
      lastChecked: storedVersion ? new Date(storedVersion.lastChecked) : new Date(0),
      timeSinceCheck: this.formatDuration(timeSinceCheck),
      needsCheck: timeSinceCheck > VERSION_CHECK_INTERVAL,
      stats: {
        components: persistentComponentCache.getStats(),
        icons: persistentIconCache.getStats(),
        docs: persistentDocsCache.getStats()
      }
    };
  }

  /**
   * Format duration in human-readable format
   */
  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }
}

export const cacheVersionManager = new CacheVersionManager();

/**
 * Add cache headers to responses for debugging
 */
export function addCacheHeaders(data: any, cacheHit: boolean): any {
  return {
    ...data,
    _cache: {
      hit: cacheHit,
      version: CURRENT_CACHE_VERSION,
      timestamp: new Date().toISOString()
    }
  };
}