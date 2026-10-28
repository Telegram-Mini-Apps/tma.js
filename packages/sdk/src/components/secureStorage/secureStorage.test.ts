import { describe, expect, it } from 'vitest';

import { secureStorage } from './secureStorage.js';
import { respond, setup } from '../../../test/utils.js';

describe('secureStorage', () => {
  it('should get values', async () => {
    setup({
      onMethod: respond('web_app_secure_storage_get_key', 'secure_storage_key_received', (
        params: { req_id: string },
      ) => ({ can_restore: true, req_id: params.req_id, value: null })),
    });
    await expect(secureStorage.getItem('k')).resolves.toEqual({ canRestore: true, value: null });
  });

  it('should save values ignoring events of other requests', async () => {
    const calls = setup({
      onMethod(call) {
        respond('web_app_secure_storage_save_key', 'secure_storage_failed', {
          error: 'FAILED',
          req_id: 'other',
        })(call);
        respond('web_app_secure_storage_save_key', 'secure_storage_key_saved', (
          params: { req_id: string },
        ) => ({ req_id: params.req_id }))(call);
      },
    });
    await secureStorage.deleteItem('k');
    expect(calls).toHaveBeenCalledWith({
      name: 'web_app_secure_storage_save_key',
      params: expect.objectContaining({ key: 'k', value: null }),
    });
  });
});
