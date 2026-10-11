export type CallbackFn = () => void;

/**
 * Returns a tuple, containing function to add cleanup, call cleanup, and flag showing whether
 * cleanup was called. Cleanup will not be performed in case, it was done before.
 */
export function createCbCollector(...cbs: (CallbackFn | CallbackFn[])[]): [
  add: (...fns: CallbackFn[]) => void,
  call: () => void,
] {
  const callbacks = cbs.flat(1);

  return [
    callbacks.push.bind(callbacks),
    () => {
      callbacks.forEach(cb => {
        cb();
      });
    },
  ];
}
