import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Use explicit imports instead of globals (2025 best practice)
    globals: false,

    // Node environment for testing
    environment: 'node',

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'build/',
        'src/**/*.test.ts',
        'src/**/__tests__/**',
        'vitest.config.ts'
      ],
      // Target 70% coverage
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70
      }
    },

    // Test file patterns
    include: ['src/**/*.{test,spec}.ts'],

    // Timeouts
    testTimeout: 10000,
    hookTimeout: 10000
  }
});