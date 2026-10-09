import type { BetterPromise } from 'better-promises';
import { either as E, option as O, taskEither as TE, function as fn } from 'fp-ts';

import { InvalidArgumentsError, InvalidEnvError, ServerlessError } from '@/errors.js';
import type { SharedFeatureOptions } from '@/fn-options/sharedFeatureOptions.js';
import type { WithVersion } from '@/fn-options/withVersion.js';
import { throwifyWithChecksFp } from '@/with-checks/throwifyWithChecksFp.js';
import { withChecksFp, type WithChecks, type WithChecksFp } from '@/with-checks/withChecksFp.js';

export interface ServerlessCallOptions {
  /**
   * Signal to abort the request.
   */
  abortSignal?: AbortSignal;
}

export type ServerlessCallError = InvalidArgumentsError | InvalidEnvError | ServerlessError;

type CallFp = <T = unknown>(
  name: string,
  input?: object,
  options?: ServerlessCallOptions,
) => TE.TaskEither<ServerlessCallError, T>;

type Call = <T = unknown>(
  name: string,
  input?: object,
  options?: ServerlessCallOptions,
) => BetterPromise<T>;

export interface ServerlessOptions extends SharedFeatureOptions, WithVersion {
  /**
   * Retrieves raw init data from the current environment.
   */
  retrieveRawInitData: () => E.Either<Error, O.Option<string>>;
  /**
   * Function to perform HTTP requests.
   */
  fetch: typeof fetch;
}

/**
 * Converts the endpoint response to the call result.
 * @param name - endpoint name.
 * @param response - endpoint response.
 */
function parseResponse(name: string, response: Response): TE.TaskEither<ServerlessError, any> {
  return fn.pipe(
    // Response body may be missing or not a JSON. In this case we consider it unexpected.
    TE.tryCatch(async () => JSON.parse(await response.text()) as unknown, () => undefined),
    TE.orElseW(() => TE.right(undefined)),
    TE.chain(data => {
      if (!data || typeof data !== 'object' || typeof (data as any).ok !== 'boolean') {
        return TE.left(new ServerlessError(
          `Unexpected response from endpoint ${name} (HTTP ${response.status})`,
          { status: response.status },
        ));
      }
      const envelope = data as {
        ok: boolean;
        result?: unknown;
        description?: string;
        error_code?: number;
        error_type?: string;
        parameters?: unknown;
      };
      return envelope.ok
        ? TE.right(envelope.result)
        : TE.left(new ServerlessError(
          envelope.description || `Endpoint ${name} failed (HTTP ${response.status})`,
          {
            status: envelope.error_code || response.status,
            type: envelope.error_type || undefined,
            parameters: envelope.parameters,
          },
        ));
    }),
  );
}

/**
 * Component allowing a Mini App hosted on Telegram Serverless to call the bot's endpoints.
 * @see https://corefork.telegram.org/bots/serverless
 */
export class Serverless {
  constructor({ retrieveRawInitData, fetch, ...rest }: ServerlessOptions) {
    const callFp: CallFp = (name, input = {}, options = {}) => {
      if (typeof input !== 'object' || input === null || Array.isArray(input)) {
        return TE.left(new InvalidArgumentsError('Endpoint input must be an object'));
      }
      return fn.pipe(
        TE.fromEither(retrieveRawInitData()),
        TE.chainW(TE.fromOption(() => {
          return new InvalidEnvError('Init data is unavailable. Open the app from Telegram');
        })),
        TE.chainW(initData => TE.tryCatch(
          () => fetch(`/api/${name}`, {
            method: 'POST',
            headers: {
              Authorization: `TMA ${btoa(initData)}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
            credentials: 'omit',
            signal: options.abortSignal,
          }),
          e => new ServerlessError(
            `Network error calling endpoint ${name}${
              e instanceof Error && e.message ? `: ${e.message}` : ''
            }`,
            { status: 0, cause: e },
          ),
        )),
        TE.chainW(response => parseResponse(name, response)),
      ) as TE.TaskEither<ServerlessCallError, any>;
    };

    // Casting is required to keep the result type generic.
    const callFpWithChecks = withChecksFp(callFp, { ...rest, returns: 'task' });
    this.callFp = callFpWithChecks as typeof this.callFp;
    this.call = throwifyWithChecksFp(callFpWithChecks) as typeof this.call;
  }

  /**
   * Calls the bot's Serverless project endpoint with the specified name.
   *
   * The platform validates the Mini App init data before running the endpoint, so the endpoint
   * is able to identify the caller.
   * @param name - endpoint name.
   * @param input - JSON-serializable object passed to the endpoint as its first argument.
   * @param options - additional options.
   * @returns The value returned by the endpoint.
   * @example
   * fn.pipe(
   *   serverless.callFp<Profile>('getProfile', { lang: 'en' }),
   *   TE.match(
   *     error => console.error(error.message),
   *     profile => console.log(profile),
   *   ),
   * );
   */
  readonly callFp: WithChecksFp<CallFp, false> & CallFp;

  /**
   * @see callFp
   * @example
   * const profile = await serverless.call<Profile>('getProfile', { lang: 'en' });
   */
  readonly call: WithChecks<Call, false> & Call;
}
