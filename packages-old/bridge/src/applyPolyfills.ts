/**
 * Applies polyfills required for stable work of the package:
 * - `Object.hasOwn` - used by `valibot`
 */
export function applyPolyfills(): void {
  if (!Object.hasOwn) {
    Object.hasOwn = function(obj, prop) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    };
  }
}
