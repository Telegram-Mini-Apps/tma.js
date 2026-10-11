type UnionKeys<T> = T extends T ? keyof T : never;

/**
 * Creates Mini Apps method parameters types.
 */
export interface CreateMethodParams<
  Params = never,
  VersionedParam extends UnionKeys<Params> = never,
> {
  params: Params;
  versionedParams: VersionedParam;
}
