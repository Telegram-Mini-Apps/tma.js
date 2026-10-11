import {
  type MethodName,
  type MethodParams,
  offEvent,
  onEvent,
  type OnOptions,
} from '@tma.js/bridge';

import { type ComponentCore, createComponentCore } from './component.js';
import { isMethodSupported, requireMethod } from './globals.js';
import { computedFromStore, shallowEqual, type SubscribeFn } from './store.js';
import type { MountableComponent, StatefulComponent } from './types.js';

export type ButtonClickEvent =
  | 'back_button_pressed'
  | 'main_button_pressed'
  | 'secondary_button_pressed'
  | 'settings_button_pressed';

/**
 * Base API of all buttons.
 */
export interface ButtonComponent<S> extends StatefulComponent<S>, MountableComponent {
  /**
   * @returns True if the SDK is initialized and the button is supported by the Telegram client.
   */
  isSupported: () => boolean;
  /**
   * Mounts the component. If the page was reloaded, the state saved before the reload is
   * restored.
   * @throws {NotInitializedError} The SDK is not initialized.
   * @throws {MethodUnsupportedError} The button is unsupported.
   */
  mount: () => void;
  /**
   * Adds a button click listener.
   * @param listener - listener to add.
   * @param options - additional options.
   * @returns Function removing the listener.
   * @example
   * const off = button.onClick(() => {
   *   console.log('Clicked');
   *   off();
   * });
   */
  onClick: (listener: VoidFunction, options?: OnOptions) => VoidFunction;
  /**
   * Removes a button click listener.
   * @param listener - listener to remove.
   */
  offClick: (listener: VoidFunction) => void;
}

export interface CreateButtonOptions<S extends object, M extends MethodName> {
  name: string;
  method: M;
  clickEvent: ButtonClickEvent;
  initialState: S;
  /**
   * @returns Method parameters reflecting the state.
   */
  toParams: (state: S) => MethodParams<M>;
  /**
   * Additional changes sources the button depends on.
   */
  sources?: SubscribeFn[];
}

export interface Button<S extends object> {
  core: ComponentCore<S>;
  /**
   * Public API shared by all buttons.
   */
  component: ButtonComponent<S>;
  /**
   * Updates the button state. Undefined values are ignored.
   * @throws {NotInitializedError} The SDK is not initialized.
   * @throws {MethodUnsupportedError} The button is unsupported.
   * @throws {NotMountedError} The button is not mounted.
   */
  setState: (state: Partial<S>) => void;
  /**
   * @returns A function setting the state key to the value.
   */
  setter: <K extends keyof S>(key: K, value: S[K]) => VoidFunction;
}

/**
 * @returns Object without keys having undefined values.
 * @internal
 */
export function removeUndefined<T extends object>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(entry => entry[1] !== undefined),
  ) as T;
}

/**
 * Creates the base of a button component.
 * @internal
 */
export function createButton<S extends object, M extends MethodName>({
  name,
  method,
  clickEvent,
  initialState,
  toParams,
  sources = [],
}: CreateButtonOptions<S, M>): Button<S> {
  const core = createComponentCore(name, initialState, ...sources);
  const setState = (update: Partial<S>) => {
    const { postEvent } = requireMethod(method);
    core.assertMounted();
    const current = core.state.get();
    const next = { ...current, ...removeUndefined(update) };
    if (shallowEqual(next, current)) {
      return;
    }
    (postEvent as (method: M, params: MethodParams<M>) => void)(method, toParams(next));
    core.state.set(next);
  };

  return {
    core,
    setState,
    setter: (key, value) => () => setState({ [key]: value } as unknown as Partial<S>),
    component: {
      isSupported: () => isMethodSupported(method),
      isMounted: computedFromStore(core.mounted),
      state: computedFromStore(core.state),
      mount() {
        requireMethod(method);
        core.mount();
      },
      unmount() {
        core.unmount();
      },
      onClick: (listener, options) => onEvent(clickEvent, listener, options),
      offClick(listener) {
        offEvent(clickEvent, listener);
      },
    },
  };
}
