import { signal, computed } from '@tma.js/signals';
import { createLogger, type Logger } from '@tma.js/toolkit';

import { off, offAll, on } from '@/events/emitter.js';
import type { SubscribeListener } from '@/events/types/index.js';
import type { PostMessage } from '@/methods/postMessage.js';

/**
 * @internal
 */
const _debug = signal(false);
/**
 * @internal
 */
const _targetOrigin = signal('https://web.telegram.org');

const onEventReceived: SubscribeListener = event => {
  logger().log('Event received:', event);
};

/**
 * The current debug mode state.
 *
 * To update the value, use the `setDebug` function.
 * @see setDebug
 */
export const debug = computed(_debug);

/**
 * Sets the package debug mode.
 *
 * Enabling debug mode leads to printing additional messages in the console related to the
 * processes inside the package.
 * @param value - enable debug mode.
 */
export function setDebug(value: boolean): void {
  if (value !== _debug()) {
    _debug.set(value);
    (value ? on : off)('*', onEventReceived);
  }
}

/**
 * The current target origin used by the `postEvent` method.
 *
 * You don't need to override this value until you know what you are doing.
 * To update the value, use the `setTargetOrigin` function.
 * @default 'https://web.telegram.org'
 * @see setTargetOrigin
 */
export const targetOrigin = computed(_targetOrigin);

/**
 * Sets a new target origin that is being used when calling the `postEvent` function in Telegram
 * web versions.
 *
 * You don't need to override this value until you know what you are doing.
 * @param origin - allowed target origin value.
 * @see _targetOrigin
 */
export function setTargetOrigin(origin: string) {
  _targetOrigin.set(origin);
  logger().log('New target origin set', origin);
}

/**
 * Signal containing a custom implementation of the method to post a message to the parent
 * window. We usually use it to send a message in web versions of Telegram.
 *
 * @default A function behaving like the `window.parent.postMessage` method.
 */
export const postMessageImpl = signal<PostMessage>((...args) => {
  window.parent.postMessage(...args as unknown as Parameters<PostMessage>);
});

/**
 * The package logger. You can override this value in order to use your own implementation.
 */
export const logger = signal<Logger>(createLogger('Bridge', {
  bgColor: '#9147ff',
  textColor: 'white',
  shouldLog: debug,
}));

/**
 * Resets the package global values. Normally, you don't use this function in your application.
 * We are using it only for test purposes.
 */
export function resetGlobals() {
  offAll();
  [postMessageImpl, _targetOrigin, targetOrigin, _debug, debug, logger].forEach(s => {
    s.unsubAll();
    'reset' in s && s.reset();
  });
}
