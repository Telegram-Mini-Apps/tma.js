import { type BaseRouterProps, createRouter as createSolidRouter } from '@solidjs/router';
import { type BrowserNavigator, getHash, urlToPath } from '@telegram-apps/sdk';
import type { Component } from 'solid-js';

/**
 * Guard against selector being an invalid CSS selector.
 * @param selector - CSS selector.
 */
function querySelector<T extends Element>(selector: string) {
  try {
    return document.querySelector<T>(selector);
  } catch {
    return null;
  }
}

/**
 * Scrolls to specified hash.
 * @param hash - hash to scroll to.
 * @param fallbackTop - should scroll be performed to the beginning of the page in case
 * hash was not found on the page.
 */
function scrollToHash(hash: string, fallbackTop: boolean) {
  const el = querySelector(`#${hash}`);
  if (el) {
    el.scrollIntoView();
    return;
  }

  if (fallbackTop) {
    window.scrollTo(0, 0);
  }
}

/**
 * Creates a new Router for the application.
 * @param navigator - browser navigator.
 */
export function createRouter<State>(
  navigator: BrowserNavigator<State>,
): Component<BaseRouterProps> {
  return createSolidRouter({
    get: () => navigator.path,
    init: (notify) => navigator.on('change', () => notify()),
    set: ({ value, state, ...next }) => {
      // TODO: We should check all cases with the "state" variable. Not sure, if it always fits
      //  the typing of State.
      if (next.replace) {
        navigator.replace(value, state as State);
      } else {
        navigator.push(value, state as State);
      }

      const hash = getHash(value);
      if (hash) {
        scrollToHash(hash, next.scroll || false);
      }
    },
    utils: {
      go: (delta) => navigator.go(delta),
      renderPath: (path) => navigator.renderPath(path),
      parsePath: (path) => urlToPath(navigator.parsePath(path)),
    },
  });
}
