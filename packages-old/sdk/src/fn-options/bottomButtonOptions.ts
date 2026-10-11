import type { EventName } from '@tma.js/bridge';
import { function as fn } from 'fp-ts';

import { buttonOptions } from '@/fn-options/buttonOptions.js';

// @__NO_SIDE_EFFECTS__
export function bottomButtonOptions<S, D>(
  storageName: string,
  trackedClickEvent: EventName,
  defaults: D,
) {
  return fn.pipe(
    buttonOptions<S>(storageName, trackedClickEvent),
    obj => ({ ...obj, defaults }),
  );
}
