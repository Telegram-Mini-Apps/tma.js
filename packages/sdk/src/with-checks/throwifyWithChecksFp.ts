import { throwifyFpFn, throwifyAnyEither, type AnyFn } from '@tma.js/toolkit';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';

import type { WithChecksFp, WithChecks } from '@/with-checks/withChecksFp.js';

// #__NO_SIDE_EFFECTS__
export function throwifyWithChecksFp<
  Fn extends AnyFn,
  HasSupportCheck extends boolean,
  SupportsMapKeySchema extends string,
>(
  fn: WithChecksFp<Fn, HasSupportCheck, SupportsMapKeySchema>,
): WithChecks<Fn, HasSupportCheck, SupportsMapKeySchema> {
  return Object.assign(throwifyFpFn(fn), {
    ifAvailable(...args: Parameters<Fn>) {
      return pipe(
        fn.ifAvailable(...args),
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
