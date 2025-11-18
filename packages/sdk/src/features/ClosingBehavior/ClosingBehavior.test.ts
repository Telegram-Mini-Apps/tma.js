import type { PostEventFpFn } from '@tma.js/bridge';
import * as E from 'fp-ts/Either';
import { describe, expect, it, vi } from 'vitest';

import { testSafetyPure } from '~/test-utils/predefined/testSafetyPure.js';
import { createNoopComponentStorage } from '~/test-utils/utils.js';

import { ClosingBehavior } from '@/features/ClosingBehavior/ClosingBehavior.js';
import { type ComponentStorage, createComponentSessionStorage } from '@/helpers/component-storage.js';

function instantiate({
  storage = false,
  postEvent = () => E.right(undefined),
  isTma = true,
  isPageReload = false,
}: {
  storage?: boolean | ComponentStorage<{ isConfirmationEnabled: boolean }>;
  postEvent?: PostEventFpFn;
  isTma?: boolean;
  isPageReload?: boolean;
} = {}) {
  return new ClosingBehavior({
    storage: typeof storage === 'boolean'
      ? storage
        ? createComponentSessionStorage('closingBehavior')
        : createNoopComponentStorage()
      : storage,
    postEvent,
    isTma,
    isPageReload,
  });
}

describe.each([
  ['disableConfirmation', (component: ClosingBehavior) => component.disableConfirmation(), true],
  ['enableConfirmation', (component: ClosingBehavior) => component.enableConfirmation(), true],
  ['mount', (component: ClosingBehavior) => component.mount(), false],
] as const)('%s', (method, tryCall, requireMount) => {
  describe('safety', () => {
    testSafetyPure({
      instantiate,
      get: instance => instance[method],
      try: tryCall,
      mount: requireMount
        ? component => component.mount()
        : undefined,
    });
  });
});

describe.each([
  ['disableConfirmation', false, 'enableConfirmation'],
  ['enableConfirmation', true, 'disableConfirmation'],
] as const)('%s', (method, targetValue, oppositeMethod) => {
  it(`should set isConfirmationEnabled = ${targetValue}`, () => {
    const component = instantiate();
    component.mount();
    component[oppositeMethod]();
    expect(component.isConfirmationEnabled()).toBe(!targetValue);
    component[method]();
    expect(component.isConfirmationEnabled()).toBe(targetValue);
  });

  it(
    `should call postEvent with "web_app_setup_closing_behavior" and { need_confirmation: ${targetValue} }`,
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
      expect(postEvent).toBeCalledWith(
        'web_app_setup_closing_behavior', { need_confirmation: targetValue },
      );
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
    expect(set).toHaveBeenCalledWith({ isConfirmationEnabled: targetValue });
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
      const get = vi.fn(() => ({ isConfirmationEnabled: true }));
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

      const get2 = vi.fn(() => ({ isConfirmationEnabled: true }));
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
