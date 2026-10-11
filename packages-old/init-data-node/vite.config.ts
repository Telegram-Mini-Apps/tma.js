import dts from 'vite-plugin-dts';
import { defineConfig } from 'vitest/config';

import packageJson from './package.json' with { type: "json" };

export default defineConfig((_) => ({
  test: {
    include: ['src/**/*.test.ts'],
    coverage: {
      enabled: true,
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts'],
      branches: 100,
      functions: 100,
      statements: 100,
      lines: 100,
    },
  },
  plugins: [
    dts({ outDir: 'dist' }),
  ],
  build: {
    outDir: 'dist/entries',
    emptyOutDir: false,
    sourcemap: true,
    rollupOptions: {
      external: Object.keys(packageJson.dependencies),
    },
    lib: {
      entry: {
        node: 'src/entries/node.ts',
        web: 'src/entries/web.ts',
      },
      formats: ['es', 'cjs'],
      fileName(format, entry) {
        return `${entry}.${format === 'es' ? 'js' : 'cjs'}`;
      },
    },
  },
}));
