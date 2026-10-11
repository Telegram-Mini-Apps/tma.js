import type { Computed } from './store.js';

/**
 * Options of asynchronous functions.
 */
export interface AsyncOptions {
  /**
   * Time in milliseconds to wait for the operation to complete. When reached, the function
   * returns `TimeoutError`.
   */
  timeout?: number;
  /**
   * Signal to abort the operation. When aborted, the function is rejected with `signal.reason`.
   */
  signal?: AbortSignal;
}

/**
 * Base API of components having a state.
 */
export interface StatefulComponent<S> {
  /**
   * The component state. The same object is returned until the state changes.
   */
  state: Computed<S>;
}

/**
 * Base API of components which should be mounted before use.
 */
export interface MountableComponent {
  /**
   * True if the component is mounted.
   */
  isMounted: Computed<boolean>;
  /**
   * Unmounts the component. The component stops listening to Telegram events.
   */
  unmount: () => void;
}
