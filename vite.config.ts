import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { projects: ['packages2/*/vite.config.ts'] },
});