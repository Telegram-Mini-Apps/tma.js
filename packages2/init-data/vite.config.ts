import dts from 'vite-plugin-dts';

import packageJson from './package.json' with { type: 'json' };
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    dts({
      outDir: 'dist/dts',
      // TypeScript 6 resolves the root directory to the tsconfig directory, which would place
      // declarations in the "dist/dts/src" directory.
      compilerOptions: { rootDir: 'src' },
      include: ['src'],
      exclude: ['src/**/*.test*.ts'],
    }),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: true,
    rollupOptions: {
      external: Object.keys(packageJson.dependencies),
    },
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      fileName: 'index',
    },
  },
  test: {
    environment: 'node',
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test*.ts'],
    },
  },
});
