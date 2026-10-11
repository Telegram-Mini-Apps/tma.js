import { matchError } from 'error-kid';
import { expectTypeOf } from 'vitest';

import type {
  InvalidLaunchParamsError,
  InvokeCustomMethodFailedError,
  LaunchParamsRetrieveError,
  StartParamTooLongError,
  TimeoutError,
} from './errors.js';

import { emitEvent, onAnyEvent, onEvent } from './events.js';
import { safeInvokeCustomMethod } from './invokeCustomMethod.js';
import {
  type LaunchParams,
  safeParseLaunchParams,
  safeRetrieveLaunchParams,
  safeRetrieveRawInitData,
  safeRetrieveRawLaunchParams,
} from './launch-params.js';
import { postEvent } from './post-event.js';
import { request, safeRequest } from './request.js';
import { ok, type Result, throwing } from './result.js';
import { safeCreateStartParam } from './start-param.js';
import { supports } from './versions.js';

// The function is never called. The file is checked by the TypeScript compiler only.
export function checkTypes(): void {
  expectTypeOf(() => {
    postEvent('web_app_ready');
    // @ts-expect-error Method has no parameters.
    postEvent('web_app_ready', {});
    postEvent('web_app_close');
    postEvent('web_app_close', { return_back: true });
    // @ts-expect-error Parameters are required.
    postEvent('web_app_setup_back_button');
    // @ts-expect-error Unknown method.
    postEvent('web_app_unknown');

    onEvent('back_button_pressed', payload => {
      expectTypeOf(payload).toEqualTypeOf<undefined>();
    });
    onEvent('fullscreen_changed', payload => {
      expectTypeOf(payload).toEqualTypeOf<{ is_fullscreen: boolean }>();
    });
    onAnyEvent(event => {
      if (event.name === 'qr_text_received') {
        expectTypeOf(event.payload).toEqualTypeOf<{ data: string }>();
      }
    });

    emitEvent('back_button_pressed');
    // @ts-expect-error Event has no payload.
    emitEvent('back_button_pressed', {});
    // @ts-expect-error Payload is required.
    emitEvent('fullscreen_changed');

    expectTypeOf(request('web_app_request_phone', 'phone_requested'))
      .resolves
      .toHaveProperty('status');
    expectTypeOf(request('web_app_request_phone', ['phone_requested', 'popup_closed']))
      .resolves
      .toEqualTypeOf<
        | { event: 'phone_requested'; payload: { status: string } }
        | { event: 'popup_closed'; payload: { button_id?: string } }
    >();
    // @ts-expect-error Parameters are required.
    void request('web_app_open_popup', 'popup_closed');
    // @ts-expect-error Method has no parameters.
    void request('web_app_request_phone', 'phone_requested', { params: {} });

    supports('web_app_open_link', 'try_browser', '7.6');
    // @ts-expect-error Unknown versioned parameter.
    supports('web_app_open_link', 'url', '7.6');
  }).toBeFunction();
}

// The function is never called. The file is checked by the TypeScript compiler only.
export async function checkSafeTypes(): Promise<void> {
  expectTypeOf(safeRequest('web_app_request_phone', 'phone_requested'))
    .resolves
    .toEqualTypeOf<Result<TimeoutError, { status: string }>>();

  const invoked = await safeInvokeCustomMethod('getCurrentTime', {});
  expectTypeOf(invoked)
    .toEqualTypeOf<Result<InvokeCustomMethodFailedError | TimeoutError, unknown>>();
  if (!invoked.ok) {
    matchError(invoked.error, {
      InvokeCustomMethodFailedError: () => null,
      TimeoutError: () => null,
    });
    // @ts-expect-error Every error must be handled.
    matchError(invoked.error, { TimeoutError: () => null });
  }

  expectTypeOf(safeParseLaunchParams)
    .returns
    .toEqualTypeOf<Result<InvalidLaunchParamsError, LaunchParams>>();
  expectTypeOf(safeRetrieveLaunchParams)
    .returns
    .toEqualTypeOf<Result<LaunchParamsRetrieveError, LaunchParams>>();
  expectTypeOf(safeRetrieveRawLaunchParams)
    .returns
    .toEqualTypeOf<Result<LaunchParamsRetrieveError, string>>();
  expectTypeOf(safeRetrieveRawInitData)
    .returns
    .toEqualTypeOf<Result<LaunchParamsRetrieveError, string | undefined>>();
  expectTypeOf(safeCreateStartParam)
    .returns
    .toEqualTypeOf<Result<StartParamTooLongError, string>>();

  // throwing keeps the arguments and unwraps the result.
  expectTypeOf(throwing((a: number, b?: string): Result<TimeoutError, boolean> => ok(!!a && !b)))
    .toEqualTypeOf<(a: number, b?: string) => boolean>();
  expectTypeOf(throwing(async (a: number): Promise<Result<TimeoutError, string>> => ok(String(a))))
    .toEqualTypeOf<(a: number) => Promise<string>>();
}
