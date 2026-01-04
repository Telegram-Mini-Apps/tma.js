import type { PostEventError } from '@tma.js/bridge';
import { computed, type Computed } from '@tma.js/signals';
import type { RGB } from '@tma.js/types';
import { either as E } from 'fp-ts';

import { Button, type ButtonOptions } from '@/composables/Button.js';
import { access } from '@/helpers/access.js';
import type { MaybeAccessor } from '@/types.js';
import type { WithChecks, WithChecksFp } from '@/with-checks/withChecksFp.js';

type MainButtonEither = E.Either<PostEventError, void>;

export interface MainButtonState {
  isVisible: boolean;
  bgColor?: RGB;
  hasShineEffect: boolean;
  isEnabled: boolean;
  isLoaderVisible: boolean;
  text: string;
  textColor?: RGB;
}

export interface MainButtonOptions extends Omit<
  ButtonOptions<MainButtonState, 'web_app_setup_main_button'>,
  'initialState' | 'method' | 'payload' | 'version'
> {
  /**
   * Default values for different kinds of the button properties.
   */
  defaults: {
    bgColor: MaybeAccessor<RGB>;
    textColor: MaybeAccessor<RGB>;
  };
}

export class MainButton {
  constructor({ defaults, ...options }: MainButtonOptions) {
    const button = new Button({
      ...options,
      version: '100',
      initialState: {
        hasShineEffect: false,
        isEnabled: true,
        isLoaderVisible: false,
        isVisible: false,
        text: 'Continue',
      },
      method: 'web_app_setup_main_button',
      payload: state => ({
        has_shine_effect: state.hasShineEffect,
        is_visible: state.isVisible,
        is_active: state.isEnabled,
        is_progress_visible: state.isLoaderVisible,
        text: state.text,
        color: state.bgColor,
        text_color: state.textColor,
      }),
    });

    const withDefault = (
      field: 'bgColor' | 'textColor',
      getDefault: MaybeAccessor<RGB>,
    ) => {
      const fromState = button.stateGetter(field);
      return computed(() => fromState() || access(getDefault));
    };

    this.bgColor = withDefault('bgColor', defaults.bgColor);
    this.textColor = withDefault('textColor', defaults.textColor);
    this.hasShineEffect = button.stateGetter('hasShineEffect');
    this.isEnabled = button.stateGetter('isEnabled');
    this.isLoaderVisible = button.stateGetter('isLoaderVisible');
    this.text = button.stateGetter('text');
    this.isVisible = button.stateGetter('isVisible');
    this.isMounted = button.isMounted;
    this.state = button.state;

    [this.setBgColor, this.setBgColorFp] = button.stateSetters('bgColor');
    [this.setTextColor, this.setTextColorFp] = button.stateSetters('textColor');
    [
      [this.disableShineEffect, this.disableShineEffectFp],
      [this.enableShineEffect, this.enableShineEffectFp],
    ] = button.stateBoolSetters('hasShineEffect');
    [
      [this.disable, this.disableFp],
      [this.enable, this.enableFp],
    ] = button.stateBoolSetters('isEnabled');
    [
      [this.hideLoader, this.hideLoaderFp],
      [this.showLoader, this.showLoaderFp],
    ] = button.stateBoolSetters('isLoaderVisible');

    [this.setText, this.setTextFp] = button.stateSetters('text');
    [[this.hide, this.hideFp], [this.show, this.showFp]] = button.stateBoolSetters('isVisible');
    this.setParams = button.setState;
    this.setParamsFp = button.setStateFp;
    this.onClick = button.onClick;
    this.onClickFp = button.onClickFp;
    this.offClick = button.offClick;
    this.offClickFp = button.offClickFp;
    this.mount = button.mount;
    this.mountFp = button.mountFp;
    this.unmount = button.unmount;
  }

  //#region Properties.
  /**
   * The button background color.
   */
  readonly bgColor: Computed<RGB>;

  /**
   * True if the button has a shining effect.
   */
  readonly hasShineEffect: Computed<boolean>;

  /**
   * True if the button is clickable.
   */
  readonly isEnabled: Computed<boolean>;

  /**
   * True if the button loader is visible.
   */
  readonly isLoaderVisible: Computed<boolean>;

  /**
   * True if the button is visible.
   */
  readonly isVisible: Computed<boolean>;

  /**
   * Signal indicating if the component is currently mounted.
   */
  readonly isMounted: Computed<boolean>;

  /**
   * The complete button state.
   */
  readonly state: Computed<MainButtonState>;

  /**
   * The button displayed text.
   */
  readonly text: Computed<string>;

  /**
   * The button text color.
   *
   * Note that this value is computed based on the external defaults. For
   * example, if not explicitly set, this value may be equal to one of theme
   * params colors.
   */
  readonly textColor: Computed<RGB>;
  //#endregion

  //#region Methods.
  /**
   * Shows the button.
   */
  readonly showFp: WithChecksFp<() => MainButtonEither, false>;

  /**
   * @see showFp
   */
  readonly show: WithChecks<() => void, false>;

  /**
   * Hides the button.
   */
  readonly hideFp: WithChecksFp<() => MainButtonEither, false>;

  /**
   * @see hideFp
   */
  readonly hide: WithChecks<() => void, false>;

  /**
   * Enables the button.
   */
  readonly enableFp: WithChecksFp<() => MainButtonEither, false>;

  /**
   * @see enableFp
   */
  readonly enable: WithChecks<() => void, false>;

  /**
   * Enables the button.
   */
  readonly enableShineEffectFp: WithChecksFp<() => MainButtonEither, false>;

  /**
   * @see enableShineEffectFp
   */
  readonly enableShineEffect: WithChecks<() => void, false>;

  /**
   * Disables the button.
   */
  readonly disableFp: WithChecksFp<() => MainButtonEither, false>;

  /**
   * @see disableFp
   */
  readonly disable: WithChecks<() => void, false>;

  /**
   * Enables the button.
   */
  readonly disableShineEffectFp: WithChecksFp<() => MainButtonEither, false>;

  /**
   * @see disableShineEffectFp
   */
  readonly disableShineEffect: WithChecks<() => void, false>;

  /**
   * Updates the button background color.
   */
  readonly setBgColorFp: WithChecksFp<(value: RGB) => MainButtonEither, false>;

  /**
   * @see setBgColorFp
   */
  readonly setBgColor: WithChecks<(value: RGB) => void, false>;

  /**
   * Updates the button text color.
   */
  readonly setTextColorFp: WithChecksFp<(value: RGB) => MainButtonEither, false>;

  /**
   * @see setTextColorFp
   */
  readonly setTextColor: WithChecks<(value: RGB) => void, false>;

  /**
   * Updates the button text.
   */
  readonly setTextFp: WithChecksFp<(value: string) => MainButtonEither, false>;

  /**
   * @see setTextFp
   */
  readonly setText: WithChecks<(value: string) => void, false>;

  /**
   * Shows the button loader.
   */
  readonly showLoaderFp: WithChecksFp<() => MainButtonEither, false>;

  /**
   * @see showLoaderFp
   */
  readonly showLoader: WithChecks<() => void, false>;

  /**
   * Hides the button loader.
   */
  readonly hideLoaderFp: WithChecksFp<() => MainButtonEither, false>;

  /**
   * @see hideLoaderFp
   */
  readonly hideLoader: WithChecks<() => void, false>;

  /**
   * Updates the button state.
   * @param state - updates to apply.
   * @example
   * button.setParams({
   *   text: 'Submit',
   *   isEnabled: true,
   *   hasShineEffect: true,
   * });
   */
  readonly setParamsFp: WithChecksFp<(state: Partial<MainButtonState>) => MainButtonEither, false>;

  readonly setParams: WithChecks<(state: Partial<MainButtonState>) => void, false>;

  /**
   * Mounts the component restoring its state.
   */
  readonly mountFp: WithChecksFp<() => void, false>;

  /**
   * @see mountFp
   */
  readonly mount: WithChecks<() => void, false>;

  /**
   * Unmounts the component.
   */
  readonly unmount: () => void;

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
  readonly onClickFp: WithChecksFp<(listener: VoidFunction, once?: boolean) => VoidFunction, false>;

  /**
   * @see onClickFp
   */
  readonly onClick: WithChecks<(listener: VoidFunction, once?: boolean) => VoidFunction, false>;

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
  readonly offClickFp: WithChecksFp<(listener: VoidFunction, once?: boolean) => void, false>;

  /**
   * @see offClickFp
   */
  readonly offClick: WithChecks<(listener: VoidFunction, once?: boolean) => void, false>;
  //#endregion
}
