import { runInBatchMode } from './batch.js';
import { collectSignal } from './computed.js';

export type SubscribeListenerFn<T> = (current: T, previous: T) => void;
export type RemoveListenerFn = () => void;

export interface SignalOptions<T> {
  /**
   * Previous and next values comparator.
   *
   * This function is used during the actual and incoming values comparison in the `set` method.
   * If values are considered the same, no subscribers will be called.
   *
   * @default Object.is
   * @param current - the actual value.
   * @param next - an incoming value.
   * @returns True if values are considered the same.
   */
  equals?: (current: T, next: T) => boolean;
}

export interface SubOptions {
  /**
   * Should the listener be called only once.
   */
  once?: boolean;
  /**
   * True if the subscriber was added by another signal.
   */
  signal?: boolean;
}

export interface Signal<T> {
  /**
   * @returns An underlying signal value.
   */
  (): T;
  /**
   * Destroys the signal removing all bound listeners.
   *
   * We usually use this method when the signal is not needed anymore.
   *
   * Take note that as long as call of this method removes all bound listeners, computed signals
   * based on the current one will stop listening to its changes, possibly making it work
   * improperly.
   */
  destroy: () => void;
  /**
   * Resets the signal to its initial value.
   */
  reset: () => void;
  /**
   * Updates the signal notifying all subscribers about changes.
   * @param value - value to set.
   */
  set: (value: T) => void;
  /**
   * Adds a new listener, tracking the signal changes.
   * @param fn - event listener.
   * @param onceOrOptions - was this listener added for a single call, or additional
   * options.
   * @returns A function to remove the bound listener.
   */
  sub: (fn: SubscribeListenerFn<T>, onceOrOptions?: boolean | SubOptions) => RemoveListenerFn;
  /**
   * Removes a listener, tracking the signal changes.
   * @param fn - event listener.
   * @param onceOrOptions - was this listener added for a single call, or additional
   * options. Default: false
   */
  unsub: (fn: SubscribeListenerFn<T>, onceOrOptions?: boolean | SubOptions) => void;
  /**
   * Remove all non-signal listeners.
   */
  unsubAll: () => void;
}

/**
 * Creates a new signal with initial value.
 * @param initialValue - initial value.
 * @param options - additional options.
 */
export function signal<T>(
  initialValue: T,
  options?: SignalOptions<T>,
): Signal<T>;

/**
 * Creates a new signal without initial value.
 * @param initialValue
 * @param options - additional options.
 */
export function signal<T>(
  initialValue?: T,
  options?: SignalOptions<T | undefined>,
): Signal<T | undefined>;

// #__NO_SIDE_EFFECTS__
export function signal<T>(
  initialValue?: T,
  options?: SignalOptions<T | undefined>,
): Signal<T | undefined> {
  type CurrentSignal = Signal<T | undefined>;

  options ||= {};
  const equals = options.equals || Object.is;

  let listeners: [
    listener: SubscribeListenerFn<T | undefined>,
    options: Required<SubOptions>,
  ][] = [];
  let value: ReturnType<CurrentSignal> = initialValue;

  const set: CurrentSignal['set'] = v => {
    if (!equals(value, v)) {
      const prev = value;
      value = v;

      // We are making a copy of listeners as long as they may mutate the listeners' array,
      // leading to an unexpected behavior.
      //
      // We want the setter to make sure that all listeners will be called in predefined
      // order within a single update frame.
      runInBatchMode(s, () => {
        [...listeners].forEach(([fn, once]) => {
          fn(v, prev);

          // Remove "once" listeners.
          if (once) {
            unsub(fn, true);
          }
        });
      });
    }
  };

  function formatSubOptions(onceOrOptions: boolean | SubOptions | undefined): Required<SubOptions> {
    const options = typeof onceOrOptions !== 'object'
      ? { once: onceOrOptions }
      : onceOrOptions;
    return {
      once: options.once || false,
      signal: options.signal || false,
    };
  }

  const unsub: CurrentSignal['unsub'] = (fn, onceOrOptions) => {
    const options = formatSubOptions(onceOrOptions);
    const idx = listeners.findIndex(([listener, lOptions]) => {
      return listener === fn
        && lOptions.once === options.once
        && lOptions.signal === options.signal;
    });
    if (idx >= 0) {
      listeners.splice(idx, 1);
    }
  };

  const s = Object.assign(
    function get() {
      collectSignal(s);
      return value;
    },
    {
      destroy() {
        listeners = [];
      },
      set,
      reset() {
        set(initialValue);
      },
      sub(fn, onceOrOptions) {
        listeners.push([fn, formatSubOptions(onceOrOptions)]);
        return () => unsub(fn, onceOrOptions);
      },
      unsub,
      unsubAll() {
        listeners = listeners.filter(l => l[1].signal);
      },
    } satisfies Pick<CurrentSignal, 'destroy' | 'set' | 'reset' | 'sub' | 'unsub' | 'unsubAll'>,
  );

  return s;
}
