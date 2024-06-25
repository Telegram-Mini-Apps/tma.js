import { initInvoice } from '@telegram-apps/sdk';

import { createHOCs } from '../createHOCs.js';
import { createHooks } from '../createHooks.js';

export const [useInvoiceRaw, useInvoice] = createHooks(initInvoice);

export const [withInvoiceRaw, withInvoice] = createHOCs(useInvoiceRaw, useInvoice);
