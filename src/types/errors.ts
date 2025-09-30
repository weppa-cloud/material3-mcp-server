/**
 * Error types and categories for Material 3 MCP Server
 */

export enum ErrorCategory {
  NETWORK = 'network',
  RATE_LIMIT = 'rate_limit',
  AUTHENTICATION = 'authentication',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  SERVER_ERROR = 'server_error',
  UNKNOWN = 'unknown'
}

export interface MCPError {
  category: ErrorCategory;
  message: string;
  solution: string;
  docsLink: string;
  originalError?: any;
}

export interface EnhancedErrorResponse {
  [x: string]: unknown;
  content: [{
    type: 'text';
    text: string;
  }];
  isError: true;
}