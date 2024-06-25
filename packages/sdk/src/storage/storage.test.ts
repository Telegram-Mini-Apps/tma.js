import { vi, it, expect, afterEach, describe } from 'vitest';
import { getStorageValue, setStorageValue } from '@/storage/storage.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('setStorageValue', () => {
  it('should call sessionStorage.setItem with formatted key and JSON.stringify applied to value', () => {
    const fn = vi.fn();
    vi.spyOn(sessionStorage, 'setItem').mockImplementationOnce(fn);
    setStorageValue('backButton', { isVisible: false });

    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith('telegram-apps/back-button', '{"isVisible":false}');
  });
});

describe('getStorageValue', () => {
  it('should call sessionStorage.getItem with formatted key and apply JSON.parse to the extracted value in case, it is not empty. If parsing failed, return undefined', () => {
    const getItem = vi.spyOn(sessionStorage, 'getItem').mockImplementation(() => '{"isVisible":false}');
    let value = getStorageValue('backButton');
    expect(getItem).toHaveBeenCalledOnce();
    expect(getItem).toHaveBeenCalledWith('telegram-apps/back-button');
    expect(value).toStrictEqual({ isVisible: false });

    getItem.mockImplementation(() => null);
    value = getStorageValue('backButton');
    expect(value).toBeUndefined();

    getItem.mockImplementation(() => '{"isVisible":}');
    value = getStorageValue('backButton');
    expect(value).toBeUndefined();
  });
});