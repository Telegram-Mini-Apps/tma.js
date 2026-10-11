import { describe, expect, it } from 'vitest';

import { safeSendData, sendData } from './sendData.js';
import { setup } from '../../../test/utils.js';
import { InvalidArgumentsError, NotInitializedError } from '../../errors.js';

describe('sendData', () => {
  it.each(['', 'a'.repeat(4097)])('should return InvalidArgumentsError for invalid data', data => {
    setup();
    const result = safeSendData(data);
    expect(!result.ok && InvalidArgumentsError.is(result.error)).toBe(true);
    expect(() => sendData(data)).toThrow(InvalidArgumentsError);
  });

  it('should count the data size in bytes', () => {
    setup();
    expect(safeSendData('ы'.repeat(2048)).ok).toBe(true);
    expect(safeSendData('ы'.repeat(2049)).ok).toBe(false);
  });

  it('should send data', () => {
    const calls = setup();
    expect(safeSendData('data').ok).toBe(true);
    expect(calls).toHaveBeenCalledWith({ name: 'web_app_data_send', params: { data: 'data' } });
  });

  it('should throw NotInitializedError if the SDK is not initialized', () => {
    expect(() => sendData('data')).toThrow(NotInitializedError);
  });
});

describe('isSupported', () => {
  it.each([
    { name: 'sendData', fn: sendData },
    { name: 'safeSendData', fn: safeSendData },
  ])('$name should check if the SDK is initialized', ({ fn }) => {
    expect(fn.isSupported()).toBe(false);
    setup();
    expect(fn.isSupported()).toBe(true);
  });
});
