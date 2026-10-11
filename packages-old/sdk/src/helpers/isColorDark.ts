import { throwifyFpFn } from '@tma.js/toolkit';
import { toRGBFullFp } from '@tma.js/transformers';
import { either as E, function as fn } from 'fp-ts';

/**
 * @param color - color in any format acceptable by the `toRGB` function.
 * @returns True if the color is recognized as dark.
 * @see toRGB
 */
export function isColorDarkFp(color: string): E.Either<Error, boolean> {
  return fn.pipe(
    toRGBFullFp(color),
    E.map(rgb => {
      // Actual formula: hsp = Math.sqrt(0.299 * r * r + 0.587 * g * g + 0.114 * b * b)
      // See: https://stackoverflow.com/a/596243
      return Math.sqrt(
        [0.299, 0.587, 0.114].reduce<number>((acc, modifier, idx) => {
          // Extract part of #RRGGBB pattern and convert it to DEC.
          const dec = parseInt(rgb.slice(1 + (idx * 2), 1 + ((idx + 1) * 2)), 16);
          return acc + (dec * dec * modifier);
        }, 0),
      ) < 120;
    }),
  );
}

/**
 * @see isColorDarkFp
 */
export const isColorDark = throwifyFpFn(isColorDarkFp);
