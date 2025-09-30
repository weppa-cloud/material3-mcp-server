import { z } from 'zod';
import { logger } from '../utils/logger.js';
import {
  argbFromHex,
  themeFromSourceColor,
  hexFromArgb,
  TonalPalette,
  Hct
} from '@material/material-color-utilities';

export const generateThemeFromColorSchema = z.object({
  baseColor: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color (e.g., #6750A4)'),
  mode: z.enum(['light', 'dark']).default('light'),
  format: z.enum(['css', 'json', 'scss', 'dart']).default('json'),
  contrastLevel: z.number().min(-1).max(1).default(0)
    .describe('Contrast level: -1 (reduced), 0 (standard), 1 (high)')
});

interface ColorToken {
  name: string;
  value: string;
  description: string;
}

export async function generateThemeFromColor(
  args: z.infer<typeof generateThemeFromColorSchema>
) {
  try {
    logger.info('Generating theme from color', args);

    const { baseColor, mode, format, contrastLevel } = args;

    // Convert hex to ARGB
    const sourceColorArgb = argbFromHex(baseColor);

    // Generate Material 3 theme
    const theme = themeFromSourceColor(sourceColorArgb, [
      {
        name: 'custom',
        value: sourceColorArgb,
        blend: true
      }
    ]);

    // Get the appropriate scheme (light or dark)
    const scheme = mode === 'light' ? theme.schemes.light : theme.schemes.dark;

    // Extract color tokens
    const tokens: ColorToken[] = [
      // Primary
      { name: 'primary', value: hexFromArgb(scheme.primary), description: 'Primary brand color' },
      { name: 'onPrimary', value: hexFromArgb(scheme.onPrimary), description: 'Text/icons on primary' },
      { name: 'primaryContainer', value: hexFromArgb(scheme.primaryContainer), description: 'Containers using primary' },
      { name: 'onPrimaryContainer', value: hexFromArgb(scheme.onPrimaryContainer), description: 'Text/icons on primary container' },

      // Secondary
      { name: 'secondary', value: hexFromArgb(scheme.secondary), description: 'Secondary brand color' },
      { name: 'onSecondary', value: hexFromArgb(scheme.onSecondary), description: 'Text/icons on secondary' },
      { name: 'secondaryContainer', value: hexFromArgb(scheme.secondaryContainer), description: 'Containers using secondary' },
      { name: 'onSecondaryContainer', value: hexFromArgb(scheme.onSecondaryContainer), description: 'Text/icons on secondary container' },

      // Tertiary
      { name: 'tertiary', value: hexFromArgb(scheme.tertiary), description: 'Tertiary brand color' },
      { name: 'onTertiary', value: hexFromArgb(scheme.onTertiary), description: 'Text/icons on tertiary' },
      { name: 'tertiaryContainer', value: hexFromArgb(scheme.tertiaryContainer), description: 'Containers using tertiary' },
      { name: 'onTertiaryContainer', value: hexFromArgb(scheme.onTertiaryContainer), description: 'Text/icons on tertiary container' },

      // Error
      { name: 'error', value: hexFromArgb(scheme.error), description: 'Error color' },
      { name: 'onError', value: hexFromArgb(scheme.onError), description: 'Text/icons on error' },
      { name: 'errorContainer', value: hexFromArgb(scheme.errorContainer), description: 'Containers for errors' },
      { name: 'onErrorContainer', value: hexFromArgb(scheme.onErrorContainer), description: 'Text/icons on error container' },

      // Surface
      { name: 'surface', value: hexFromArgb(scheme.surface), description: 'Surface background' },
      { name: 'onSurface', value: hexFromArgb(scheme.onSurface), description: 'Text/icons on surface' },
      { name: 'surfaceVariant', value: hexFromArgb(scheme.surfaceVariant), description: 'Variant surface color' },
      { name: 'onSurfaceVariant', value: hexFromArgb(scheme.onSurfaceVariant), description: 'Text/icons on surface variant' },

      // Outline
      { name: 'outline', value: hexFromArgb(scheme.outline), description: 'Borders and dividers' },
      { name: 'outlineVariant', value: hexFromArgb(scheme.outlineVariant), description: 'Variant outline color' },

      // Background
      { name: 'background', value: hexFromArgb(scheme.background), description: 'Background color' },
      { name: 'onBackground', value: hexFromArgb(scheme.onBackground), description: 'Text/icons on background' },

      // Other
      { name: 'inverseSurface', value: hexFromArgb(scheme.inverseSurface), description: 'Inverse surface color' },
      { name: 'inverseOnSurface', value: hexFromArgb(scheme.inverseOnSurface), description: 'Text on inverse surface' },
      { name: 'inversePrimary', value: hexFromArgb(scheme.inversePrimary), description: 'Inverse primary color' },
      { name: 'shadow', value: hexFromArgb(scheme.shadow), description: 'Shadow color' },
      { name: 'scrim', value: hexFromArgb(scheme.scrim), description: 'Scrim overlay color' }
    ];

    // Format output based on requested format
    let formattedOutput: string;

    switch (format) {
      case 'css':
        formattedOutput = formatAsCss(tokens, mode);
        break;
      case 'scss':
        formattedOutput = formatAsScss(tokens, mode);
        break;
      case 'dart':
        formattedOutput = formatAsDart(tokens, mode, baseColor);
        break;
      case 'json':
      default:
        formattedOutput = JSON.stringify({
          sourceColor: baseColor,
          mode,
          contrastLevel,
          tokens: tokens.reduce((acc, token) => {
            acc[token.name] = {
              value: token.value,
              description: token.description
            };
            return acc;
          }, {} as Record<string, { value: string; description: string }>),
          usage: {
            web: `import { applyTheme } from '@material/web/theming/themes';\napplyTheme(document.body, ${JSON.stringify(tokens.reduce((acc, t) => ({ ...acc, [t.name]: t.value }), {}))});`,
            flutter: `ThemeData(\n  colorScheme: ColorScheme.${mode}(\n    primary: Color(0xFF${tokens[0].value.slice(1)}),\n    // ... other colors\n  ),\n)`,
            css: `Apply the CSS variables from the 'css' format output`
          }
        }, null, 2);
    }

    logger.info('Theme generated successfully', {
      baseColor,
      mode,
      format,
      tokenCount: tokens.length
    });

    return {
      content: [{
        type: 'text' as const,
        text: formattedOutput
      }]
    };

  } catch (error: any) {
    logger.error('Failed to generate theme from color', error);
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          error: 'Failed to generate theme',
          message: error.message,
          suggestion: 'Ensure baseColor is a valid hex color (e.g., #6750A4)'
        }, null, 2)
      }],
      isError: true
    };
  }
}

function formatAsCss(tokens: ColorToken[], mode: string): string {
  const lines = [
    `/* Material 3 ${mode} theme */`,
    `:root {`
  ];

  tokens.forEach(token => {
    lines.push(`  --md-sys-color-${kebabCase(token.name)}: ${token.value}; /* ${token.description} */`);
  });

  lines.push(`}`);
  lines.push(``);
  lines.push(`/* Usage example: */`);
  lines.push(`.button-primary {`);
  lines.push(`  background-color: var(--md-sys-color-primary);`);
  lines.push(`  color: var(--md-sys-color-on-primary);`);
  lines.push(`}`);

  return lines.join('\n');
}

function formatAsScss(tokens: ColorToken[], mode: string): string {
  const lines = [
    `// Material 3 ${mode} theme`,
    ``
  ];

  tokens.forEach(token => {
    lines.push(`$md-sys-color-${kebabCase(token.name)}: ${token.value}; // ${token.description}`);
  });

  lines.push(``);
  lines.push(`// Usage example:`);
  lines.push(`.button-primary {`);
  lines.push(`  background-color: $md-sys-color-primary;`);
  lines.push(`  color: $md-sys-color-on-primary;`);
  lines.push(`}`);

  return lines.join('\n');
}

function formatAsDart(tokens: ColorToken[], mode: string, sourceColor: string): string {
  const lines = [
    `// Material 3 ${mode} theme generated from ${sourceColor}`,
    `import 'package:flutter/material.dart';`,
    ``,
    `final ThemeData ${mode}Theme = ThemeData(`,
    `  useMaterial3: true,`,
    `  brightness: Brightness.${mode},`,
    `  colorScheme: ColorScheme.${mode}(`
  ];

  tokens.slice(0, 15).forEach((token, index) => {
    const isLast = index === 14;
    const colorValue = token.value.toUpperCase().replace('#', '0xFF');
    lines.push(`    ${camelCase(token.name)}: Color(${colorValue})${isLast ? '' : ','} // ${token.description}`);
  });

  lines.push(`  ),`);
  lines.push(`);`);

  return lines.join('\n');
}

function kebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function camelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}