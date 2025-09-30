import { describe, it, expect } from 'vitest';
import { ErrorHandler } from '../error-handler.js';
import { z } from 'zod';

describe('ErrorHandler', () => {
  describe('handleError', () => {
    it('should handle network errors (ECONNREFUSED)', () => {
      const error = { code: 'ECONNREFUSED' };
      const result = ErrorHandler.handleError({
        tool: 'list_material_components',
        operation: 'fetch components',
        error
      });

      expect(result.message).toContain('Network connection failed');
      expect(result.solution).toContain('internet connection');
      expect(result.docsLink).toContain('troubleshooting.md#network-errors');
    });

    it('should handle network errors (ETIMEDOUT)', () => {
      const error = { code: 'ETIMEDOUT' };
      const result = ErrorHandler.handleError({
        tool: 'get_component_code',
        operation: 'fetch button code',
        error
      });

      expect(result.message).toContain('Network connection failed');
      expect(result.solution).toContain('internet connection');
    });

    it('should handle GitHub API rate limit errors', () => {
      const error = {
        response: {
          status: 403,
          headers: { 'x-ratelimit-remaining': '0' }
        }
      };

      const result = ErrorHandler.handleError({
        tool: 'get_component_code',
        operation: 'fetch button code',
        error
      });

      expect(result.message).toContain('rate limit');
      expect(result.solution).toContain('GITHUB_TOKEN');
      expect(result.solution).toContain('5,000');
      expect(result.docsLink).toContain('troubleshooting.md#github-api-rate-limits');
    });

    it('should handle GitHub API authentication errors (403)', () => {
      const error = {
        response: {
          status: 403,
          headers: {}
        }
      };

      const result = ErrorHandler.handleError({
        tool: 'get_component_code',
        operation: 'fetch button code',
        error
      });

      expect(result.message).toContain('Access denied');
      expect(result.solution).toContain('GITHUB_TOKEN');
      expect(result.solution).toContain('valid');
    });

    it('should handle authentication errors (401)', () => {
      const error = {
        response: {
          status: 401
        }
      };

      const result = ErrorHandler.handleError({
        tool: 'list_material_components',
        operation: 'list components',
        error
      });

      expect(result.message).toContain('Authentication failed');
      expect(result.solution).toContain('invalid or expired');
      expect(result.solution).toContain('github.com/settings/tokens');
    });

    it('should handle not found errors (404)', () => {
      const error = {
        response: {
          status: 404
        }
      };

      const result = ErrorHandler.handleError({
        tool: 'get_component_code',
        operation: 'fetch xyz component',
        error
      });

      expect(result.message).toContain('not found');
      expect(result.solution).toContain('fetch xyz component');
      expect(result.solution).toContain('list_material_components');
      expect(result.docsLink).toContain('api-reference.md#available-components');
    });

    it('should handle server errors (500+)', () => {
      const error = {
        response: {
          status: 503
        }
      };

      const result = ErrorHandler.handleError({
        tool: 'list_material_components',
        operation: 'list components',
        error
      });

      expect(result.message).toContain('External service error');
      expect(result.solution).toContain('experiencing issues');
      expect(result.solution).toContain('githubstatus.com');
    });

    it('should handle Zod validation errors with field details', () => {
      const zodSchema = z.object({
        category: z.enum(['buttons', 'cards']),
        limit: z.number().max(100)
      });

      try {
        zodSchema.parse({ category: 'invalid', limit: 150 });
      } catch (zodError) {
        const result = ErrorHandler.handleError({
          tool: 'list_material_components',
          operation: 'validate input',
          error: zodError
        });

        expect(result.message).toContain('Invalid input');
        expect(result.solution).toContain('Validation errors');
        expect(result.solution).toContain('category');
        expect(result.docsLink).toContain('api-reference.md#list-material-components');
      }
    });

    it('should handle generic errors', () => {
      const error = new Error('Something went wrong');

      const result = ErrorHandler.handleError({
        tool: 'get_design_tokens',
        operation: 'get tokens',
        error
      });

      expect(result.message).toContain('Something went wrong');
      expect(result.solution).toContain('LOG_LEVEL=DEBUG');
      expect(result.docsLink).toContain('troubleshooting.md#debugging-techniques');
    });

    it('should handle errors without message', () => {
      const error = {};

      const result = ErrorHandler.handleError({
        tool: 'search_material_icons',
        operation: 'search icons',
        error
      });

      expect(result.message).toContain('unexpected error');
      expect(result.solution).toContain('LOG_LEVEL=DEBUG');
    });
  });

  describe('formatErrorResponse', () => {
    it('should format error with all sections', () => {
      const enhancedError = {
        message: 'Test error',
        solution: 'Do this to fix it',
        docsLink: 'https://example.com/docs'
      };

      const result = ErrorHandler.formatErrorResponse(enhancedError);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('❌ Test error');
      expect(result.content[0].text).toContain('💡 Suggested solution:');
      expect(result.content[0].text).toContain('Do this to fix it');
      expect(result.content[0].text).toContain('📚 More information:');
      expect(result.content[0].text).toContain('https://example.com/docs');
      expect(result.isError).toBe(true);
    });
  });

  describe('handleAndFormat', () => {
    it('should handle and format in one call', () => {
      const error = { code: 'ECONNREFUSED' };
      const result = ErrorHandler.handleAndFormat({
        tool: 'list_material_components',
        operation: 'fetch components',
        error
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toContain('❌');
      expect(result.content[0].text).toContain('Network connection failed');
      expect(result.content[0].text).toContain('💡');
      expect(result.content[0].text).toContain('📚');
      expect(result.isError).toBe(true);
    });
  });
});