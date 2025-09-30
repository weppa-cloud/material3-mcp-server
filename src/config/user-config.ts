import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { logger } from '../utils/logger.js';

export interface UserConfig {
  defaultFramework: 'web' | 'flutter' | 'react' | 'angular';
  cacheEnabled: boolean;
  cacheTTL: {
    components: number; // seconds
    icons: number;
    docs: number;
  };
  githubToken?: string;
}

const DEFAULT_CONFIG: UserConfig = {
  defaultFramework: 'flutter',
  cacheEnabled: true,
  cacheTTL: {
    components: 3600,  // 1 hour
    icons: 86400,      // 24 hours
    docs: 43200        // 12 hours
  }
};

export class UserConfigManager {
  private configPath: string;
  private config: UserConfig;

  constructor() {
    // Store config in user's home directory
    const configDir = join(homedir(), '.material3-mcp');
    this.configPath = join(configDir, 'config.json');

    // Ensure config directory exists
    if (!existsSync(configDir)) {
      mkdirSync(configDir, { recursive: true });
    }

    // Load or create config
    this.config = this.loadConfig();
  }

  /**
   * Load config from disk, or create default if not exists
   */
  private loadConfig(): UserConfig {
    try {
      if (existsSync(this.configPath)) {
        const data = readFileSync(this.configPath, 'utf-8');
        const loaded = JSON.parse(data) as Partial<UserConfig>;

        // Merge with defaults to ensure all fields exist
        const config = {
          ...DEFAULT_CONFIG,
          ...loaded,
          cacheTTL: {
            ...DEFAULT_CONFIG.cacheTTL,
            ...(loaded.cacheTTL || {})
          }
        };

        logger.info('User config loaded', { path: this.configPath, config });
        return config;
      }
    } catch (error: any) {
      logger.warn('Failed to load user config, using defaults', error);
    }

    // Create default config file
    this.saveConfig(DEFAULT_CONFIG);
    logger.info('Created default user config', { path: this.configPath });
    return DEFAULT_CONFIG;
  }

  /**
   * Save config to disk
   */
  private saveConfig(config: UserConfig): void {
    try {
      writeFileSync(
        this.configPath,
        JSON.stringify(config, null, 2),
        'utf-8'
      );
      logger.info('User config saved', { path: this.configPath });
    } catch (error: any) {
      logger.error('Failed to save user config', error);
    }
  }

  /**
   * Get current config
   */
  getConfig(): UserConfig {
    return { ...this.config };
  }

  /**
   * Get default framework
   */
  getDefaultFramework(): 'web' | 'flutter' | 'react' | 'angular' {
    return this.config.defaultFramework;
  }

  /**
   * Set default framework
   */
  setDefaultFramework(framework: 'web' | 'flutter' | 'react' | 'angular'): void {
    this.config.defaultFramework = framework;
    this.saveConfig(this.config);
    logger.info('Default framework updated', { framework });
  }

  /**
   * Check if cache is enabled
   */
  isCacheEnabled(): boolean {
    return this.config.cacheEnabled;
  }

  /**
   * Get cache TTL for a specific type
   */
  getCacheTTL(type: 'components' | 'icons' | 'docs'): number {
    return this.config.cacheTTL[type];
  }

  /**
   * Update cache settings
   */
  updateCacheSettings(settings: Partial<UserConfig['cacheTTL']>): void {
    this.config.cacheTTL = {
      ...this.config.cacheTTL,
      ...settings
    };
    this.saveConfig(this.config);
    logger.info('Cache settings updated', settings);
  }

  /**
   * Get GitHub token (prefer env var over config)
   */
  getGithubToken(): string | undefined {
    return process.env.GITHUB_TOKEN || this.config.githubToken;
  }

  /**
   * Set GitHub token
   */
  setGithubToken(token: string | undefined): void {
    this.config.githubToken = token;
    this.saveConfig(this.config);
    logger.info('GitHub token updated');
  }

  /**
   * Reset config to defaults
   */
  reset(): void {
    this.config = { ...DEFAULT_CONFIG };
    this.saveConfig(this.config);
    logger.info('User config reset to defaults');
  }

  /**
   * Get config file path
   */
  getConfigPath(): string {
    return this.configPath;
  }
}

// Export singleton instance
export const userConfig = new UserConfigManager();