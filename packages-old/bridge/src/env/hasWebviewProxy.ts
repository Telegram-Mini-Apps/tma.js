import * as v from 'valibot';

/**
 * Returns true in case, passed value contains path `TelegramWebviewProxy.postEvent` property and
 * `postEvent` is a function.
 * @param value - value to check.
 */
export function hasWebviewProxy<T>(value: T): value is T & {
  TelegramWebviewProxy: {
    postEvent: (...args: unknown[]) => unknown;
  };
} {
  return typeof value === 'object' && !!value && !Array.isArray(value) && v.is(
    v.looseObject({ TelegramWebviewProxy: v.looseObject({ postEvent: v.function() }) }),
    { TelegramWebviewProxy: (value as Record<string, unknown>).TelegramWebviewProxy },
  );
}
