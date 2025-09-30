import { z } from 'zod';
import { MaterialWebProvider } from '../providers/material-web-provider.js';
import { FlutterMaterialProvider } from '../providers/flutter-material-provider.js';
import { logger } from '../utils/logger.js';
import { isValidComponentName } from '../utils/validators.js';

const inputSchema = z.object({
  componentName: z.string().describe("Component name (e.g., 'button', 'card')").refine(isValidComponentName, {
    message: "Invalid component name. Use lowercase with hyphens (e.g., 'text-field')"
  }),
  framework: z.enum(['web', 'flutter', 'react', 'angular'])
    .optional()
    .default('flutter')
    .describe("Target framework (default: 'flutter'). Supported: 'web', 'flutter'. React and Angular coming soon."),
  variant: z.string().optional().describe("Variant name (e.g., 'filled', 'outlined', 'elevated')"),
  includeExamples: z.boolean().optional().default(true),
  includeDependencies: z.boolean().optional().default(true)
});

export async function getComponentCode(args: z.infer<typeof inputSchema>) {
  try {
    logger.info('get_component_code called', args);

    // Check for unsupported frameworks
    if (args.framework === 'react' || args.framework === 'angular') {
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            error: 'Framework not yet supported',
            message: `Currently 'web' and 'flutter' frameworks are supported. React and Angular support is planned for future releases.`,
            requested_framework: args.framework,
            available_frameworks: ['web', 'flutter'],
            suggestion: `Try requesting the component with framework: 'flutter' or 'web'.`
          }, null, 2)
        }],
        isError: true
      };
    }

    // Select appropriate provider based on framework (defaults to flutter per schema)
    const framework = args.framework || 'flutter';
    let componentCode;

    if (framework === 'flutter') {
      const provider = new FlutterMaterialProvider();
      componentCode = await provider.getComponentCode(args.componentName, args.variant);
    } else {
      // Use web provider
      const provider = new MaterialWebProvider();
      componentCode = await provider.getComponentCode(args.componentName, args.variant);
    }

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