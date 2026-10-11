export type InstantiateOptions<T> = Partial<
  & Omit<T, 'storage'>
  & (T extends { storage?: any } ? { storage?: T['storage'] | boolean } : {})
>;