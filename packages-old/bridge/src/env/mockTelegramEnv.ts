import { setStorageValue } from '@tma.js/toolkit';
import {
  miniAppsMessage,
  parseLaunchParamsQuery,
  pipeJsonToSchema,
  serializeLaunchParamsQuery,
  type LaunchParamsLike,
} from '@tma.js/transformers';
import { parse } from 'valibot';

import { isIframe } from '@/env/isIframe.js';
import { InvalidLaunchParamsError } from '@/errors.js';
import { logger, postMessageImpl } from '@/globals.js';
import type { MethodName, MethodParams } from '@/methods/types/index.js';

/**
 * Mocks the environment and imitates Telegram Mini Apps behavior.
 *
 * We usually use this function in the following cases:
 * 1. We are developing an application outside the Telegram environment and would like to imitate
 * the Telegram client in order to re-create the same communication behavior.
 * 2. We would like to intercept some Telegram Mini Apps methods' calls in order to enhance them
 * or write a custom behavior. It is extremely useful in some Telegram clients improperly handling
 * Mini Apps methods' calls and not even responding.
 *
 * Note that calling this function in Telegram web clients, the `postMessageImplementation` signal
 * value will be updated with a new one, enhancing previously set signal value to allow wrapping
 * the original `window.parent.postMessage` function. In other words, calling `mockTelegramEnv`
 * function N times, you will effectively wrap previously set implementation N times, so be
 * careful calling this function several times during a single lifecycle of the app. In case you
 * would like to avoid such kind of behavior, use the `resetPostMessage` option.
 */
export function mockTelegramEnv({ launchParams, onEvent, resetPostMessage }: {
  /**
   * Launch parameters to mock. They will be saved in the storage, so the SDK functions could
   * retrieve them.
   *
   * Note that this value must have `tgWebAppData` presented in a raw format as long as you will
   * need it when retrieving init data in this format. Otherwise, init data may be broken.
   */
  launchParams?:
    | (Omit<LaunchParamsLike, 'tgWebAppData'> & { tgWebAppData?: string | URLSearchParams })
    | string
    | URLSearchParams;
  /**
   * Function that will be called if a Mini Apps method call was requested by the mini app.
   *
   * It receives a Mini Apps method name along with the passed payload.
   *
   * Note that using the `next` function, in non-web environments it uses the
   * `window.TelegramWebviewProxy.postEvent` method.
   *
   * Talking about the web versions of Telegram, the value of `next` is a bit more complex - it
   * will be equal to the value stored in the `postMessageImpl` signal set previously. By default,
   * this value contains a function utilizing the `window.parent.postMessage` method.
   * @param event - event information.
   * @param next - function to call the original method used to call a Mini Apps method.
   */
  onEvent?: (
    event:
      | { [M in MethodName]: { name: M; params: MethodParams<M> } }[MethodName]
      | { name: string; params: unknown },
    next: () => void,
  ) => void;
  /**
   * Removes all previously set enhancements of the `window.parent.postMessage` function set
   * by other `mockTelegramEnv` calls.
   * @default false
   */
  resetPostMessage?: boolean;
} = {}): void {
  if (launchParams) {
    // If launch parameters were passed, save them in the session storage, so
    // the retrieveLaunchParams function would return them.
    const launchParamsQuery =
      typeof launchParams === 'string' || launchParams instanceof URLSearchParams
        ? launchParams.toString()
        : (
          // Here we have to trick serializeLaunchParamsQuery into thinking, it serializes a valid
          // value. We are doing it because we are working with tgWebAppData presented as a
          // string, not an object as serializeLaunchParamsQuery requires.
          serializeLaunchParamsQuery({ ...launchParams, tgWebAppData: undefined })
          // Then, we just append init data.
          + (launchParams.tgWebAppData ? `&tgWebAppData=${encodeURIComponent(launchParams.tgWebAppData.toString())}` : '')
        );

    // Remember to check if launch params are valid.
    try {
      parseLaunchParamsQuery(launchParamsQuery);
    } catch (e) {
      throw new InvalidLaunchParamsError(launchParamsQuery, e);
    }
    setStorageValue('launchParams', launchParamsQuery);
  }

  // Original postEvent firstly checks if the current environment is iframe.
  // That's why we have a separate branch for this environment here too.
  if (isIframe()) {
    if (!onEvent) {
      return;
    }
    // As long as the postEvent function uses the postMessage method, we should rewire it.
    if (resetPostMessage) {
      postMessageImpl.reset();
    }

    const original = postMessageImpl();
    postMessageImpl.set((...args) => {
      const [message] = args;
      const next = () => {
        (original as any)(...args);
      };

      // Pass only Telegram Mini Apps events to the handler. All other calls should be passed
      // to the original handler (window.parent.postMessage likely).
      try {
        const data = parse(pipeJsonToSchema(miniAppsMessage()), message);
        onEvent({ name: data.eventType, params: data.eventData }, next);
      } catch {
        next();
      }
    });
    return;
  }

  // In all other environments, it is enough to define window.TelegramWebviewProxy.postEvent.
  const proxy = (window as any).TelegramWebviewProxy || {};
  const postEventDefaulted = proxy.postEvent || (() => undefined);
  (window as any).TelegramWebviewProxy = {
    ...proxy,
    postEvent(eventType: string, eventData: string) {
      const next = () => {
        postEventDefaulted(eventType, eventData);
      };
      onEvent
        ? onEvent({
          name: eventType,
          params: eventData ? JSON.parse(eventData) : undefined,
        }, next)
        : next();
    },
  };

  logger().log('Environment was mocked by the mockTelegramEnv function');
}
