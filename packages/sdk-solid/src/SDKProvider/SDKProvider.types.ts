import type { AnyFn, CleanupFn } from '@telegram-apps/sdk';
import type { ParentProps } from 'solid-js';

export interface SDKProviderProps extends ParentProps {
  /**
   * True if SDK should accept styles sent from the Telegram web application. This option is only
   * used in web versions of Telegram.
   * @default true
   */
  acceptCustomStyles?: boolean;
  /**
   * Enables debug mode.
   * @default false
   */
  debug?: boolean;
}

type ExtractResult<T> = T extends [result: infer R, cleanup: CleanupFn]
  ? ExtractResult<R>
  : T extends Promise<infer U>
    ? U | undefined
    : T;

interface FactorySignalFn<Factory extends AnyFn> {
  /**
   * Returns factory execution result.
   * @throws An error, if it occurred during factory call. Use the "error" property before
   * to check if something went wrong.
   */
  (): ExtractResult<ReturnType<Factory>>;
}

export interface FactorySignal<Factory extends AnyFn> extends FactorySignalFn<Factory> {
  /**
   * Error occurred during factory call.
   */
  error?: unknown;
}

export interface SDKContextItem<Factory extends AnyFn> {
  /**
   * Function, to cleanup this item.
   */
  cleanup?: CleanupFn;
  /**
   * Error occurred during factory call.
   */
  error?: unknown;
  /**
   * Signal to retrieve the result.
   */
  signal: FactorySignalFn<Factory>;
}

export interface SDKContextType {
  /**
   * Uses specified factory with the passed arguments. In case, this factory was called
   * previously, its previous result will be returned.
   * @param factory - factory function.
   * @param args - factory arguments.
   */<Fn extends AnyFn>(factory: Fn, ...args: Parameters<Fn>): SDKContextItem<Fn>;
}
