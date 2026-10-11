import { Version } from '@tma.js/types';
import { describe, expect, it } from 'vitest';

import { FunctionUnavailableError } from '@/errors.js';

import { getPrevVersion } from '../utils.js';

import { testIsSupportedPure } from './testIsSupportedPure.js';

interface BaseOptions<C> {
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
   * Creates a new component instance.
   * @param opts
   */
  instantiate: (opts: { isTma: boolean; version: string }) => C;
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
  /**
   * Creates a new component instance.
   * @param opts
   */
  instantiate: (opts: { isTma: boolean }) => C;
}

export function testSafetyPure<C>(options: VersionedOptions<C>): void;
export function testSafetyPure<C>(options: VersionlessOptions<C>): void;
export function testSafetyPure<C>({
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

  if (hasMinVersion) {
    describe('isSupported', () => {
      testIsSupportedPure(
        version => get(instantiate({ isTma: true, version })) as {
          isAvailable(): boolean;
          isSupported(): boolean;
        },
        versions.min,
      );
    });
  }

  describe('isAvailable', () => {
    it('should return false if not mini apps env', () => {
      expect(get(instantiate({ isTma: false, version: versions.min })).isAvailable()).toBe(false);
    });

    if (hasMinVersion || mount) {
      describe('mini apps env', () => {
        if (hasMinVersion) {
          it('should return false if version is "0.0" (SDK not initialized)', () => {
            expect(get(instantiate({ isTma: true, version: '0.0' })).isAvailable()).toBe(false);
          });

          it(`should return false if version is less than ${versions.min}`, () => {
            expect(get(instantiate({
              isTma: true,
              version: versions.prev,
            })).isAvailable()).toBe(false);
          });

          if (!mount) {
            it(`should return true if version is ${versions.min}`, () => {
              expect(get(instantiate({ isTma: true, version: versions.min })).isAvailable())
                .toBe(true);
            });
          }
        }

        if (mount) {
          it('should return false if component is not mounted', () => {
            expect(
              get(instantiate({ isTma: true, version: versions.min })).isAvailable(),
            ).toBe(false);
          });

          describe('component is mounted', () => {
            if (hasMinVersion) {
              it(
                `should return true if version is ${versions.min}`,
                async () => {
                  const component = instantiate({ isTma: true, version: versions.min });
                  await mount(component);
                  expect(get(component).isAvailable()).toBe(true);
                },
              );
            } else {
              it(
                'should return true if mini apps env and component is mounted',
                async () => {
                  const component = instantiate({ isTma: true, version: '0.0' });
                  await mount(component);
                  expect(get(component).isAvailable()).toBe(true);
                },
              );
            }
          });
        }
      });
    }
  });

  describe('()', () => {
    describe('not mini apps env', () => {
      it('should throw FunctionUnavailableError', async () => {
        await expect(
          (async () => tryCall(instantiate({ isTma: false, version: versions.min })))(),
        )
          .rejects
          .toStrictEqual(
            new FunctionUnavailableError(
              'Unable to call function: it can\'t be called outside Mini Apps',
            ),
          );
      });
    });

    if (hasMinVersion || mount) {
      describe('mini apps env', () => {
        if (hasMinVersion) {
          describe('package uninitialized (version is "0.0")', () => {
            it('should throw FunctionUnavailableError', async () => {
              await expect(
                (async () => tryCall(instantiate({ isTma: true, version: '0.0' })))(),
              )
                .rejects
                .toStrictEqual(new FunctionUnavailableError(
                  'Unable to call function: the SDK was not initialized. Use the SDK init() function',
                ));
            });
          });
        }

        if (hasMinVersion || mount) {
          describe('package initialized', () => {
            if (hasMinVersion) {
              describe(`minimal version not satisfied (${versions.min})`, () => {
                it('should throw FunctionUnavailableError', async () => {
                  await expect(
                    (async () => tryCall(instantiate({ isTma: true, version: versions.prev })))(),
                  )
                    .rejects
                    .toStrictEqual(
                      new FunctionUnavailableError(
                        `Unable to call function: it is unsupported in Mini Apps version ${versions.prev}`,
                      ),
                    );
                });
              });

              if (mount) {
                describe(`minimal version satisfied (${versions.min})`, () => {
                  describe('component is not mounted', () => {
                    it('should throw FunctionUnavailableError', async () => {
                      await expect(
                        (async () => tryCall(instantiate({
                          isTma: true,
                          version: versions.min,
                        })))(),
                      )
                        .rejects
                        .toStrictEqual(
                          new FunctionUnavailableError(
                            'Unable to call function: the component is unmounted. Use the mount() method',
                          ),
                        );
                    });
                  });

                  describe('component is mounted', () => {
                    it('should not throw', async () => {
                      const component = instantiate({ isTma: true, version: versions.min });
                      await mount(component);
                      await expect(
                        (async () => tryCall(component))(),
                      ).resolves.toBeOneOf([undefined, expect.anything()]);
                    });
                  });
                });
              }
            } else if (mount) {
              describe('component is not mounted', () => {
                it('should throw FunctionUnavailableError', async () => {
                  await expect(
                    (async () => tryCall(instantiate({ isTma: true, version: versions.min })))(),
                  )
                    .rejects
                    .toStrictEqual(
                      new FunctionUnavailableError(
                        'Unable to call function: the component is unmounted. Use the mount() method',
                      ),
                    );
                });
              });

              describe('component is mounted', () => {
                it('should not throw', async () => {
                  const component = instantiate({ isTma: true, version: versions.min });
                  await mount(component);
                  await expect(
                    (async () => tryCall(component))(),
                  ).resolves.toBeOneOf([undefined, expect.anything()]);
                });
              });
            }
          });
        }
      });
    }
  });
}
