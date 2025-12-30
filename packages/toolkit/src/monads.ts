import {
  BetterPromise,
  type BetterPromiseExecutorContext,
  type BetterPromiseOptions,
  type TimeoutError,
} from 'better-promises';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';

import type { AnyFn } from '@/types/misc.js';

export type AnyEither<L = any, R = any> = E.Either<L, R> | TE.TaskEither<L, R>;
export type AnyFnAnyEither<L = any, R = any> = (...args: any) => AnyEither<L, R>;

export type RightOfEither<T extends AnyEither> = [T] extends [E.Either<any, infer U>]
  ? U
  : T extends TE.TaskEither<any, infer U>
    ? U
    : never;
export type LeftOfEither<T extends AnyEither> = [T] extends [E.Either<infer U, any>]
  ? U
  : T extends TE.TaskEither<infer U, any>
    ? U
    : never;
export type RightOfReturn<F extends AnyFnAnyEither> = RightOfEither<ReturnType<F>>;
export type LeftOfReturn<F extends AnyFnAnyEither> = LeftOfEither<ReturnType<F>>;

export type MaybeMonadToCommon<T> = [T] extends [E.Either<any, infer U>]
  ? U
  : T extends TE.TaskEither<any, infer U>
    ? BetterPromise<U>
    : T;

export type MaybeCommonToMonad<T> = T extends AnyEither
  ? T
  : T extends PromiseLike<infer U>
    ? TE.TaskEither<unknown, U>
    : E.Either<unknown, T>;

export type MaybeMonadReturnTypeToCommon<Fn extends AnyFn> = MaybeMonadToCommon<ReturnType<Fn>>;

export type MaybeCommonReturnTypeToMonad<Fn extends AnyFn> = MaybeCommonToMonad<ReturnType<Fn>>;

export function throwifyAnyEither<E extends AnyEither>(either: E): MaybeMonadToCommon<E> {
  const onError = (e: unknown) => {
    throw e;
  };
  return (
    typeof either === 'function'
      ? BetterPromise.resolve(pipe(either, TE.match(onError, data => data))())
      : pipe(either, E.match(onError, data => data))
  ) as MaybeMonadToCommon<E>;
}

// #__NO_SIDE_EFFECTS__
export function throwifyFpFn<Fn extends AnyFnAnyEither>(
  fn: Fn,
): (
  & ((...args: Parameters<Fn>) => MaybeMonadReturnTypeToCommon<Fn>)
  & { [K in keyof Fn]: Fn[K] }
) {
  return Object.assign(
    (...args: Parameters<Fn>) => {
      return throwifyAnyEither(fn(...args)) as MaybeMonadReturnTypeToCommon<Fn>;
    },
    fn,
  );
}

export type BetterTaskEitherError = TimeoutError;

export const BetterTaskEither = /* #__PURE__ */ Object.assign(
  <E, T>(
    executor: (
      resolve: (data: T) => void,
      reject: (reason: E) => void,
      context: BetterPromiseExecutorContext<E.Either<E | BetterTaskEitherError, T>>,
    ) => (void | Promise<void>),
    options?: BetterPromiseOptions,
  ): TE.TaskEither<E | BetterTaskEitherError, T> => {
    return pipe(
      TE.tryCatch(
        () => {
          return new BetterPromise<E.Either<E, T>>((res, _rej, context) => {
            return executor(
              result => res(E.right(result)),
              error => res(E.left(error)),
              context,
            );
          }, options);
        },
        e => e as E,
      ),
      TE.chainW(E.match(TE.left, TE.right<E, T>)),
    );
  },
  {
    fn: <E, T>(
      fn: (context: BetterPromiseExecutorContext<E.Either<E | BetterTaskEitherError, T>>) => (
        E.Either<E, T> | TE.TaskEither<E, T>
      ),
      options?: BetterPromiseOptions,
    ): TE.TaskEither<E | BetterTaskEitherError, T> => {
      return BetterTaskEither<E, T>((resolve, reject, context) => {
        const result = fn(context);
        void pipe(
          typeof result === 'function' ? result : TE.fromEither(result),
          TE.matchW(reject, resolve),
        )();
      }, options);
    },
  },
);
