import type { PostEventFpFn } from '@tma.js/bridge';
import type { Version } from '@tma.js/types';
import * as E from 'fp-ts/Either';
import { describe, expect, it, vi } from 'vitest';

import { testSafetyPure } from '~/test-utils/predefined/testSafetyPure.js';
import { createNoopComponentStorage } from '~/test-utils/utils.js';

import { SwipeBehavior } from '@/features/SwipeBehavior/SwipeBehavior.js';
import { type ComponentStorage, createComponentSessionStorage } from '@/helpers/component-storage.js';

function instantiate({
  version = '100',
  isPageReload = false,
  storage = false,
  postEvent = () => E.right(undefined),
  isTma = true,
}: {
  isPageReload?: boolean;
  version?: Version;
  storage?: boolean | ComponentStorage<{ isVerticalEnabled: boolean }>;
  postEvent?: PostEventFpFn;
  isTma?: boolean;
} = {}) {
  return new SwipeBehavior({
    storage: typeof storage === 'boolean'
      ? storage
        ? createComponentSessionStorage('swipeBehavior')
        : createNoopComponentStorage()
      : storage,
    version,
    isPageReload,
    postEvent,
    isTma,
  });
}

describe.each([
  ['disableVertical', (component: SwipeBehavior) => component.disableVertical(), true],
  ['enableVertical', (component: SwipeBehavior) => component.enableVertical(), true],
  ['mount', (component: SwipeBehavior) => component.mount(), false],
] as const)('%s', (method, tryCall, requireMount) => {
  describe('safety', () => {
    testSafetyPure({
      instantiate,
      get: instance => instance[method],
      minVersion: '7.7',
      try: tryCall,
      mount: requireMount
        ? component => component.mount()
        : undefined,
    });
  });
});

describe.each([
  ['disableVertical', false, 'enableVertical'],
  ['enableVertical', true, 'disableVertical'],
] as const)('%s', (method, targetValue, oppositeMethod) => {
  it(`should set isVerticalEnabled = ${targetValue}`, () => {
    const component = instantiate();
    component.mount();
    component[oppositeMethod]();
    expect(component.isVerticalEnabled()).toBe(!targetValue);
    component[method]();
    expect(component.isVerticalEnabled()).toBe(targetValue);
  });

  it(
    `should call postEvent with "web_app_setup_swipe_behavior" and { allow_vertical_swipe: ${targetValue} }`,
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
        .toBeCalledWith('web_app_setup_swipe_behavior', { allow_vertical_swipe: targetValue });
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
    expect(set).toHaveBeenCalledWith({ isVerticalEnabled: targetValue });
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
      const get = vi.fn(() => ({ isVerticalEnabled: true }));
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

      const get2 = vi.fn(() => ({ isVerticalEnabled: true }));
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
