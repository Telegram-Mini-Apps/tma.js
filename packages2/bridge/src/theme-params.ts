import {
  check,
  type GenericSchema,
  number,
  parseJson,
  pipe,
  record,
  string,
  transform,
  union,
} from 'valibot';

import type { RGB, ThemeParams } from './types/index.js';

/**
 * Theme color. Some Telegram clients send colors as numbers, so they are converted to
 * the `#RRGGBB` format.
 */
const color = pipe(
  union([string(), number()]),
  transform(value => (
    typeof value === 'number'
      ? `#${(value & 0xFFFFFF).toString(16).padStart(6, '0')}`
      : value
  ) as RGB),
  check(
    value => /^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.test(value),
    issue => `Invalid color: ${String(issue.input)}`,
  ),
);

/**
 * Schema of a raw theme parameters object.
 */
export const themeParams: GenericSchema<unknown, ThemeParams> = record(string(), color);

/**
 * Schema of theme parameters in the JSON format.
 */
export const themeParamsJson: GenericSchema<unknown, ThemeParams> = pipe(
  string(),
  parseJson(),
  themeParams,
);
