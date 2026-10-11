import { backButton, init, mockTelegramEnv } from '@tma.js/sdk';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { useComputed } from './useComputed.js';
import { createSource } from '../test/createSource.js';

let root: Root;
let container: HTMLElement;

function render(useValue: () => unknown): void {
  function App() {
    return String(useValue());
  }
  act(() => root.render(createElement(App)));
}

beforeEach(() => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div');
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
});

describe('useComputed', () => {
  it('should re-render with the value when it changes', () => {
    const source = createSource(0);
    render(() => useComputed(source.computed));
    expect(container.textContent).toBe('0');
    act(() => source.set(1));
    expect(container.textContent).toBe('1');
  });

  it('should unsubscribe on unmount', () => {
    const source = createSource(0);
    render(() => useComputed(source.computed));
    expect(source.listeners.size).toBe(1);
    act(() => root.unmount());
    expect(source.listeners.size).toBe(0);
    root = createRoot(container);
  });

  it('should work with SDK components', () => {
    mockTelegramEnv();
    init({
      launchParams: {
        tgWebAppPlatform: 'tdesktop',
        tgWebAppVersion: '9.0',
        tgWebAppThemeParams: {},
      },
    });
    backButton.mount();
    render(() => useComputed(backButton.isVisible));
    expect(container.textContent).toBe('false');
    act(() => backButton.show());
    expect(container.textContent).toBe('true');
  });
});
