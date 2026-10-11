import { taskEither as TE } from 'fp-ts';
import { describe, expect, it, vi } from 'vitest';

import { testIsSupportedPure } from '~/test-utils/predefined/testIsSupportedPure.js';
import { testSafetyPure } from '~/test-utils/predefined/testSafetyPure.js';
import type { InstantiateOptions } from '~/test-utils/types.js';

import { Invoice, type InvoiceOptions } from '@/features/Invoice/Invoice.js';

const MIN_VERSION = '6.1';

function instantiate({
  version = MIN_VERSION,
  request = () => TE.right(undefined),
  isTma = true,
}: InstantiateOptions<InvoiceOptions> = {}) {
  return new Invoice({ version, request, isTma });
}

describe.each([
  ['openSlug', (component: Invoice) => component.openSlug('$a')],
  ['openUrl', (component: Invoice) => component.openUrl('https://t.me/invoice/a')],
] as const)('%s', (method, tryCall) => {
  describe('safety', () => {
    testSafetyPure({
      instantiate,
      get: instance => instance[method],
      try: tryCall,
      minVersion: MIN_VERSION,
    });
  });
});

describe('openSlug', () => {
  it(
    'should call request with "web_app_open_invoice", "invoice_closed" and params = { slug }',
    async () => {
      const request = vi.fn(() => TE.right({ status: 'paid' }));
      const component = instantiate({ request });
      await component.openSlug('$a');
      expect(request).toHaveBeenCalledOnce();
      expect(request).toHaveBeenCalledWith(
        'web_app_open_invoice', 'invoice_closed', expect.objectContaining({
          params: { slug: '$a' },
        }),
      );
    },
  );
});

describe('openUrl', () => {
  it(
    'should call request with "web_app_open_invoice", "invoice_closed" and params = { slug } where slug is computed based on the URL',
    async () => {
      const request = vi.fn(() => TE.right({ status: 'paid' }));
      const component = instantiate({ request });
      await component.openUrl('https://t.me/invoice/abc');
      expect(request).toHaveBeenCalledOnce();
      expect(request).toHaveBeenCalledWith(
        'web_app_open_invoice', 'invoice_closed', expect.objectContaining({
          params: { slug: 'abc' },
        }),
      );
    },
  );
});

describe('isSupported', () => {
  testIsSupportedPure(version => instantiate({ isTma: true, version }), MIN_VERSION);
});
