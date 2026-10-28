import { MethodUnsupportedError, TimeoutError } from '@tma.js/bridge';
import { describe, expect, it, vi } from 'vitest';

import {
  requestContact,
  requestContactComplete,
  requestPhoneAccess,
  requestWriteAccess,
  safeRequestContact,
  safeRequestContactComplete,
  safeRequestPhoneAccess,
  safeRequestWriteAccess,
} from './privacy.js';
import { respond, respondCustomMethod, setup } from '../../../test/utils.js';
import { AccessDeniedError, InvalidResponseError } from '../../errors.js';

const rawContact = new URLSearchParams({
  auth_date: '1',
  contact: JSON.stringify({ first_name: 'P', phone_number: '123', user_id: 1 }),
  hash: 'h',
}).toString();

/**
 * Responds to the "getRequestedContact" custom method with the values one by one.
 */
function respondContact(...values: unknown[]) {
  return respondCustomMethod('getRequestedContact', () => ({
    result: values.length > 1 ? values.shift() : values[0],
  }));
}

it('should request phone and write access', async () => {
  setup({
    onMethod(call) {
      respond('web_app_request_phone', 'phone_requested', { status: 'sent' })(call);
      respond('web_app_request_write_access', 'write_access_requested', { status: 'allowed' })(call);
    },
  });
  await expect(requestPhoneAccess()).resolves.toBe('sent');
  await expect(requestWriteAccess()).resolves.toBe('allowed');
});

it.each([
  { fn: safeRequestPhoneAccess, name: 'safeRequestPhoneAccess' },
  { fn: safeRequestWriteAccess, name: 'safeRequestWriteAccess' },
])('$name should return TimeoutError if the user did not respond in time', async ({ fn }) => {
  vi.useFakeTimers();
  setup();
  const promise = fn({ timeout: 1000 });
  await vi.advanceTimersByTimeAsync(1000);
  const result = await promise;
  expect(!result.ok && TimeoutError.is(result.error)).toBe(true);
  vi.useRealTimers();
});

describe('requestContact', () => {
  it('should return the contact shared earlier', async () => {
    const calls = setup({ onMethod: respondContact(rawContact) });
    await expect(safeRequestContactComplete()).resolves.toEqual({
      data: {
        parsed: {
          auth_date: new Date(1000),
          contact: { first_name: 'P', phone_number: '123', user_id: 1 },
          hash: 'h',
        },
        raw: rawContact,
      },
      ok: true,
    });
    expect(calls).toHaveBeenCalledOnce();
  });

  it('should return the contact in raw and parsed formats', async () => {
    setup({ onMethod: respondContact(rawContact) });
    await expect(requestContactComplete()).resolves.toMatchObject({
      parsed: { hash: 'h' },
      raw: rawContact,
    });
  });

  it('should handle the contact returned as a JSON string', async () => {
    setup({ onMethod: respondContact(JSON.stringify(rawContact)) });
    const result = await safeRequestContactComplete();
    expect(result.ok && result.data.raw).toBe(rawContact);
  });

  it('should request phone access and poll the contact', async () => {
    const contact = respondContact('', '', rawContact);
    setup({
      onMethod(call) {
        contact(call);
        respond('web_app_request_phone', 'phone_requested', { status: 'sent' })(call);
      },
    });
    await expect(requestContact()).resolves.toMatchObject({ hash: 'h' });
  });

  it('should request phone access if the contact retrieval failed', async () => {
    const calls = setup({
      onMethod(call) {
        respondCustomMethod('getRequestedContact', { error: 'UNKNOWN' })(call);
        respond('web_app_request_phone', 'phone_requested', { status: 'cancelled' })(call);
      },
    });
    const result = await safeRequestContactComplete();
    expect(!result.ok && AccessDeniedError.is(result.error)).toBe(true);
    expect(calls).toHaveBeenCalledWith({ name: 'web_app_request_phone', params: undefined });
  });

  it('should return AccessDeniedError if the user declined the request', async () => {
    setup({
      onMethod(call) {
        respondContact('')(call);
        respond('web_app_request_phone', 'phone_requested', { status: 'cancelled' })(call);
      },
    });
    const result = await safeRequestContactComplete();
    expect(!result.ok && AccessDeniedError.is(result.error)).toBe(true);
  });

  it.each([
    { name: 'invalid contacts', value: 'contact=1' },
    { name: 'non-string values', value: 1 },
    { name: 'invalid JSON strings', value: '"\\q"' },
  ])('should return InvalidResponseError for $name', async ({ value }) => {
    setup({ onMethod: respondContact(value) });
    const result = await safeRequestContactComplete();
    expect(!result.ok && InvalidResponseError.is(result.error)).toBe(true);
  });

  it('should return InvalidResponseError for invalid contacts received while polling', async () => {
    const contact = respondContact('', 'contact=1');
    setup({
      onMethod(call) {
        contact(call);
        respond('web_app_request_phone', 'phone_requested', { status: 'sent' })(call);
      },
    });
    const result = await safeRequestContactComplete();
    expect(!result.ok && InvalidResponseError.is(result.error)).toBe(true);
    await expect(requestContact()).rejects.toThrow(InvalidResponseError);
  });

  it('should return TimeoutError if the user did not respond to the phone request', async () => {
    vi.useFakeTimers();
    setup({ onMethod: respondContact('') });
    const promise = safeRequestContactComplete({ timeout: 1000 });
    await vi.advanceTimersByTimeAsync(1000);
    const result = await promise;
    expect(!result.ok && TimeoutError.is(result.error)).toBe(true);
    vi.useRealTimers();
  });

  it('should throw the abort reason if the signal was aborted while polling', async () => {
    const controller = new AbortController();
    const reason = new Error('Aborted');
    let phoneRequested = false;
    setup({
      onMethod(call) {
        respondContact('')(call);
        if (call.name === 'web_app_request_phone') {
          phoneRequested = true;
          respond('web_app_request_phone', 'phone_requested', { status: 'sent' })(call);
        } else if (phoneRequested) {
          controller.abort(reason);
        }
      },
    });
    await expect(safeRequestContactComplete({ signal: controller.signal })).rejects.toBe(reason);
  });

  it('should throw MethodUnsupportedError before v6.9', async () => {
    setup({ version: '6.8' });
    await expect(requestContact()).rejects.toThrow(MethodUnsupportedError);
  });

  it('should return TimeoutError if the contact was not received in time', async () => {
    vi.useFakeTimers();
    setup({
      onMethod(call) {
        respondContact('')(call);
        respond('web_app_request_phone', 'phone_requested', { status: 'sent' })(call);
      },
    });
    const promise = safeRequestContactComplete({ timeout: 1000 });
    await vi.advanceTimersByTimeAsync(1000);
    const result = await promise;
    expect(!result.ok && TimeoutError.is(result.error)).toBe(true);
    vi.useRealTimers();
  });
});

describe('isSupported', () => {
  it.each([
    { fn: requestPhoneAccess, name: 'requestPhoneAccess', supported: '6.9', unsupported: '6.8' },
    { fn: safeRequestPhoneAccess, name: 'safeRequestPhoneAccess', supported: '6.9', unsupported: '6.8' },
    { fn: requestWriteAccess, name: 'requestWriteAccess', supported: '6.9', unsupported: '6.8' },
    { fn: safeRequestWriteAccess, name: 'safeRequestWriteAccess', supported: '6.9', unsupported: '6.8' },
    { fn: requestContact, name: 'requestContact', supported: '6.9', unsupported: '6.8' },
    { fn: safeRequestContact, name: 'safeRequestContact', supported: '6.9', unsupported: '6.8' },
    { fn: requestContactComplete, name: 'requestContactComplete', supported: '6.9', unsupported: '6.8' },
    { fn: safeRequestContactComplete, name: 'safeRequestContactComplete', supported: '6.9', unsupported: '6.8' },
  ])('$name should check the Mini Apps version', ({ fn, supported, unsupported }) => {
    expect(fn.isSupported()).toBe(false);
    setup({ version: unsupported });
    expect(fn.isSupported()).toBe(false);
    setup({ version: supported });
    expect(fn.isSupported()).toBe(true);
  });
});
