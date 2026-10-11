import type { If, IsNever, IsUndefined, Or } from '@tma.js/toolkit';
import mitt, {
  type Emitter,
  type EventHandlerMap,
  type EventType,
  type Handler,
} from 'mitt';

export type WildcardHandler<E> = Handler<{
  [K in keyof E]: {
    name: K;
    payload: If<Or<IsNever<E[K]>, IsUndefined<E[K]>>, never, E[K]>;
  };
}[keyof E]>;

export interface OnFn<E> {
  /**
   * Adds a new listener for the specified event.
   * @param type - event name.
   * @param handler - event listener.
   * @param once - should this listener be called only once.
   * @returns Function to remove bound event listener.
   */
  <K extends keyof E>(type: K, handler: Handler<E[K]>, once?: boolean): VoidFunction;
  /**
   * Adds a listener to the wildcard event.
   * @param type - event name.
   * @param handler - event listener.
   * @param once - should this listener be called only once.
   * @returns Function to remove bound event listener.
   */
  (type: '*', handler: WildcardHandler<E>, once?: boolean): VoidFunction;
}

export interface OffFn<E> {
  /**
   * Removes a listener from the specified event.
   * @param type - event to listen.
   * @param handler - event listener to remove.
   * @param once - had this listener to be called only once.
   */
  <K extends keyof E>(type: K, handler: Handler<E[K]>, once?: boolean): void;
  /**
   * Removes a listener from the wildcard event.
   * @param type - event to stop listening.
   * @param handler - event listener to remove.
   * @param once - should this listener be called only once.
   */
  (type: '*', handler: WildcardHandler<E>, once?: boolean): void;
}

export interface EmitFn<E> {
  <K extends keyof E>(type: K, event: E[K]): void;
  <K extends keyof E>(type: undefined extends E[K] ? K : never): void;
}

/**
 * Creates a new enhanced event emitter.
 * @param onFirst - a function to call every time when the events map appeared to be empty during
 * the event listener creation.
 * @param onEmpty - a function to call every tume when the events map became empty.
 */
export function createEmitter<E extends object>(
  onFirst: VoidFunction,
  onEmpty: VoidFunction,
): {
  on: OnFn<E>;
  off: OffFn<E>;
  emit: EmitFn<E>;
  clear: VoidFunction;
} {
  // To understand the event handlers concept here, let's tell the underlying idea.
  //
  // We use a Map, where key is an event name, and the value is a Map we call HandlersMap.
  //
  // The HandlersMap is a Map, where the key is an event handler, added by the developer.
  // The corresponding value is a list of tuples, with an internally generated function and a
  // boolean value responsible for determining if the handler must be called only once. So, you
  // can imagine the following map as:
  //
  // HandlersMap {
  //   { developer_handler }: Array<[ internally_created_handler, once ]>;
  // }
  //
  // The value for the key represents an array of tuples, as long as a single handler may be added
  // many times, and for each addition we add a new tuple entry.
  //
  // The handler may also be added to be called only once. Trying to remove such kind of handler
  // using a different value of the "once" argument will lead to nothing. The developer must
  // specify the same argument value to avoid confusions.
  //
  // Here is the final EventToHandlersMap definition:
  //
  // EventToHandlersMap {
  //   { event_name }: HandlersMap {
  //     { developer_handler }: Array<[ internally_created_handler, once ]>;
  //   }
  // }
  type HandlersMap = Map<
    (...args: any) => void,
    [handler: (...args: any) => void, once: boolean][]
  >;

  const eventToHandlersMap = new Map<keyof E | '*', HandlersMap>();

  const emitter = (mitt as any as {
    <E extends Record<EventType, unknown>>(all?: EventHandlerMap<E>): Emitter<E>;
  })<E & Record<string | symbol, unknown>>();

  const off: OffFn<E> = (
    event: keyof E | '*',
    handler: (...args: any) => void,
    once = false,
  ) => {
    const handlersMap: HandlersMap = eventToHandlersMap.get(event) || new Map();
    eventToHandlersMap.set(event, handlersMap);

    const handlers = handlersMap.get(handler) || [];
    handlersMap.set(handler, handlers);

    const index = handlers.findIndex(item => item[1] === once);
    if (index >= 0) {
      // Remove the related handler.
      emitter.off(event, handlers[index][0]);

      // Remove the handler from the cache array.
      handlers.splice(index, 1);

      // If after removal, there are no handlers left, we should remove the entry from the cache.
      if (!handlers.length) {
        handlersMap.delete(handler);
        if (!handlersMap.size) {
          const prevSize = eventToHandlersMap.size;
          eventToHandlersMap.delete(event);
          prevSize && !eventToHandlersMap.size && onEmpty();
        }
      }
    }
  };

  return {
    on(event: keyof E | '*', handler: (...args: any[]) => any, once?: boolean) {
      // The events' map became non-empty. Call the onFirst callback.
      !eventToHandlersMap.size && onFirst();

      const cleanup = () => {
        off(event as any, handler, once);
      };

      const internalHandler = (...args: any[]) => {
        once && cleanup();
        if (event === '*') {
          handler({ name: args[0], payload: args[1] });
        } else {
          handler(...args);
        }
      };

      emitter.on(event, internalHandler);

      // Add this handler to the cache, so we could remove it using the passed listener.
      const handlersMap: HandlersMap = eventToHandlersMap.get(event) || new Map();
      eventToHandlersMap.set(event, handlersMap);

      const handlers = handlersMap.get(handler) || [];
      handlersMap.set(handler, handlers);
      handlers.push([internalHandler, once || false]);

      return cleanup;
    },
    off,
    // eslint-disable-next-line @typescript-eslint/unbound-method
    emit: emitter.emit,
    clear() {
      const prevSize = eventToHandlersMap.size;
      emitter.all.clear();
      eventToHandlersMap.clear();
      prevSize && onEmpty();
    },
  };
}
