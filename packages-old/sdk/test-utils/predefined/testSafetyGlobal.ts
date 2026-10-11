import { beforeEach, describe, expect, it } from 'vitest';
import { Version } from '@tma.js/types';

import { FunctionUnavailableError } from '@/errors.js';

import { getPrevVersion, mockMiniAppsEnv, setVersion } from '../utils.js';

import { testIsSupportedGlobal } from '~/test-utils/predefined/testIsSupportedGlobal.js';
import { resetGlobals } from '@/globals/resetGlobals.js';

interface BaseOptions<C> {
  /**
   * Creates a new component instance.
   * @param opts
   */
  instantiate: () => C;
  /**
   * Mounts the component.
   */
  mount?: (component: C) => void | Promise<void>;
  /**
   * Attempts to call the component method.
   * @param component
   */
  try: (component: C) => any;
}

interface VersionedOptions<C> extends BaseOptions<C> {
  /**
   * Retrieves component method.
   * @param component
   */
  get: (component: C) => {
    isSupported(): boolean;
    isAvailable(): boolean;
  };
  /**
   * Minimal version for the method to be supported.
   */
  minVersion: Version;
}

interface VersionlessOptions<C> extends BaseOptions<C> {
  /**
   * Retrieves component method.
   * @param component
   */
  get: (component: C) => {
    isAvailable: () => boolean;
  };
}

export function testSafetyGlobal<C>(options: VersionedOptions<C>): void;
export function testSafetyGlobal<C>(options: VersionlessOptions<C>): void;
export function testSafetyGlobal<C>({
  instantiate,
  try: tryCall,
  get,
  mount,
  ...options
}: VersionedOptions<C> | VersionlessOptions<C>) {
  const hasMinVersion = 'minVersion' in options;
  const versions = hasMinVersion
    ? { prev: getPrevVersion(options.minVersion), min: options.minVersion }
    : { prev: '99.9', min: '100' };

  describe.runIf(hasMinVersion)('isSupported', () => {
    testIsSupportedGlobal(
      get(instantiate()) as {
        isAvailable(): boolean;
        isSupported(): boolean;
      },
      versions.min,
    );
  });

  describe('isAvailable', () => {
    beforeEach(resetGlobals);

    it('should return false if not mini apps env', () => {
      setVersion(versions.min);
      expect(get(instantiate()).isAvailable()).toBe(false);
    });

    describe('mini apps env', () => {
      beforeEach(() => {
        mockMiniAppsEnv();
      });

      describe.runIf(hasMinVersion)(() => {
        it('should return false if version is "0.0" (SDK not initialized)', () => {
          expect(get(instantiate()).isAvailable()).toBe(false);
        });

        it(`should return false if version is less than ${versions.min}`, () => {
          setVersion(versions.prev);
          expect(get(instantiate()).isAvailable()).toBe(false);
        });

        it.runIf(!mount)(`should return true if version is ${versions.min}`, () => {
          setVersion(versions.min);
          expect(get(instantiate()).isAvailable()).toBe(true);
        });
      });

      describe.runIf(mount)(() => {
        it('should return false if component is not mounted', () => {
          setVersion(versions.min);
          expect(get(instantiate()).isAvailable()).toBe(false);
        });

        describe('component is mounted', () => {
          it.runIf(hasMinVersion)(`should return true if version is ${versions.min}`, async () => {
            setVersion(versions.min);
            const component = instantiate();
            await mount!(component);
            expect(get(component).isAvailable()).toBe(true);
          });

          it.runIf(!hasMinVersion)(
            'should return true if mini apps env and component is mounted',
            async () => {
              const component = instantiate();
              await mount!(component);
              expect(get(component).isAvailable()).toBe(true);
            },
          );
        });
      });
    });
  });

  describe('()', () => {
    describe('not mini apps env', () => {
      it('should throw FunctionUnavailableError', () => {
        setVersion(versions.min);
        expect(() => tryCall(instantiate())).toThrow(
          new FunctionUnavailableError(
            'Unable to call function: it can\'t be called outside Mini Apps',
          ),
        );
      });
    });

    describe('mini apps env', () => {
      beforeEach(() => {
        mockMiniAppsEnv();
      });

      describe('package uninitialized (version is "0.0")', () => {
        it.runIf(hasMinVersion)('should throw FunctionUnavailableError', () => {
          expect(() => tryCall(instantiate())).toThrow(new FunctionUnavailableError(
            'Unable to call function: the SDK was not initialized. Use the SDK init() function',
          ));
        });
      });

      describe('package initialized', () => {
        describe.runIf(hasMinVersion)(() => {
          describe(`minimal version not satisfied (${versions.min})`, () => {
            it('should throw FunctionUnavailableError', () => {
              setVersion(versions.prev);
              expect(() => tryCall(instantiate())).toThrow(
                new FunctionUnavailableError(
                  `Unable to call function: it is unsupported in Mini Apps version ${versions.prev}`,
                ),
              );
            });
          });

          describe.runIf(mount)(`minimal version satisfied (${versions.min})`, () => {
            describe('component is not mounted', () => {
              it('should throw FunctionUnavailableError', () => {
                setVersion(versions.min);
                expect(() => tryCall(instantiate())).toThrow(
                  new FunctionUnavailableError(
                    'Unable to call function: the component is unmounted. Use the mount() method',
                  ),
                );
              });
            });

            describe('component is mounted', () => {
              it('should not throw', async () => {
                setVersion(versions.min);
                const component = instantiate();
                await mount!(component);
                expect(() => tryCall(component)).not.toThrow();
              });
            });
          });
        });

        describe.runIf(!hasMinVersion && mount)(() => {
          describe('component is not mounted', () => {
            it('should throw FunctionUnavailableError', () => {
              setVersion(versions.min);
              expect(() => tryCall(instantiate())).toThrow(
                new FunctionUnavailableError(
                  'Unable to call function: the component is unmounted. Use the mount() method',
                ),
              );
            });
          });

          describe('component is mounted', () => {
            it('should not throw', async () => {
              setVersion(versions.min);
              const component = instantiate();
              await mount!(component);
              expect(() => tryCall(component)).not.toThrow();
            });
          });
        });
      });
    });
  });
}
