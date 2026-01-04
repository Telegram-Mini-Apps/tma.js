import { throwifyFpFn, throwifyAnyEither, type AnyFn } from '@tma.js/toolkit';
import { function as fn, option as O } from 'fp-ts';

import type { WithChecksFp, WithChecks } from '@/with-checks/withChecksFp.js';

// #__NO_SIDE_EFFECTS__
export function throwifyWithChecksFp<
  Fn extends AnyFn,
  HasSupportCheck extends boolean,
  SupportsMapKeySchema extends string,
>(
  fn_: WithChecksFp<Fn, HasSupportCheck, SupportsMapKeySchema>,
): WithChecks<Fn, HasSupportCheck, SupportsMapKeySchema> {
  return Object.assign(throwifyFpFn(fn_), {
    ifAvailable(...args: Parameters<Fn>) {
      return fn.pipe(
        fn_.ifAvailable(...args),
        O.match(
          () => ({ ok: false }),
          data => ({
            ok: true,
            data: throwifyAnyEither(data),
          }),
        ),
      );
    },
  }) as unknown as WithChecks<Fn, HasSupportCheck, SupportsMapKeySchema>;
}
