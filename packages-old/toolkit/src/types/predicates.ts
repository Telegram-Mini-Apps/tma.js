export type IsNever<T> = [T] extends [never] ? true : false;

export type IsUndefined<T> = [T] extends [undefined] ? true : false;
