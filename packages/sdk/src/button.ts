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
   * Removes a button click listener.
   * @param listener - listener to remove.
   */
  offClick: (listener: VoidFunction) => void;
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
}

export interface CreateButtonOptions<S extends object, M extends MethodName> {
  clickEvent: ButtonClickEvent;
  initialState: S;
  method: M;
  name: string;
  /**
   * Additional changes sources the button depends on.
   */
  sources?: SubscribeFn[];
  /**
   * @returns Method parameters reflecting the state.
   */
  toParams: (state: S) => MethodParams<M>;
}

export interface Button<S extends object> {
  /**
   * Public API shared by all buttons.
   */
  component: ButtonComponent<S>;
  core: ComponentCore<S>;
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
  clickEvent,
  initialState,
  method,
  name,
  sources = [],
  toParams,
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
    component: {
      isMounted: computedFromStore(core.mounted),
      isSupported: () => isMethodSupported(method),
      mount() {
        requireMethod(method);
        core.mount();
      },
      offClick(listener) {
        offEvent(clickEvent, listener);
      },
      onClick: (listener, options) => onEvent(clickEvent, listener, options),
      state: computedFromStore(core.state),
      unmount() {
        core.unmount();
      },
    },
    core,
    setState,
    setter: (key, value) => () => setState({ [key]: value } as unknown as Partial<S>),
  };
}
