import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';
import { iconCache } from '../utils/cache.js';

interface IconifyIcon {
  body: string;
  width?: number;
  height?: number;
  left?: number;
  top?: number;
  rotate?: number;
  hFlip?: boolean;
  vFlip?: boolean;
}

interface IconifyJSON {
  prefix: string;
  icons: {
    [key: string]: IconifyIcon;
  };
  aliases?: {
    [key: string]: {
      parent: string;
      [key: string]: any;
    };
  };
  width?: number;
  height?: number;
}

export interface MaterialIcon {
  name: string;
  body: string;
  category?: string;
  tags?: string[];
}

export class MaterialSymbolsProvider {
  private iconsData?: IconifyJSON;
  private iconsList: string[] = [];

  constructor() {
    this.loadIconsData();
  }

  private loadIconsData() {
    try {
      // Resolve path to @iconify-json/material-symbols package
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);

      // Try to load from node_modules
      const iconifyPath = join(__dirname, '../../node_modules/@iconify-json/material-symbols/icons.json');

      const data = readFileSync(iconifyPath, 'utf-8');
      this.iconsData = JSON.parse(data);
      this.iconsList = Object.keys(this.iconsData?.icons || {});

      logger.info(`Loaded ${this.iconsList.length} Material Symbols icons`);
    } catch (error: any) {
      logger.error('Failed to load Material Symbols icons data', error);
      throw new Error('Could not load Material Symbols data. Ensure @iconify-json/material-symbols is installed.');
    }
  }

  async searchIcons(
    query: string,
    options: {
      style?: 'outlined' | 'rounded' | 'sharp';
      filled?: boolean;
      limit?: number;
    } = {}
  ): Promise<MaterialIcon[]> {
    const { style, filled, limit = 20 } = options;
    const cacheKey = `icons:search:${query}:${style}:${filled}:${limit}`;

    return iconCache.wrap(cacheKey, async () => {
      if (!this.iconsData) {
        throw new Error('Icons data not loaded');
      }

      // Normalize query
      const normalizedQuery = query.toLowerCase().replace(/\s+/g, '-');

      // Filter icons
      let results = this.iconsList.filter(iconName => {
        const normalized = iconName.toLowerCase();
        return normalized.includes(normalizedQuery);
      });

      // Apply style filter (note: Iconify material-symbols might not have style variants)
      // Most Material Symbols in Iconify are already the outlined style
      // For real style filtering, you'd need different Iconify packages

      // Sort by relevance (exact match first, then starts with, then contains)
      results.sort((a, b) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        const queryLower = normalizedQuery;

        if (aLower === queryLower) return -1;
        if (bLower === queryLower) return 1;
        if (aLower.startsWith(queryLower)) return -1;
        if (bLower.startsWith(queryLower)) return 1;
        return 0;
      });

      // Limit results
      results = results.slice(0, limit);

      // Map to MaterialIcon format
      return results.map(iconName => {
        const iconData = this.iconsData!.icons[iconName];
        return {
          name: iconName,
          body: iconData.body,
          category: this.categorizeIcon(iconName),
          tags: this.generateTags(iconName)
        };
      });
    }, 86400); // Cache for 24 hours
  }

  async getIcon(name: string): Promise<MaterialIcon | null> {
    if (!this.iconsData) {
      throw new Error('Icons data not loaded');
    }

    const iconData = this.iconsData.icons[name];
    if (!iconData) {
      return null;
    }

    return {
      name,
      body: iconData.body,
      category: this.categorizeIcon(name),
      tags: this.generateTags(name)
    };
  }

  generateUsageCode(iconName: string, framework: 'web' | 'react' | 'angular' | 'vue' | 'flutter' = 'web'): string {
    switch (framework) {
      case 'web':
        return `<!-- Using Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />

<span class="material-symbols-outlined">
  ${iconName.replace(/-/g, '_')}
</span>`;

      case 'react':
        return `// Install: npm install @mui/icons-material
import ${this.toPascalCase(iconName)}Icon from '@mui/icons-material/${this.toPascalCase(iconName)}';

function MyComponent() {
  return <${this.toPascalCase(iconName)}Icon />;
}`;

      case 'angular':
        return `<!-- Install: ng add @angular/material -->
<!-- In module: import { MatIconModule } from '@angular/material/icon'; -->

<mat-icon>${iconName.replace(/-/g, '_')}</mat-icon>`;

      case 'vue':
        return `<!-- Using Google Fonts -->
<template>
  <span class="material-symbols-outlined">
    ${iconName.replace(/-/g, '_')}
  </span>
</template>`;

      case 'flutter':
        return `// Using Material Icons (included in Flutter SDK)
import 'package:flutter/material.dart';

// Basic usage
Icon(Icons.${this.toFlutterIconName(iconName)})

// With customization
Icon(
  Icons.${this.toFlutterIconName(iconName)},
  size: 24.0,
  color: Colors.blue,
)

// In a widget
IconButton(
  icon: Icon(Icons.${this.toFlutterIconName(iconName)}),
  onPressed: () {
    // Handle press
  },
)`;

      default:
        return `Icon: ${iconName}`;
    }
  }

  generateSvgCode(icon: MaterialIcon): string {
    const width = this.iconsData?.width || 24;
    const height = this.iconsData?.height || 24;

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <path d="${icon.body}" fill="currentColor"/>
</svg>`;
  }

  private categorizeIcon(iconName: string): string {
    // Basic categorization based on common prefixes/keywords
    const categories: { [key: string]: string[] } = {
      'action': ['add', 'delete', 'edit', 'save', 'search', 'settings'],
      'navigation': ['arrow', 'menu', 'home', 'back', 'forward', 'expand', 'close'],
      'communication': ['email', 'chat', 'message', 'call', 'phone'],
      'content': ['copy', 'paste', 'cut', 'link', 'attach', 'file'],
      'device': ['phone', 'computer', 'tablet', 'watch', 'tv'],
      'social': ['share', 'people', 'person', 'group'],
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => iconName.includes(keyword))) {
        return category;
      }
    }

    return 'other';
  }

  private generateTags(iconName: string): string[] {
    // Generate tags from icon name
    return iconName.split('-').filter(tag => tag.length > 2);
  }

  private toPascalCase(str: string): string {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  /**
   * Converts icon name to Flutter Icons class naming convention
   * Examples: 'home' -> 'home', 'arrow-back' -> 'arrow_back', 'add-circle' -> 'add_circle'
   */
  private toFlutterIconName(iconName: string): string {
    // Flutter uses snake_case for icon names in the Icons class
    return iconName.replace(/-/g, '_');
  }

  getStats(): {
    totalIcons: number;
    loaded: boolean;
    cacheStats: {
      hits: number;
      misses: number;
      keys: number;
      hitRate: string;
    };
  } {
    return {
      totalIcons: this.iconsList.length,
      loaded: !!this.iconsData,
      cacheStats: iconCache.getStats()
    };
  }
}