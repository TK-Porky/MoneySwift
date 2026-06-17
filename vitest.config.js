import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals:     true,
    environment: 'node',
    coverage: {
      provider:  'v8',
      reporter:  ['text', 'json', 'html'],
      exclude:   ['node_modules/**', '**/prisma/**', '**/*.config.*'],
    },
    // Timeout généreux pour les tests d'intégration
    testTimeout: 10000,
    // Fichiers de setup globaux
    setupFiles: ['./tests/setup.js'],
  },
});
