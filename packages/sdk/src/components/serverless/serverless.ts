import { err, ok, type Result, unwrap } from '@tma.js/bridge';

import { InvalidArgumentsError, InvalidEnvError, ServerlessError } from '../../errors.js';
import { getGlobals } from '../../globals.js';

export interface ServerlessCallOptions {
  /**
   * Signal to abort the call. When aborted, the call is rejected with `signal.reason`.
   */
  signal?: AbortSignal;
}

export type ServerlessCallError = InvalidArgumentsError | ServerlessError;

/**
 * Endpoints deployed with Telegram serverless functions.
 */
export interface Serverless {
  /**
   * Calls the endpoint with the specified name. Init data is passed in the `Authorization`
   * header, so the endpoint knows the user.
   * @param name - endpoint name.
   * @param input - endpoint input.
   * @param options - additional options.
   * @returns Endpoint result, `InvalidArgumentsError` if the input is not an object, or
   * `ServerlessError` if the endpoint failed or the request could not be completed.
   * @throws {NotInitializedError} The SDK is not initialized.
   * @throws {InvalidEnvError} Launch parameters have no init data.
   * @example
   * const result = await serverless.safeCall<{ balance: number }>('getBalance');
   */
  safeCall: <T = unknown>(
    name: string,
    input?: object,
    options?: ServerlessCallOptions,
  ) => Promise<Result<ServerlessCallError, T>>;
  /**
   * Throwing version of `safeCall`.
   * @throws {InvalidArgumentsError} The input is not an object.
   * @throws {ServerlessError} The endpoint failed or the request could not be completed.
   */
  call: <T = unknown>(name: string, input?: object, options?: ServerlessCallOptions) => Promise<T>;
}

interface Envelope {
  ok: boolean;
  result?: unknown;
  description?: string;
  error_code?: number;
  error_type?: string;
  parameters?: unknown;
}

async function parseResponse(
  name: string,
  response: Response,
): Promise<Result<ServerlessError, any>> {
  let data: unknown;
  try {
    data = JSON.parse(await response.text());
  } catch {
    // The body is missing or is not JSON, which is unexpected.
  }
  if (!data || typeof data !== 'object' || typeof (data as Envelope).ok !== 'boolean') {
    return err(new ServerlessError(
      `Unexpected response from endpoint ${name} (HTTP ${response.status})`,
      { status: response.status },
    ));
  }
  const envelope = data as Envelope;
  return envelope.ok
    ? ok(envelope.result)
    : err(new ServerlessError(
      envelope.description || `Endpoint ${name} failed (HTTP ${response.status})`,
      {
        status: envelope.error_code || response.status,
        type: envelope.error_type || undefined,
        parameters: envelope.parameters,
      },
    ));
}

/**
 * Endpoints deployed with Telegram serverless functions.
 */
export const serverless: Serverless = {
  async safeCall(name, input = {}, { signal } = {}) {
    const initData = getGlobals().launchParams.tgWebAppData;
    if (!initData) {
      throw new InvalidEnvError('Init data is unavailable. Open the app from Telegram');
    }
    if (typeof input !== 'object' || input === null || Array.isArray(input)) {
      return err(new InvalidArgumentsError('Endpoint input must be an object'));
    }
    let response: Response;
    try {
      response = await fetch(`/api/${name}`, {
        method: 'POST',
        headers: {
          Authorization: `TMA ${btoa(initData)}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
        credentials: 'omit',
        signal,
      });
    } catch (e) {
      if (signal && signal.aborted) {
        throw signal.reason;
      }
      return err(new ServerlessError(
        `Network error calling endpoint ${name}${e instanceof Error && e.message ? `: ${e.message}` : ''}`,
        { status: 0 },
        e,
      ));
    }
    return parseResponse(name, response);
  },
  async call(name, input, options) {
    return unwrap(await serverless.safeCall(name, input, options));
  },
};
