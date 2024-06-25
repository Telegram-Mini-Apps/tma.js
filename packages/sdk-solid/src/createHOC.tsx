import { type Component, mergeProps } from 'solid-js';
import type { PartialBy } from '@telegram-apps/sdk';

import type { Hook } from './createHook.js';

export interface HOC<H extends Hook<any>> {
  <PropKey extends string, Props extends { [K in PropKey]: ReturnType<H> }>(
    prop: PropKey,
    Component: Component<Props>,
    ...args: Parameters<H>
  ): Component<PartialBy<Props, PropKey>>;
}

/**
 * Based on the passed hook, creates function returning HOC. Created HOC passes hook result
 * to the wrapped component.
 * @param hook - hook returning component.
 */
export function createHOC<H extends Hook<any>>(hook: H): HOC<H> {
  return (prop, Component, ...args) => {
    return (props) => {
      return <Component {...mergeProps({ [prop]: hook(...args) }, props) as any}/>;
    };
  };
}
