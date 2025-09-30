import { z } from 'zod';
import { DocumentationProvider } from '../providers/documentation-provider.js';
import { logger } from '../utils/logger.js';

const inputSchema = z.object({
  componentName: z.string().describe("Component name"),
  wcagLevel: z.enum(['A', 'AA', 'AAA']).optional().default('AA'),
  includeARIA: z.boolean().optional().default(true),
  includeKeyboard: z.boolean().optional().default(true)
});

export async function getAccessibilityGuidelines(args: z.infer<typeof inputSchema>) {
  try {
    logger.info('get_accessibility_guidelines called', args);

    const provider = new DocumentationProvider();
    const guidelines = await provider.getAccessibilityGuidelines(
      args.componentName,
      args.wcagLevel
    );

    const result = {
      ...guidelines,
      ariaAttributes: args.includeARIA ? guidelines.ariaAttributes : undefined,
      keyboardSupport: args.includeKeyboard ? guidelines.keyboardSupport : undefined
    };

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(result, null, 2)
      }]
    };
  } catch (error: any) {
    logger.error('get_accessibility_guidelines failed', error);
    return {
      content: [{
        type: 'text' as const,
        text: `Error: ${error.message}`
      }],
      isError: true
    };
  }
}

export const getAccessibilityGuidelinesSchema = inputSchema;