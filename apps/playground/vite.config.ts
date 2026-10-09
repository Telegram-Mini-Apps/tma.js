import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
  plugins: [
    // Resolves packages to their sources using the compilerOptions.paths property in
    // tsconfig.json.
    // https://www.npmjs.com/package/vite-tsconfig-paths
    tsconfigPaths(),
    // Allows using self-signed certificates to run the dev server using HTTPS.
    // https://www.npmjs.com/package/vite-plugin-mkcert
    !!process.env.HTTPS && mkcert(),
  ],
  server: {
    host: true,
  },
  build: {
    // Required for the top-level await.
    target: 'esnext',
    outDir: 'dist',
    emptyOutDir: true,
  },
});
