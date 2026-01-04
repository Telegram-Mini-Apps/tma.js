import type { PostEventError, SecondaryButtonPosition } from '@tma.js/bridge';
import { computed, type Computed } from '@tma.js/signals';
import type { RGB } from '@tma.js/types';
import { either as E } from 'fp-ts';

import { Button, type ButtonOptions } from '@/composables/Button.js';
import { access } from '@/helpers/access.js';
import { createIsSupportedSignal } from '@/helpers/createIsSupportedSignal.js';
import type { MaybeAccessor } from '@/types.js';
import type { WithChecks, WithChecksFp } from '@/with-checks/withChecksFp.js';

type SecondaryButtonEither = E.Either<PostEventError, void>;

export interface SecondaryButtonState {
  isVisible: boolean;
  bgColor?: RGB;
  hasShineEffect: boolean;
  isEnabled: boolean;
  isLoaderVisible: boolean;
  text: string;
  textColor?: RGB;
  position: SecondaryButtonPosition;
}

export interface SecondaryButtonOptions extends Omit<
  ButtonOptions<SecondaryButtonState, 'web_app_setup_secondary_button'>,
  'initialState' | 'method' | 'payload'
> {
  /**
   * Default values for different kinds of the button properties.
   */
  defaults: {
    bgColor: MaybeAccessor<RGB>;
    textColor: MaybeAccessor<RGB>;
  };
}

/**
 * @since Mini Apps v7.10
 */
export class SecondaryButton {
  constructor({ defaults, ...options }: SecondaryButtonOptions) {
    const button = new Button({
      ...options,
      initialState: {
        hasShineEffect: false,
        isEnabled: true,
        isLoaderVisible: false,
        isVisible: false,
        text: 'Cancel',
        position: 'left',
      },
      method: 'web_app_setup_secondary_button',
      payload: state => ({
        has_shine_effect: state.hasShineEffect,
        is_visible: state.isVisible,
        is_active: state.isEnabled,
        is_progress_visible: state.isLoaderVisible,
        text: state.text,
        color: state.bgColor,
        text_color: state.textColor,
        position: state.position,
      }),
    });

    const withDefault = (
      field: 'bgColor' | 'textColor',
      getDefault: MaybeAccessor<RGB>,
    ) => {
      const fromState = button.stateGetter(field);
      return computed(() => fromState() || access(getDefault));
    };

    this.isSupported = createIsSupportedSignal('web_app_setup_secondary_button', options.version);
    this.bgColor = withDefault('bgColor', defaults.bgColor);
    this.textColor = withDefault('textColor', defaults.textColor);
    this.position = button.stateGetter('position');
    this.hasShineEffect = button.stateGetter('hasShineEffect');
    this.isEnabled = button.stateGetter('isEnabled');
    this.isLoaderVisible = button.stateGetter('isLoaderVisible');
    this.text = button.stateGetter('text');
    this.isVisible = button.stateGetter('isVisible');
    this.isMounted = button.isMounted;
    this.state = button.state;

    [this.setPosition, this.setPositionFp] = button.stateSetters('position');
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
   * Signal indicating if the component is supported.
   */
  readonly isSupported: Computed<boolean>;

  /**
   * The button position relative to the main one.
   */
  readonly position: Computed<SecondaryButtonPosition>;

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
  readonly state: Computed<SecondaryButtonState>;

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
   * @since Mini Apps v7.10
   */
  readonly showFp: WithChecksFp<() => SecondaryButtonEither, true>;

  /**
   * @see showFp
   */
  readonly show: WithChecks<() => void, true>;

  /**
   * Hides the button.
   * @since Mini Apps v7.10
   */
  readonly hideFp: WithChecksFp<() => SecondaryButtonEither, true>;

  /**
   * @see hideFp
   */
  readonly hide: WithChecks<() => void, true>;

  /**
   * Enables the button.
   * @since Mini Apps v7.10
   */
  readonly enableFp: WithChecksFp<() => SecondaryButtonEither, true>;

  /**
   * @see enableFp
   */
  readonly enable: WithChecks<() => void, true>;

  /**
   * Enables the button.
   * @since Mini Apps v7.10
   */
  readonly enableShineEffectFp: WithChecksFp<() => SecondaryButtonEither, true>;

  /**
   * @see enableShineEffectFp
   */
  readonly enableShineEffect: WithChecks<() => void, true>;

  /**
   * Disables the button.
   * @since Mini Apps v7.10
   */
  readonly disableFp: WithChecksFp<() => SecondaryButtonEither, true>;

  /**
   * @see disableFp
   */
  readonly disable: WithChecks<() => void, true>;

  /**
   * Enables the button.
   * @since Mini Apps v7.10
   */
  readonly disableShineEffectFp: WithChecksFp<() => SecondaryButtonEither, true>;

  /**
   * @see disableShineEffectFp
   */
  readonly disableShineEffect: WithChecks<() => void, true>;

  /**
   * Updates the button background color.
   * @since Mini Apps v7.10
   */
  readonly setBgColorFp: WithChecksFp<(value: RGB) => SecondaryButtonEither, true>;

  /**
   * @see setBgColorFp
   */
  readonly setBgColor: WithChecks<(value: RGB) => void, true>;

  /**
   * Updates the button text color.
   * @since Mini Apps v7.10
   */
  readonly setTextColorFp: WithChecksFp<(value: RGB) => SecondaryButtonEither, true>;

  /**
   * @see setTextColorFp
   */
  readonly setTextColor: WithChecks<(value: RGB) => void, true>;

  /**
   * Updates the button text.
   * @since Mini Apps v7.10
   */
  readonly setTextFp: WithChecksFp<(value: string) => SecondaryButtonEither, true>;

  /**
   * @see setTextFp
   */
  readonly setText: WithChecks<(value: string) => void, true>;

  /**
   * Updates the button position.
   * @since Mini Apps v7.10
   */
  readonly setPositionFp: WithChecksFp<
    (position: SecondaryButtonPosition) => SecondaryButtonEither,
    true
  >;

  /**
   * @see setPositionFp
   */
  readonly setPosition: WithChecks<(position: SecondaryButtonPosition) => void, true>;

  /**
   * Shows the button loader.
   * @since Mini Apps v7.10
   */
  readonly showLoaderFp: WithChecksFp<() => SecondaryButtonEither, true>;

  /**
   * @see showLoaderFp
   */
  readonly showLoader: WithChecks<() => void, true>;

  /**
   * Hides the button loader.
   * @since Mini Apps v7.10
   */
  readonly hideLoaderFp: WithChecksFp<() => SecondaryButtonEither, true>;

  /**
   * @see hideLoaderFp
   */
  readonly hideLoader: WithChecks<() => void, true>;

  /**
   * Updates the button state.
   * @param state - updates to apply.
   * @since Mini Apps v7.10
   * @example
   * button.setParams({
   *   text: 'Submit',
   *   isEnabled: true,
   *   hasShineEffect: true,
   * });
   */
  readonly setParamsFp: WithChecksFp<
    (state: Partial<SecondaryButtonState>) => SecondaryButtonEither,
    true
  >;

  /**
   * @see setParamsFp
   */
  readonly setParams: WithChecks<(state: Partial<SecondaryButtonState>) => void, true>;

  /**
   * Mounts the component restoring its state.
   * @since Mini Apps v7.10
   */
  readonly mountFp: WithChecksFp<() => void, true>;

  /**
   * @see mountFp
   */
  readonly mount: WithChecks<() => void, true>;

  /**
   * Unmounts the component.
   */
  readonly unmount: () => void;

  /**
   * Adds a new button listener.
   * @param listener - event listener.
   * @param once - should the listener be called only once.
   * @returns A function to remove bound listener.
   * @since Mini Apps v7.10
   * @example
   * const off = button.onClick(() => {
   *   console.log('User clicked the button');
   *   off();
   * });
   */
  readonly onClickFp: WithChecksFp<(listener: VoidFunction, once?: boolean) => VoidFunction, true>;

  /**
   * @see onClick
   */
  readonly onClick: WithChecks<(listener: VoidFunction, once?: boolean) => VoidFunction, true>;

  /**
   * Removes the button click listener.
   * @param listener - event listener.
   * @param once - should the listener be called only once.
   * @since Mini Apps v7.10
   * @example
   * function listener() {
   *   console.log('User clicked the button');
   *   button.offClick(listener);
   * }
   * button.onClick(listener);
   */
  readonly offClickFp: WithChecksFp<(listener: VoidFunction, once?: boolean) => void, true>;

  /**
   * @see offClick
   */
  readonly offClick: WithChecks<(listener: VoidFunction, once?: boolean) => void, true>;
  //#endregion
}
