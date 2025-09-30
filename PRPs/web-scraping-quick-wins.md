# PRP: Material 3 MCP Server - Web Scraping Quick Wins

**Version:** 1.0
**Status:** Ready for Implementation
**Created:** 2025-09-29
**Epic:** Data Provider Enhancement
**Priority:** High

---

## 1. Feature Overview & Business Value

### Problem Statement
The current Material 3 MCP Server implementation has a critical gap in component metadata retrieval. While we successfully integrated GitHub API for real component code and Iconify for Material Symbols, the `DocumentationProvider` still returns mock data with generic descriptions. This limits the agent's ability to provide accurate, context-rich information about Material 3 components.

### Business Value
- **Improved Agent Responses**: Agents can provide real component descriptions, usage guidelines, and design specifications
- **Complete Data Coverage**: 80%+ components with authentic documentation from m3.material.io
- **Enhanced User Experience**: Developers get accurate, official Material Design guidance
- **Reduced Maintenance**: Automated scraping reduces need for manual documentation updates
- **Competitive Advantage**: Only MCP server with real-time Material 3 documentation integration

### Success Metrics
- **Data Quality**: 80% of components return real descriptions (vs. 0% currently)
- **Performance**: P95 latency <200ms (cached), <2s (uncached)
- **Reliability**: 99% uptime with fallback to mock data on scraping failures
- **Coverage**: Support for all 20+ Material 3 component categories
- **Feature Flag**: Ability to enable/disable web scraping via environment variable

---

## 2. Technical Requirements & Architecture

### System Context
```
┌─────────────────────────────────────────────────────────────┐
│                    MCP Server (Node.js)                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │ MCP Tools Layer  │────────▶│ DocumentationProvider│       │
│  │ (5 tools)        │         │                      │       │
│  └──────────────────┘         └──────────────────┘          │
│                                         │                     │
│                                         ▼                     │
│                         ┌────────────────────────┐           │
│                         │  HTTP Client (Axios)   │           │
│                         │  + Rate Limiter        │           │
│                         │  + Circuit Breaker     │           │
│                         │  + Retry Logic         │           │
│                         └────────────────────────┘           │
│                                         │                     │
└─────────────────────────────────────────┼─────────────────────┘
                                          │
                                          ▼
                         ┌────────────────────────┐
                         │   m3.material.io       │
                         │   (Web Scraping Target)│
                         └────────────────────────┘
```

### Data Flow
```
User Request
    │
    ▼
MCP Tool (list_material_components)
    │
    ▼
DocumentationProvider.getComponentsList()
    │
    ├──▶ Check Feature Flag (ENABLE_WEB_SCRAPING)
    │    │
    │    ├─[ENABLED]──▶ Parallel Fetch:
    │    │              ├─▶ GitHub API (existing)
    │    │              └─▶ Web Scraping (NEW)
    │    │                   │
    │    │                   ├─▶ HTTP Client with:
    │    │                   │   ├─ Rate Limiting (10 req/s)
    │    │                   │   ├─ Circuit Breaker
    │    │                   │   └─ Exponential Retry (3 attempts)
    │    │                   │
    │    │                   ▼
    │    │              Cheerio Parsing
    │    │                   │
    │    │                   ▼
    │    │              Cache with Health Check
    │    │                   │
    │    └─[DISABLED]──▶ Mock Data (fallback)
    │
    ▼
Merge Results (GitHub + Scraped Data)
    │
    ▼
Return to Agent
```

### Technology Stack
- **Web Scraping**: axios + cheerio (already installed)
- **Rate Limiting**: bottleneck (NEW dependency)
- **Circuit Breaker**: cockatiel (NEW dependency)
- **Caching**: node-cache (existing)
- **Validation**: zod (existing)
- **Testing**: vitest (existing)

### Key Design Decisions

#### 1. Feature Flag Architecture
```typescript
// Environment-based feature flag
export const config = {
  webScraping: {
    enabled: process.env.ENABLE_WEB_SCRAPING === 'true',
    rateLimit: parseInt(process.env.WEB_SCRAPING_RATE_LIMIT || '10'),
    timeout: parseInt(process.env.HTTP_TIMEOUT || '5000'),
  }
}
```

**Rationale**: Allows instant rollback if scraping breaks or m3.material.io structure changes.

#### 2. Fallback Chain Strategy
```
Attempt 1: Web Scraping (if enabled)
    ↓ (on failure)
Attempt 2: Mock Data (always available)
    ↓
Return Best Available Data
```

**Rationale**: Ensures zero downtime even if scraping fails completely.

#### 3. Parallel Fetching Pattern
```typescript
const [githubResult, scrapedResult] = await Promise.allSettled([
  githubProvider.getComponents(),
  scrapingProvider.getComponents()
]);
```

**Rationale**: Reduces latency by fetching data sources concurrently instead of sequentially.

#### 4. Cache Health Validation
```typescript
function isCacheHealthy(data: any): boolean {
  return Array.isArray(data.components) &&
         data.components.length >= MIN_COMPONENTS_THRESHOLD;
}
```

**Rationale**: Prevents caching corrupt/incomplete data that would persist for TTL duration.

---

## 3. Database Schema Changes

**Not Applicable** - This feature uses in-memory caching only. No database changes required.

---

## 4. Service Layer Implementation

### 4.1 Configuration Service (NEW)

**File**: `src/utils/config.ts`

```typescript
import { z } from 'zod';

// Configuration schema with validation
const ConfigSchema = z.object({
  webScraping: z.object({
    enabled: z.boolean().default(false),
    rateLimit: z.number().int().positive().default(10),
    timeout: z.number().int().positive().default(5000),
    retryAttempts: z.number().int().min(0).max(5).default(3),
  }),
  cache: z.object({
    ttl: z.number().int().positive().default(3600), // 1 hour
    checkPeriod: z.number().int().positive().default(600), // 10 minutes
  }),
  healthCheck: z.object({
    minComponentsThreshold: z.number().int().positive().default(15),
  }),
});

export type Config = z.infer<typeof ConfigSchema>;

// Load and validate configuration from environment
export function loadConfig(): Config {
  const rawConfig = {
    webScraping: {
      enabled: process.env.ENABLE_WEB_SCRAPING === 'true',
      rateLimit: parseInt(process.env.WEB_SCRAPING_RATE_LIMIT || '10'),
      timeout: parseInt(process.env.HTTP_TIMEOUT || '5000'),
      retryAttempts: parseInt(process.env.HTTP_RETRY_ATTEMPTS || '3'),
    },
    cache: {
      ttl: parseInt(process.env.CACHE_TTL || '3600'),
      checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD || '600'),
    },
    healthCheck: {
      minComponentsThreshold: parseInt(process.env.MIN_COMPONENTS_THRESHOLD || '15'),
    },
  };

  // Validate and return with defaults
  return ConfigSchema.parse(rawConfig);
}

// Singleton config instance
export const config = loadConfig();
```

**Design Notes**:
- Uses Zod for runtime validation (catches invalid env vars)
- Provides type-safe config access throughout codebase
- Centralized configuration management
- Graceful defaults for all optional settings

---

### 4.2 HTTP Client Service (NEW)

**File**: `src/utils/http-client.ts`

```typescript
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { IPolicy, retry, circuitBreaker, timeout, wrap } from 'cockatiel';
import Bottleneck from 'bottleneck';
import { logger } from './logger';
import { config } from './config';

/**
 * Resilient HTTP client with rate limiting, circuit breaker, and retry logic
 */
export class HttpClient {
  private axiosInstance: AxiosInstance;
  private rateLimiter: Bottleneck;
  private retryPolicy: IPolicy;

  constructor() {
    // Configure axios instance
    this.axiosInstance = axios.create({
      timeout: config.webScraping.timeout,
      headers: {
        'User-Agent': 'Material3-MCP-Server/1.0 (+https://github.com/weppa-cloud/material3-mcp-server)',
      },
    });

    // Configure rate limiter (10 requests per second by default)
    this.rateLimiter = new Bottleneck({
      minTime: 1000 / config.webScraping.rateLimit, // ms between requests
      maxConcurrent: 5, // max concurrent requests
    });

    // Configure resilience policies
    const retryPolicy = retry(
      exponentialBackoff({
        maxAttempts: config.webScraping.retryAttempts,
        initialDelay: 1000,
        maxDelay: 10000,
      }),
      (error) => {
        // Retry on network errors or 5xx server errors
        return error.code === 'ECONNRESET' ||
               (error.response?.status >= 500 && error.response?.status < 600);
      }
    );

    const circuitBreakerPolicy = circuitBreaker({
      halfOpenAfter: 30000, // 30 seconds
      breaker: consecutiveBreaker(5), // open after 5 consecutive failures
    });

    const timeoutPolicy = timeout(config.webScraping.timeout);

    // Wrap policies (timeout → circuit breaker → retry)
    this.retryPolicy = wrap(timeoutPolicy, circuitBreakerPolicy, retryPolicy);

    logger.info('[HttpClient] Initialized with rate limit:', config.webScraping.rateLimit);
  }

  /**
   * Fetch URL with full resilience stack
   */
  async fetch<T = any>(url: string, options?: AxiosRequestConfig): Promise<T> {
    return this.rateLimiter.schedule(async () => {
      return this.retryPolicy.execute(async () => {
        logger.debug('[HttpClient] Fetching:', url);
        const response = await this.axiosInstance.get<T>(url, options);
        return response.data;
      });
    });
  }

  /**
   * Fetch HTML content as string (for scraping)
   */
  async fetchHTML(url: string): Promise<string> {
    return this.fetch<string>(url, {
      headers: { 'Accept': 'text/html' },
    });
  }

  /**
   * Get circuit breaker status for monitoring
   */
  getStatus(): { state: string } {
    // In real implementation, expose circuit breaker state
    return { state: 'closed' }; // 'open', 'closed', 'half-open'
  }
}

// Singleton instance
export const httpClient = new HttpClient();

/**
 * Helper: Exponential backoff calculator
 */
function exponentialBackoff(opts: { maxAttempts: number; initialDelay: number; maxDelay: number }) {
  return {
    maxAttempts: opts.maxAttempts,
    backoff: (attempt: number) => {
      const delay = Math.min(opts.initialDelay * Math.pow(2, attempt), opts.maxDelay);
      return delay + Math.random() * 1000; // Add jitter
    },
  };
}

/**
 * Helper: Consecutive failure breaker
 */
function consecutiveBreaker(threshold: number) {
  let failures = 0;
  return {
    onSuccess: () => { failures = 0; },
    onFailure: () => { failures++; },
    shouldOpen: () => failures >= threshold,
  };
}
```

**Design Notes**:
- **Rate Limiting**: Protects m3.material.io from being overwhelmed (respectful scraping)
- **Circuit Breaker**: Prevents cascading failures if site is down
- **Exponential Backoff**: Increases delay between retries (1s → 2s → 4s)
- **Jitter**: Adds randomness to avoid thundering herd
- **User-Agent**: Identifies MCP server for site administrators

---

### 4.3 Enhanced Documentation Provider (UPDATED)

**File**: `src/providers/documentation-provider.ts`

```typescript
import * as cheerio from 'cheerio';
import NodeCache from 'node-cache';
import { logger } from '../utils/logger';
import { httpClient } from '../utils/http-client';
import { config } from '../utils/config';
import { MaterialComponent } from '../types/material-component';

const BASE_URL = 'https://m3.material.io/components';

export class DocumentationProvider {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: config.cache.ttl,
      checkperiod: config.cache.checkPeriod,
      useClones: false, // Performance optimization
    });

    logger.info('[DocumentationProvider] Initialized with cache TTL:', config.cache.ttl);
  }

  /**
   * Get list of all Material 3 components with real metadata
   */
  async getComponentsList(): Promise<MaterialComponent[]> {
    const cacheKey = 'components-list';

    // Check cache first
    const cached = this.cache.get<MaterialComponent[]>(cacheKey);
    if (cached) {
      logger.debug('[DocumentationProvider] Cache hit for components list');
      return cached;
    }

    // Fetch fresh data
    let components: MaterialComponent[];

    if (config.webScraping.enabled) {
      try {
        components = await this.scrapeComponentMetadata();

        // Validate before caching
        if (this.isCacheHealthy(components)) {
          this.cache.set(cacheKey, components);
          logger.info('[DocumentationProvider] Cached', components.length, 'components');
        } else {
          logger.warn('[DocumentationProvider] Scraped data failed health check, using fallback');
          components = this.getMockComponents();
        }
      } catch (error) {
        logger.error('[DocumentationProvider] Scraping failed:', error);
        components = this.getMockComponents();
      }
    } else {
      logger.info('[DocumentationProvider] Web scraping disabled, using mock data');
      components = this.getMockComponents();
    }

    return components;
  }

  /**
   * Scrape component metadata from m3.material.io
   */
  private async scrapeComponentMetadata(): Promise<MaterialComponent[]> {
    logger.info('[DocumentationProvider] Scraping m3.material.io...');

    // Fetch components index page
    const html = await httpClient.fetchHTML(`${BASE_URL}/overview`);
    const $ = cheerio.load(html);

    const components: MaterialComponent[] = [];

    // Example scraping logic (adapt to actual HTML structure)
    $('.component-card').each((_, element) => {
      const $el = $(element);

      const name = $el.find('.component-name').text().trim().toLowerCase();
      const category = this.inferCategory(name);
      const description = $el.find('.component-description').text().trim();
      const complexity = this.inferComplexity($el);
      const frameworks = this.inferFrameworks($el);

      components.push({
        name,
        category,
        description,
        complexity,
        frameworks,
        url: `${BASE_URL}/${name}`,
        deprecated: $el.hasClass('deprecated'),
      });
    });

    logger.info('[DocumentationProvider] Scraped', components.length, 'components');
    return components;
  }

  /**
   * Health check: Validate scraped data quality
   */
  private isCacheHealthy(components: MaterialComponent[]): boolean {
    if (!Array.isArray(components)) return false;
    if (components.length < config.healthCheck.minComponentsThreshold) return false;

    // Check that most components have real descriptions (not "Material 3 component")
    const realDescriptions = components.filter(c =>
      c.description &&
      c.description.length > 20 &&
      !c.description.includes('Material 3 component')
    ).length;

    const healthRatio = realDescriptions / components.length;
    const isHealthy = healthRatio >= 0.7; // 70% must have real descriptions

    logger.debug('[DocumentationProvider] Cache health:', {
      total: components.length,
      realDescriptions,
      healthRatio,
      isHealthy,
    });

    return isHealthy;
  }

  /**
   * Fallback: Mock data when scraping fails
   */
  private getMockComponents(): MaterialComponent[] {
    return [
      {
        name: 'button',
        category: 'buttons',
        description: 'Material 3 button component with multiple variants',
        complexity: 'simple',
        frameworks: ['web', 'flutter', 'react', 'angular'],
        url: `${BASE_URL}/button`,
        deprecated: false,
      },
      {
        name: 'card',
        category: 'cards',
        description: 'Material 3 card component for content containers',
        complexity: 'medium',
        frameworks: ['web', 'flutter', 'react'],
        url: `${BASE_URL}/card`,
        deprecated: false,
      },
      // ... more mock components
    ];
  }

  // Helper methods
  private inferCategory(name: string): string {
    const categoryMap: Record<string, string> = {
      button: 'buttons',
      fab: 'buttons',
      card: 'cards',
      chip: 'chips',
      dialog: 'dialogs',
      list: 'lists',
      menu: 'menus',
      // ... more mappings
    };
    return categoryMap[name] || 'other';
  }

  private inferComplexity($el: cheerio.Cheerio): 'simple' | 'medium' | 'complex' {
    // Heuristic: count properties, slots, or methods mentioned
    const text = $el.text();
    if (text.includes('advanced') || text.includes('customizable')) return 'complex';
    if (text.includes('variants') || text.includes('options')) return 'medium';
    return 'simple';
  }

  private inferFrameworks($el: cheerio.Cheerio): string[] {
    const frameworks: string[] = [];
    const text = $el.text().toLowerCase();

    if (text.includes('web components')) frameworks.push('web');
    if (text.includes('flutter')) frameworks.push('flutter');
    if (text.includes('react')) frameworks.push('react');
    if (text.includes('angular')) frameworks.push('angular');

    return frameworks.length > 0 ? frameworks : ['web']; // Default to web
  }
}

// Singleton instance
export const documentationProvider = new DocumentationProvider();
```

**Design Notes**:
- **Feature Flag Integration**: Checks `config.webScraping.enabled` before scraping
- **Cache Health Validation**: Prevents caching invalid data
- **Graceful Fallback**: Always returns data (scraped or mock)
- **Detailed Logging**: Every decision point logged for debugging
- **Cheerio Selectors**: Must be updated based on actual m3.material.io HTML structure

---

### 4.4 Parallel Fetching Strategy (NEW)

**File**: `src/providers/unified-provider.ts` (NEW)

```typescript
import { MaterialComponent } from '../types/material-component';
import { documentationProvider } from './documentation-provider';
import { materialWebProvider } from './material-web-provider';
import { logger } from '../utils/logger';

/**
 * Unified provider that fetches from multiple sources in parallel
 */
export class UnifiedProvider {
  /**
   * Fetch components from GitHub + Web Scraping in parallel
   */
  async getComponents(): Promise<MaterialComponent[]> {
    logger.info('[UnifiedProvider] Fetching from multiple sources...');

    const results = await Promise.allSettled([
      materialWebProvider.getComponents(), // GitHub API
      documentationProvider.getComponentsList(), // Web scraping
    ]);

    const githubResult = results[0];
    const scrapedResult = results[1];

    // Merge results (prefer scraped descriptions over GitHub metadata)
    let components: MaterialComponent[] = [];

    if (githubResult.status === 'fulfilled') {
      components = githubResult.value;
    }

    if (scrapedResult.status === 'fulfilled') {
      components = this.mergeComponentData(components, scrapedResult.value);
    }

    logger.info('[UnifiedProvider] Merged', components.length, 'components');
    return components;
  }

  /**
   * Merge GitHub and scraped data (scraped descriptions win)
   */
  private mergeComponentData(
    githubComponents: MaterialComponent[],
    scrapedComponents: MaterialComponent[]
  ): MaterialComponent[] {
    const scrapedMap = new Map(scrapedComponents.map(c => [c.name, c]));

    return githubComponents.map(githubComp => {
      const scrapedComp = scrapedMap.get(githubComp.name);

      if (scrapedComp) {
        // Merge: Use scraped description, keep GitHub code metadata
        return {
          ...githubComp,
          description: scrapedComp.description,
          category: scrapedComp.category,
          complexity: scrapedComp.complexity,
          url: scrapedComp.url,
        };
      }

      return githubComp;
    });
  }
}

export const unifiedProvider = new UnifiedProvider();
```

**Design Notes**:
- **Promise.allSettled**: Waits for all promises, doesn't fail if one rejects
- **Data Merging**: Combines best of both worlds (GitHub code + scraped descriptions)
- **Graceful Degradation**: Works even if one data source fails

---

## 5. UI/UX Implementation

**Not Applicable** - This is a backend MCP server with no user interface. The "UI" is the JSON responses returned to AI agents.

---

## 6. Permission & Authorization Rules

**Not Applicable** - MCP server runs locally on user's machine. No authentication/authorization required.

---

## 7. Testing Strategy

### 7.1 Unit Tests

**Framework**: Vitest
**Coverage Target**: 80%

#### Test File: `tests/utils/config.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadConfig } from '../../src/utils/config';

describe('Config Service', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should load default config when no env vars set', () => {
    const config = loadConfig();
    expect(config.webScraping.enabled).toBe(false);
    expect(config.webScraping.rateLimit).toBe(10);
    expect(config.cache.ttl).toBe(3600);
  });

  it('should enable web scraping when ENABLE_WEB_SCRAPING=true', () => {
    process.env.ENABLE_WEB_SCRAPING = 'true';
    const config = loadConfig();
    expect(config.webScraping.enabled).toBe(true);
  });

  it('should parse numeric env vars correctly', () => {
    process.env.WEB_SCRAPING_RATE_LIMIT = '20';
    process.env.CACHE_TTL = '7200';
    const config = loadConfig();
    expect(config.webScraping.rateLimit).toBe(20);
    expect(config.cache.ttl).toBe(7200);
  });

  it('should validate rate limit is positive', () => {
    process.env.WEB_SCRAPING_RATE_LIMIT = '-5';
    expect(() => loadConfig()).toThrow();
  });
});
```

#### Test File: `tests/utils/http-client.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HttpClient } from '../../src/utils/http-client';
import axios from 'axios';

vi.mock('axios');

describe('HttpClient', () => {
  let httpClient: HttpClient;

  beforeEach(() => {
    httpClient = new HttpClient();
    vi.clearAllMocks();
  });

  it('should fetch URL successfully', async () => {
    const mockData = '<html>test</html>';
    vi.mocked(axios.create).mockReturnValue({
      get: vi.fn().mockResolvedValue({ data: mockData }),
    } as any);

    const result = await httpClient.fetchHTML('https://example.com');
    expect(result).toBe(mockData);
  });

  it('should retry on network errors', async () => {
    const axiosInstance = {
      get: vi.fn()
        .mockRejectedValueOnce({ code: 'ECONNRESET' })
        .mockRejectedValueOnce({ code: 'ECONNRESET' })
        .mockResolvedValue({ data: 'success' }),
    };
    vi.mocked(axios.create).mockReturnValue(axiosInstance as any);

    const result = await httpClient.fetch('https://example.com');
    expect(result).toBe('success');
    expect(axiosInstance.get).toHaveBeenCalledTimes(3);
  });

  it('should respect rate limit', async () => {
    const startTime = Date.now();

    // Make 3 requests
    await Promise.all([
      httpClient.fetch('https://example.com/1'),
      httpClient.fetch('https://example.com/2'),
      httpClient.fetch('https://example.com/3'),
    ]);

    const elapsed = Date.now() - startTime;
    expect(elapsed).toBeGreaterThan(200); // At least 200ms for rate limiting
  });
});
```

#### Test File: `tests/providers/documentation-provider.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocumentationProvider } from '../../src/providers/documentation-provider';
import { httpClient } from '../../src/utils/http-client';

vi.mock('../../src/utils/http-client');

describe('DocumentationProvider', () => {
  let provider: DocumentationProvider;

  beforeEach(() => {
    provider = new DocumentationProvider();
    vi.clearAllMocks();
  });

  it('should return cached data when available', async () => {
    const mockComponents = [{ name: 'button', category: 'buttons' }];
    provider['cache'].set('components-list', mockComponents);

    const result = await provider.getComponentsList();
    expect(result).toBe(mockComponents);
    expect(httpClient.fetchHTML).not.toHaveBeenCalled();
  });

  it('should scrape when web scraping enabled', async () => {
    process.env.ENABLE_WEB_SCRAPING = 'true';
    const mockHTML = `
      <div class="component-card">
        <h3 class="component-name">Button</h3>
        <p class="component-description">A Material 3 button</p>
      </div>
    `;
    vi.mocked(httpClient.fetchHTML).mockResolvedValue(mockHTML);

    const result = await provider.getComponentsList();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].name).toBe('button');
  });

  it('should fallback to mock data on scraping error', async () => {
    process.env.ENABLE_WEB_SCRAPING = 'true';
    vi.mocked(httpClient.fetchHTML).mockRejectedValue(new Error('Network error'));

    const result = await provider.getComponentsList();
    expect(result.length).toBeGreaterThan(0); // Mock data returned
  });

  it('should reject unhealthy cache data', async () => {
    const unhealthyData = [
      { name: 'comp1', description: 'Material 3 component' }, // Generic description
    ];

    const isHealthy = provider['isCacheHealthy'](unhealthyData);
    expect(isHealthy).toBe(false);
  });

  it('should accept healthy cache data', async () => {
    const healthyData = [
      { name: 'button', description: 'Buttons allow users to take actions with a single tap...' },
      { name: 'card', description: 'Cards contain content and actions about a single subject...' },
      { name: 'chip', description: 'Chips help users enter information, make selections...' },
    ];

    const isHealthy = provider['isCacheHealthy'](healthyData);
    expect(isHealthy).toBe(true);
  });
});
```

---

### 7.2 Integration Tests

**Test Scenarios** (6 end-to-end tests):

1. **Test: Web Scraping Enabled + Success**
   - Given: `ENABLE_WEB_SCRAPING=true`, m3.material.io reachable
   - When: Agent calls `list_material_components`
   - Then: Returns 20+ components with real descriptions (not "Material 3 component")

2. **Test: Web Scraping Enabled + Site Down**
   - Given: `ENABLE_WEB_SCRAPING=true`, m3.material.io unreachable (mock network error)
   - When: Agent calls `list_material_components`
   - Then: Returns mock data, no errors thrown

3. **Test: Web Scraping Disabled**
   - Given: `ENABLE_WEB_SCRAPING=false`
   - When: Agent calls `list_material_components`
   - Then: Returns mock data, no HTTP requests made

4. **Test: Cache Hit Performance**
   - Given: Components already cached
   - When: Agent calls `list_material_components` 3 times
   - Then: Response time <50ms, only 1 HTTP request made

5. **Test: Parallel Fetching Performance**
   - Given: `ENABLE_WEB_SCRAPING=true`
   - When: Agent calls `list_material_components` (first time, cache cold)
   - Then: GitHub + Scraping fetched in parallel (<2s total, not >3s sequential)

6. **Test: Cache Health Validation**
   - Given: Scraping returns corrupt data (only 5 components with generic descriptions)
   - When: Provider attempts to cache data
   - Then: Cache rejected, mock data used instead

**Test File**: `tests/integration/web-scraping.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { setupServer } from '../../src/index';

describe('Web Scraping Integration', () => {
  let server: McpServer;

  beforeEach(() => {
    server = setupServer();
  });

  it('should fetch real component metadata when enabled', async () => {
    process.env.ENABLE_WEB_SCRAPING = 'true';

    const response = await server.callTool('list_material_components', {
      category: 'buttons',
    });

    expect(response.content[0].text).toContain('button');
    expect(response.content[0].text).not.toContain('Material 3 component'); // Real descriptions
  });

  // ... more integration tests
});
```

---

### 7.3 Performance Tests

**Test**: Latency under cache hit/miss scenarios

```typescript
import { describe, it, expect } from 'vitest';
import { documentationProvider } from '../../src/providers/documentation-provider';

describe('Performance Tests', () => {
  it('should return cached data in <50ms', async () => {
    // Warm up cache
    await documentationProvider.getComponentsList();

    const start = Date.now();
    await documentationProvider.getComponentsList();
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(50);
  });

  it('should fetch uncached data in <2s', async () => {
    documentationProvider['cache'].flushAll();

    const start = Date.now();
    await documentationProvider.getComponentsList();
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(2000);
  });
});
```

---

## 8. Implementation Tasks & Timeline

### Task Breakdown

#### TASK 1: Configuration & Feature Flags (Small)
**Estimate**: 2 hours
**Files**: `src/utils/config.ts` (NEW)
**Acceptance Criteria**:
- [ ] Config service loads and validates env vars
- [ ] Zod schema validates all numeric ranges
- [ ] Feature flag `ENABLE_WEB_SCRAPING` works
- [ ] Unit tests: 100% coverage (5 test cases)

---

#### TASK 2: Resilient HTTP Client (Medium)
**Estimate**: 6 hours
**Files**: `src/utils/http-client.ts` (NEW)
**Dependencies**: Install `bottleneck`, `cockatiel`
**Acceptance Criteria**:
- [ ] Rate limiter prevents >10 req/s
- [ ] Circuit breaker opens after 5 consecutive failures
- [ ] Exponential retry with jitter (3 attempts)
- [ ] User-Agent header set correctly
- [ ] Unit tests: 80% coverage (8 test cases)

---

#### TASK 3: Web Scraping Implementation (Large)
**Estimate**: 10 hours
**Files**: `src/providers/documentation-provider.ts` (UPDATE)
**Acceptance Criteria**:
- [ ] `scrapeComponentMetadata()` parses m3.material.io HTML
- [ ] Extracts: name, description, category, complexity, frameworks
- [ ] Cheerio selectors match actual HTML structure (verify manually)
- [ ] Handles pagination if needed (check if components split across pages)
- [ ] Unit tests: 75% coverage (6 test cases)

---

#### TASK 4: Cache Health Validation (Medium)
**Estimate**: 4 hours
**Files**: `src/providers/documentation-provider.ts` (UPDATE)
**Acceptance Criteria**:
- [ ] `isCacheHealthy()` rejects data with <15 components
- [ ] Rejects data with <70% real descriptions
- [ ] Gracefully falls back to mock data on validation failure
- [ ] Unit tests: 100% coverage (4 test cases)

---

#### TASK 5: Parallel Fetching Strategy (Medium)
**Estimate**: 5 hours
**Files**: `src/providers/unified-provider.ts` (NEW)
**Acceptance Criteria**:
- [ ] `Promise.allSettled` fetches GitHub + Scraping in parallel
- [ ] Merge logic prefers scraped descriptions
- [ ] Works even if one data source fails
- [ ] Performance test: <2s for cold cache (vs >3s sequential)
- [ ] Unit tests: 80% coverage (5 test cases)

---

#### TASK 6: MCP Tool Integration (Small)
**Estimate**: 2 hours
**Files**: `src/tools/listMaterialComponents.ts` (UPDATE)
**Acceptance Criteria**:
- [ ] Tool uses `unifiedProvider` instead of `documentationProvider`
- [ ] No breaking changes to tool interface
- [ ] Existing tests still pass
- [ ] Integration test: End-to-end with web scraping enabled

---

#### TASK 7: Integration & E2E Testing (Medium)
**Estimate**: 6 hours
**Files**: `tests/integration/web-scraping.test.ts` (NEW)
**Acceptance Criteria**:
- [ ] All 6 integration test scenarios pass
- [ ] Performance tests validate <200ms (cached), <2s (uncached)
- [ ] MCP Inspector manual testing confirms real data
- [ ] Documentation updated with new env vars

---

### Implementation Timeline

**Total Estimated Time**: 35 hours (~1 week for 1 developer, or 2-3 weeks at 50% capacity)

```
Week 1: Core Infrastructure
├─ Day 1-2: TASK 1 (Config) + TASK 2 (HTTP Client)
├─ Day 3-5: TASK 3 (Web Scraping)

Week 2: Integration & Testing
├─ Day 1-2: TASK 4 (Cache Validation) + TASK 5 (Parallel Fetching)
├─ Day 3: TASK 6 (MCP Tool Integration)
├─ Day 4-5: TASK 7 (Integration Tests + Manual Testing)
```

---

## 9. Validation Gates & Quality Assurance

### Pre-Merge Checklist

**Code Quality**:
- [ ] All unit tests pass (`npm test`)
- [ ] Test coverage ≥80% (check with `npm run coverage`)
- [ ] No TypeScript errors (`npm run build`)
- [ ] No ESLint warnings
- [ ] All functions have JSDoc comments

**Functional Testing**:
- [ ] Feature flag works (test with `ENABLE_WEB_SCRAPING=true` and `false`)
- [ ] Web scraping returns ≥20 components with real descriptions
- [ ] Fallback to mock data works on network errors
- [ ] Cache health validation rejects corrupt data
- [ ] Parallel fetching completes in <2s

**Performance Testing**:
- [ ] P95 latency <200ms (cached)
- [ ] P95 latency <2s (uncached)
- [ ] Rate limiting prevents >10 req/s
- [ ] Circuit breaker opens after 5 failures

**Integration Testing**:
- [ ] MCP Inspector shows real component data
- [ ] Claude Desktop integration works
- [ ] Cursor IDE integration works

**Documentation**:
- [ ] README.md updated with new env vars
- [ ] CLAUDE.md updated with architecture changes
- [ ] JSDoc comments for all public methods
- [ ] CHANGELOG.md entry added

---

### Success Metrics (Post-Deployment)

**Week 1 Targets**:
- [ ] 80% components return real descriptions (measured via logs)
- [ ] Zero 500 errors in production
- [ ] Cache hit rate >70%
- [ ] Average response time <500ms

**Week 4 Targets**:
- [ ] 90% components return real descriptions
- [ ] Cache hit rate >85%
- [ ] Zero user-reported issues related to web scraping
- [ ] Feature flag still at `enabled=true` (no rollbacks)

---

## 10. Risk Assessment & Mitigation

### Risk Matrix

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **m3.material.io HTML structure changes** | High | High | Feature flag allows instant rollback; fallback to mock data; automated tests detect breakage |
| **Rate limiting by Google** | Medium | Medium | Respectful User-Agent; 10 req/s limit; circuit breaker; cache reduces requests |
| **Performance regression** | Low | High | Performance tests in CI; cache reduces latency; parallel fetching |
| **Cache poisoning with corrupt data** | Medium | Medium | Health validation before caching; 70% real description threshold |
| **Circuit breaker stuck open** | Low | Medium | 30s half-open retry; monitoring logs; fallback to mock data |

---

### Rollback Plan

**If web scraping breaks production**:

1. **Immediate Action** (5 minutes):
   ```bash
   # Set feature flag to false in deployment config
   ENABLE_WEB_SCRAPING=false

   # Restart MCP server (automatic in Claude Desktop on config change)
   ```

2. **Verify Rollback** (10 minutes):
   - Test `list_material_components` returns mock data
   - Check logs for errors
   - Confirm cache cleared

3. **Root Cause Analysis** (1 hour):
   - Inspect m3.material.io HTML changes
   - Review error logs
   - Test scraping logic locally

4. **Fix & Redeploy** (2-4 hours):
   - Update Cheerio selectors
   - Add regression test
   - Re-enable feature flag

---

## 11. Dependencies & Prerequisites

### New NPM Dependencies

```json
{
  "dependencies": {
    "bottleneck": "^2.19.5",    // Rate limiting
    "cockatiel": "^3.1.3"       // Circuit breaker + retry
  }
}
```

**Total Package Size Impact**: +150KB (gzipped)

---

### Environment Variables (NEW)

```bash
# Required
ENABLE_WEB_SCRAPING=true              # Feature flag (default: false)

# Optional
WEB_SCRAPING_RATE_LIMIT=10            # Requests per second (default: 10)
HTTP_TIMEOUT=5000                     # HTTP timeout in ms (default: 5000)
HTTP_RETRY_ATTEMPTS=3                 # Retry attempts (default: 3)
CACHE_TTL=3600                        # Cache TTL in seconds (default: 3600 = 1 hour)
CACHE_CHECK_PERIOD=600                # Cache cleanup interval (default: 600 = 10 min)
MIN_COMPONENTS_THRESHOLD=15           # Min components for healthy cache (default: 15)
```

---

## 12. Future Enhancements

**Post-MVP Improvements** (not in this PRP):

1. **Incremental Cache Updates**: Only re-scrape components that changed (track last-modified)
2. **Webhook Monitoring**: Subscribe to m3.material.io updates (if API available)
3. **Distributed Caching**: Use Redis for multi-instance deployments
4. **Component Versioning**: Track Material 3 version changes over time
5. **Image Scraping**: Extract component screenshots for visual reference
6. **Storybook Integration**: Scrape interactive component examples

---

## Appendix A: Code Size Estimates

| File | New Lines | Modified Lines | Total Impact |
|------|-----------|----------------|--------------|
| `src/utils/config.ts` | 80 | 0 | 80 |
| `src/utils/http-client.ts` | 180 | 0 | 180 |
| `src/providers/documentation-provider.ts` | 150 | 50 | 200 |
| `src/providers/unified-provider.ts` | 70 | 0 | 70 |
| `src/tools/listMaterialComponents.ts` | 0 | 10 | 10 |
| `tests/utils/config.test.ts` | 60 | 0 | 60 |
| `tests/utils/http-client.test.ts` | 100 | 0 | 100 |
| `tests/providers/documentation-provider.test.ts` | 120 | 0 | 120 |
| `tests/integration/web-scraping.test.ts` | 200 | 0 | 200 |
| `tests/performance/latency.test.ts` | 50 | 0 | 50 |
| **TOTAL** | **1,010** | **60** | **1,070** |

**Lines of Code (LoC)**: ~1,250 (including comments and blank lines)

---

## Appendix B: Cheerio Selector Reference

**Target URL**: `https://m3.material.io/components/overview`

**HTML Structure** (example, must verify against actual site):

```html
<div class="component-grid">
  <div class="component-card">
    <h3 class="component-title">Button</h3>
    <p class="component-description">
      Buttons help users take action with a single tap...
    </p>
    <div class="component-meta">
      <span class="complexity">Simple</span>
      <span class="framework">Web Components</span>
    </div>
  </div>
  <!-- More components... -->
</div>
```

**Cheerio Selectors**:

```typescript
$('.component-card').each((_, el) => {
  const name = $(el).find('.component-title').text().trim().toLowerCase();
  const description = $(el).find('.component-description').text().trim();
  const complexity = $(el).find('.complexity').text().trim().toLowerCase();
  const framework = $(el).find('.framework').text().trim();
  // ...
});
```

**Action Required**: Developer must inspect actual HTML and update selectors during TASK 3.

---

## Appendix C: Example Usage

### Before (Mock Data)
```bash
$ npx @weppa-cloud/material3-mcp-server
Claude> List Material 3 button components

Response:
- button: "Material 3 button component"  # Generic description
- fab: "Material 3 fab component"
```

### After (Real Data)
```bash
$ ENABLE_WEB_SCRAPING=true npx @weppa-cloud/material3-mcp-server
Claude> List Material 3 button components

Response:
- button: "Buttons help users take action with a single tap. Common buttons include text buttons, outlined buttons, filled buttons, and elevated buttons."
- fab: "Floating action buttons (FABs) represent the primary action of a screen. FABs come in three sizes: small, regular, and large."
```

---

**End of PRP**

---

## Sign-off

**Product Owner**: _______________ Date: _______
**Tech Lead**: _______________ Date: _______
**QA Lead**: _______________ Date: _______

**Ready for Implementation**: ☐ Yes ☐ No (reason: ________________)