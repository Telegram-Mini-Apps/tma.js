import { getConfig } from './tools/getConfig.js';

export default getConfig({
  input: 'src/index.ts',
  formats: ['es', 'cjs'],
  declarations: true,
});