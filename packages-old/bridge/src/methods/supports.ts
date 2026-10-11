import type { Version } from '@tma.js/types';

import { getReleaseVersion } from '@/methods/getReleaseVersion.js';
import type {
  MethodName,
  MethodNameWithVersionedParams,
  MethodVersionedParams,
} from '@/methods/types/index.js';
import { compareVersions } from '@/utils/compareVersions.js';

/**
 * Returns true in case, passed parameter in specified method is supported.
 * @param method - method name
 * @param param - method parameter
 * @param inVersion - platform version.
 */
export function supports<M extends MethodNameWithVersionedParams>(
  method: M,
  param: MethodVersionedParams<M>,
  inVersion: Version,
): boolean;

/**
 * Returns true in case, specified method is supported in a passed version.
 * @param method - method name.
 * @param inVersion - platform version.
 */
export function supports(method: MethodName, inVersion: Version): boolean;

export function supports(
  method: MethodName,
  paramOrVersion: Version | string,
  inVersion?: string,
): boolean {
  const version = inVersion
    ? getReleaseVersion(
      method as MethodNameWithVersionedParams,
      paramOrVersion as MethodVersionedParams<MethodNameWithVersionedParams>,
    )
    : getReleaseVersion(method);
  return version
    ? compareVersions(version, inVersion || paramOrVersion) <= 0
    : false;
}
