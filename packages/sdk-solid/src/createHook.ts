import { AnyFn } from '@telegram-apps/sdk';

import { useSDK } from './SDKProvider/SDKContext.js';
import type { FactorySignal } from './SDKProvider/SDKProvider.types.js';

export interface Hook<Factory extends AnyFn> {
  (...args: Parameters<Factory>): FactorySignal<Factory>;
}

/**
 * Creates new hook, which firstly attempts to extract a value from the SDK context. In case,
 * value is missing, it uses the passed component factory, creates a component, subscribes
 * to its changes if required, and returns its reactive copy.
 * @param factory - component factory.
 */
export function createHook<Factory extends AnyFn>(factory: Factory): Hook<Factory> {
  return (...args) => {
    const contextItem = useSDK()(factory, ...args);
    const signal: FactorySignal<Factory> = () => {
      return contextItem.signal();
    };
    Object.defineProperty(signal, 'error', () => {
      return contextItem.error;
    });

    return signal;
  };
}
