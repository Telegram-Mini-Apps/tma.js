import {
  serializeLaunchParamsQuery,
  type LaunchParamsLike,
} from '@tma.js/transformers';
import type { Version } from '@tma.js/types';
import { createWindow } from 'test-utils';
import type { PostEventFpFn } from '@tma.js/bridge';
import { either as E } from 'fp-ts';
import { vi } from 'vitest';

import type { ComponentStorage } from '@/helpers/component-storage.js';
import { version } from '@/globals/version.js';
import { resetGlobals } from '@/globals/resetGlobals.js';
import { postEventFpSignal } from '@/globals/postEvent.js';

export function createNoopComponentStorage<T>(): ComponentStorage<T> {
  const noop = () => undefined;
  return { get: noop, set: noop };
}

export function setVersion(v: Version) {
  version.set(v);
}

export function setMaxVersion() {
  setVersion('100');
}

export function mockPostEvent(
  postEvent: PostEventFpFn = () => E.right(undefined),
) {
  const fn = vi.fn(postEvent);
  postEventFpSignal.set(fn as any);
  return fn;
}

export function mockMiniAppsEnv(lp: LaunchParamsLike = {
  tgWebAppPlatform: 'tdesktop',
  tgWebAppVersion: '10',
  tgWebAppThemeParams: {},
}) {
  createWindow({
    env: 'iframe',
    location: {
      ...window.location,
      href: `/?${serializeLaunchParamsQuery(lp)}`,
    },
  });
}

export function configureEnv({
  version = '100',
  lp = {
    tgWebAppPlatform: 'tdesktop',
    tgWebAppVersion: version,
    tgWebAppThemeParams: {},
  },
}: {
  version?: Version,
  lp?: LaunchParamsLike | 'skip'
} = {}) {
  setVersion(version);

  if (lp !== 'skip') {
    mockMiniAppsEnv(lp);
  }
}

/**
 * Resets globals and restores all mocks.
 */
export function restoreState() {
  resetGlobals();
  vi.restoreAllMocks();
}

/**
 * Returns a previous version related to the specified one.
 * @param version
 */
export function getPrevVersion(version: Version): Version {
  const [a, b = 0] = version.split('.').map(Number);
  return `${b === 0 ? a - 1 : a}.${b === 0 ? 99 : b - 1}`;
}
