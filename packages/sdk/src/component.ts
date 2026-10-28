import { ok, type Result } from '@tma.js/bridge';

import { NotMountedError } from './errors.js';
import {
  combineSubscribe,
  createObjectStore,
  createStore,
  type Store,
  type SubscribeFn,
} from './store.js';
import type { AsyncOptions } from './types.js';

const STORAGE_PREFIX = 'tma.js/sdk/';

/**
 * @returns True if the current page was reloaded.
 * @see https://stackoverflow.com/a/36444134/11894710
 */
function isPageReload(): boolean {
  const [entry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
  return !!entry && entry.type === 'reload';
}

function readSessionStorage(key: string): unknown {
  try {
    const value = sessionStorage.getItem(STORAGE_PREFIX + key);
    return value ? JSON.parse(value) : undefined;
  } catch {
    return undefined;
  }
}

function writeSessionStorage(key: string, value: unknown): void {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    // Session storage may be unavailable.
  }
}

export interface ComponentCore<S extends object> {
  /**
   * @throws {NotMountedError} The component is not mounted.
   */
  assertMounted: () => void;
  /**
   * Marks the component as mounted. If the page was reloaded, the state saved before the reload
   * is restored. Otherwise, the passed state is applied.
   * @param state - state to apply if nothing was restored.
   * @returns False if the component was already mounted.
   */
  mount: (state?: S) => boolean;
  /**
   * True if the component is mounted.
   */
  mounted: Store<boolean>;
  /**
   * @returns The state saved before the page reload, if the page was reloaded and the component
   * was not mounted since then.
   */
  restoreState: () => S | undefined;
  /**
   * Component state. It is saved in the session storage on each change.
   */
  state: Store<S> & { update: (value: Partial<S>) => void };
  /**
   * Subscribes to changes of the component state, its mount status, and the additional sources
   * passed to `createComponentCore`.
   */
  subscribe: SubscribeFn;
  /**
   * Marks the component as unmounted.
   * @returns False if the component was not mounted.
   */
  unmount: () => boolean;
}

/**
 * Creates the base of a stateful component.
 * @param name - component name. It is used as a session storage key and in error messages.
 * @param initialState - component initial state.
 * @param sources - additional changes sources the component depends on.
 * @internal
 */
export function createComponentCore<S extends object>(
  name: string,
  initialState: S,
  ...sources: SubscribeFn[]
): ComponentCore<S> {
  const state = createObjectStore(initialState);
  const mounted = createStore(false);
  state.subscribe(() => writeSessionStorage(name, state.get()));

  // The saved state is restored only on the first mount after the page reload. Later mounts
  // happen in the same page lifetime, so the saved state may be outdated.
  let canRestore = true;
  const restoreState = () => {
    return canRestore && isPageReload() ? readSessionStorage(name) as S | undefined : undefined;
  };

  return {
    assertMounted() {
      if (!mounted.get()) {
        throw new NotMountedError(name);
      }
    },
    mount(value) {
      if (mounted.get()) {
        return false;
      }
      const next = restoreState() || value;
      canRestore = false;
      next && state.set(next);
      mounted.set(true);
      return true;
    },
    mounted,
    restoreState,
    state,
    subscribe: combineSubscribe(state.subscribe, mounted.subscribe, ...sources),
    unmount() {
      if (!mounted.get()) {
        return false;
      }
      mounted.set(false);
      return true;
    },
  };
}

export interface AsyncMount<E> {
  /**
   * Cancels pending mounts, so they don't mount the component when they complete.
   */
  cancel: VoidFunction;
  /**
   * True if the component is mounting.
   */
  mounting: Store<boolean>;
  /**
   * Mounts the component. Each call retrieves the state independently, the first one to succeed
   * mounts the component.
   */
  safeMount: (options?: AsyncOptions) => Promise<Result<E, void>>;
}

/**
 * Creates a function mounting a component, which state must be retrieved asynchronously.
 * @param core - component core.
 * @param retrieveState - function retrieving the state. It is called only if there is no state
 * to restore after the page reload.
 * @param onMounted - function to call when the component was mounted.
 * @internal
 */
export function createAsyncMount<S extends object, E>(
  core: ComponentCore<S>,
  retrieveState: (options?: AsyncOptions) => Promise<Result<E, S>>,
  onMounted: VoidFunction,
): AsyncMount<E> {
  const mounting = createStore(false);
  let pending = 0;
  // Incremented on cancel, so mounts started before it are ignored.
  let generation = 0;

  return {
    cancel() {
      generation++;
    },
    mounting,
    async safeMount(options) {
      if (core.mounted.get()) {
        return ok(undefined);
      }
      const startedAt = generation;
      pending++;
      mounting.set(true);
      try {
        let state = core.restoreState();
        if (!state) {
          const retrieved = await retrieveState(options);
          if (!retrieved.ok) {
            return retrieved;
          }
          state = retrieved.data;
        }
        startedAt === generation && core.mount(state) && onMounted();
        return ok(undefined);
      } finally {
        mounting.set(!!--pending);
      }
    },
  };
}
