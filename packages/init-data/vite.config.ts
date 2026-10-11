import dts from 'vite-plugin-dts';

import packageJson from './package.json' with { type: 'json' };
import { defineConfig } from 'vitest/config';

// "vite build --mode iife" produces a self-contained build exposing the package as the
// "tmajs.initData" global, so it can be loaded via a <script> tag.
export default defineConfig(({ mode }) => {
  const iife = mode === 'iife';

  return {
    plugins: [
      !iife && dts({
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
        external: iife ? [] : Object.keys(packageJson.dependencies),
      },
      lib: {
        entry: 'src/index.ts',
        name: 'tmajs.initData',
        formats: iife ? ['iife'] : ['es', 'cjs'],
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
  };
});
