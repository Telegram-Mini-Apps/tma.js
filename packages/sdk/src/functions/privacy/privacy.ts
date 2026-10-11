import {
  err,
  type InvokeCustomMethodFailedError,
  ok,
  type PhoneRequestedStatus,
  type Result,
  safeInvokeCustomMethod,
  safeRequest,
  TimeoutError,
  type WriteAccessRequestedStatus,
} from '@tma.js/bridge';
import {
  type GenericSchema,
  looseObject,
  number,
  optional,
  parseJson,
  pipe,
  safeParse,
  string,
  transform,
  ValiError,
} from 'valibot';

import { AccessDeniedError, InvalidResponseError } from '../../errors.js';
import { isMethodSupported, requireMethod } from '../../globals.js';
import { throwingWithIsSupported, withIsSupported } from '../../is-supported.js';
import type { AsyncOptions } from '../../types.js';

/**
 * Requests the user's phone number. If the user agrees, the bot receives a message with
 * the contact. Use `requestContact` to get the contact in the mini app.
 * @param options - additional options.
 * @returns Request status, or `TimeoutError` if the user didn't respond in time.
 * @throws {NotInitializedError} The SDK is not initialized.
 * @throws {MethodUnsupportedError} The method is unsupported.
 * @since Mini Apps v6.9
 */
export const safeRequestPhoneAccess = /* @__PURE__ */ withIsSupported(
  async function(
    options?: AsyncOptions,
  ): Promise<Result<TimeoutError, PhoneRequestedStatus>> {
    const { postEvent } = requireMethod('web_app_request_phone');
    const response = await safeRequest('web_app_request_phone', 'phone_requested', {
      ...options,
      postEvent,
    });
    return response.ok ? ok(response.data.status) : response;
  },
  () => isMethodSupported('web_app_request_phone'),
);

/**
 * Requests the user's phone number.
 *
 * Throwing version of `safeRequestPhoneAccess`.
 * @param options - additional options.
 * @throws {NotInitializedError} The SDK is not initialized.
 * @throws {MethodUnsupportedError} The method is unsupported.
 * @throws {TimeoutError} The user didn't respond in time.
 * @since Mini Apps v6.9
 */
export const requestPhoneAccess = /* @__PURE__ */ throwingWithIsSupported(safeRequestPhoneAccess);

/**
 * Requests the permission for the bot to send messages to the user.
 * @param options - additional options.
 * @returns Request status, or `TimeoutError` if the user didn't respond in time.
 * @throws {NotInitializedError} The SDK is not initialized.
 * @throws {MethodUnsupportedError} The method is unsupported.
 * @since Mini Apps v6.9
 */
export const safeRequestWriteAccess = /* @__PURE__ */ withIsSupported(
  async function(
    options?: AsyncOptions,
  ): Promise<Result<TimeoutError, WriteAccessRequestedStatus>> {
    const { postEvent } = requireMethod('web_app_request_write_access');
    const response = await safeRequest('web_app_request_write_access', 'write_access_requested', {
      ...options,
      postEvent,
    });
    return response.ok ? ok(response.data.status) : response;
  },
  () => isMethodSupported('web_app_request_write_access'),
);

/**
 * Requests the permission for the bot to send messages to the user.
 *
 * Throwing version of `safeRequestWriteAccess`.
 * @param options - additional options.
 * @throws {NotInitializedError} The SDK is not initialized.
 * @throws {MethodUnsupportedError} The method is unsupported.
 * @throws {TimeoutError} The user didn't respond in time.
 * @since Mini Apps v6.9
 */
export const requestWriteAccess = /* @__PURE__ */ throwingWithIsSupported(safeRequestWriteAccess);

/**
 * Contact shared by the user.
 */
export interface RequestedContact {
  contact: {
    user_id: number;
    phone_number: string;
    first_name: string;
    last_name?: string;
    [key: string]: unknown;
  };
  auth_date: Date;
  /**
   * Hash to validate the contact with the bot token, the same way as init data.
   */
  hash: string;
  [key: string]: unknown;
}

export interface RequestedContactComplete {
  /**
   * Contact in the raw format, as it was received from the Telegram client. Use it to validate
   * the contact on the server.
   */
  raw: string;
  parsed: RequestedContact;
}

export type RequestContactError =
  | AccessDeniedError
  | InvalidResponseError
  | TimeoutError;

const ContactSchema: GenericSchema<unknown, RequestedContact> = looseObject({
  contact: pipe(string(), parseJson(), looseObject({
    user_id: number(),
    phone_number: string(),
    first_name: string(),
    last_name: optional(string()),
  })),
  auth_date: pipe(string(), transform(value => new Date(Number(value) * 1000))),
  hash: string(),
});

function isRequestContactSupported(): boolean {
  return isMethodSupported('web_app_request_phone')
    && isMethodSupported('web_app_invoke_custom_method');
}

/**
 * Retrieves the contact shared by the user earlier.
 * @returns Contact, or `undefined` if the user didn't share it.
 */
async function safeGetRequestedContact(
  options: AsyncOptions,
): Promise<Result<
  InvalidResponseError | InvokeCustomMethodFailedError | TimeoutError,
  RequestedContactComplete | undefined
>> {
  const { postEvent } = requireMethod('web_app_invoke_custom_method');
  const response = await safeInvokeCustomMethod('getRequestedContact', {}, {
    ...options,
    postEvent,
  });
  if (!response.ok) {
    return response;
  }
  if (typeof response.data !== 'string') {
    return err(new InvalidResponseError(response.data));
  }
  let raw = response.data;
  // Telegram for macOS returns the value as a JSON string.
  if (raw.startsWith('"') && raw.endsWith('"')) {
    try {
      raw = JSON.parse(raw) as string;
    } catch (e) {
      return err(new InvalidResponseError(raw, e));
    }
  }
  if (!raw) {
    return ok(undefined);
  }
  const parsed = safeParse(ContactSchema, Object.fromEntries(new URLSearchParams(raw)));
  return parsed.success
    ? ok({ raw, parsed: parsed.output })
    : err(new InvalidResponseError(raw, new ValiError(parsed.issues)));
}

/**
 * Requests the user's contact. If the user shared it earlier, it is returned immediately.
 * Otherwise, the user is asked to share it.
 * @param options - additional options. The timeout applies to the whole operation.
 * @returns Contact in raw and parsed formats, `AccessDeniedError` if the user refused to share
 * it, `TimeoutError` if the contact was not received in time, or `InvalidResponseError` if
 * the Telegram client returned an invalid contact.
 * @throws {NotInitializedError} The SDK is not initialized.
 * @throws {MethodUnsupportedError} The method is unsupported.
 * @since Mini Apps v6.9
 */
export const safeRequestContactComplete = /* @__PURE__ */ withIsSupported(
  async function(
    options: AsyncOptions = {},
  ): Promise<Result<RequestContactError, RequestedContactComplete>> {
    requireMethod('web_app_request_phone');
    const { timeout, signal } = options;
    const deadline = timeout ? Date.now() + timeout : Infinity;
    const remaining = () => (timeout ? Math.max(deadline - Date.now(), 1) : undefined);

    // Each attempt to retrieve the contact is limited to 5 seconds and the time left. Errors other
    // than the invalid response mean the contact is not available yet.
    const getContact = async (): Promise<Result<
      InvalidResponseError,
      RequestedContactComplete | undefined
    >> => {
      const result = await safeGetRequestedContact({
        signal,
        timeout: Math.min(remaining() || 5000, 5000),
      });
      if (result.ok) {
        return result;
      }
      return InvalidResponseError.is(result.error) ? err(result.error) : ok(undefined);
    };

    const existing = await getContact();
    if (!existing.ok) {
      return existing;
    }
    if (existing.data) {
      return ok(existing.data);
    }

    const status = await safeRequestPhoneAccess({ signal, timeout: remaining() });
    if (!status.ok) {
      return status;
    }
    if (status.data !== 'sent') {
      return err(new AccessDeniedError('User denied access'));
    }

    // The contact reaches the Telegram server with a delay, so it is polled with a growing
    // interval.
    for (let sleep = 50; Date.now() < deadline; sleep += 50) {
      const contact = await getContact();
      if (!contact.ok) {
        return contact;
      }
      if (contact.data) {
        return ok(contact.data);
      }
      if (signal && signal.aborted) {
        throw signal.reason;
      }
      await new Promise(resolve => setTimeout(resolve, Math.min(sleep, remaining() || sleep)));
    }
    return err(new TimeoutError(timeout || 0));
  },
  isRequestContactSupported,
);

/**
 * Requests the user's contact.
 *
 * Throwing version of `safeRequestContactComplete`.
 * @param options - additional options.
 * @throws {NotInitializedError} The SDK is not initialized.
 * @throws {MethodUnsupportedError} The method is unsupported.
 * @throws {AccessDeniedError} The user refused to share the contact.
 * @throws {TimeoutError} The contact was not received in time.
 * @throws {InvalidResponseError} The Telegram client returned an invalid contact.
 * @since Mini Apps v6.9
 */
export const requestContactComplete = /* @__PURE__ */ throwingWithIsSupported(
  safeRequestContactComplete,
);

/**
 * Requests the user's contact. Works the same way as `safeRequestContactComplete`, but returns
 * only the parsed contact.
 * @param options - additional options.
 * @since Mini Apps v6.9
 */
export const safeRequestContact = /* @__PURE__ */ withIsSupported(
  async function(
    options?: AsyncOptions,
  ): Promise<Result<RequestContactError, RequestedContact>> {
    const result = await safeRequestContactComplete(options);
    return result.ok ? ok(result.data.parsed) : result;
  },
  isRequestContactSupported,
);

/**
 * Requests the user's contact.
 *
 * Throwing version of `safeRequestContact`.
 * @param options - additional options.
 * @throws {NotInitializedError} The SDK is not initialized.
 * @throws {MethodUnsupportedError} The method is unsupported.
 * @throws {AccessDeniedError} The user refused to share the contact.
 * @throws {TimeoutError} The contact was not received in time.
 * @throws {InvalidResponseError} The Telegram client returned an invalid contact.
 * @since Mini Apps v6.9
 */
export const requestContact = /* @__PURE__ */ throwingWithIsSupported(safeRequestContact);
