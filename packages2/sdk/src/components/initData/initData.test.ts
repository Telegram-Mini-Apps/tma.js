import { InvalidInitDataError } from '@tma.js/init-data';
import { describe, expect, it } from 'vitest';

import { createInitData } from './initData.js';
import { setup } from '../../../test/utils.js';
import { NotInitializedError } from '../../errors.js';

describe('initData', () => {
  it('should require the SDK to be initialized', () => {
    expect(() => createInitData().restore()).toThrow(NotInitializedError);
  });

  it('should parse init data from launch parameters', () => {
    const raw = 'auth_date=1&can_send_after=10&hash=h&user=%7B%22id%22%3A1%2C%22first_name%22%3A%22P%22%7D';
    setup({ launchParams: { tgWebAppData: raw } });
    const initData = createInitData();
    expect(initData.state()).toBeUndefined();
    initData.restore();
    expect(initData.raw()).toBe(raw);
    expect(initData.user()).toEqual({ id: 1, first_name: 'P' });
    expect(initData.authDate()).toEqual(new Date(1000));
    expect(initData.canSendAfterDate()).toEqual(new Date(11000));
    expect(initData.hash()).toBe('h');
  });

  it('should keep the state empty if launch parameters have no init data', () => {
    setup();
    const initData = createInitData();
    initData.restore();
    expect(initData.state()).toBeUndefined();
  });

  it('should return InvalidInitDataError for invalid init data', () => {
    setup({ launchParams: { tgWebAppData: 'auth_date=abc' } });
    const result = createInitData().safeRestore();
    expect(!result.ok && InvalidInitDataError.is(result.error)).toBe(true);
  });
});
