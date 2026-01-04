import { either as E } from 'fp-ts';
import { describe, expect, it, vi } from 'vitest';

import { testIsSupportedPure } from '~/test-utils/predefined/testIsSupportedPure.js';
import { testSafetyPure } from '~/test-utils/predefined/testSafetyPure.js';
import { InstantiateOptions } from '~/test-utils/types.js';
import { createNoopComponentStorage } from '~/test-utils/utils.js';

import {
  SecondaryButton,
  type SecondaryButtonOptions,
} from '@/features/SecondaryButton/SecondaryButton.js';
import { createComponentSessionStorage } from '@/helpers/component-storage.js';

const MIN_VERSION = '7.10';

function instantiate({
  storage = false,
  version = MIN_VERSION,
  postEvent = () => E.right(undefined),
  isTma = true,
  onClick = () => () => undefined,
  offClick = () => undefined,
  isPageReload = false,
  defaults = {
    bgColor: '#000',
    textColor: '#fff',
  },
}: InstantiateOptions<SecondaryButtonOptions> = {}) {
  return new SecondaryButton({
    version,
    storage: typeof storage === 'boolean'
      ? storage
        ? createComponentSessionStorage('secondaryButton')
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
  ['show', (component: SecondaryButton) => component.show(), true],
  ['hide', (component: SecondaryButton) => component.hide(), true],
  ['setParams', (component: SecondaryButton) => component.setParams({}), true],
  ['mount', (component: SecondaryButton) => component.mount(), false],
  ['onClick', (component: SecondaryButton) => component.onClick(() => undefined), false],
  ['offClick', (component: SecondaryButton) => component.offClick(() => undefined), false],
  ['enable', (component: SecondaryButton) => component.enable(), true],
  ['disable', (component: SecondaryButton) => component.disable(), true],
  ['enableShineEffect', (component: SecondaryButton) => component.enableShineEffect(), true],
  ['disableShineEffect', (component: SecondaryButton) => component.disableShineEffect(), true],
  ['showLoader', (component: SecondaryButton) => component.showLoader(), true],
  ['hideLoader', (component: SecondaryButton) => component.hideLoader(), true],
  ['setText', (component: SecondaryButton) => component.setText('a'), true],
  ['setTextColor', (component: SecondaryButton) => component.setTextColor('#aaa'), true],
  ['setBgColor', (component: SecondaryButton) => component.setBgColor('#ddd'), true],
  ['setPosition', (component: SecondaryButton) => component.setPosition('right'), true],
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
    `should call postEvent with "web_app_setup_secondary_button" and { ${payloadProperty}: ${targetValue} }`,
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
        'web_app_setup_secondary_button',
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
  {
    method: 'setBgColor',
    property: 'bgColor',
    payloadProperty: 'color',
    usedValue: '#abc',
    use: (component: SecondaryButton) => component.setBgColor('#abc'),
  },
  {
    method: 'setTextColor',
    property: 'textColor',
    payloadProperty: 'text_color',
    usedValue: '#cba',
    use: (component: SecondaryButton) => component.setTextColor('#cba'),
  },
  {
    method: 'setText',
    property: 'text',
    payloadProperty: 'text',
    usedValue: 'Some text',
    use: (component: SecondaryButton) => component.setText('Some text'),
  },
  {
    method: 'setPosition',
    property: 'position',
    payloadProperty: 'position',
    usedValue: 'right',
    use: (component: SecondaryButton) => component.setPosition('right'),
  },
] as const)('$method', ({ property, payloadProperty, usedValue, use }) => {
  it(`should set ${property}`, () => {
    const component = instantiate();
    component.mount();
    use(component);
    expect(component[property]()).toBe(usedValue);
  });

  it(
    `should call postEvent with "web_app_setup_secondary_button" and { ${payloadProperty}: {{value}} }`,
    () => {
      const postEvent = vi.fn(() => E.right(undefined));
      const component = instantiate({ postEvent });
      component.mount();
      use(component);
      use(component);
      use(component);
      expect(postEvent).toBeCalledTimes(1);
      expect(postEvent).toBeCalledWith(
        'web_app_setup_secondary_button', expect.objectContaining({ [payloadProperty]: usedValue }),
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

describe('isSupported', () => {
  testIsSupportedPure(version => instantiate({ isTma: true, version }), MIN_VERSION);
});
