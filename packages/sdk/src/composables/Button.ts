import type { PostEventError, MethodName, MethodParams } from '@tma.js/bridge';
import { computed, type Computed } from '@tma.js/signals';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

import { Mountable } from '@/composables/Mountable.js';
import { Stateful } from '@/composables/Stateful.js';
import type { SharedFeatureOptions } from '@/fn-options/sharedFeatureOptions.js';
import type { WithPostEvent } from '@/fn-options/withPostEvent.js';
import type { WithStateRestore } from '@/fn-options/withStateRestore.js';
import type { WithVersion } from '@/fn-options/withVersion.js';
import { createIsSupportedSignal } from '@/helpers/createIsSupportedSignal.js';
import { removeUndefined } from '@/helpers/removeUndefined.js';
import { throwifyWithChecksFp } from '@/with-checks/throwifyWithChecksFp.js';
import {
  type WithChecksFp,
  type WithChecks,
  createWithChecksFp,
} from '@/with-checks/withChecksFp.js';

type ButtonEither = E.Either<PostEventError, void>;

type BoolFields<S> = {
  [K in keyof S]-?: S[K] extends boolean ? K : never;
}[keyof S];

export interface ButtonOptions<S, M extends MethodName>
  extends SharedFeatureOptions,
  WithStateRestore<S>,
  WithPostEvent,
  WithVersion {
  /**
   * The initial button state.
   */
  initialState: S;
  /**
   * Removes a component click listener.
   * @param listener - a listener to remove.
   * @param once - should the listener be called only once.
   */
  offClick: (listener: VoidFunction, once?: boolean) => void;
  /**
   * Adds a component click listener.
   * @returns A function to remove listener.
   * @param listener - a listener to add.
   * @param once - should the listener be called only once.
   */
  onClick: (listener: VoidFunction, once?: boolean) => VoidFunction;
  /**
   * A Mini Apps method to commit changes.
   */
  method: M;
  /**
   * A function to create method payload.
   * @param state
   */
  payload: (state: S) => MethodParams<M>;
}

export class Button<S extends object, M extends MethodName> {
  constructor({
    isTma,
    storage,
    onClick,
    offClick,
    initialState,
    isPageReload,
    postEvent,
    payload,
    method,
    version,
  }: ButtonOptions<S, M>) {
    const stateful = new Stateful({
      initialState,
      onChange(state) {
        storage.set(state);
      },
    });
    const mountable = new Mountable<S>({
      initialState,
      isPageReload,
      onMounted: stateful.setState,
      restoreState: storage.get,
    });

    const wrapOptions = { version, requires: method, isTma };
    const wrapSupportedPlain = createWithChecksFp({
      ...wrapOptions,
      returns: 'plain',
    });
    const wrapMountedEither = createWithChecksFp({
      ...wrapOptions,
      returns: 'either',
      isMounted: mountable.isMounted,
    });

    this.isMounted = mountable.isMounted;
    this.isSupported = createIsSupportedSignal(method, version);
    this.state = stateful.state;

    this.setStateFp = wrapMountedEither(state => {
      const nextState = { ...this.state(), ...removeUndefined(state) };
      if (!stateful.hasDiff(nextState)) {
        return E.right(undefined);
      }
      return pipe(
        postEvent(method as any, payload(nextState)),
        E.map(() => {
          stateful.setState(nextState);
        }),
      );
    });
    this.setState = throwifyWithChecksFp(this.setStateFp);
    this.onClickFp = wrapSupportedPlain(onClick);
    this.onClick = throwifyWithChecksFp(this.onClickFp);
    this.offClickFp = wrapSupportedPlain(offClick);
    this.offClick = throwifyWithChecksFp(this.offClickFp);
    this.mountFp = wrapSupportedPlain(() => {
      const nothing = () => undefined;
      return pipe(mountable.mount(), E.match(nothing, nothing));
    });
    this.mount = throwifyWithChecksFp(this.mountFp);
    this.unmount = mountable.unmount;
    this.stateSetters = key => {
      const wrapped = wrapMountedEither(value => {
        return this.setStateFp({ [key]: value } as unknown as Partial<S>);
      });
      return [throwifyWithChecksFp(wrapped), wrapped];
    };
    this.stateBoolSetters = <K extends keyof S>(key: K) => {
      const [, setFp] = this.stateSetters(key);
      const setFalse = wrapMountedEither(() => setFp(false as S[K]));
      const setTrue = wrapMountedEither(() => setFp(true as S[K]));
      return [
        [throwifyWithChecksFp(setFalse), setFalse],
        [throwifyWithChecksFp(setTrue), setTrue],
      ];
    };
  }

  /**
   * Signal indicating if the component is currently mounted.
   */
  readonly isMounted: Computed<boolean>;

  /**
   * Signal indicating if the component is supported.
   */
  readonly isSupported: Computed<boolean>;

  /**
   * Complete button state.
   */
  readonly state: Computed<S>;

  /**
   * @returns A computed based on the specified state and its related key.
   * @param key - a key to use.
   */
  stateGetter<K extends keyof S>(key: K): Computed<S[K]> {
    return computed(() => this.state()[key]);
  }

  /**
   * @returns A setter with checks for the specified key.
   * @param key
   */
  readonly stateSetters: <K extends keyof S>(key: K) => [
    throwing: WithChecks<(value: S[K]) => void, true>,
    fp: WithChecksFp<(value: S[K]) => ButtonEither, true>,
  ];

  /**
   * @returns Setters with checks to set a specified boolean key.
   * @param key
   */
  readonly stateBoolSetters: <K extends BoolFields<S>>(key: K) => [
    setFalse: [
      throwing: WithChecks<() => void, true>,
      fp: WithChecksFp<() => ButtonEither, true>,
    ],
    setTrue: [
      throwing: WithChecks<() => void, true>,
      fp: WithChecksFp<() => ButtonEither, true>,
    ],
  ];

  /**
   * Updates the button state.
   */
  readonly setStateFp: WithChecksFp<(state: Partial<S>) => ButtonEither, true>;

  /**
   * @see setStateFp
   */
  readonly setState: WithChecks<(state: Partial<S>) => void, true>;

  /**
   * Adds a new button listener.
   * @param listener - event listener.
   * @param once - should the listener be called only once.
   * @returns A function to remove bound listener.
   * @example
   * const off = button.onClick(() => {
   *   console.log('User clicked the button');
   *   off();
   * });
   */
  readonly onClickFp: WithChecksFp<(listener: VoidFunction, once?: boolean) => VoidFunction, true>;

  /**
   * @see onClickFp
   */
  readonly onClick: WithChecks<(listener: VoidFunction, once?: boolean) => VoidFunction, true>;

  /**
   * Removes the button click listener.
   * @param listener - event listener.
   * @param once - should the listener be called only once.
   * @example
   * function listener() {
   *   console.log('User clicked the button');
   *   button.offClick(listener);
   * }
   * button.onClick(listener);
   */
  readonly offClickFp: WithChecksFp<
    (listener: VoidFunction, once?: boolean) => void,
    true
  >;

  /**
   * @see offClickFp
   */
  readonly offClick: WithChecks<(listener: VoidFunction, once?: boolean) => void, true>;

  /**
   * Mounts the component restoring its state.
   * @since Mini Apps v6.1
   */
  readonly mountFp: WithChecksFp<() => void, true>;

  /**
   * @see mountFp
   */
  readonly mount: WithChecks<() => void, true>;

  /**
   * Unmounts the component.
   *
   * Note that this function does not remove listeners added via the `onClick`
   * function, so you have to remove them on your own.
   * @see onClick
   */
  readonly unmount: () => void;
}
