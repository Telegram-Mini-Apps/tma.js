import { retrieveRawInitDataFp, retrieveLaunchParamsFp } from '@tma.js/bridge';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';

import { InitData } from '@/features/InitData/InitData.js';

function instantiate() {
  return new InitData({
    retrieveInitData() {
      return pipe(
        E.Do,
        E.bindW('obj', () => pipe(
          retrieveLaunchParamsFp(),
          E.map(({ tgWebAppData }) => {
            return tgWebAppData ? O.some(tgWebAppData) : O.none;
          }),
        )),
        E.bindW('raw', retrieveRawInitDataFp),
        E.map(({ obj, raw }) => {
          return pipe(
            O.Do,
            O.bind('obj', () => obj),
            O.bind('raw', () => raw),
          );
        }),
      );
    },
  });
}

export const initData = /* @__PURE__*/ instantiate();
