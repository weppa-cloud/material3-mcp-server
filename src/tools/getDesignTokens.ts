import { z } from 'zod';
import { DocumentationProvider } from '../providers/documentation-provider.js';
import { logger } from '../utils/logger.js';

const inputSchema = z.object({
  tokenType: z.enum([
    'color',
    'typography',
    'spacing',
    'elevation',
    'shape',
    'motion',
    'all'
  ]).optional().default('all'),
  format: z.enum(['css', 'scss', 'json', 'javascript']).optional().default('json'),
  includeDocumentation: z.boolean().optional().default(true)
});

export async function getDesignTokens(args: z.infer<typeof inputSchema>) {
  try {
    logger.info('get_design_tokens called', args);

    const provider = new DocumentationProvider();
    const tokens = await provider.getDesignTokens(args.tokenType);

    let formattedOutput = '';

    switch (args.format) {
      case 'css':
        formattedOutput = ':root {\n' +
          Object.entries(tokens)
            .map(([key, token]) => `  --${key}: ${token.value};`)
            .join('\n') +
          '\n}';
        break;

      case 'scss':
        formattedOutput = Object.entries(tokens)
          .map(([key, token]) => `$${key.replace(/\./g, '-')}: ${token.value};`)
          .join('\n');
        break;

      case 'javascript':
        formattedOutput = `export const tokens = ${JSON.stringify(tokens, null, 2)};`;
        break;

      case 'json':
      default:
        formattedOutput = JSON.stringify(tokens, null, 2);
        break;
    }

    const result = {
      tokenType: args.tokenType,
      format: args.format,
      tokens: tokens,
      formatted: formattedOutput,
      documentation: args.includeDocumentation
        ? 'https://m3.material.io/foundations/design-tokens'
        : undefined
    };

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(result, null, 2)
      }]
    };
  } catch (error: any) {
    logger.error('get_design_tokens failed', error);
    return {
      content: [{
        type: 'text' as const,
        text: `Error: ${error.message}`
      }],
      isError: true
    };
  }
}

export const getDesignTokensSchema = inputSchema;