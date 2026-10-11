import { describe, expect, it } from 'vitest';

import { createLocationManager } from './locationManager.js';
import { respond, setup } from '../../../test/utils.js';

describe('locationManager', () => {
  it('should check the location on mount and request it', async () => {
    setup({
      onMethod(call) {
        respond('web_app_check_location', 'location_checked', {
          available: true,
          access_requested: true,
          access_granted: null,
        })(call);
        respond('web_app_request_location', 'location_requested', {
          available: true,
          latitude: 1,
          longitude: 2,
        })(call);
      },
    });
    const manager = createLocationManager();
    await manager.mount();
    expect(manager.state()).toEqual({
      available: true,
      accessRequested: true,
      accessGranted: false,
    });
    await expect(manager.requestLocation()).resolves.toEqual({ latitude: 1, longitude: 2 });
  });

  it('should return null if location is unavailable', async () => {
    setup({
      onMethod(call) {
        respond('web_app_check_location', 'location_checked', { available: true })(call);
        respond('web_app_request_location', 'location_requested', { available: false })(call);
      },
    });
    const manager = createLocationManager();
    await manager.mount();
    await expect(manager.requestLocation()).resolves.toBeNull();
    expect(manager.isAvailable()).toBe(false);
  });
});
