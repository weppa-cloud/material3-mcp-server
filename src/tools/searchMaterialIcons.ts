import { z } from 'zod';
import { MaterialSymbolsProvider } from '../providers/material-symbols-provider.js';
import { logger } from '../utils/logger.js';

const inputSchema = z.object({
  query: z.string().describe("Search query (e.g., 'home', 'settings')"),
  style: z.enum(['outlined', 'rounded', 'sharp']).optional(),
  filled: z.boolean().optional(),
  limit: z.number().max(100).optional().default(20)
});

export async function searchMaterialIcons(args: z.infer<typeof inputSchema>) {
  try {
    logger.info('search_material_icons called', args);

    const provider = new MaterialSymbolsProvider();
    const icons = await provider.searchIcons(args.query, {
      style: args.style,
      filled: args.filled,
      limit: args.limit
    });

    // Generate usage code for each icon
    const resultsWithCode = icons.map(icon => ({
      name: icon.name,
      category: icon.category,
      tags: icon.tags,
      svg: provider.generateSvgCode(icon),
      usage: {
        web: provider.generateUsageCode(icon.name, 'web'),
        react: provider.generateUsageCode(icon.name, 'react'),
        angular: provider.generateUsageCode(icon.name, 'angular'),
        vue: provider.generateUsageCode(icon.name, 'vue'),
        flutter: provider.generateUsageCode(icon.name, 'flutter')
      }
    }));

    const result = {
      query: args.query,
      filters: {
        style: args.style || 'all',
        filled: args.filled || false
      },
      results: resultsWithCode,
      total: resultsWithCode.length,
      documentation: 'https://fonts.google.com/icons',
      apiDocs: 'https://developers.google.com/fonts/docs/material_symbols'
    };

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(result, null, 2)
      }]
    };
  } catch (error: any) {
    logger.error('search_material_icons failed', error);
    return {
      content: [{
        type: 'text' as const,
        text: `Error: ${error.message}`
      }],
      isError: true
    };
  }
}

export const searchMaterialIconsSchema = inputSchema;