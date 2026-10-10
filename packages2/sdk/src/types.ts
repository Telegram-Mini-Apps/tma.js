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
   * @returns The current component state. The same object is returned until the state changes.
   */
  state: () => S;
  /**
   * Subscribes to the component changes. It is compatible with React's `useSyncExternalStore`
   * and similar APIs of other frameworks.
   * @param listener - function to call whenever the component changes.
   * @returns Function removing the listener.
   */
  subscribe: (listener: VoidFunction) => VoidFunction;
}

/**
 * Base API of components which should be mounted before use.
 */
export interface MountableComponent {
  /**
   * @returns True if the component is mounted.
   */
  isMounted: () => boolean;
  /**
   * Unmounts the component. The component stops listening to Telegram events.
   */
  unmount: () => void;
}
