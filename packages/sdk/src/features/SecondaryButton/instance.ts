import { computed } from '@tma.js/signals';

import { miniApp } from '@/features/MiniApp/instance.js';
import { SecondaryButton } from '@/features/SecondaryButton/SecondaryButton.js';
import { themeParams } from '@/features/ThemeParams/instance.js';
import { bottomButtonOptions } from '@/fn-options/bottomButtonOptions.js';

function instantiate() {
  return new SecondaryButton(
    bottomButtonOptions('secondaryButton', 'secondary_button_pressed', {
      bgColor: computed(() => miniApp.bottomBarColorRgb() || '#000000'),
      textColor: computed(() => themeParams.buttonColor() || '#2481cc'),
    }),
  );
}

export const secondaryButton = /* @__PURE__*/ instantiate();
