import { either as E } from 'fp-ts';
import { describe, expect, it, vi } from 'vitest';

import { testIsSupportedPure } from '~/test-utils/predefined/testIsSupportedPure.js';
import { testSafetyPure } from '~/test-utils/predefined/testSafetyPure.js';
import type { InstantiateOptions } from '~/test-utils/types.js';
import { createNoopComponentStorage } from '~/test-utils/utils.js';

import { BackButton, type BackButtonOptions } from '@/features/BackButton/BackButton.js';
import { createComponentSessionStorage } from '@/helpers/component-storage.js';

const MIN_VERSION = '6.1';

function instantiate({
  storage = false,
  version = MIN_VERSION,
  postEvent = () => E.right(undefined),
  isTma = true,
  onClick = () => () => undefined,
  offClick = () => undefined,
  isPageReload = false,
}: InstantiateOptions<BackButtonOptions> = {}) {
  return new BackButton({
    version,
    storage: typeof storage === 'boolean'
      ? storage
        ? createComponentSessionStorage('backButton')
        : createNoopComponentStorage()
      : storage,
    postEvent,
    isTma,
    onClick,
    offClick,
    isPageReload,
  });
}

describe.each([
  ['hide', (component: BackButton) => component.hide(), true],
  ['show', (component: BackButton) => component.show(), true],
  ['mount', (component: BackButton) => component.mount(), false],
  ['onClick', (component: BackButton) => component.onClick(() => undefined), false],
  ['offClick', (component: BackButton) => component.offClick(() => undefined), false],
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

describe.each([
  ['hide', false, 'show'],
  ['show', true, 'hide'],
] as const)('%s', (method, targetIsVisible, oppositeMethod) => {
  it(`should set isVisible = ${targetIsVisible}`, () => {
    const component = instantiate();
    component.mount();
    component[oppositeMethod]();
    expect(component.isVisible()).toBe(!targetIsVisible);
    component[method]();
    expect(component.isVisible()).toBe(targetIsVisible);
  });

  it(
    `should call postEvent with "web_app_setup_back_button" and { is_visible: ${targetIsVisible} }`,
    () => {
      const postEvent = vi.fn(() => E.right(undefined));
      const component = instantiate({ postEvent });
      component.mount();
      component[oppositeMethod]();
      postEvent.mockClear();
      component[method]();
      component[method]();
      component[method]();
      expect(postEvent).toBeCalledTimes(1);
      expect(postEvent)
        .toBeCalledWith('web_app_setup_back_button', { is_visible: targetIsVisible });
    },
  );

  it('should save the state using passed storage', () => {
    const set = vi.fn();
    const component = instantiate({
      storage: { get: () => undefined, set },
    });
    component.mount();
    component[oppositeMethod]();
    set.mockClear();
    component[method]();
    expect(set).toHaveBeenCalledOnce();
    expect(set).toHaveBeenCalledWith({ isVisible: targetIsVisible });
  });
});

describe('onClick', () => {
  it('should return result of passed onClick from options', () => {
    const offClick = () => undefined;
    const onClick = vi.fn(() => offClick);
    const listener = vi.fn();
    expect(instantiate({ onClick }).onClick(listener, true)).toBe(offClick);
    expect(onClick).toHaveBeenCalledOnce();
    expect(onClick).toHaveBeenCalledWith(listener, true);
  });
});

describe('offClick', () => {
  it('should use passed offClick from options', () => {
    const offClick = vi.fn(() => undefined);
    const listener = vi.fn();
    instantiate({ offClick }).offClick(listener, true);
    expect(offClick).toHaveBeenCalledOnce();
    expect(offClick).toHaveBeenCalledWith(listener, true);
  });
});

describe('mount', () => {
  it('should set isMounted = true', () => {
    const component = instantiate();
    expect(component.isMounted()).toBe(false);
    component.mount();
    expect(component.isMounted()).toBe(true);
  });

  describe('no page reload', () => {
    it('should not use value from the storage', () => {
      const get = vi.fn(() => ({ isVisible: true }));
      const component = instantiate({ storage: { get, set: vi.fn() } });
      component.mount();
      expect(get).not.toHaveBeenCalled();
    });
  });

  describe('page reload', () => {
    it('should extract state from storage', () => {
      const get = vi.fn();
      const component = instantiate({
        storage: { get, set: vi.fn() },
        isPageReload: true,
      });
      component.mount();
      expect(get).toHaveBeenCalledOnce();

      const get2 = vi.fn(() => ({ isVisible: true }));
      const component2 = instantiate({
        storage: { get: get2, set: vi.fn() },
        isPageReload: true,
      });
      component2.mount();
      expect(get2).toHaveBeenCalledOnce();
    });
  });
});

describe('unmount', () => {
  it('should set isMounted = false', () => {
    const component = instantiate();
    expect(component.isMounted()).toBe(false);
    component.mount();
    expect(component.isMounted()).toBe(true);
    component.unmount();
    expect(component.isMounted()).toBe(false);
  });
});

describe('isSupported', () => {
  testIsSupportedPure(version => instantiate({ isTma: true, version }), MIN_VERSION);
});
