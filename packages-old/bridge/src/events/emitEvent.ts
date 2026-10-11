import type { EventPayload, EventWithoutPayload, EventWithPayload } from '@/events/types/index.js';

/**
 * Emits an event without payload sent from the Telegram native application like it was sent in
 * a default web environment between two iframes.
 *
 * It dispatches a new MessageEvent and expects it to be handled via
 * the `window.addEventListener('message', ...)` call, as a developer would do it to handle
 * messages sent from the parent iframe.
 * @param eventType - event name.
 */
export function emitEvent<E extends EventWithoutPayload>(eventType: E): void;

/**
 * Emits an event with payload sent from the Telegram native application like it was sent in
 * a default web environment between two iframes.
 *
 * It dispatches a new MessageEvent and expects it to be handled via
 * the `window.addEventListener('message', ...)` call, as a developer would do it to handle
 * messages sent from the parent iframe.
 * @param eventType - event name.
 * @param eventData - event payload.
 */
export function emitEvent<E extends EventWithPayload>(
  eventType: E,
  eventData: EventPayload<E>,
): void;

/**
 * Emits an unknown event sent from the Telegram native application like it was sent in a default
 * web environment between two iframes.
 *
 * It dispatches a new MessageEvent and expects it to be handled via
 * the `window.addEventListener('message', ...)` call, as a developer would do it to handle
 * messages sent from the parent iframe.
 * @param eventType - event name.
 * @param eventData - event payload.
 */
export function emitEvent<E extends string>(
  eventType: E,
  eventData: E extends EventWithoutPayload
    ? never
    : E extends EventWithPayload
      ? EventPayload<E>
      : unknown,
): void;

/**
 * Emits an event sent from the Telegram native application like it was sent in a default web
 * environment between two iframes.
 *
 * It dispatches a new MessageEvent and expects it to be handled via
 * the `window.addEventListener('message', ...)` call, as a developer would do it to handle
 * messages sent from the parent iframe.
 * @param eventType - event name.
 * @param eventData - event payload.
 */
export function emitEvent(eventType: string, eventData?: unknown): void {
  window.dispatchEvent(new MessageEvent('message', {
    data: JSON.stringify({ eventType, eventData }),
    // We specify this kind of source here in order to allow the package's "on" function to
    // capture it. The reason is this function always checks the event source and relies on
    // it to be the parent window.
    source: window.parent,
  }));
}
