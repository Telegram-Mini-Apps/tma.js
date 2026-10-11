export type UnionStringKeys<U> = U extends U ? {
  [K in keyof U]-?: U[K] extends string | undefined ? K : never;
}[keyof U] : never;

export type UnionRequiredKeys<U> = U extends U ? {
  [K in UnionStringKeys<U>]: ({} extends Pick<U, K> ? never : K);
}[UnionStringKeys<U>] : never;

export type UnionOptionalKeys<U> = Exclude<UnionStringKeys<U>, UnionRequiredKeys<U>>;
