import {
  boolean,
  type GenericSchema,
  looseObject,
  nullish,
  number,
  optional,
  parse,
  parseJson,
  pipe,
  safeParse,
  string,
  transform,
  unknown,
} from 'valibot';

import { isIframe } from './env.js';
import { telegramWindow } from './globals.js';
import { debugLog, getLogger } from './logger.js';
import { themeParams } from './theme-params.js';
import type {
  AnyEventListener,
  EventListener,
  EventListenerPayload,
  EventName,
  EventPayload,
} from './types/index.js';
import { composeFn, ensureObject, mergeOnAssign, type Restore } from './window-hooks.js';

export interface OnOptions {
  /**
   * Remove the listener after the first call.
   */
  once?: boolean;
  /**
   * Signal removing the listener when aborted.
   */
  signal?: AbortSignal;
}

/**
 * Arguments following the event name when emitting the event.
 */
export type EmitEventArgs<E extends EventName> = [EventPayload<E>] extends [never]
  ? []
  : [payload: EventPayload<E>];

type Listener = (payload: any) => void;

/**
 * Event name to its listeners. The value is a listener-to-once-flag map.
 */
const listeners = new Map<string, Map<Listener, boolean>>();
const anyListeners = new Map<AnyEventListener, boolean>();
let restoreWindow: Restore | undefined;

/**
 * Schema of a message sent by Telegram Web clients via `window.postMessage`.
 */
export const miniAppsMessage = pipe(
  string(),
  parseJson(),
  looseObject({ eventType: string(), eventData: optional(unknown()) }),
);

/**
 * Validates event payloads and fixes known issues of the payloads sent by some Telegram clients.
 */
const payloadSchemas: { [E in EventName]?: GenericSchema<unknown, EventListenerPayload<E>> } = {
  clipboard_text_received: looseObject({
    req_id: string(),
    data: nullish(string()),
  }),
  custom_method_invoked: looseObject({
    req_id: string(),
    result: optional(unknown()),
    error: optional(string()),
  }),
  popup_closed: pipe(
    nullish(looseObject({ button_id: nullish(string()) })),
    transform(data => (data && typeof data.button_id === 'string' ? { button_id: data.button_id } : {})),
  ),
  theme_changed: looseObject({ theme_params: themeParams }),
  viewport_changed: nullish(
    looseObject({
      height: number(),
      width: nullish(number(), () => window.innerWidth),
      is_expanded: boolean(),
      is_state_stable: boolean(),
    }),
    // macOS client sends null instead of the payload.
    () => ({
      height: window.innerHeight,
      width: window.innerWidth,
      is_expanded: true,
      is_state_stable: true,
    }),
  ),
};

function callListener(listener: (value: any) => void, value: unknown): void {
  try {
    listener(value);
  } catch (e) {
    getLogger().error('An event listener threw an error:', e);
  }
}

function callListeners<L>(map: Map<L, boolean>, value: unknown): void {
  // Copying the entries, so listeners added or removed during the call don't affect it.
  [...map].forEach(([listener, once]) => {
    if (map.get(listener) === undefined) {
      return;
    }
    once && map.delete(listener);
    callListener(listener as (value: unknown) => void, value);
  });
}

/**
 * Processes an event received from the Telegram client.
 */
function receiveEvent(name: string, data?: unknown): void {
  const schema = payloadSchemas[name as EventName];
  let payload: unknown;
  try {
    payload = schema ? parse(schema, data) : data;
  } catch (e) {
    getLogger().error(`Unable to process the "${name}" event payload:`, data, e);
    return;
  }
  debugLog('Event received:', name, payload);

  const eventListeners = listeners.get(name);
  if (eventListeners) {
    callListeners(eventListeners, payload);
    !eventListeners.size && listeners.delete(name);
  }
  callListeners(anyListeners, { name, payload });
  uninstallIfIdle();
}

function onMessage(event: MessageEvent): void {
  if (event.source !== window.parent) {
    return;
  }
  // Messages may be sent by any other code. We are ignoring unknown ones.
  const message = safeParse(miniAppsMessage, event.data);
  message.success && receiveEvent(message.output.eventType, message.output.eventData);
}

/**
 * Starts receiving events from the Telegram client.
 *
 * Native clients call one of `window.Telegram.WebView.receiveEvent`,
 * `window.TelegramGameProxy.receiveEvent` or `window.TelegramGameProxy_receiveEvent`. Web
 * clients post messages to the window. The official SDK defines the same functions, so they
 * are composed to keep both working regardless of which one was loaded first.
 */
function install(): Restore {
  const w = telegramWindow() as unknown as Record<string, any>;
  const restores: Restore[] = [
    ensureObject(w, 'Telegram'),
    ensureObject(w.Telegram, 'WebView'),
    mergeOnAssign(w.Telegram, 'WebView'),
    composeFn(w.Telegram.WebView, 'receiveEvent', receiveEvent),
    ensureObject(w, 'TelegramGameProxy'),
    mergeOnAssign(w, 'TelegramGameProxy'),
    composeFn(w.TelegramGameProxy, 'receiveEvent', receiveEvent),
    composeFn(w, 'TelegramGameProxy_receiveEvent', receiveEvent),
  ];
  window.addEventListener('message', onMessage);

  return () => {
    window.removeEventListener('message', onMessage);
    restores.reverse().forEach(restore => restore());
  };
}

function installIfNeeded(): void {
  restoreWindow ||= install();
}

function uninstallIfIdle(): void {
  if (restoreWindow && !listeners.size && !anyListeners.size) {
    restoreWindow();
    restoreWindow = undefined;
  }
}

function subscribe(add: () => void, remove: () => void, options: OnOptions): VoidFunction {
  const { signal } = options;
  if (signal && signal.aborted) {
    return () => undefined;
  }
  installIfNeeded();
  add();

  const off = () => {
    remove();
    uninstallIfIdle();
    signal && signal.removeEventListener('abort', off);
  };
  signal && signal.addEventListener('abort', off);
  return off;
}

/**
 * Adds a listener of the specified Mini Apps event. Adding the same listener twice has no
 * effect.
 * @param event - event name.
 * @param listener - event listener.
 * @param options - additional options.
 * @returns Function removing the listener.
 * @see https://docs.telegram-mini-apps.com/platform/events
 */
export function onEvent<E extends EventName>(
  event: E,
  listener: EventListener<E>,
  options: OnOptions = {},
): VoidFunction {
  return subscribe(
    () => {
      const map = listeners.get(event) || new Map<Listener, boolean>();
      listeners.set(event, map);
      map.set(listener as Listener, !!options.once);
    },
    () => offEvent(event, listener),
    options,
  );
}

/**
 * Removes a listener of the specified Mini Apps event.
 * @param event - event name.
 * @param listener - event listener.
 */
export function offEvent<E extends EventName>(event: E, listener: EventListener<E>): void {
  const map = listeners.get(event);
  if (map) {
    map.delete(listener as Listener);
    !map.size && listeners.delete(event);
  }
  uninstallIfIdle();
}

/**
 * Adds a listener of all Mini Apps events. Adding the same listener twice has no effect.
 * @param listener - events listener.
 * @param options - additional options.
 * @returns Function removing the listener.
 */
export function onAnyEvent(listener: AnyEventListener, options: OnOptions = {}): VoidFunction {
  return subscribe(
    () => anyListeners.set(listener, !!options.once),
    () => offAnyEvent(listener),
    options,
  );
}

/**
 * Removes a listener of all Mini Apps events.
 * @param listener - events listener.
 */
export function offAnyEvent(listener: AnyEventListener): void {
  anyListeners.delete(listener);
  uninstallIfIdle();
}

/**
 * Removes all event listeners and stops receiving events from the Telegram client.
 */
export function offAll(): void {
  listeners.clear();
  anyListeners.clear();
  uninstallIfIdle();
}

/**
 * Emits an event as if it was sent by the Telegram client. Use it to imitate the Telegram
 * client, for example, in the `mockTelegramEnv` function `onEvent` option.
 *
 * The event is delivered the same way a real Telegram client would deliver it, so other
 * libraries (e.g. the official SDK) receive it too.
 * @param event - event name.
 * @param args - event payload.
 */
export function emitEvent<E extends EventName>(event: E, ...args: EmitEventArgs<E>): void {
  const [eventData] = args as [unknown?];
  const receive = telegramWindow().Telegram?.WebView?.receiveEvent;
  if (!isIframe() && typeof receive === 'function') {
    receive(event, eventData);
    return;
  }
  window.dispatchEvent(new MessageEvent('message', {
    data: JSON.stringify({ eventType: event, eventData }),
    source: window.parent,
  }));
}
