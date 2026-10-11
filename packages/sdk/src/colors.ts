import { err, ok, type Result, type RGB, throwing } from '@tma.js/bridge';

import { InvalidColorError } from './errors.js';

/**
 * @returns True if the value is a color in the `#RRGGBB` format.
 * @param value - value to check.
 */
export function isRGB(value: string): value is RGB {
  return /^#[\da-f]{6}$/i.test(value);
}

/**
 * Converts a color to the `#RRGGBB` format. The alpha channel is dropped. Accepts the following
 * formats: `#RGB`, `#RGBA`, `#RRGGBB`, `#RRGGBBAA`, `rgb(r, g, b)` and `rgba(r, g, b, a)`.
 * @param color - color to convert.
 * @returns Color in the `#RRGGBB` format, or `InvalidColorError` if the color has an unknown
 * format.
 */
export function safeToRGB(color: string): Result<InvalidColorError, RGB> {
  const clean = color.replace(/\s/g, '').toLowerCase();

  let match = clean.match(/^#([\da-f])([\da-f])([\da-f])[\da-f]?$/);
  if (match) {
    return ok<RGB>(`#${match.slice(1).map(char => char + char)
      .join('')}`);
  }
  match = clean.match(/^#([\da-f]{6})(?:[\da-f]{2})?$/);
  if (match) {
    return ok<RGB>(`#${match[1]}`);
  }
  match = clean.match(/^rgba?\((\d{1,3}),(\d{1,3}),(\d{1,3})(?:,[\d.]+)?\)$/);
  if (match) {
    const parts = match.slice(1).map(Number);
    if (parts.every(part => part <= 255)) {
      return ok<RGB>(`#${parts.map(part => part.toString(16).padStart(2, '0')).join('')}`);
    }
  }
  return err(new InvalidColorError(color));
}

/**
 * Converts a color to the `#RRGGBB` format.
 *
 * Throwing version of `safeToRGB`.
 * @param color - color to convert.
 * @throws {InvalidColorError} The color has an unknown format.
 */
export const toRGB = /* @__PURE__ */ throwing(safeToRGB);

/**
 * @param color - color in any format supported by `safeToRGB`.
 * @returns True if the color is dark, or `InvalidColorError` if the color has an unknown format.
 * @see https://stackoverflow.com/a/596243
 */
export function safeIsColorDark(color: string): Result<InvalidColorError, boolean> {
  const rgb = safeToRGB(color);
  if (!rgb.ok) {
    return rgb;
  }
  const [r, g, b] = [1, 3, 5].map(index => parseInt(rgb.data.slice(index, index + 2), 16));
  return ok(Math.sqrt((0.299 * r * r) + (0.587 * g * g) + (0.114 * b * b)) < 120);
}

/**
 * Checks if the color is dark.
 *
 * Throwing version of `safeIsColorDark`.
 * @param color - color in any format supported by `toRGB`.
 * @throws {InvalidColorError} The color has an unknown format.
 */
export const isColorDark = /* @__PURE__ */ throwing(safeIsColorDark);
