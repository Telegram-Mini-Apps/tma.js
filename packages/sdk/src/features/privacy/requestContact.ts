import { PhoneRequestedStatus } from '@tma.js/bridge';
import { BetterTaskEither, type BetterTaskEitherError } from '@tma.js/toolkit';
import { pipeJsonToSchema, pipeQueryToSchema } from '@tma.js/transformers';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import {
  safeParse,
  pipe as valiPipe,
  date,
  looseObject,
  number,
  optional,
  string,
  transform,
} from 'valibot';

import { AccessDeniedError, ValidationError } from '@/errors.js';
import {
  sharedFeatureOptions,
  type SharedFeatureOptions,
} from '@/fn-options/sharedFeatureOptions.js';

import {
  withInvokeCustomMethod,
  type WithInvokeCustomMethod,
  InvokeCustomMethodError,
} from '@/fn-options/withInvokeCustomMethod.js';

import { withVersion, type WithVersion } from '@/fn-options/withVersion.js';
import type { AsyncOptions } from '@/types.js';
import { throwifyWithChecksFp } from '@/with-checks/throwifyWithChecksFp.js';

import { withChecksFp } from '@/with-checks/withChecksFp.js';

import { type RequestPhoneAccessError, requestPhoneAccessFp } from './requestPhoneAccess.js';

/**
 * Requested contact information.
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
  hash: string;
  [key: string]: unknown;
}

/**
 * Requested contact complete data.
 */
export interface RequestedContactCompleteData {
  /**
   * Raw original representation of the contact data returned from the Telegram server.
   */
  raw: string;
  /**
   * Parsed representation of the contact data.
   */
  parsed: RequestedContact;
}

interface CreateCompleteOptions extends SharedFeatureOptions, WithInvokeCustomMethod, WithVersion {
  requestPhoneAccess: (options?: AsyncOptions) => (
    TE.TaskEither<RequestPhoneAccessError, PhoneRequestedStatus>
  );
}

interface CreateParsedOptions extends SharedFeatureOptions, WithVersion {
  requestContact: (options?: AsyncOptions) => TE.TaskEither<RequestContactError, RequestedContact>;
}

export type RequestContactError =
  | InvokeCustomMethodError
  | AccessDeniedError
  | ValidationError
  | BetterTaskEitherError;

function createComplete({
  invokeCustomMethod,
  requestPhoneAccess,
  ...rest
}: CreateCompleteOptions) {
  type GetRequestedContactError = InvokeCustomMethodError | ValidationError;

  // Attempts to get previously requested contact.
  const getContact = (
    options?: AsyncOptions,
  ): TE.TaskEither<GetRequestedContactError, RequestedContactCompleteData | undefined> => {
    return pipe(
      invokeCustomMethod('getRequestedContact', {}, {
        ...options,
        timeout: (options || {}).timeout || 5000,
      }),
      TE.chainW(response => {
        const toStringResult = safeParse(string(), response);
        if (!toStringResult.success) {
          return TE.left(new ValidationError(response, toStringResult.issues));
        }

        if (!toStringResult.output) {
          return TE.right(undefined);
        }

        const toParsedResult = safeParse(
          pipeQueryToSchema(
            looseObject({
              contact: pipeJsonToSchema(looseObject({
                user_id: number(),
                phone_number: string(),
                first_name: string(),
                last_name: optional(string()),
              })),
              auth_date: valiPipe(
                string(),
                transform(input => new Date(Number(input) * 1000)),
                date(),
              ),
              hash: string(),
            }),
          ),
          toStringResult.output,
        );
        return toParsedResult.success
          ? TE.right({ raw: toStringResult.output, parsed: toParsedResult.output })
          : TE.left(new ValidationError(toStringResult.output, toParsedResult.issues));
      }),
    );
  };

  // Attempts to get previously requested contact, but ignores all errors except validation error.
  const getContactWithErrorsIgnore = (
    options?: AsyncOptions,
  ): TE.TaskEither<ValidationError, RequestedContactCompleteData | undefined> => {
    return pipe(
      getContact(options),
      TE.match(
        // All other errors except validation ones should be ignored. Receiving validation error
        // means that we have some data, but we are unable to parse it properly. So, there is no
        // need to make some more requests further, the problem is local.
        error => (ValidationError.is(error) ? E.left(error) : E.right(undefined)),
        contact => E.right(contact),
      ),
    );
  };

  // Polls previously requested contact with increasing timeout between requests.
  const pollContact = (ctx: {
    isRejected: boolean;
    rejectReason: unknown;
    abortSignal: AbortSignal;
  }): TE.TaskEither<BetterTaskEitherError | ValidationError, RequestedContactCompleteData> => {
    return BetterTaskEither<ValidationError, RequestedContactCompleteData>(
      async (res, rej, context) => {
        // Time to wait before executing the next request.
        let sleepTime = 50;

        // We are trying to retrieve the requested contact until the deadline was reached.
        while (!context.isRejected) {
          const result = await getContactWithErrorsIgnore(context)();
          if (result._tag === 'Left') {
            return rej(result.left);
          }
          if (result.right) {
            return res(result.right);
          }
          await new Promise(resolve => setTimeout(resolve, sleepTime));
          sleepTime += 50;
        }
      },
      ctx,
    );
  };

  return withChecksFp((
    options?: AsyncOptions,
  ): TE.TaskEither<RequestContactError, RequestedContactCompleteData> => {
    return BetterTaskEither.fn(context => {
      return pipe(
        // Try to get the requested contact. Probably, we already requested it before.
        getContactWithErrorsIgnore(context),
        TE.chain(contact => {
          if (contact) {
            return TE.right(contact);
          }
          return pipe(
            requestPhoneAccess(context),
            TE.chainW(status => {
              return status === 'sent'
                ? pollContact(context)
                : TE.left(new AccessDeniedError('User denied access'));
            }),
          );
        }),
      );
    }, options);
  }, { ...rest, returns: 'task', requires: 'web_app_request_phone' });
}

// #__NO_SIDE_EFFECTS__
function instantiateComplete() {
  return createComplete({
    ...pipe(sharedFeatureOptions(), withInvokeCustomMethod, withVersion),
    requestPhoneAccess: requestPhoneAccessFp,
  });
}

function createParsed({ requestContact, ...rest }: CreateParsedOptions) {
  return withChecksFp(
    requestContact,
    { ...rest, returns: 'task', requires: 'web_app_request_phone' },
  );
}

// #__NO_SIDE_EFFECTS__
function instantiateParsed() {
  return createParsed({
    ...pipe(sharedFeatureOptions(), withVersion),
    requestContact(options) {
      return pipe(
        requestContactCompleteFp(options),
        TE.map(contact => contact.parsed),
      );
    },
  });
}

/**
 * Requests current user contact information.
 *
 * This function returns an object, containing both raw and parsed representations of a response,
 * received from the Telegram client.
 * @param options - additional options.
 * @since Mini Apps v6.9
 */
export const requestContactCompleteFp = instantiateComplete();

/**
 * @see requestContactCompleteFp
 */
export const requestContactComplete = throwifyWithChecksFp(requestContactCompleteFp);

/**
 * Works the same way as the `requestContactCompleteFp` function, but returns only parsed
 * representation of the contact data.
 * @see requestContactCompleteFp
 * @param options - additional options.
 * @since Mini Apps v6.9
 */
export const requestContactFp = instantiateParsed();

/**
 * @see requestContactFp
 */
export const requestContact = throwifyWithChecksFp(requestContactFp);
