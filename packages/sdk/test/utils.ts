import {
  emitEvent,
  type EventName,
  type LaunchParams,
  type MockedMethodCall,
  mockTelegramEnv,
} from '@tma.js/bridge';
import { vi } from 'vitest';

import { init } from '../src/init.js';

export interface SetupOptions {
  /**
   * Mini Apps version.
   * @default '9.6'
   */
  version?: string;
  /**
   * Additional launch parameters.
   */
  launchParams?: Partial<LaunchParams>;
  /**
   * Function called whenever a method is called. Use `emitEvent` to respond.
   */
  onMethod?: (call: MockedMethodCall) => void;
}

/**
 * Mocks the Telegram client and initializes the SDK.
 * @returns Spy receiving all method calls.
 */
export function setup({ version = '9.6', launchParams, onMethod }: SetupOptions = {}) {
  const calls = vi.fn<(call: MockedMethodCall) => void>();
  mockTelegramEnv({
    onMethod(call) {
      calls(call);
      onMethod && onMethod(call);
    },
  });
  init({
    launchParams: {
      tgWebAppPlatform: 'tdesktop',
      tgWebAppVersion: version,
      tgWebAppThemeParams: {},
      ...launchParams,
    },
  });
  return calls;
}

/**
 * @returns Function responding to the method with the event.
 */
export function respond<E extends EventName>(
  method: string,
  event: E,
  payload?: unknown | ((params: any) => unknown),
): (call: MockedMethodCall) => void {
  return call => {
    if (call.name === method) {
      const data = typeof payload === 'function' ? payload(call.params) : payload;
      (emitEvent as (event: string, payload?: unknown) => void)(event, data);
    }
  };
}

export interface CustomMethodResponse {
  result?: unknown;
  error?: string;
}

/**
 * @returns Function responding to the custom method with the result or the error.
 * @param method - custom method name.
 * @param response - response, or a function returning it for each call.
 */
export function respondCustomMethod(
  method: string,
  response: CustomMethodResponse | (() => CustomMethodResponse),
): (call: MockedMethodCall) => void {
  return call => {
    const params = call.params as { method: string; req_id: string };
    if (call.name === 'web_app_invoke_custom_method' && params.method === method) {
      emitEvent('custom_method_invoked', {
        req_id: params.req_id,
        ...typeof response === 'function' ? response() : response,
      });
    }
  };
}

/**
 * Makes the current page look reloaded.
 */
export function mockPageReload(): void {
  vi.spyOn(performance, 'getEntriesByType').mockReturnValue([
    { type: 'reload' } as PerformanceNavigationTiming,
  ]);
}
