// vitest.config.js
import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals:     true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'services/*/src/**/*.js',
        'packages/utils/src/**/*.js',
        'packages/middleware/**/*.js',
        'packages/errors/**/*.js',
        'packages/events/**/*.js',
      ],
      exclude: [
        'apps/**',
        'node_modules/**',
        '**/prisma/**',
        '**/__tests__/**',
        '**/__mocks__/**',
        '**/*.config.*',
        '**/index.js',
        '**/Dockerfile',
      ],
    },
    testTimeout: 10000,
    setupFiles:  ['./tests/setup.js'],
  },
    resolve: {
    alias: {
      // Point tests at the real package entry which adapts to test env.
      // This ensures CJS `require` and ESM `import` resolve the same module.
      '@moneyswift/database': path.resolve(__dirname, 'packages/database/index.js'),
    },
  },
});