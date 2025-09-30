import { logger } from '../utils/logger.js';
import { githubClient } from '../utils/http-client.js';
import { componentCache } from '../utils/cache.js';
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

/**
 * Provider for Flutter Material Design components
 * Fetches component source code from flutter/flutter GitHub repository
 */
export class FlutterMaterialProvider {
  private readonly repoPath = 'repos/flutter/flutter';
  private readonly materialPath = 'packages/flutter/lib/src/material';

  /**
   * Gets Flutter Material component code from GitHub
   * @param componentName - Component name (e.g., 'button', 'card', 'chip')
   * @param variant - Component variant (e.g., 'elevated', 'outlined', 'text')
   */
  async getComponentCode(componentName: string, variant?: string): Promise<ComponentCode> {
    const cacheKey = `flutter:${componentName}:${variant || 'default'}`;

    return componentCache.wrap(cacheKey, async () => {
      try {
        logger.info(`Fetching Flutter component code for: ${componentName}${variant ? ` (${variant})` : ''}`);

        // Determine file name based on variant
        const fileName = this.resolveFileName(componentName, variant);
        const filePath = `${this.materialPath}/${fileName}`;

        // Fetch file content from GitHub
        const fileResponse = await githubClient.get<GitHubContent>(
          `/${this.repoPath}/contents/${filePath}`
        );

        const fileData = fileResponse.data;
        if (!fileData.content || fileData.encoding !== 'base64') {
          throw new Error(`Invalid content for ${fileName}`);
        }

        // Decode base64 content
        const sourceCode = Buffer.from(fileData.content, 'base64').toString('utf-8');

        // Extract metadata from Dart code
        const imports = this.extractImports(sourceCode);
        const classNames = this.extractClassNames(sourceCode);
        const variants = this.inferVariants(componentName);

        // Generate usage examples
        const examples = this.generateExamples(componentName, variant, classNames[0]);

        return {
          component: componentName,
          framework: 'flutter',
          variant: variant || 'default',
          sourceCode,
          examples,
          dependencies: ['flutter/material.dart'],
          imports: [`import 'package:flutter/material.dart';`],
          cssVariables: [], // Flutter uses theme properties, not CSS
          documentation: `https://api.flutter.dev/flutter/material/${classNames[0]}-class.html`,
          availableVariants: variants,
        };
      } catch (error: any) {
        logger.error(`Failed to fetch Flutter component code: ${componentName}`, error);
        throw new Error(`Flutter component not found: ${componentName} - ${error.message}`);
      }
    });
  }

  /**
   * Resolves the Dart file name based on component and variant
   */
  private resolveFileName(componentName: string, variant?: string): string {
    // Map component names to Flutter file names
    const fileNameMap: Record<string, string> = {
      // Buttons
      'button': variant ? `${variant}_button.dart` : 'button.dart',
      'elevated-button': 'elevated_button.dart',
      'text-button': 'text_button.dart',
      'outlined-button': 'outlined_button.dart',
      'icon-button': 'icon_button.dart',
      'floating-action-button': 'floating_action_button.dart',
      'fab': 'floating_action_button.dart',

      // Chips
      'chip': variant ? `${variant}_chip.dart` : 'chip.dart',
      'action-chip': 'action_chip.dart',
      'filter-chip': 'filter_chip.dart',
      'input-chip': 'input_chip.dart',
      'choice-chip': 'choice_chip.dart',

      // Cards
      'card': 'card.dart',

      // Text fields
      'text-field': 'text_field.dart',
      'textfield': 'text_field.dart',
      'text-form-field': 'text_form_field.dart',

      // Selection controls
      'checkbox': 'checkbox.dart',
      'radio': 'radio.dart',
      'switch': 'switch.dart',
      'slider': 'slider.dart',

      // Dialogs
      'dialog': 'dialog.dart',
      'alert-dialog': 'alert_dialog.dart',
      'simple-dialog': 'simple_dialog.dart',

      // Lists
      'list-tile': 'list_tile.dart',
      'expansion-tile': 'expansion_tile.dart',

      // App bars
      'app-bar': 'app_bar.dart',
      'bottom-app-bar': 'bottom_app_bar.dart',

      // Navigation
      'bottom-navigation-bar': 'bottom_navigation_bar.dart',
      'navigation-bar': 'navigation_bar.dart',
      'navigation-rail': 'navigation_rail.dart',
      'tab-bar': 'tab_bar.dart',
      'tabs': 'tabs.dart',

      // Progress indicators
      'circular-progress-indicator': 'circular_progress_indicator.dart',
      'linear-progress-indicator': 'linear_progress_indicator.dart',
      'progress': 'progress_indicator.dart',

      // Snackbar
      'snackbar': 'snack_bar.dart',
      'snack-bar': 'snack_bar.dart',
    };

    const fileName = fileNameMap[componentName.toLowerCase()];
    if (!fileName) {
      // Default: convert component-name to component_name.dart
      return `${componentName.replace(/-/g, '_')}.dart`;
    }

    return fileName;
  }

  /**
   * Extracts import statements from Dart code
   */
  private extractImports(sourceCode: string): string[] {
    const importRegex = /import\s+['"](.+?)['"]/g;
    const imports: string[] = [];
    let match;

    while ((match = importRegex.exec(sourceCode)) !== null) {
      imports.push(match[1]);
    }

    return imports;
  }

  /**
   * Extracts class names from Dart code
   */
  private extractClassNames(sourceCode: string): string[] {
    const classRegex = /class\s+(\w+)/g;
    const classNames: string[] = [];
    let match;

    while ((match = classRegex.exec(sourceCode)) !== null) {
      classNames.push(match[1]);
    }

    return classNames;
  }

  /**
   * Infers available variants for a component
   */
  private inferVariants(componentName: string): string[] {
    const variantsMap: Record<string, string[]> = {
      'button': ['elevated', 'text', 'outlined', 'filled', 'tonal'],
      'chip': ['action', 'filter', 'input', 'choice'],
      'dialog': ['alert', 'simple'],
      'fab': ['small', 'large', 'extended'],
      'progress': ['circular', 'linear'],
    };

    return variantsMap[componentName] || [];
  }

  /**
   * Generates Flutter usage examples
   */
  private generateExamples(componentName: string, variant: string | undefined, className: string): Array<{
    title: string;
    code: string;
    description: string;
  }> {
    // Determine widget name
    const widgetName = className || this.toWidgetName(componentName, variant);

    return [
      {
        title: `Basic ${widgetName}`,
        code: `${widgetName}(
  onPressed: () {
    // Handle press
  },
  child: Text('Click me'),
)`,
        description: `Standard ${widgetName} usage`,
      },
      {
        title: 'Full Example',
        code: `import 'package:flutter/material.dart';

class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: ${widgetName}(
          onPressed: () {
            print('${widgetName} pressed');
          },
          child: Text('Click me'),
        ),
      ),
    );
  }
}`,
        description: 'Complete Flutter widget example',
      },
    ];
  }

  /**
   * Converts component name to Flutter widget name
   */
  private toWidgetName(componentName: string, variant?: string): string {
    const baseNameMap: Record<string, string> = {
      'button': 'Button',
      'elevated-button': 'ElevatedButton',
      'text-button': 'TextButton',
      'outlined-button': 'OutlinedButton',
      'fab': 'FloatingActionButton',
      'card': 'Card',
      'chip': 'Chip',
      'text-field': 'TextField',
      'checkbox': 'Checkbox',
      'radio': 'Radio',
      'switch': 'Switch',
      'slider': 'Slider',
      'dialog': 'Dialog',
      'app-bar': 'AppBar',
      'snackbar': 'SnackBar',
    };

    const baseName = baseNameMap[componentName] || this.toPascalCase(componentName);

    if (variant) {
      return `${this.toPascalCase(variant)}${baseName}`;
    }

    return baseName;
  }

  /**
   * Converts kebab-case to PascalCase
   */
  private toPascalCase(str: string): string {
    return str
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  /**
   * Lists all available Flutter Material components
   */
  async listComponents(): Promise<string[]> {
    return componentCache.wrap('flutter:components:list', async () => {
      try {
        logger.info('Listing Flutter Material components from GitHub');

        const response = await githubClient.get<GitHubContent[]>(
          `/${this.repoPath}/contents/${this.materialPath}`
        );

        const contents = response.data;
        if (!Array.isArray(contents)) {
          throw new Error('Expected array of contents');
        }

        // Filter Dart files that are likely components
        const components = contents
          .filter(item => item.type === 'file')
          .filter(item => item.name.endsWith('.dart'))
          .filter(item => {
            // Exclude theme, style, and internal files
            const excluded = [
              '_',
              'theme',
              'style',
              'constants',
              'typography',
              'colors',
              'icons',
              'material_state',
              'debug',
            ];
            return !excluded.some(ex => item.name.includes(ex));
          })
          .map(item => item.name.replace('.dart', '').replace(/_/g, '-'))
          .sort();

        logger.info(`Found ${components.length} Flutter Material components`);
        return components;
      } catch (error: any) {
        logger.error('Failed to list Flutter components', error);
        throw new Error(`Failed to fetch Flutter component list: ${error.message}`);
      }
    }, 3600); // Cache for 1 hour
  }
}

export const flutterMaterialProvider = new FlutterMaterialProvider();