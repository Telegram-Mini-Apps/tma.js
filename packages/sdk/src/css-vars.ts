import { CSSVarsBoundError } from './errors.js';
import { createStore, type Store } from './store.js';

/**
 * @returns Value converted from camel or snake case to kebab case.
 * @param value - value to convert.
 * @internal
 */
export function toKebab(value: string): string {
  return value.replace(/_/g, '-').replace(/[A-Z]/g, char => `-${char.toLowerCase()}`);
}

/**
 * CSS variables binding of a component.
 */
export interface CSSVarsBinding<K extends string> {
  /**
   * True if CSS variables are bound.
   */
  bound: Store<boolean>;
  /**
   * Binds CSS variables to the values.
   * @param getName - function returning a CSS variable name. If it returns a falsy value, the
   * variable is not created.
   * @returns Function unbinding the variables.
   * @throws {CSSVarsBoundError} CSS variables are already bound.
   */
  bind: (getName: (key: K) => string | null | undefined | false) => VoidFunction;
}

/**
 * Creates CSS variables binding.
 * @param getValues - function returning values to bind. Keys are passed to the CSS variable name
 * generator. Undefined values remove the variable.
 * @param subscribe - function subscribing to values changes.
 * @internal
 */
export function createCSSVarsBinding<K extends string>(
  getValues: () => Partial<Record<K, string>>,
  subscribe: (listener: VoidFunction) => VoidFunction,
): CSSVarsBinding<K> {
  const bound = createStore(false);

  return {
    bound,
    bind(getName) {
      if (bound.get()) {
        throw new CSSVarsBoundError();
      }
      const { style } = document.documentElement;
      // Key to its CSS variable name. Names are computed once per key, as keys may appear later.
      const names = new Map<K, string | null | undefined | false>();
      const getCachedName = (key: K) => {
        names.has(key) || names.set(key, getName(key));
        return names.get(key);
      };

      const update = () => {
        const values = getValues();
        // Removing variables, which values became missing.
        names.forEach((name, key) => {
          name && values[key] === undefined && style.removeProperty(name);
        });
        (Object.entries(values) as [K, string | undefined][]).forEach(([key, value]) => {
          const name = getCachedName(key);
          name && value !== undefined && style.setProperty(name, value);
        });
      };
      update();
      const unsubscribe = subscribe(update);
      bound.set(true);

      let active = true;
      return () => {
        if (!active) {
          return;
        }
        active = false;
        unsubscribe();
        names.forEach(name => {
          name && style.removeProperty(name);
        });
        bound.set(false);
      };
    },
  };
}
