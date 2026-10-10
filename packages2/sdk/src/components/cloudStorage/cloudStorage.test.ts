import { InvokeCustomMethodFailedError } from '@tma.js/bridge';
import { describe, expect, it } from 'vitest';

import { cloudStorage } from './cloudStorage.js';
import { respondCustomMethod, setup } from '../../../test/utils.js';
import { InvalidResponseError } from '../../errors.js';

describe('cloudStorage', () => {
  it('should return values filling missing keys with empty strings', async () => {
    const calls = setup({ onMethod: respondCustomMethod('getStorageValues', { result: { a: '1' } }) });
    await expect(cloudStorage.getItems(['a', 'b'])).resolves.toEqual({ a: '1', b: '' });
    await expect(cloudStorage.getItem('b')).resolves.toBe('');
    expect(calls).toHaveBeenCalledWith({
      name: 'web_app_invoke_custom_method',
      params: expect.objectContaining({ method: 'getStorageValues', params: { keys: ['a', 'b'] } }),
    });
  });

  it('should return InvalidResponseError for unexpected responses', async () => {
    setup({ onMethod: respondCustomMethod('getStorageKeys', { result: [1] }) });
    const result = await cloudStorage.safeGetKeys();
    expect(!result.ok && InvalidResponseError.is(result.error)).toBe(true);
  });

  it('should return InvokeCustomMethodFailedError', async () => {
    setup({ onMethod: respondCustomMethod('saveStorageValue', { error: 'FAILED' }) });
    const result = await cloudStorage.safeSetItem('a', 'b');
    expect(!result.ok && InvokeCustomMethodFailedError.is(result.error)).toBe(true);
  });

  it('should delete all keys on clear', async () => {
    const calls = setup({
      onMethod(call) {
        respondCustomMethod('getStorageKeys', { result: ['a', 'b'] })(call);
        respondCustomMethod('deleteStorageValues', { result: true })(call);
      },
    });
    await cloudStorage.clear();
    expect(calls).toHaveBeenLastCalledWith({
      name: 'web_app_invoke_custom_method',
      params: expect.objectContaining({
        method: 'deleteStorageValues',
        params: { keys: ['a', 'b'] },
      }),
    });
  });

  it('should not call the method for an empty list of keys', async () => {
    const calls = setup();
    await expect(cloudStorage.getItems([])).resolves.toEqual({});
    await cloudStorage.deleteItem([]);
    expect(calls).not.toHaveBeenCalled();
  });
});
