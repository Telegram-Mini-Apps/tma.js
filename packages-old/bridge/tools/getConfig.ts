import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { LibraryFormats } from 'vite';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig, type UserConfigFn } from 'vitest/config';

import packageJson from '../package.json' with { type: "json" };

export function getConfig({
  input,
  formats,
  declarations,
  inlineModules,
}: {
  input: string;
  formats: LibraryFormats[];
  declarations?: boolean;
  inlineModules?: boolean;
}): UserConfigFn {
  return defineConfig(({ mode }) => {
    const tsconfigPath = mode === 'test'
      ? './tsconfig.test.json'
      : './tsconfig.build.json';

    return {
      plugins: [
        tsconfigPaths({ projects: [tsconfigPath] }),
        declarations && dts({ outDir: 'dist/dts', tsconfigPath }),
      ],
      resolve: {
        alias: {
          '@': resolve(dirname(fileURLToPath(import.meta.url)), '../src'),
        },
      },
      build: {
        outDir: 'dist',
        emptyOutDir: false,
        sourcemap: true,
        rollupOptions: {
          external: inlineModules ? [] : Object.keys(packageJson.dependencies)
        },
        lib: {
          name: 'tapps.bridge',
          entry: input,
          formats,
          fileName: 'index',
        },
      },
      test: {
        environment: 'happy-dom',
        coverage: {
          enabled: true,
          provider: 'v8',
          include: ['src/**/*.ts'],
          exclude: ['src/**/*.test.ts'],
          branches: 80,
          functions: 80,
          statements: 80,
          lines: 80,
        },
      },
    };
  });
}
