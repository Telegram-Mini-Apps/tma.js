import { retrieveRawInitDataFp, retrieveLaunchParamsFp } from '@tma.js/bridge';
import { either as E, function as fn, option as O } from 'fp-ts';

import { InitData } from '@/features/InitData/InitData.js';

function instantiate() {
  return new InitData({
    retrieveInitData() {
      return fn.pipe(
        E.Do,
        E.bindW('obj', () => fn.pipe(
          retrieveLaunchParamsFp(),
          E.map(({ tgWebAppData }) => {
            return tgWebAppData ? O.some(tgWebAppData) : O.none;
          }),
        )),
        E.bindW('raw', retrieveRawInitDataFp),
        E.map(({ obj, raw }) => {
          return fn.pipe(
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
