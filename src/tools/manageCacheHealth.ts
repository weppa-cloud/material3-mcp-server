import { z } from 'zod';
import { cacheVersionManager } from '../utils/cache-versioning.js';
import { logger } from '../utils/logger.js';

const inputSchema = z.object({
  action: z.enum(['status', 'invalidate_all', 'invalidate_component', 'check_updates'])
    .describe("Action to perform: 'status' shows cache health, 'invalidate_all' clears all caches, 'invalidate_component' clears specific component, 'check_updates' checks for upstream changes"),
  componentName: z.string().optional().describe("Component name (required for 'invalidate_component')"),
  framework: z.enum(['web', 'flutter']).optional().describe("Framework (required for 'invalidate_component')")
});

export async function manageCacheHealth(args: z.infer<typeof inputSchema>) {
  try {
    logger.info('manage_cache_health called', args);

    let result: any;

    switch (args.action) {
      case 'status': {
        const health = cacheVersionManager.getCacheHealth();
        result = {
          action: 'status',
          cache_health: {
            version: health.version,
            last_upstream_check: health.lastChecked,
            time_since_check: health.timeSinceCheck,
            needs_upstream_check: health.needsCheck,
            statistics: health.stats
          },
          recommendation: health.needsCheck
            ? 'Run "check_updates" to verify upstream changes'
            : 'Cache is fresh and up-to-date'
        };
        break;
      }

      case 'invalidate_all': {
        cacheVersionManager.invalidateAllCaches();
        result = {
          action: 'invalidate_all',
          status: 'success',
          message: 'All caches cleared. Next requests will fetch fresh data from GitHub.',
          affected: ['components', 'icons', 'documentation']
        };
        break;
      }

      case 'invalidate_component': {
        if (!args.componentName || !args.framework) {
          throw new Error('componentName and framework are required for invalidate_component action');
        }
        cacheVersionManager.invalidateComponent(args.componentName, args.framework);
        result = {
          action: 'invalidate_component',
          status: 'success',
          message: `Cache cleared for ${args.framework}:${args.componentName}`,
          component: args.componentName,
          framework: args.framework
        };
        break;
      }

      case 'check_updates': {
        const hasUpdates = await cacheVersionManager.checkCacheVersion();
        result = {
          action: 'check_updates',
          status: 'success',
          upstream_changes_detected: hasUpdates,
          message: hasUpdates
            ? 'Upstream changes detected. Cache has been invalidated automatically.'
            : 'No upstream changes. Cache is up-to-date.',
          recommendation: hasUpdates
            ? 'Fresh data will be fetched on next component request'
            : 'No action needed'
        };
        break;
      }
    }

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(result, null, 2)
      }]
    };
  } catch (error: any) {
    logger.error('manage_cache_health failed', error);
    return {
      content: [{
        type: 'text' as const,
        text: `Error: ${error.message}`
      }],
      isError: true
    };
  }
}

export const manageCacheHealthSchema = inputSchema;