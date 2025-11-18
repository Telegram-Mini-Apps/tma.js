/**
 * You can import any code from other packages here. There are currently 2 shortcuts:
 *
 * 1. "@packages/*". Provides access to "packages" directory:
 * import { postEvent } from '@packages/sdk/src/index.js';
 *
 * 2. "@/*". Provides easy access to packages' index files:
 * import { postEvent } from '@/sdk';
 */

import { postEvent } from '@/sdk';

postEvent('web_app_expand');
