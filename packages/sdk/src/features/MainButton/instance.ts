import { computed } from '@tma.js/signals';

import { MainButton } from '@/features/MainButton/MainButton.js';
import { themeParams } from '@/features/ThemeParams/instance.js';
import { bottomButtonOptions } from '@/fn-options/bottomButtonOptions.js';

export const mainButton = /* @__PURE__*/ new MainButton(
  bottomButtonOptions('mainButton', 'main_button_pressed', {
    bgColor: computed(() => themeParams.buttonColor() || '#2481cc'),
    textColor: computed(() => themeParams.buttonTextColor() || '#ffffff'),
  }),
);
