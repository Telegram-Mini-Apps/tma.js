import { on } from '@tma.js/bridge';

import { pipe } from 'fp-ts/function';

import { QrScanner } from '@/features/QrScanner/QrScanner.js';
import { sharedFeatureOptions } from '@/fn-options/sharedFeatureOptions.js';
import { withPostEvent } from '@/fn-options/withPostEvent.js';
import { withVersion } from '@/fn-options/withVersion.js';

function instantiate() {
  return new QrScanner({
    ...pipe(sharedFeatureOptions(), withPostEvent, withVersion),
    onClosed(listener) {
      return on('scan_qr_popup_closed', listener);
    },
    onTextReceived(listener) {
      return on('qr_text_received', event => {
        listener(event.data);
      });
    },
  });
}

export const qrScanner = /* @__PURE__*/ instantiate();
