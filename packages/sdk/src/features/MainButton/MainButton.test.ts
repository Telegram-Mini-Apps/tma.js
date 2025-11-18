import * as E from 'fp-ts/Either';
import { describe, expect, it, vi } from 'vitest';

import { testSafetyPure } from '~/test-utils/predefined/testSafetyPure.js';
import { InstantiateOptions } from '~/test-utils/types.js';
import { createNoopComponentStorage } from '~/test-utils/utils.js';

import {
  MainButton,
  type MainButtonOptions,
} from '@/features/MainButton/MainButton.js';
import { createComponentSessionStorage } from '@/helpers/component-storage.js';

function instantiate({
  storage = false,
  postEvent = () => E.right(undefined),
  isTma = true,
  onClick = () => () => undefined,
  offClick = () => undefined,
  isPageReload = false,
  defaults = {
    bgColor: '#000',
    textColor: '#fff',
  },
}: InstantiateOptions<MainButtonOptions> = {}) {
  return new MainButton({
    storage: typeof storage === 'boolean'
      ? storage
        ? createComponentSessionStorage('mainButton')
        : createNoopComponentStorage()
      : storage,
    postEvent,
    isTma,
    onClick,
    offClick,
    isPageReload,
    defaults,
  });
}

describe.each([
  ['show', (component: MainButton) => component.show(), true],
  ['hide', (component: MainButton) => component.hide(), true],
  ['setParams', (component: MainButton) => component.setParams({}), true],
  ['mount', (component: MainButton) => component.mount(), false],
  ['onClick', (component: MainButton) => component.onClick(() => undefined), false],
  ['offClick', (component: MainButton) => component.offClick(() => undefined), false],
  ['enable', (component: MainButton) => component.enable(), true],
  ['disable', (component: MainButton) => component.disable(), true],
  ['enableShineEffect', (component: MainButton) => component.enableShineEffect(), true],
  ['disableShineEffect', (component: MainButton) => component.disableShineEffect(), true],
  ['showLoader', (component: MainButton) => component.showLoader(), true],
  ['hideLoader', (component: MainButton) => component.hideLoader(), true],
  ['setText', (component: MainButton) => component.setText('a'), true],
  ['setTextColor', (component: MainButton) => component.setTextColor('#aaa'), true],
  ['setBgColor', (component: MainButton) => component.setBgColor('#ddd'), true],
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
  {
    method: 'hide',
    oppositeMethod: 'show',
    targetValue: false,
    property: 'isVisible',
    payloadProperty: 'is_visible',
  },
  {
    method: 'show',
    oppositeMethod: 'hide',
    targetValue: true,
    property: 'isVisible',
    payloadProperty: 'is_visible',
  },
  {
    method: 'enable',
    oppositeMethod: 'disable',
    targetValue: true,
    property: 'isEnabled',
    payloadProperty: 'is_active',
  },
  {
    method: 'disable',
    oppositeMethod: 'enable',
    targetValue: false,
    property: 'isEnabled',
    payloadProperty: 'is_active',
  },
  {
    method: 'enableShineEffect',
    oppositeMethod: 'disableShineEffect',
    targetValue: true,
    property: 'hasShineEffect',
    payloadProperty: 'has_shine_effect',
  },
  {
    method: 'disableShineEffect',
    oppositeMethod: 'enableShineEffect',
    targetValue: false,
    property: 'hasShineEffect',
    payloadProperty: 'has_shine_effect',
  },
  {
    method: 'showLoader',
    oppositeMethod: 'hideLoader',
    targetValue: true,
    property: 'isLoaderVisible',
    payloadProperty: 'is_progress_visible',
  },
  {
    method: 'hideLoader',
    oppositeMethod: 'showLoader',
    targetValue: false,
    property: 'isLoaderVisible',
    payloadProperty: 'is_progress_visible',
  },
] as const)('$method', ({ oppositeMethod, method, targetValue, property, payloadProperty }) => {
  it(`should set ${property} = ${targetValue}`, () => {
    const component = instantiate();
    component.mount();
    component[oppositeMethod]();
    expect(component[property]()).toBe(!targetValue);
    component[method]();
    expect(component[property]()).toBe(targetValue);
  });

  it(
    `should call postEvent with "web_app_setup_main_button" and { ${payloadProperty}: ${targetValue} }`,
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
        'web_app_setup_main_button',
        expect.objectContaining({ [payloadProperty]: targetValue }),
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
    expect(set).toHaveBeenCalledWith(expect.objectContaining({ [property]: targetValue }));
  });
});

describe.each([
  // {
  //   method: 'setBgColor',
  //   property: 'bgColor',
  //   payloadProperty: 'color',
  //   usedValue: '#abc',
  //   use: (component: MainButton) => component.setBgColor('#abc'),
  // },
  {
    method: 'setTextColor',
    property: 'textColor',
    payloadProperty: 'text_color',
    usedValue: '#cba',
    use: (component: MainButton) => component.setTextColor('#cba'),
  },
  // {
  //   method: 'setText',
  //   property: 'text',
  //   payloadProperty: 'text',
  //   usedValue: 'Some text',
  //   use: (component: MainButton) => component.setText('Some text'),
  // },
] as const)('$method', ({ property, payloadProperty, usedValue, use }) => {
  it(`should set ${property}`, () => {
    const component = instantiate();
    component.mount();
    use(component);
    expect(component[property]()).toBe(usedValue);
  });

  it(
    `should call postEvent with "web_app_setup_main_button" and { ${payloadProperty}: {{value}} }`,
    () => {
      const postEvent = vi.fn(() => E.right(undefined));
      const component = instantiate({ postEvent });
      component.mount();
      use(component);
      use(component);
      use(component);
      expect(postEvent).toBeCalledTimes(1);
      expect(postEvent).toBeCalledWith(
        'web_app_setup_main_button', expect.objectContaining({ [payloadProperty]: usedValue }),
      );
    },
  );

  it('should save the state using passed storage', () => {
    const set = vi.fn();
    const component = instantiate({
      storage: { get: () => undefined, set },
    });
    component.mount();
    use(component);
    expect(set).toHaveBeenCalledOnce();
    expect(set).toHaveBeenCalledWith(expect.objectContaining({ [property]: usedValue }));
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
      const get = vi.fn(() => ({
        isVisible: true,
        position: 'left',
        bgColor: '#123',
        hasShineEffect: false,
        isEnabled: true,
        isLoaderVisible: false,
        text: 'Text',
        textColor: '#112',
      } as const));
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

      const get2 = vi.fn(() => ({
        isVisible: true,
        position: 'left',
        bgColor: '#123',
        hasShineEffect: false,
        isEnabled: true,
        isLoaderVisible: false,
        text: 'Text',
        textColor: '#112',
      } as const));
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
