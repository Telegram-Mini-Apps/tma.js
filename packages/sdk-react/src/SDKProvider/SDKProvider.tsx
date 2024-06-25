import { CleanupFn, initWeb, isIframe, setDebug } from '@telegram-apps/sdk';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AnyFn } from '@telegram-apps/sdk';

import { SDKContext } from './SDKContext.js';
import {
  SDKContextType,
  SDKProviderProps,
  SDKContextItem,
} from './SDKProvider.types.js';

/**
 * Provides access to the SDK components and initializes some event listeners for the web version
 * of Telegram.
 */
export function SDKProvider({ children, acceptCustomStyles, debug }: SDKProviderProps) {
  // We need it to safely call state setters as long as React forbids these
  // operations on unmounted components.
  const isMountedRef = useRef(true);

  // Map, containing all registered factories results.
  const [cache, setCache] = useState(new Map<AnyFn, SDKContextItem<any>>());
  const cacheRef = useRef(cache);

  // Safely mutates cache with specified function.
  const mutateCache = useCallback(
    (mutate?: (state: Map<AnyFn, SDKContextItem<any>>) => void) => {
      if (isMountedRef.current) {
        setCache(c => {
          mutate && mutate(c);
          return new Map(c);
        });
      }
    }, [],
  );

  const context = useMemo<SDKContextType>(() => ({
    use(factory, ...args) {
      // Try to get a cached value.
      const cached = cache.get(factory);
      if (cached) {
        return cached;
      }

      // Call factory and retrieve result.
      let result: any;
      let error: any;
      try {
        result = factory(...args);
      } catch (err) {
        error = err;
      }

      function withCacheSet(item: SDKContextItem<any>): SDKContextItem<any> {
        cache.set(factory, item);
        return item;
      }

      // If an error occurred, return it.
      if (error) {
        return withCacheSet({ error });
      }

      // Result may represent a tuple, where a result is placed on the first place, and
      // a cleanup function on the second one.
      let cleanup: CleanupFn | undefined;
      if (Array.isArray(result)) {
        cleanup = result[1];
        result = result[0];
      }

      // We may have a case, when result is empty (most likely undefined), for example, when
      // we initialize InitData. In this case we just return the result.
      if (!result) {
        return withCacheSet({ result, cleanup });
      }

      // Adds change event listener to the value if required, and adds bound listener to the
      // cleanup function.
      function finalize(v: any): SDKContextItem<any> {
        if ('on' in v) {
          // Forcefully refresh cache in case, something in this value changed.
          const off = v.on('change', () => mutateCache());
          const cleanupOriginal = cleanup;
          cleanup = () => {
            cleanupOriginal && cleanupOriginal();
            off();
          };
        }
        return { result: v, cleanup };
      }

      if (result instanceof Promise) {
        result.then(
          (value: any) => mutateCache(c => c.set(factory, finalize(value))),
          (error: any) => mutateCache(c => c.set(factory, { error })),
        );
        return withCacheSet({});
      }
      return withCacheSet(finalize(result));
    },
  }), [cache]);

  // Effect, responsible for changing mount state.
  useEffect(() => {
    // An idiotic line for React's StrictMode.
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Effect, responsible for initializing the app in the web version of Telegram.
  useEffect(() => {
    if (isIframe()) {
      return initWeb(acceptCustomStyles);
    }
  }, [acceptCustomStyles]);

  // Effect, responsible for debug mode.
  useEffect(() => {
    setDebug(debug || false);
  }, [debug]);

  // Every time cache changes, we should actualize the ref to it. It is used in the next
  // effect.
  useEffect(() => {
    cacheRef.current = cache;
  }, [cache]);

  // Effect, responsible for removing all components "change" listeners.
  useEffect(() => {
    return () => {
      cacheRef.current.forEach(v => {
        'cleanup' in v && v.cleanup && v.cleanup();
      });
    };
  }, []);

  return <SDKContext.Provider value={context}>{children}</SDKContext.Provider>;
}
