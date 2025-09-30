import { z } from 'zod';
import { DocumentationProvider } from '../providers/documentation-provider.js';
import { logger } from '../utils/logger.js';

const inputSchema = z.object({
  category: z.enum([
    'buttons', 'cards', 'chips', 'dialogs', 'lists',
    'menus', 'navigation', 'progress', 'selection',
    'sliders', 'text-fields', 'all'
  ]).optional().default('all'),
  complexity: z.enum(['simple', 'medium', 'complex', 'all']).optional().default('all'),
  framework: z.enum(['web', 'flutter', 'react', 'angular', 'all']).optional().default('all'),
  includeDeprecated: z.boolean().optional().default(false)
});

export async function listMaterialComponents(args: z.infer<typeof inputSchema>) {
  try {
    logger.info('list_material_components called', args);

    const provider = new DocumentationProvider();
    let components = await provider.getComponents(
      args.category === 'all' ? undefined : args.category,
      args.framework === 'all' ? undefined : args.framework
    );

    // Filter by complexity
    if (args.complexity !== 'all') {
      components = components.filter(c => c.complexity === args.complexity);
    }

    const result = {
      components,
      total: components.length,
      filters: {
        category: args.category,
        complexity: args.complexity,
        framework: args.framework
      }
    };

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(result, null, 2)
      }]
    };
  } catch (error: any) {
    logger.error('list_material_components failed', error);
    return {
      content: [{
        type: 'text' as const,
        text: `Error: ${error.message}`
      }],
      isError: true
    };
  }
}

export const listMaterialComponentsSchema = inputSchema;