import { describe, expect, it } from 'vitest';

import { switchInlineQuery } from './switchInlineQuery.js';
import { setup } from '../../../test/utils.js';
import { InvalidEnvError } from '../../errors.js';

describe('switchInlineQuery', () => {
  it('should throw InvalidEnvError outside inline mode', () => {
    setup();
    expect(() => switchInlineQuery('q')).toThrow(InvalidEnvError);
  });

  it('should insert the query', () => {
    const calls = setup({ launchParams: { tgWebAppBotInline: true } });
    switchInlineQuery('q', ['users']);
    expect(calls).toHaveBeenCalledWith({
      name: 'web_app_switch_inline_query',
      params: { query: 'q', chat_types: ['users'] },
    });
  });
});

describe('isSupported', () => {
  it('should check if the mini app was launched in inline mode', () => {
    expect(switchInlineQuery.isSupported()).toBe(false);
    setup();
    expect(switchInlineQuery.isSupported()).toBe(false);
    setup({ version: '6.6', launchParams: { tgWebAppBotInline: true } });
    expect(switchInlineQuery.isSupported()).toBe(false);
    setup({ launchParams: { tgWebAppBotInline: true } });
    expect(switchInlineQuery.isSupported()).toBe(true);
  });
});
