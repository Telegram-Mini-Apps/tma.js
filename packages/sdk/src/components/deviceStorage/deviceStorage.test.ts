import { MethodUnsupportedError } from '@tma.js/bridge';
import { describe, expect, it } from 'vitest';

import { deviceStorage } from './deviceStorage.js';
import { respond, setup } from '../../../test/utils.js';
import { DeviceStorageMethodError } from '../../errors.js';

describe('deviceStorage', () => {
  it('should get values', async () => {
    setup({
      onMethod: respond('web_app_device_storage_get_key', 'device_storage_key_received', (
        params: { req_id: string },
      ) => ({ req_id: params.req_id, value: 'v' })),
    });
    await expect(deviceStorage.getItem('k')).resolves.toBe('v');
  });

  it('should return DeviceStorageMethodError if the client failed', async () => {
    setup({
      onMethod: respond('web_app_device_storage_clear', 'device_storage_failed', (
        params: { req_id: string },
      ) => ({ req_id: params.req_id, error: 'FAILED' })),
    });
    const result = await deviceStorage.safeClear();
    expect(!result.ok && DeviceStorageMethodError.is(result.error) && result.error.data)
      .toEqual({ error: 'FAILED' });
  });

  it('should reject with MethodUnsupportedError before v9.0', async () => {
    setup({ version: '8.0' });
    expect(deviceStorage.isSupported()).toBe(false);
    await expect(deviceStorage.setItem('k', 'v')).rejects.toThrow(MethodUnsupportedError);
  });
});
