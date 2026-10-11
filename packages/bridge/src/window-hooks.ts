/**
 * Helpers allowing the package to receive events from Telegram clients together with other
 * libraries (usually, the official SDK) without overwriting each other's handlers.
 */

type AnyFn = (...args: any[]) => void;
type AnyObj = Record<string, any>;
export type Restore = () => void;

/**
 * Makes `obj[key]` always return a function calling `fn` and then the function assigned to
 * `obj[key]` by someone else (before or after the call). Assigning a new function replaces only
 * the external one.
 * @returns Function restoring `obj[key]` to the external function.
 */
export function composeFn(obj: AnyObj, key: string, fn: AnyFn): Restore {
  let external: AnyFn | undefined = typeof obj[key] === 'function' ? obj[key] : undefined;
  const composed: AnyFn = (...args) => {
    fn(...args);
    external && external(...args);
  };
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: true,
    get: () => composed,
    set(value) {
      external = typeof value === 'function' ? value : undefined;
    },
  });
  return () => {
    if (external) {
      Object.defineProperty(obj, key, {
        configurable: true,
        enumerable: true,
        writable: true,
        value: external,
      });
    } else {
      delete obj[key];
    }
  };
}

/**
 * Makes assignments to `obj[key]` merge the assigned object into the current one instead of
 * replacing it. It protects properties defined via `composeFn` from being overwritten together
 * with the owning object.
 * @returns Function restoring `obj[key]` to a plain property.
 */
export function mergeOnAssign(obj: AnyObj, key: string): Restore {
  const value: AnyObj = obj[key];
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: true,
    get: () => value,
    set(next) {
      if (next && typeof next === 'object') {
        Object.assign(value, next);
      }
    },
  });
  return () => {
    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: true,
      writable: true,
      value,
    });
  };
}

/**
 * Creates an empty object in `obj[key]` if it is missing.
 * @returns Function removing the created object if it is still empty.
 */
export function ensureObject(obj: AnyObj, key: string): Restore {
  if (obj[key]) {
    return () => undefined;
  }
  obj[key] = {};
  return () => {
    const value: unknown = obj[key];
    if (value && typeof value === 'object' && !Object.keys(value).length) {
      delete obj[key];
    }
  };
}
