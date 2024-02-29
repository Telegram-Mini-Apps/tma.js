import { createViteConfig } from 'build-utils';
import vue from '@vitejs/plugin-vue';

import packageJson from './package.json';

export default createViteConfig({
  packageName: packageJson.name,
  formats: ['es', 'cjs'],
  external: ['@tma.js/utils', '@tma.js/sdk', 'vue'],
  plugins: [vue()],
});
