import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getStorageValue, setStorageValue } from '@/storage/storage.js';

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('setStorageValue', () => {
  it(
    'should call sessionStorage.setItem with formatted key and JSON.stringify applied to value',
    () => {
      const setItem = vi
        .spyOn(Storage.prototype, 'setItem')
        .mockImplementation(() => null);
      setStorageValue('backButton', false);
      expect(setItem).toHaveBeenCalledOnce();
      expect(setItem).toHaveBeenCalledWith('tapps/backButton', 'false');
    },
  );
});

describe('getStorageValue', () => {
  it(
    'should call sessionStorage.getItem with formatted key and apply JSON.parse to the extracted value in case, it is not empty. If parsing failed, return undefined',
    () => {
      const getItem = vi
        .spyOn(Storage.prototype, 'getItem')
        .mockImplementation(() => '{"isVisible":false}');
      let value = getStorageValue('backButton');
      expect(getItem).toHaveBeenCalledOnce();
      expect(getItem).toHaveBeenCalledWith('tapps/backButton');
      expect(value).toStrictEqual({ isVisible: false });

      getItem.mockImplementation(() => null);
      value = getStorageValue('backButton');
      expect(value).toBeUndefined();

      getItem.mockImplementation(() => '{"isVisible":}');
      value = getStorageValue('backButton');
      expect(value).toBeUndefined();
    },
  );
});
