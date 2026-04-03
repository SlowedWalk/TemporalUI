import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['packages/**/*.test.ts', 'packages/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@temporalui/core': path.resolve(__dirname, 'packages/core/src'),
      '@temporalui/react': path.resolve(__dirname, 'packages/react/src'),
    },
  },
});
