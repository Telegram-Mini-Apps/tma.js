import type { InitData, LaunchParams } from '@tma.js/types';
import type { InferOutput } from 'valibot';

import type { initData, launchParams } from './structures.js';

export type InitDataLike = Partial<InferOutput<ReturnType<typeof initData>> | InitData>;
export type LaunchParamsLike = Partial<InferOutput<ReturnType<typeof launchParams>> | LaunchParams>;

/**
 * Converts the passed object to query parameters.
 * @param value - value to serialize.
 * @param onObject - function returning serialized object value.
 */
function serializeToQuery(
  value: object,
  onObject?: (key: string, value: object) => string,
): string {
  onObject ||= (_, value) => JSON.stringify(value);

  return new URLSearchParams(
    Object
      .entries(value)
      .reduce<[string, string][]>((acc, [key, value]) => {
        if (Array.isArray(value)) {
          acc.push(...value.map(v => [key, String(v)] as [string, string]));
        } else {
          if (value !== null && value !== undefined) {
            acc.push([
              key,
              value instanceof Date
                ? (value.getTime() / 1000 | 0).toString()
                : typeof value === 'string' || typeof value === 'number'
                  ? String(value)
                  : typeof value === 'boolean'
                    ? value ? '1' : '0'
                    : onObject(key, value),
            ]);
          }
        }
        return acc;
      }, []),
  ).toString();
}

/**
 * Serializes the InitDataQuery shape.
 * @param value - value to serialize.
 */
export function serializeInitDataQuery(value: InitDataLike): string {
  return serializeToQuery(value);
}

/**
 * Serializes the LaunchParamsQuery shape.
 * @param value - value to serialize.
 */
export function serializeLaunchParamsQuery(value: LaunchParamsLike): string {
  return serializeToQuery(value, (k, v) => {
    return k === 'tgWebAppData' ? serializeInitDataQuery(v as any) : JSON.stringify(v);
  });
}
