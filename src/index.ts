#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { logger } from './utils/logger.js';

// Import tools
import {
  listMaterialComponents,
  listMaterialComponentsSchema
} from './tools/listMaterialComponents.js';
import {
  getComponentCode,
  getComponentCodeSchema
} from './tools/getComponentCode.js';
import {
  getDesignTokens,
  getDesignTokensSchema
} from './tools/getDesignTokens.js';
import {
  searchMaterialIcons,
  searchMaterialIconsSchema
} from './tools/searchMaterialIcons.js';
import {
  getAccessibilityGuidelines,
  getAccessibilityGuidelinesSchema
} from './tools/getAccessibilityGuidelines.js';
import {
  manageCacheHealth,
  manageCacheHealthSchema
} from './tools/manageCacheHealth.js';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Import cache versioning
import { cacheVersionManager } from './utils/cache-versioning.js';

async function main() {
  logger.info('Starting Material 3 MCP Server');

  // Check cache version and upstream changes on startup
  await cacheVersionManager.checkCacheVersion();

  // Create MCP server
  const server = new McpServer({
    name: '@weppa-cloud/material3-mcp-server',
    version: '1.0.0'
  });

  // Register Tool 1: list_material_components
  server.registerTool(
    'list_material_components',
    {
      title: 'List Material 3 Components',
      description: 'List available Material 3 components with filtering by category, complexity, and framework',
      inputSchema: listMaterialComponentsSchema.shape
    },
    listMaterialComponents
  );

  // Register Tool 2: get_component_code
  server.registerTool(
    'get_component_code',
    {
      title: 'Get Component Code',
      description: 'Retrieve real source code of specific Material 3 component with variants and examples',
      inputSchema: getComponentCodeSchema.shape
    },
    getComponentCode
  );

  // Register Tool 3: get_design_tokens
  server.registerTool(
    'get_design_tokens',
    {
      title: 'Get Design Tokens',
      description: 'Export Material 3 design tokens in multiple formats (CSS, SCSS, JSON, JavaScript)',
      inputSchema: getDesignTokensSchema.shape
    },
    getDesignTokens
  );

  // Register Tool 4: search_material_icons
  server.registerTool(
    'search_material_icons',
    {
      title: 'Search Material Icons',
      description: 'Search Material Symbols icon library with filters and get usage code for different frameworks',
      inputSchema: searchMaterialIconsSchema.shape
    },
    searchMaterialIcons
  );

  // Register Tool 5: get_accessibility_guidelines
  server.registerTool(
    'get_accessibility_guidelines',
    {
      title: 'Get Accessibility Guidelines',
      description: 'Get WCAG 2.1 accessibility guidelines specific to a Material 3 component',
      inputSchema: getAccessibilityGuidelinesSchema.shape
    },
    getAccessibilityGuidelines
  );

  // Register Tool 6: manage_cache_health
  server.registerTool(
    'manage_cache_health',
    {
      title: 'Manage Cache Health',
      description: 'Check cache status, verify upstream changes, and invalidate stale data',
      inputSchema: manageCacheHealthSchema.shape
    },
    manageCacheHealth
  );

  logger.info('Registered 6 MCP tools');

  // Connect via stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  logger.info('Material 3 MCP Server connected and ready');
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down Material 3 MCP Server');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down Material 3 MCP Server');
  process.exit(0);
});

// Start server
main().catch((error) => {
  logger.error('Fatal error starting server', error);
  process.exit(1);
});