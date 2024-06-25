import { initQRScanner } from '@telegram-apps/sdk';

import { createHOCs } from '../createHOCs.js';
import { createHooks } from '../createHooks.js';

export const [useQRScannerRaw, useQRScanner] = createHooks(initQRScanner);

export const [withQRScannerRaw, withQRScanner] = createHOCs(useQRScannerRaw, useQRScanner);
