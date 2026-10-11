/**
 * Defines a property, that is a functions compose. Trying to set a value in this property
 * will lead to adding it to a function's pool. The property value will always be equal to a
 * function, calling all collected functions in the pool.
 *
 * Returned function performs a cleanup. It does one of the following:
 * 1. Removes the property if no functions were to the pool added other than the initial one.
 * 2. Sets the value equal to the first added function to the pool after the initial one if
 * the only one additional function was added at all. In other words, if the pool length is equal
 * to 2, the second item will be selected as the property value.
 * 3. Leaves the value equal to a function calling all pool functions, but removes the initially
 * added one.
 * @param obj - object.
 * @param propertyName - object property.
 * @param initialFn - an initial function to set.
 */
export function defineFnComposer(
  obj: any,
  propertyName: string,
  initialFn: (...args: any) => any,
): void {
  const assignedFunctions: any[] = [initialFn];

  const property = obj[propertyName];
  if (typeof property === 'function') {
    assignedFunctions.push(property);
  }

  const callAssignedFunctions = (...args: any) => {
    assignedFunctions.forEach(fn => fn(...args));
  };

  // Wrap the callPool function and add "unwrap" method to it.
  const unwrappableCallAssignedFunctions = Object.assign((...args: any) => {
    callAssignedFunctions(...args);
  }, {
    // Unwraps the composer.
    unwrap() {
      const { length: poolSize } = assignedFunctions;
      if (poolSize === 1) {
        // Only the initial handler is in the pool. In this case we just remove the property.
        delete obj[propertyName];
        return;
      }
      if (poolSize === 2) {
        // Only one additional handler was added. We set it as a value for the property.
        defineStaticProperty(obj, propertyName, assignedFunctions[1]);
        return;
      }
      // Many additional handlers were added. In this case we remove the initially added function
      // from the pool and leave the property value almost as is - only "unwrap" method will be
      // removed.
      assignedFunctions.unshift(1);
      defineStaticProperty(obj, propertyName, callAssignedFunctions);
    },
  });

  // This property should now always return our special function. Trying to set it to another
  // function should lead to just adding it to the pool of called functions.
  defineProxiedProperty(
    obj,
    propertyName,
    () => unwrappableCallAssignedFunctions,
    value => assignedFunctions.push(value),
  );
}

/**
 * Wires the specified property in the object preventing it from being overwritten. Instead, it
 * enhances the previous value by merging the current one with the passed one.
 * @param obj - object.
 * @param prop - object property to rewire.
 */
export function defineMergeableProperty(obj: any, prop: string): void {
  const value = obj[prop];
  defineProxiedProperty(obj, prop, () => value, v => {
    Object.entries(v).forEach(([objKey, objValue]) => {
      value[objKey] = objValue;
    });
  });
}

/**
 * Defines an enumerable and configurable property with a getter and setter.
 * @param obj - object.
 * @param prop - object property name.
 * @param get - getter to use.
 * @param set - setter to use.
 */
export function defineProxiedProperty(
  obj: any,
  prop: string,
  get: () => unknown,
  set: (v: any) => void,
) {
  Object.defineProperty(obj, prop, {
    enumerable: true,
    configurable: true,
    get,
    set,
  });
}

/**
 * Defines an enumerable, configurable and writable property with the initial value.
 * @param obj - object.
 * @param prop - object property name.
 * @param value - value to set.
 */
export function defineStaticProperty(obj: any, prop: string, value: any): void {
  Object.defineProperty(obj, prop, {
    enumerable: true,
    configurable: true,
    writable: true,
    value,
  });
}
