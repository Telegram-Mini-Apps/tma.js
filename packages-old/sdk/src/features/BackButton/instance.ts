import { BackButton } from '@/features/BackButton/BackButton.js';
import { buttonOptions } from '@/fn-options/buttonOptions.js';

export const backButton = /* @__PURE__*/ new BackButton(
  buttonOptions('backButton', 'back_button_pressed'),
);
