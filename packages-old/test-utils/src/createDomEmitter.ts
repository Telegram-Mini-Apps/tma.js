export interface DomEmitter {
  addEventListener(event: string, cb: (event: Event) => void): void;
  removeEventListener(event: string, cb: (event: Event) => void): void;
  dispatchEvent(event: Event): void;
}

/**
 * Removes simple emitter, which could be used in tests.
 */
export function createDomEmitter(): DomEmitter {
  const listeners: Record<string, ((...args: any) => any)[]> = {};

  return {
    addEventListener(event, cb) {
      if (listeners[event] === undefined) {
        listeners[event] = [];
      }
      listeners[event].push(cb);
    },
    removeEventListener(event, cb) {
      const eventListeners = listeners[event] || [];
      if (eventListeners.includes(cb)) {
        eventListeners.splice(eventListeners.indexOf(cb), 1);
      }
    },
    dispatchEvent(event): void {
      const cbs = listeners[event.type] || [];
      cbs.forEach(cb => cb(event));
    },
  };
}
