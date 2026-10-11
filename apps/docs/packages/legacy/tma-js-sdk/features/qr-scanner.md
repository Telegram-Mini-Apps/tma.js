# 💠QR Scanner

The component which provides the QR scanner functionality.

## Capturing a Single QR

To capture a single QR, use the `capture` method with the `capture` option.

```ts
import { qrScanner } from '@tma.js/sdk';

const promise = qrScanner.capture({
  capture(scannedQr) {
    return scannedQr === 'expected qr by me';
  },
});
// qrScanner.isOpened() -> true
const qr = await promise;
// qrScanner.isOpened() -> false
```

The `capture` option should return true if the captured QR should be returned. After resolving the promise, the QR
scanner will be closed automatically. 

Note that the promise may also resolve with `undefined` in case the QR scanner was closed.

## Capturing Multiple QR-s

To capture multiple QR-s, use the `open` method with the `onCaptured` option.

```ts
import { qrScanner } from '@tma.js/sdk';

const promise = qrScanner.open({
  onCapture(scannedQr) {
    if (scannedQr === 'expected qr by me') {
      console.log('Ok, we got a valid QR');
      qrScanner.close();
    }
  },
});
// qrScanner.isOpened() -> true
await promise;
// qrScanner.isOpened() -> false
```

In this case, you should close the QR scanner by yourself when it is needed.
