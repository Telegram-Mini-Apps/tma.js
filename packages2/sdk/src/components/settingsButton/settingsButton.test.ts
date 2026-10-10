import { describe, expect, it } from 'vitest';

import { createSettingsButton } from './settingsButton.js';
import { setup } from '../../../test/utils.js';

describe('settingsButton', () => {
  it('should call the settings button method', () => {
    const calls = setup();
    const button = createSettingsButton();
    button.mount();
    button.show();
    expect(calls).toHaveBeenCalledWith({
      name: 'web_app_setup_settings_button',
      params: { is_visible: true },
    });
  });

  it('should be supported since Mini Apps v6.10', () => {
    setup({ version: '6.9' });
    expect(createSettingsButton().isSupported()).toBe(false);
  });
});
