import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
  },
  resolve: {
    alias: {
      '@config': path.resolve(__dirname, './src/config'),
      '@shared': path.resolve(__dirname, './src/shared'),
    },
  },
});
