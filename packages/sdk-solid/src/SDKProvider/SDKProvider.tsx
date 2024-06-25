import { AnyFn, CleanupFn, initWeb, isIframe, setDebug } from '@telegram-apps/sdk';
import {
  Accessor,
  type Component,
  createEffect,
  createMemo,
  createResource,
  from,
  onCleanup,
} from 'solid-js';

import { SDKContext } from './SDKContext.js';
import {
  SDKContextItem,
  SDKContextType,
  SDKProviderProps,
} from './SDKProvider.types.js';

/**
 * Provides access to SDK components and initializes some event listeners for the web version
 * of Telegram.
 */
export const SDKProvider: Component<SDKProviderProps> = (props) => {
  const cache = new Map<AnyFn, SDKContextItem<AnyFn>>();

  const use: SDKContextType = (factory, ...args) => {
    // SDK context may already have this value.
    if (cache.has(factory)) {
      return cache.get(factory)!;
    }

    function withCacheSet(item: SDKContextItem<any>): SDKContextItem<any> {
      cache.set(factory, item);
      return item;
    }

    // Call factory and retrieve result.
    let result: any;
    try {
      result = factory(...args);
    } catch (error) {
      return withCacheSet({
        error,
        signal: () => {
          throw error;
        },
      });
    }

    // Result may represent a tuple, where the result is placed on the first place, and
    // a cleanup function is on the second one.
    let cleanup: CleanupFn | undefined;
    if (Array.isArray(result)) {
      [result, cleanup] = result;
    }

    // We are creating a resource as long as the factory can sometimes return a promise. For
    // example, this may happen in case, the factory initializes BiometryManager or
    // Viewport components.
    const [resource] = createResource(() => result);

    // Signal, which returns computed resource value.
    const value = createMemo(() => {
      // The resource is loading, return nothing. This usually happens when the factory is async.
      if (resource.state !== 'ready') {
        return;
      }

      const v = resource();

      // Factory may return undefined if it creates the InitData component, for example.
      // The returned component may also not allow tracking its changes. It means, it cannot
      // be reactive, we just this values as is.
      if (!v || !('on' in v)) {
        return v;
      }

      // Otherwise, we are making value reactive and track its changes.
      const get = from((set) => {
        set(v);
        return v.on('change', () => set(v));
      });

      // We use this value to retrieve properties having getters. We assume, that if property has
      // a getter, it must be reactive.
      // NOTE: Yeah, it looks horrible, but I had no other way of doing this.
      const prototype = Object.getPrototypeOf(v);

      // Cache with already defined signals.
      const propCache: Record<string | symbol, Accessor<any>> = {};

      return new Proxy(v, {
        get(target: any, property: string | symbol): any {
          if (!(property in propCache)) {
            const descriptor = Reflect.getOwnPropertyDescriptor(prototype, property);

            // We receive descriptor, describing this property and check if it has getter. In
            // case it does, we must make it reactive. Otherwise, we return real value behind
            // this property.
            propCache[property] = descriptor && ('get' in descriptor)
              ? createMemo(() => (get() as any)[property])
              : () => Reflect.get(target, property);
          }
          return propCache[property]();
        },
      });
    });

    return withCacheSet({
      signal() {
        if (resource.error) {
          throw resource.error;
        }
        return value();
      },
      get error() {
        return resource.error;
      },
      cleanup,
    });
  };

  // Effect, responsible for debug mode.
  createEffect(() => {
    setDebug(props.debug || false);
  });

  // Effect, responsible for initializing the app in the web version of Telegram.
  createEffect(() => {
    if (isIframe()) {
      onCleanup(initWeb(props.acceptCustomStyles));
    }
  });

  // On unmount, cleanup all created items.
  onCleanup(() => {
    cache.forEach(c => c.cleanup && c.cleanup());
  });

  return <SDKContext.Provider value={use}>{props.children}</SDKContext.Provider>;
};
