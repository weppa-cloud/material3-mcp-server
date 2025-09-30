/**
 * Centralized error handling for Material 3 MCP Server
 * Provides consistent error responses with actionable solutions
 */

import { z } from 'zod';
import { logger } from './logger.js';
import type { MCPError, ErrorCategory, EnhancedErrorResponse } from '../types/errors.js';
import { ErrorCategory as EC } from '../types/errors.js';

export interface ErrorContext {
  tool: string;
  operation: string;
  error: any;
}

export interface EnhancedError {
  message: string;
  solution: string;
  docsLink: string;
}

export class ErrorHandler {
  private static readonly DOCS_BASE = 'https://github.com/weppa-cloud/material3-mcp-server/blob/main/docs';

  /**
   * Handles errors and returns structured error information
   */
  static handleError(context: ErrorContext): EnhancedError {
    const { tool, operation, error } = context;

    logger.error(`${tool} - ${operation} failed`, error);

    // Network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      return {
        message: 'Network connection failed',
        solution: 'Check your internet connection and firewall settings. Ensure you can reach github.com and m3.material.io.',
        docsLink: `${this.DOCS_BASE}/troubleshooting.md#network-errors`
      };
    }

    // GitHub API rate limits
    if (error.response?.status === 403 && error.response?.headers?.['x-ratelimit-remaining'] === '0') {
      return {
        message: 'GitHub API rate limit exceeded',
        solution: 'Set GITHUB_TOKEN environment variable with a GitHub Personal Access Token for 5,000 requests/hour instead of 60. See the documentation for instructions.',
        docsLink: `${this.DOCS_BASE}/troubleshooting.md#github-api-rate-limits`
      };
    }

    // GitHub API other 403 errors
    if (error.response?.status === 403) {
      return {
        message: 'Access denied by GitHub API',
        solution: 'Verify your GITHUB_TOKEN is valid and has the correct permissions. The token may be expired or revoked.',
        docsLink: `${this.DOCS_BASE}/troubleshooting.md#authentication-failures`
      };
    }

    // Authentication errors
    if (error.response?.status === 401) {
      return {
        message: 'Authentication failed',
        solution: 'Your GITHUB_TOKEN is invalid or expired. Generate a new token at https://github.com/settings/tokens',
        docsLink: `${this.DOCS_BASE}/troubleshooting.md#authentication-failures`
      };
    }

    // Resource not found
    if (error.response?.status === 404) {
      return {
        message: 'Resource not found',
        solution: `The requested resource "${operation}" may not exist. For components, use list_material_components to see available options. Check spelling and component availability.`,
        docsLink: `${this.DOCS_BASE}/api-reference.md#available-components`
      };
    }

    // Server errors
    if (error.response?.status >= 500) {
      return {
        message: 'External service error',
        solution: 'GitHub or Material 3 documentation site may be experiencing issues. Try again in a few minutes. Check https://www.githubstatus.com/ for GitHub status.',
        docsLink: `${this.DOCS_BASE}/troubleshooting.md#runtime-errors`
      };
    }

    // Zod validation errors
    if (error instanceof z.ZodError) {
      const fieldErrors = error.errors.map(e => {
        const field = e.path.join('.');
        const expected = 'expected' in e ? ` Expected: ${JSON.stringify(e.expected)}` : '';
        return `${field}: ${e.message}${expected}`;
      }).join(', ');

      return {
        message: 'Invalid input parameters',
        solution: `Validation errors: ${fieldErrors}. Check the API reference for correct parameter types and values.`,
        docsLink: `${this.DOCS_BASE}/api-reference.md#${tool.replace(/_/g, '-')}`
      };
    }

    // Generic error
    return {
      message: error.message || 'An unexpected error occurred',
      solution: 'Enable debug logging with LOG_LEVEL=DEBUG environment variable to see detailed error information. Check the troubleshooting guide for common issues.',
      docsLink: `${this.DOCS_BASE}/troubleshooting.md#debugging-techniques`
    };
  }

  /**
   * Formats an enhanced error into an MCP error response
   */
  static formatErrorResponse(enhancedError: EnhancedError): EnhancedErrorResponse {
    const formattedText = `❌ ${enhancedError.message}

💡 Suggested solution:
${enhancedError.solution}

📚 More information:
${enhancedError.docsLink}`;

    return {
      content: [{
        type: 'text',
        text: formattedText
      }],
      isError: true
    };
  }

  /**
   * Convenience method to handle error and return formatted response
   */
  static handleAndFormat(context: ErrorContext): EnhancedErrorResponse {
    const enhancedError = this.handleError(context);
    return this.formatErrorResponse(enhancedError);
  }
}