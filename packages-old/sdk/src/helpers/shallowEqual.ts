export function shallowEqual<T extends object>(a: T, b: T): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  return aKeys.length !== bKeys.length
    ? false
    : aKeys.every(aKey => {
      return Object.prototype.hasOwnProperty.call(b, aKey)
        && (a as any)[aKey] === (b as any)[aKey];
    });
}
