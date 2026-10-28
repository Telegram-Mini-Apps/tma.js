import { emitEvent, MethodUnsupportedError } from '@tma.js/bridge';
import { describe, expect, it } from 'vitest';

import { createBiometry } from './biometry.js';
import { respond, setup } from '../../../test/utils.js';
import { BiometryUnavailableError, ConcurrentCallError, NotMountedError } from '../../errors.js';

const info = {
  access_granted: true,
  access_requested: true,
  available: true,
  device_id: 'device',
  token_saved: false,
  type: 'face',
} as const;

describe('biometry', () => {
  it('should request the state on mount and follow its changes', async () => {
    setup({ onMethod: respond('web_app_biometry_get_info', 'biometry_info_received', info) });
    const biometry = createBiometry();
    await biometry.mount();
    expect(biometry.state()).toEqual({
      accessGranted: true,
      accessRequested: true,
      available: true,
      deviceId: 'device',
      tokenSaved: false,
      type: 'face',
    });
    emitEvent('biometry_info_received', { available: false });
    expect(biometry.isAvailable()).toBe(false);
  });

  it('should require the component to be mounted', async () => {
    setup();
    await expect(createBiometry().authenticate()).rejects.toThrow(NotMountedError);
  });

  it('should reject with MethodUnsupportedError before v7.2', async () => {
    setup({ version: '7.1' });
    await expect(createBiometry().mount()).rejects.toThrow(MethodUnsupportedError);
  });

  it('should authenticate the user', async () => {
    const calls = setup({
      onMethod(call) {
        respond('web_app_biometry_get_info', 'biometry_info_received', info)(call);
        respond('web_app_biometry_request_auth', 'biometry_auth_requested', {
          status: 'authorized',
          token: 'token',
        })(call);
      },
    });
    const biometry = createBiometry();
    await biometry.mount();
    await expect(biometry.authenticate({ reason: ' Log in ' })).resolves.toEqual({
      status: 'authorized',
      token: 'token',
    });
    expect(calls).toHaveBeenLastCalledWith({
      name: 'web_app_biometry_request_auth',
      params: { reason: 'Log in' },
    });
  });

  it('should return BiometryUnavailableError if biometry is unavailable', async () => {
    setup({
      onMethod: respond('web_app_biometry_get_info', 'biometry_info_received', { available: false }),
    });
    const biometry = createBiometry();
    await biometry.mount();
    const result = await biometry.safeAuthenticate();
    expect(!result.ok && BiometryUnavailableError.is(result.error)).toBe(true);
  });

  it('should reject concurrent requests with ConcurrentCallError', async () => {
    setup({ onMethod: respond('web_app_biometry_get_info', 'biometry_info_received', info) });
    const biometry = createBiometry();
    await biometry.mount();
    void biometry.authenticate();
    await expect(biometry.requestAccess()).rejects.toThrow(ConcurrentCallError);
  });

  it('should request access and return if it was granted', async () => {
    setup({
      onMethod(call) {
        respond('web_app_biometry_get_info', 'biometry_info_received', {
          ...info,
          access_granted: false,
          access_requested: false,
        })(call);
        respond('web_app_biometry_request_access', 'biometry_info_received', info)(call);
      },
    });
    const biometry = createBiometry();
    await biometry.mount();
    await expect(biometry.requestAccess()).resolves.toBe(true);
    expect(biometry.state().accessGranted).toBe(true);
  });

  it('should update the token', async () => {
    setup({
      onMethod(call) {
        respond('web_app_biometry_get_info', 'biometry_info_received', info)(call);
        respond('web_app_biometry_update_token', 'biometry_token_updated', { status: 'updated' })(call);
      },
    });
    const biometry = createBiometry();
    await biometry.mount();
    await expect(biometry.updateToken({ token: 'a' })).resolves.toBe('updated');
    expect(biometry.state().tokenSaved).toBe(true);
  });
});
