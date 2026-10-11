import { describe, expect, it } from 'vitest';

import { createInvoice } from './invoice.js';
import { respond, setup } from '../../../test/utils.js';
import { InvalidArgumentsError } from '../../errors.js';

describe('invoice', () => {
  it.each([
    'https://t.me/invoice/abc',
    'https://t.me/$abc',
  ])('should open the invoice by the URL %s', async url => {
    const calls = setup({
      onMethod: respond('web_app_open_invoice', 'invoice_closed', ({ slug }: { slug: string }) => ({
        slug,
        status: 'paid',
      })),
    });
    await expect(createInvoice().openUrl(url)).resolves.toBe('paid');
    expect(calls).toHaveBeenCalledWith({ name: 'web_app_open_invoice', params: { slug: 'abc' } });
  });

  it.each([
    'https://example.com/invoice/abc',
    'https://t.me/abc',
  ])('should return InvalidArgumentsError for the URL %s', async url => {
    setup();
    const result = await createInvoice().safeOpenUrl(url);
    expect(!result.ok && InvalidArgumentsError.is(result.error)).toBe(true);
  });

  it('should ignore events of other invoices', async () => {
    setup({
      onMethod(call) {
        respond('web_app_open_invoice', 'invoice_closed', { slug: 'other', status: 'paid' })(call);
        respond('web_app_open_invoice', 'invoice_closed', { slug: 'abc', status: 'failed' })(call);
      },
    });
    await expect(createInvoice().openSlug('abc')).resolves.toBe('failed');
  });
});
