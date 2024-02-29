import type { InitOptions, InitResult } from '@tma.js/sdk';

export type { InitOptions, InitResult };

export interface Trackable {
  on(event: 'change', listener: () => void): () => void;
}

/**
 * SDK init result keys, which describe values with trackable changes.
 */
export type DynamicInitResultKey = {
  [K in InitResultKey]-?: InitResultValue<K> extends Trackable ? K : never;
}[InitResultKey];

/**
 * SDK init result keys, which describe static values.
 */
export type StaticInitResultKey = Exclude<InitResultKey, DynamicInitResultKey>;

/**
 * SDK initialization result key.
 */
export type InitResultKey = keyof InitResult;

/**
 * Returns SDK init result value type by its key.
 */
export type InitResultValue<K extends InitResultKey> = InitResult[K];
