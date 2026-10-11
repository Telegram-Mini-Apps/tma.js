import { describe, expect, it } from 'vitest';

import { InvalidInitDataError } from './errors.js';
import { parse, safeParse, serialize } from './parsing.js';
import { INIT_DATA } from '../test/fixtures.js';

describe('parse', () => {
  it('should parse init data', () => {
    expect(parse(INIT_DATA)).toEqual({
      user: {
        id: 279058397,
        first_name: 'Vladislav + - ? /',
        last_name: 'Kibenko',
        username: 'vdkfrost',
        language_code: 'ru',
        is_premium: true,
        allows_write_to_pm: true,
        photo_url: 'https://t.me/i/userpic/320/4FPEE4tmP3ATHa57u6MqTDih13LTOiMoKoLDRG4PnSA.svg',
      },
      chat_instance: '8134722200314281151',
      chat_type: 'private',
      auth_date: new Date(1733584787000),
      signature: 'zL-ucjNyREiHDE8aihFwpfR9aggP2xiAo3NSpfe-p7IbCisNlDKlo7Kb6G4D0Ao2mBrSgEk4maLSdv6MLIlADQ',
      hash: '2174df5b000556d044f3f020384e879c8efcab55ddea2ced4eb752e93e7080d6',
    });
  });

  it('should parse all known parameters and drop unknown ones', () => {
    const query = new URLSearchParams({
      auth_date: '1',
      can_send_after: '10',
      chat: JSON.stringify({ id: 1, type: 'group', title: 'Chat', unknown: 1 }),
      chat_join_request_query_id: 'join',
      hash: 'h',
      query_id: 'q',
      receiver: JSON.stringify({ id: 2, first_name: 'Bot', is_bot: true }),
      start_param: 'start',
      unknown: '1',
    });
    expect(parse(query)).toEqual({
      auth_date: new Date(1000),
      can_send_after: 10,
      chat: { id: 1, type: 'group', title: 'Chat' },
      chat_join_request_query_id: 'join',
      hash: 'h',
      query_id: 'q',
      receiver: { id: 2, first_name: 'Bot', is_bot: true },
      start_param: 'start',
    });
  });

  it.each([
    ['"hash" is missing', 'auth_date=1'],
    ['"auth_date" is missing', 'hash=h'],
    ['"auth_date" is not a number', 'auth_date=1a&hash=h'],
    ['"user" is not JSON', 'auth_date=1&hash=h&user={'],
    ['"user" has invalid structure', 'auth_date=1&hash=h&user={"id":"1"}'],
  ])('should throw InvalidInitDataError if %s', (_, value) => {
    expect(() => parse(value)).toThrow(InvalidInitDataError);
  });

  it('should pass the value and the cause to InvalidInitDataError', () => {
    let error: unknown;
    try {
      parse('auth_date=1');
    } catch (e) {
      error = e;
    }
    expect((error as InvalidInitDataError).data).toEqual({ value: 'auth_date=1' });
    expect((error as InvalidInitDataError).cause).toBeInstanceOf(Error);
  });
});

describe('safeParse', () => {
  it('should return parsed init data', () => {
    expect(safeParse(INIT_DATA)).toEqual({ ok: true, data: parse(INIT_DATA) });
  });

  it('should return InvalidInitDataError instead of throwing it', () => {
    const result = safeParse('auth_date=1');
    expect(result.ok).toBe(false);
    expect(!result.ok && InvalidInitDataError.is(result.error)).toBe(true);
  });
});

describe('serialize', () => {
  it('should be reversible by parse', () => {
    const initData = parse(INIT_DATA);
    expect(parse(serialize(initData))).toEqual(initData);
  });

  it('should convert dates to Unix time and skip undefined values', () => {
    expect(serialize({ auth_date: new Date(1999), query_id: undefined, can_send_after: 5 }))
      .toBe('auth_date=1&can_send_after=5');
  });
});
