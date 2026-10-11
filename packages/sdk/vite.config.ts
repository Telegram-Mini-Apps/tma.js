import dts from 'vite-plugin-dts';

import { defaultClientConditions, defaultServerConditions } from 'vite';

import packageJson from './package.json' with { type: 'json' };
import { defineConfig } from 'vitest/config';

// Resolves workspace packages to their source code, so they don't have to be built.
const SOURCE_CONDITION = '@tma.js/source';

// "vite build --mode iife" produces a self-contained build exposing the package as the
// "tmajs.sdk" global, so it can be loaded via a <script> tag.
export default defineConfig(({ mode }) => {
  const iife = mode === 'iife';

  return {
    resolve: {
      conditions: [SOURCE_CONDITION, ...defaultClientConditions],
    },
    ssr: {
      resolve: {
        conditions: [SOURCE_CONDITION, ...defaultServerConditions],
      },
    },
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
        name: 'tmajs.sdk',
        formats: iife ? ['iife'] : ['es', 'cjs'],
        fileName: 'index',
      },
    },
    test: {
      environment: 'happy-dom',
      setupFiles: ['test/setup.ts'],
      restoreMocks: true,
      unstubGlobals: true,
      coverage: {
        provider: 'v8',
        include: ['src/**/*.ts'],
        exclude: ['src/**/*.test*.ts'],
      },
    },
  };
});
