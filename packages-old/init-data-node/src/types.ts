export type Text = string | ArrayBuffer;

/**
 * SHA-256 hashing function.
 */
export interface CreateHmacFn<Async extends boolean> {
  (data: Text, key: Text): Async extends true ? Promise<ArrayBuffer> : ArrayBuffer;
}
