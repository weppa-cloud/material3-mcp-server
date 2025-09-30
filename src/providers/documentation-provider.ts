import * as cheerio from 'cheerio';
import { logger } from '../utils/logger.js';
import { webClient } from '../utils/http-client.js';
import { persistentDocsCache } from '../utils/persistent-cache.js';
import { userConfig } from '../config/user-config.js';
import { MaterialWebProvider } from './material-web-provider.js';
import { FlutterMaterialProvider } from './flutter-material-provider.js';
import type { MaterialComponent, DesignToken, MaterialIcon, AccessibilityGuideline } from '../types/material-component.js';

export class DocumentationProvider {
  private readonly baseUrl = 'https://m3.material.io';
  private materialWebProvider: MaterialWebProvider;
  private flutterMaterialProvider: FlutterMaterialProvider;
  private useWebScraping: boolean;

  constructor(useWebScraping: boolean = false) {
    this.materialWebProvider = new MaterialWebProvider();
    this.flutterMaterialProvider = new FlutterMaterialProvider();
    this.useWebScraping = useWebScraping;
  }

  async getComponents(category?: string, framework?: string): Promise<MaterialComponent[]> {
    logger.info('Fetching Material 3 components', { category, framework });

    // Use GitHub API as primary source
    if (!this.useWebScraping) {
      return this.getComponentsFromGitHub(category, framework);
    }

    // Fallback to web scraping if enabled
    return this.getComponentsFromWeb(category, framework);
  }

  private async getComponentsFromGitHub(category?: string, framework?: string): Promise<MaterialComponent[]> {
    try {
      // Fetch components from both providers
      const [webComponentNames, flutterComponentNames] = await Promise.all([
        this.materialWebProvider.listComponents(),
        this.flutterMaterialProvider.listComponents()
      ]);

      // Create a map to merge components by name
      const componentMap = new Map<string, MaterialComponent>();

      // Add web components
      webComponentNames.forEach(name => {
        componentMap.set(name, {
          name,
          displayName: this.toDisplayName(name),
          category: this.categorizeComponent(name),
          complexity: this.estimateComplexity(name),
          frameworks: ['web'],
          variants: [],
          description: `Material 3 ${this.toDisplayName(name)} component`,
          documentationUrl: `https://m3.material.io/components/${name}`
        });
      });

      // Add flutter components (merge if already exists)
      flutterComponentNames.forEach(name => {
        const existing = componentMap.get(name);
        if (existing) {
          // Component exists in both frameworks
          existing.frameworks.push('flutter');
        } else {
          // Flutter-only component
          componentMap.set(name, {
            name,
            displayName: this.toDisplayName(name),
            category: this.categorizeComponent(name),
            complexity: this.estimateComplexity(name),
            frameworks: ['flutter'],
            variants: [],
            description: `Material 3 ${this.toDisplayName(name)} component`,
            documentationUrl: `https://m3.material.io/components/${name}`
          });
        }
      });

      // Convert map to array
      const components = Array.from(componentMap.values());

      // Filter by category and framework
      return components.filter(comp => {
        const matchesCategory = !category || category === 'all' || comp.category === category;
        const matchesFramework = !framework || framework === 'all' || comp.frameworks.includes(framework);
        return matchesCategory && matchesFramework;
      });
    } catch (error: any) {
      logger.error('Failed to get components from GitHub', error);
      // Fallback to mock data
      return this.getMockComponents(category, framework);
    }
  }

  private async getComponentsFromWeb(category?: string, framework?: string): Promise<MaterialComponent[]> {
    return persistentDocsCache.wrap(`components:web:${category}:${framework}`, async () => {
      try {
        logger.info('Scraping components from m3.material.io');

        const response = await webClient.get(`${this.baseUrl}/components`);
        const $ = cheerio.load(response.data);

        const components: MaterialComponent[] = [];

        // This is a simplified scraper - real implementation would need
        // to analyze the actual HTML structure of m3.material.io
        // For now, fallback to GitHub approach
        logger.warn('Web scraping not fully implemented, using GitHub API instead');
        return this.getComponentsFromGitHub(category, framework);

      } catch (error: any) {
        logger.error('Failed to scrape components', error);
        return this.getMockComponents(category, framework);
      }
    }, userConfig.getCacheTTL('docs'));
  }

  private getMockComponents(category?: string, framework?: string): MaterialComponent[] {
    // Fallback mock data - matches actual material-components/material-web GitHub repo
    const allComponents: MaterialComponent[] = [
      {
        name: 'button',
        displayName: 'Button',
        category: 'buttons',
        complexity: 'simple',
        frameworks: ['web'], // Material Web only supports web framework
        variants: ['filled', 'outlined', 'text', 'elevated', 'tonal'],
        description: 'Buttons help people take action, such as sending an email, sharing a document, or liking a comment.',
        documentationUrl: 'https://m3.material.io/components/buttons'
      },
      {
        name: 'chips',
        displayName: 'Chips',
        category: 'chips',
        complexity: 'medium',
        frameworks: ['web'], // Material Web only supports web framework
        variants: ['assist', 'filter', 'input', 'suggestion'],
        description: 'Chips help people enter information, make selections, filter content, or trigger actions.',
        documentationUrl: 'https://m3.material.io/components/chips'
      },
      {
        name: 'textfield',
        displayName: 'Text Field',
        category: 'text-fields',
        complexity: 'medium',
        frameworks: ['web'], // Material Web only supports web framework
        variants: ['filled', 'outlined'],
        description: 'Text fields let users enter text into a UI.',
        documentationUrl: 'https://m3.material.io/components/text-fields'
      },
      {
        name: 'checkbox',
        displayName: 'Checkbox',
        category: 'selection',
        complexity: 'simple',
        frameworks: ['web'],
        variants: [],
        description: 'Checkboxes allow users to select one or more items from a set.',
        documentationUrl: 'https://m3.material.io/components/checkbox'
      },
      {
        name: 'fab',
        displayName: 'FAB',
        category: 'buttons',
        complexity: 'simple',
        frameworks: ['web'],
        variants: ['surface', 'primary', 'secondary', 'tertiary'],
        description: 'Floating action buttons represent the primary action in an application.',
        documentationUrl: 'https://m3.material.io/components/floating-action-button'
      },
      {
        name: 'dialog',
        displayName: 'Dialog',
        category: 'dialogs',
        complexity: 'complex',
        frameworks: ['web'],
        variants: [],
        description: 'Dialogs provide important prompts in a user flow.',
        documentationUrl: 'https://m3.material.io/components/dialogs'
      },
      {
        name: 'list',
        displayName: 'List',
        category: 'navigation',
        complexity: 'complex',
        frameworks: ['web'],
        variants: [],
        description: 'Lists are continuous, vertical indexes of text or images.',
        documentationUrl: 'https://m3.material.io/components/lists'
      }
    ];

    return allComponents.filter(comp => {
      const matchesCategory = !category || category === 'all' || comp.category === category;
      const matchesFramework = !framework || framework === 'all' || comp.frameworks.includes(framework);
      return matchesCategory && matchesFramework;
    });
  }

  private toDisplayName(name: string): string {
    return name
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private categorizeComponent(name: string): string {
    // Updated to match actual material-components/material-web repo structure
    const categories: { [key: string]: string[] } = {
      'buttons': ['button', 'fab', 'iconbutton'],
      'selection': ['checkbox', 'radio', 'switch', 'slider', 'select'],
      'text-fields': ['textfield', 'field'],
      'chips': ['chips'],
      'navigation': ['tabs', 'menu', 'list'],
      'dialogs': ['dialog'],
      'progress': ['progress'],
      'dividers': ['divider']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => name.includes(keyword))) {
        return category;
      }
    }

    return 'other';
  }

  private estimateComplexity(name: string): 'simple' | 'medium' | 'complex' {
    const simple = ['button', 'checkbox', 'radio', 'switch', 'divider'];
    const complex = ['dialog', 'menu', 'list', 'tabs'];

    if (simple.some(s => name.includes(s))) return 'simple';
    if (complex.some(c => name.includes(c))) return 'complex';
    return 'medium';
  }

  async getDesignTokens(tokenType: string = 'all'): Promise<Record<string, DesignToken>> {
    logger.info('Fetching design tokens', { tokenType });

    // Mock data - real implementation would parse from Material 3 documentation
    const tokens: Record<string, DesignToken> = {
      'md.sys.color.primary': {
        value: '#6750A4',
        type: 'color',
        description: 'High-emphasis primary color',
        wcag: { aa: true, aaa: false }
      },
      'md.sys.color.on-primary': {
        value: '#FFFFFF',
        type: 'color',
        description: 'Text/icons on primary color',
        wcag: { aa: true, aaa: true }
      },
      'md.sys.typescale.body.large.size': {
        value: '16px',
        type: 'typography',
        description: 'Body large font size'
      },
      'md.sys.shape.corner.full': {
        value: '9999px',
        type: 'shape',
        description: 'Fully rounded corners'
      }
    };

    if (tokenType === 'all') {
      return tokens;
    }

    return Object.fromEntries(
      Object.entries(tokens).filter(([_, token]) => token.type === tokenType)
    );
  }

  async searchIcons(query: string, limit: number = 20): Promise<MaterialIcon[]> {
    logger.info('Searching Material icons', { query, limit });

    // Mock data - real implementation would search Material Symbols
    const icons: MaterialIcon[] = [
      {
        name: 'home',
        codepoint: 'e88a',
        categories: ['action'],
        tags: ['house', 'main', 'homepage'],
        svgPath: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
        usage: {
          web: "<span class='material-symbols-outlined'>home</span>",
          flutter: 'Icon(Icons.home)',
          react: '<Icon>home</Icon>'
        }
      },
      {
        name: 'search',
        codepoint: 'e8b6',
        categories: ['action'],
        tags: ['find', 'magnify', 'look'],
        svgPath: 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
        usage: {
          web: "<span class='material-symbols-outlined'>search</span>",
          flutter: 'Icon(Icons.search)',
          react: '<Icon>search</Icon>'
        }
      }
    ];

    return icons
      .filter(icon =>
        icon.name.includes(query.toLowerCase()) ||
        icon.tags.some(tag => tag.includes(query.toLowerCase()))
      )
      .slice(0, limit);
  }

  async getAccessibilityGuidelines(componentName: string, wcagLevel: 'A' | 'AA' | 'AAA' = 'AA'): Promise<{
    component: string;
    wcagLevel: string;
    guidelines: AccessibilityGuideline[];
    ariaAttributes: {
      required: string[];
      optional: string[];
      states: string[];
    };
    keyboardSupport: Record<string, string>;
    screenReaderConsiderations: string[];
  }> {
    logger.info('Fetching accessibility guidelines', { componentName, wcagLevel });

    // Mock data - real implementation would parse from Material 3 accessibility docs
    return {
      component: componentName,
      wcagLevel,
      guidelines: [
        {
          criterion: '1.4.3 Contrast (Minimum)',
          level: 'AA',
          requirement: 'Text contrast ratio minimum 4.5:1',
          implementation: 'Use md-sys-color tokens ensuring sufficient contrast',
          status: 'pass'
        },
        {
          criterion: '2.1.1 Keyboard',
          level: 'A',
          requirement: 'All functionality available from keyboard',
          implementation: 'Component supports Enter and Space for activation',
          status: 'pass'
        },
        {
          criterion: '4.1.2 Name, Role, Value',
          level: 'A',
          requirement: 'Component has accessible name and role',
          implementation: 'Automatically provides role and supports aria-label',
          status: 'pass'
        }
      ],
      ariaAttributes: {
        required: ['role'],
        optional: ['aria-label', 'aria-describedby', 'aria-labelledby'],
        states: ['aria-pressed', 'aria-disabled', 'aria-expanded']
      },
      keyboardSupport: {
        'Enter': `Activates the ${componentName}`,
        'Space': `Activates the ${componentName}`,
        'Tab': 'Moves focus to next focusable element',
        'Shift+Tab': 'Moves focus to previous focusable element'
      },
      screenReaderConsiderations: [
        `Ensure ${componentName} has accessible text content or aria-label`,
        'Announce state changes to screen readers',
        'Provide context for icon-only buttons'
      ]
    };
  }
}