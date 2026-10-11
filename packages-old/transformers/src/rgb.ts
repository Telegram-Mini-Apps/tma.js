import { throwifyFpFn } from '@tma.js/toolkit';
import type { RGB } from '@tma.js/types';
import { either as E, function as fn } from 'fp-ts';

function guardBasedOn(re: RegExp) {
  return (value: string): value is RGB => re.test(value);
}

/**
 * @returns True if the value has the #RGB format.
 */
export const isRGBShort = guardBasedOn(/^#[\da-f]{3}$/i);

/**
 * @returns True if the value has the #RGBA format.
 */
export const isRGBAShort = guardBasedOn(/^#[\da-f]{4}$/i);

/**
 * @returns True if the value has the #RRGGBB format.
 */
export const isRGB = guardBasedOn(/^#[\da-f]{6}$/i);

/**
 * @returns True if the value has the #RRGGBBAA format.
 */
export const isRGBA = guardBasedOn(/^#[\da-f]{8}$/i);

/**
 * @returns True if the value has any known RGB format.
 * @param value - value to check.
 */
export function isAnyRGB(value: string): value is RGB {
  return [isRGB, isRGBA, isRGBShort, isRGBAShort].some(fn => fn(value));
}

/**
 * Converts a short version of RGB (#RGB) to a complete one (#RRGGBB).
 * @param value
 */
function expandRgb(value: RGB): RGB {
  let color: RGB = '#';
  for (let i = 0; i < value.length - 1; i += 1) {
    color += value[1 + i].repeat(2);
  }
  return color;
}

/**
 * Converts passed value to #RRGGBBAA format. Accepts the following color formats:
 * - `#RGB`
 * - `#RGBA`
 * - `#RRGGBB`
 * - `#RRGGBBAA`
 * - `rgb(1,2,3)`
 * - `rgba(1,2,3,4)`
 * @param value - a value to convert.
 * @returns A value in the #RRGGBBAA format.
 */
export function toRGBFullFp(value: string): E.Either<Error, RGB> {
  const clean = value.replace(/\s/g, '').toLowerCase();
  if (/^#[\da-f]{3}$/i.test(clean)) {
    return E.right(expandRgb(clean.toLowerCase() + 'f' as RGB));
  }

  if (/^#[\da-f]{4}$/i.test(clean)) {
    return E.right(expandRgb(clean.toLowerCase() as RGB));
  }

  if (/^#[\da-f]{6}$/i.test(clean)) {
    return E.right(clean.toLowerCase() + 'ff' as RGB);
  }

  if (/^#[\da-f]{8}$/i.test(clean)) {
    return E.right(clean.toLowerCase() as RGB);
  }

  // Example valid values: rgb(0,3,10) rgba(32,114,8,0)
  const match = clean.match(/^rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)$/)
    || clean.match(/^rgba\((\d{1,3}),(\d{1,3}),(\d{1,3}),(\d{1,3})\)$/);

  // If this didn't work as well, we can't extract RGB color from passed text.
  if (!match) {
    return E.left(new Error(`Value "${value}" does not satisfy any of known RGB formats.`));
  }

  // Otherwise, take R, G and B components, convert to hex and create #RRGGBB string.
  return E.right(
    match
      .slice(1)
      .reduce(
        (acc, component) => {
          return acc + parseInt(component, 10)
            .toString(16)
            .padStart(2, '0');
        }, '#',
      )
      // We are adding f-s here to match the pattern: #RRGGBBAA
      .padEnd(9, 'f') as RGB,
  );
}

/**
 * Converts passed value to #RRGGBB format. Accepts the following color formats:
 * - `#RGB`
 * - `#RGBA`
 * - `#RRGGBB`
 * - `#RRGGBBAA`
 * - `rgb(1,2,3)`
 * - `rgba(1,2,3,4)`
 * @param value - a value to convert.
 * @returns A value in the #RRGGBB format.
 * @deprecated This function cuts the RGB's alpha channel. Use the `toRGBFullFp` function instead.
 */
export function toRGBFp(value: string): E.Either<Error, RGB> {
  return fn.pipe(
    toRGBFullFp(value),
    E.map(rgb => rgb.slice(0, 7) as RGB),
  );
}

/**
 * @see toRGBFp
 * @deprecated This function cuts the RGB's alpha channel. Use the `toRGBFull` function instead.
 */
export const toRGB = throwifyFpFn(toRGBFp);

/**
 * @see toRGBFullFp
 */
export const toRGBFull = throwifyFpFn(toRGBFullFp);
