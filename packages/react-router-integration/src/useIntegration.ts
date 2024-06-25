import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Location, Navigator, To, NavigateOptions } from 'react-router-dom';
import { BrowserNavigator, createSafeURL, urlToPath } from '@telegram-apps/sdk';

/**
 * Uses the passed Mini Apps navigator and returns a tuple containing reactive values
 * representing current location and react-router-dom navigator.
 * @param nav - Mini Apps navigator.
 */
export function useIntegration<State>(nav: BrowserNavigator<State>): [Location, Navigator] {
  // Creates location based on the Mini Apps navigator.
  const createLocation = useCallback((): Location => ({
    state: nav.state,
    key: nav.id,
    pathname: nav.pathname,
    hash: nav.hash,
    search: nav.search,
  }), [nav]);

  const [location, setLocation] = useState(createLocation);

  // todo: We should check if state is always State.
  const navigate = useCallback((to: To, state?: State, options?: NavigateOptions) => {
    options ||= {};
    if (state === undefined) {
      state = options.state;
    }
    const path = urlToPath(to);
    if (options.replace) {
      nav.replace(path, state);
    } else {
      nav.push(path, state);
    }
  }, [nav]);

  // Create Navigator appropriate to the react-router-dom package.
  const navigator = useMemo<Navigator>(() => ({
    go(delta) {
      nav.go(delta);
    },
    push: navigate,
    replace: navigate,
    createHref: (to) => nav.renderPath(urlToPath(to)),
    encodeLocation: (to) => createSafeURL(nav.renderPath(urlToPath(to))),
  }), [nav]);

  // When Mini Apps navigator changes its location, we should actualize the reactive values.
  useEffect(() => {
    return nav.on('change', () => setLocation(createLocation()));
  }, [nav, createLocation]);

  return [location, navigator];
}
