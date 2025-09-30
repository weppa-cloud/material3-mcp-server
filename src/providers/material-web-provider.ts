import { logger } from '../utils/logger.js';
import { githubClient } from '../utils/http-client.js';
import { persistentComponentCache } from '../utils/persistent-cache.js';
import { userConfig } from '../config/user-config.js';
import type { ComponentCode } from '../types/material-component.js';

interface GitHubContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: 'file' | 'dir';
  content?: string;
  encoding?: string;
}

export class MaterialWebProvider {
  private readonly repoPath = 'repos/material-components/material-web';

  /**
   * Check and log GitHub API rate limit status
   */
  private checkRateLimitStatus(response: any): void {
    const remaining = parseInt(response.headers?.['x-ratelimit-remaining'] || '999999');
    const limit = parseInt(response.headers?.['x-ratelimit-limit'] || '999999');
    const reset = response.headers?.['x-ratelimit-reset'];

    if (limit === 999999) return; // No rate limit headers present

    const percentageUsed = ((limit - remaining) / limit) * 100;

    // Warn at 80% consumption
    if (percentageUsed >= 80) {
      const resetDate = reset ? new Date(parseInt(reset) * 1000).toLocaleString() : 'unknown';

      logger.warn('GitHub API rate limit warning', {
        remaining,
        limit,
        percentageUsed: Math.round(percentageUsed),
        resetTime: resetDate,
        suggestion: remaining < 10 ? 'CRITICAL: Set GITHUB_TOKEN environment variable to increase limit to 5,000/hour' : 'Consider setting GITHUB_TOKEN for higher limits'
      });
    }
  }

  async getComponentCode(componentName: string, variant?: string): Promise<ComponentCode> {
    const cacheKey = `component:${componentName}:${variant || 'default'}`;

    return componentCache.wrap(cacheKey, async () => {
      try {
        logger.info(`Fetching component code for: ${componentName}${variant ? ` (${variant})` : ''}`);

        // List files in component directory
        const dirResponse = await githubClient.get<GitHubContent[]>(
          `/${this.repoPath}/contents/${componentName}`
        );

        // Check rate limit after GitHub API call
        this.checkRateLimitStatus(dirResponse);

        const files = dirResponse.data;
        if (!Array.isArray(files)) {
          throw new Error(`Expected directory listing for ${componentName}`);
        }

        // Find the target file
        const targetFileName = variant
          ? `${variant}-${componentName}.ts`
          : files.find(f => f.name.endsWith('.ts') && !f.name.includes('test') && !f.name.includes('harness'))?.name;

        if (!targetFileName) {
          throw new Error(`No TypeScript file found for ${componentName}`);
        }

        const targetFile = files.find(f => f.name === targetFileName);
        if (!targetFile) {
          throw new Error(`File not found: ${targetFileName}`);
        }

        // Fetch file content
        const fileResponse = await githubClient.get<GitHubContent>(
          `/${this.repoPath}/contents/${componentName}/${targetFileName}`
        );

        const fileData = fileResponse.data;
        if (!fileData.content || fileData.encoding !== 'base64') {
          throw new Error(`Invalid content for ${targetFileName}`);
        }

        // Decode base64 content
        const sourceCode = Buffer.from(fileData.content, 'base64').toString('utf-8');

        // Parse imports and dependencies
        const imports = this.extractImports(sourceCode);
        const cssVariables = this.extractCssVariables(sourceCode);

        // Find available variants
        const variants = files
          .filter(f => f.name.endsWith('.ts') && !f.name.includes('test') && !f.name.includes('harness'))
          .map(f => f.name.replace('.ts', '').replace(`-${componentName}`, ''))
          .filter(v => v);

        // Generate examples
        const examples = this.generateExamples(componentName, variant || variants[0]);

        return {
          component: componentName,
          framework: 'web',
          variant: variant || variants[0],
          sourceCode,
          examples,
          dependencies: ['@material/web'],
          imports: [`import '@material/web/${componentName}/${targetFileName.replace('.ts', '.js')}';`],
          cssVariables,
          documentation: `https://m3.material.io/components/${componentName}`,
          availableVariants: variants
        };
      } catch (error: any) {
        logger.error(`Failed to fetch component code: ${componentName}`, error);
        throw new Error(`Component not found: ${componentName} - ${error.message}`);
      }
    });
  }

  async listComponents(): Promise<string[]> {
    return componentCache.wrap('components:list', async () => {
      try {
        logger.info('Listing Material Web components from GitHub');

        const response = await githubClient.get<GitHubContent[]>(
          `/${this.repoPath}/contents`
        );

        const contents = response.data;
        if (!Array.isArray(contents)) {
          throw new Error('Expected array of contents');
        }

        // Filter directories that are actual Material 3 components
        // Based on actual material-components/material-web repo structure
        const components = contents
          .filter(item => item.type === 'dir')
          .filter(item => {
            // Exclude non-component directories (utilities, infrastructure, etc.)
            const excluded = [
              'docs', 'scripts', 'testing', 'internal', 'catalog',
              'elevation', 'focus', 'ripple', 'tokens',
              'typography', 'labs', 'migrations', '.github',
              'field', 'icon', 'color' // These are primitives/internals, not standalone components
            ];
            return !excluded.includes(item.name) && !item.name.startsWith('.');
          })
          .map(item => item.name)
          .sort();

        logger.info(`Found ${components.length} components`);
        return components;
      } catch (error: any) {
        logger.error('Failed to list components', error);
        throw new Error(`Failed to fetch component list: ${error.message}`);
      }
    }, 3600); // Cache for 1 hour
  }

  private extractImports(sourceCode: string): string[] {
    const importRegex = /import\s+.*?from\s+['"](.+?)['"]/g;
    const imports: string[] = [];
    let match;

    while ((match = importRegex.exec(sourceCode)) !== null) {
      imports.push(match[1]);
    }

    return imports;
  }

  private extractCssVariables(sourceCode: string): string[] {
    const cssVarRegex = /--md-[\w-]+/g;
    const variables = new Set<string>();
    let match;

    while ((match = cssVarRegex.exec(sourceCode)) !== null) {
      variables.add(match[0]);
    }

    return Array.from(variables);
  }

  private generateExamples(componentName: string, variant: string) {
    const tagName = variant ? `md-${variant}-${componentName}` : `md-${componentName}`;

    return [
      {
        title: `Basic ${variant || ''} ${componentName}`,
        code: `<${tagName}>Click me</${tagName}>`,
        description: `Standard ${componentName} usage`
      },
      {
        title: 'With Import',
        code: `import '@material/web/${componentName}/${variant}.js';\n\n<${tagName}>Click me</${tagName}>`,
        description: 'Full example with import statement'
      }
    ];
  }
}