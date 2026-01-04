import type { PopupParams, PopupButton } from '@tma.js/bridge';
import { either as E } from 'fp-ts';

import { InvalidArgumentsError } from '@/errors.js';
import type { ShowOptions } from '@/features/Popup/types.js';

/**
 * Prepares popup parameters before sending them to native app.
 * @param params - popup parameters.
 */
export function prepareParams(params: ShowOptions): E.Either<InvalidArgumentsError, PopupParams> {
  const message = params.message.trim();
  const title = (params.title || '').trim();
  const paramsButtons = params.buttons || [];

  if (title.length > 64) {
    return E.left(new InvalidArgumentsError(`Invalid title: ${title}`));
  }
  if (!message || message.length > 256) {
    return E.left(new InvalidArgumentsError(`Invalid message: ${message}`));
  }
  if (paramsButtons.length > 3) {
    return E.left(new InvalidArgumentsError(`Invalid buttons count: ${paramsButtons.length}`));
  }

  const buttons: PopupButton[] = [];
  if (!paramsButtons.length) {
    buttons.push({ type: 'close', id: '' });
  } else {
    for (let i = 0; i < paramsButtons.length; i++) {
      const button = paramsButtons[i];
      const id = button.id || '';
      if (id.length > 64) {
        return E.left(new InvalidArgumentsError(`Button with index ${i} has invalid id: ${id}`));
      }

      if (!button.type || button.type === 'default' || button.type === 'destructive') {
        const text = button.text.trim();
        if (!text || text.length > 64) {
          return E.left(new InvalidArgumentsError(`Button with index ${i} has invalid text: ${text}`));
        }
        buttons.push({ type: button.type, text, id });
      } else {
        buttons.push({ type: button.type, id });
      }
    }
  }

  return E.right({ title, message, buttons });
}
