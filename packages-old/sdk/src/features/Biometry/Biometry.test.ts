import { type EventListener, off, on, type RequestFpFn, type EventName, emitEvent } from '@tma.js/bridge';
import { either as E, taskEither as TE } from 'fp-ts';
import { describe, expect, it, vi } from 'vitest';

import { testIsSupportedPure } from '~/test-utils/predefined/testIsSupportedPure.js';
import { testSafetyPure } from '~/test-utils/predefined/testSafetyPure.js';
import { InstantiateOptions } from '~/test-utils/types.js';
import { createNoopComponentStorage } from '~/test-utils/utils.js';

import { Biometry } from '@/features/Biometry/Biometry.js';

import { BiometryOptions } from '@/features/Biometry/types.js';
import { createComponentSessionStorage } from '@/helpers/component-storage.js';

const MIN_VERSION = '7.2';

function instantiate({
  storage = false,
  version = MIN_VERSION,
  postEvent = () => E.right(undefined),
  request = ((_method: any, event: EventName) => {
    switch (event) {
      case 'biometry_auth_requested':
        return TE.right({ status: 'failed' });
      case 'biometry_info_received':
        return TE.right({
          available: true,
          access_requested: true,
          access_granted: true,
          device_id: 'A',
          token_saved: true,
          type: 'face',
        });
      case 'biometry_token_updated':
        return TE.right({ status: 'updated' });
      default:
        return TE.right(undefined);
    }
  }) as RequestFpFn,
  isTma = true,
  onInfoReceived = () => undefined,
  offInfoReceived = () => undefined,
  isPageReload = false,
}: InstantiateOptions<BiometryOptions> = {}) {
  return new Biometry({
    version,
    storage: typeof storage === 'boolean'
      ? storage
        ? createComponentSessionStorage('backButton')
        : createNoopComponentStorage()
      : storage,
    postEvent,
    request,
    isTma,
    onInfoReceived,
    offInfoReceived,
    isPageReload,
  });
}

describe.each([
  ['authenticate', (component: Biometry) => component.authenticate(), true],
  ['openSettings', (component: Biometry) => component.openSettings(), false],
  ['requestAccess', (component: Biometry) => component.requestAccess(), true],
  ['updateToken', (component: Biometry) => component.updateToken(), true],
  ['mount', (component: Biometry) => component.mount(), false],
] as const)('%s', (method, tryCall, requireMount) => {
  describe('safety', () => {
    testSafetyPure({
      instantiate,
      get: instance => instance[method],
      try: tryCall,
      minVersion: MIN_VERSION,
      mount: requireMount
        ? component => component.mount()
        : undefined,
    });
  });
});

describe('mount', () => {
  it('should set isMounted = true', async () => {
    const component = instantiate();
    expect(component.isMounted()).toBe(false);
    await component.mount();
    expect(component.isMounted()).toBe(true);
  });

  describe('no page reload', () => {
    it('should not use value from the storage', async () => {
      const storageState = {
        available: true,
        type: 'face',
        accessGranted: true,
        accessRequested: true,
        deviceId: 'A',
        tokenSaved: true,
      };
      const get = vi.fn(() => storageState);
      const component = instantiate({ storage: { get, set: vi.fn() } });
      await component.mount();
      expect(get).not.toHaveBeenCalled();
    });
  });

  describe('page reload', () => {
    it('should extract state from storage', async () => {
      const get = vi.fn();
      const component = instantiate({
        request: () => TE.right({
          available: true,
          access_requested: true,
          access_granted: true,
          device_id: 'A',
          token_saved: true,
          type: 'face',
        }),
        storage: { get, set: vi.fn() },
        isPageReload: true,
      });
      await component.mount();
      expect(get).toHaveBeenCalledOnce();

      const storageState = {
        available: true,
        type: 'face',
        accessGranted: true,
        accessRequested: true,
        deviceId: 'A',
        tokenSaved: true,
      };
      const get2 = vi.fn(() => storageState);
      const component2 = instantiate({
        storage: { get: get2, set: vi.fn() },
        isPageReload: true,
      });
      await component2.mount();
      expect(get2).toHaveBeenCalledOnce();
    });
  });

  it('should use onBiometryInfoReceived to start tracking state changes', async () => {
    const onInfoReceived = vi.fn(
      (listener: EventListener<'biometry_info_received'>) => {
        on('biometry_info_received', listener);
      },
    );
    const component = instantiate({
      storage: {
        get: () => ({
          available: true,
          type: 'face',
          accessGranted: true,
          accessRequested: true,
          deviceId: 'A',
          tokenSaved: true,
        }),
        set: vi.fn(),
      },
      onInfoReceived,
      offInfoReceived(listener) {
        off('biometry_info_received', listener);
      },
    });
    await component.mount();
    expect(onInfoReceived).toHaveBeenCalledOnce();
    expect(component.state()).toStrictEqual({
      available: true,
      type: 'face',
      accessGranted: true,
      accessRequested: true,
      deviceId: 'A',
      tokenSaved: true,
    });
    emitEvent('biometry_info_received', {
      available: true,
      access_requested: false,
      access_granted: false,
      device_id: 'B',
      token_saved: false,
      type: 'finger',
    });
    expect(component.state()).toStrictEqual({
      available: true,
      type: 'finger',
      accessGranted: false,
      accessRequested: false,
      deviceId: 'B',
      tokenSaved: false,
    });
  });
});

describe('unmount', () => {
  it('should set isMounted = false', async () => {
    const component = instantiate();
    await component.mount();
    expect(component.isMounted()).toBe(true);
    component.unmount();
    expect(component.isMounted()).toBe(false);
  });

  it(
    'should remove biometry state change listener using offBiometryInfoReceived',
    async () => {
      const offBiometryInfoReceived = vi.fn(
        (listener: EventListener<'biometry_info_received'>) => {
          off('biometry_info_received', listener);
        },
      );
      const component = instantiate({
        storage: {
          get: () => ({
            available: true,
            type: 'face',
            accessGranted: true,
            accessRequested: true,
            deviceId: 'A',
            tokenSaved: true,
          }),
          set: vi.fn(),
        },
        onInfoReceived(listener) {
          on('biometry_info_received', listener);
        },
        offInfoReceived: offBiometryInfoReceived,
      });
      await component.mount();
      const mountedState = {
        available: true,
        type: 'face',
        accessGranted: true,
        accessRequested: true,
        deviceId: 'A',
        tokenSaved: true,
      };
      expect(component.state()).toStrictEqual(mountedState);
      expect(offBiometryInfoReceived).not.toHaveBeenCalled();
      component.unmount();
      expect(offBiometryInfoReceived).toHaveBeenCalledOnce();
      emitEvent('biometry_info_received', {
        available: true,
        access_requested: false,
        access_granted: false,
        device_id: 'B',
        token_saved: false,
        type: 'finger',
      });
      expect(component.state()).toStrictEqual(mountedState);
    },
  );
});

describe('isSupported', () => {
  testIsSupportedPure(version => instantiate({ isTma: true, version }), MIN_VERSION);
});
