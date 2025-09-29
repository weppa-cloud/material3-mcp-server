import { z } from 'zod';
import { MaterialWebProvider } from '../providers/material-web-provider.js';
import { logger } from '../utils/logger.js';
import { isValidComponentName } from '../utils/validators.js';

const inputSchema = z.object({
  componentName: z.string().describe("Component name (e.g., 'button', 'card')").refine(isValidComponentName, {
    message: "Invalid component name. Use lowercase with hyphens (e.g., 'text-field')"
  }),
  framework: z.enum(['web', 'flutter', 'react', 'angular']).optional().default('web'),
  variant: z.string().optional().describe("Variant name (e.g., 'filled', 'outlined')"),
  includeExamples: z.boolean().optional().default(true),
  includeDependencies: z.boolean().optional().default(true)
});

export async function getComponentCode(args: z.infer<typeof inputSchema>) {
  try {
    logger.info('get_component_code called', args);

    // Currently only Web Components are supported via GitHub API
    // Flutter, React, Angular require different data sources
    if (args.framework !== 'web') {
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            error: 'Framework not yet supported',
            message: `Currently only 'web' framework is supported via GitHub API (material-components/material-web). Flutter, React, and Angular support is planned for future releases.`,
            requested_framework: args.framework,
            available_framework: 'web',
            suggestion: `Try requesting the component with framework: 'web' to get Material Web Components code.`,
            roadmap: 'Flutter support requires integration with Flutter Material documentation or pub.dev packages.'
          }, null, 2)
        }],
        isError: true
      };
    }

    const provider = new MaterialWebProvider();
    const componentCode = await provider.getComponentCode(args.componentName, args.variant);

    const result = {
      ...componentCode,
      examples: args.includeExamples ? componentCode.examples : [],
      dependencies: args.includeDependencies ? componentCode.dependencies : [],
      imports: args.includeDependencies ? componentCode.imports : []
    };

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(result, null, 2)
      }]
    };
  } catch (error: any) {
    logger.error('get_component_code failed', error);
    return {
      content: [{
        type: 'text' as const,
        text: `Error: ${error.message}`
      }],
      isError: true
    };
  }
}

export const getComponentCodeSchema = inputSchema;