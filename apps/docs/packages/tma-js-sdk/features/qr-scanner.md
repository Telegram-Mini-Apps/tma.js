# 💠QR Scanner

A component responsible for the native QR scanner. The scanner is supported since Mini Apps v6.4.

## Checking Support

To check if the scanner can be used, call the `isSupported` function. It returns `true` if the SDK
is [initialized](../initializing.md) and the Telegram client supports the scanner.

```ts
import { qrScanner } from '@tma.js/sdk';

qrScanner.isSupported(); // boolean
```

## Capturing a Single QR

To capture a single QR code, use the `capture` method. It opens the scanner and returns a promise,
resolved with the captured QR code content, or `undefined` if the scanner was closed without
capturing anything. When a QR code is captured, the scanner is closed. While the scanner is opened,
the `isOpened` computed value is `true`.

```ts
const promise = qrScanner.capture();
qrScanner.isOpened(); // true

const qr = await promise; // string | undefined
qrScanner.isOpened(); // false
```

By default, the first scanned QR code is captured. To capture only specific QR codes, pass the
`capture` option. It receives the scanned QR code content and returns `true` if it should be
captured:

```ts
const url = await qrScanner.capture({
  text: 'Scan the payment link',
  capture: qr => qr.startsWith('https://'),
});
```

The method accepts an optional object with the following properties:

- `text?: string`: text displayed under the scanner, 0-64 characters;
- `capture?: (qr: string) => boolean`: function deciding if the scanned QR code should be
  captured;
- `timeout?: number`: time in milliseconds to wait for a QR code to be captured;
- `signal?: AbortSignal`: signal to abort the operation.

When the timeout is reached or the signal is aborted, the scanner is closed.

## Capturing Multiple QR Codes

To process multiple QR codes, use the `open` method with the `onCaptured` option. The scanner
stays opened until the user closes it, or until you call the `close` method. The method returns a
promise resolved when the scanner is closed.

```ts
const promise = qrScanner.open({
  text: 'Scan the tickets',
  onCaptured(qr) {
    if (isLastTicket(qr)) {
      qrScanner.close();
    }
  },
});
qrScanner.isOpened(); // true

await promise;
qrScanner.isOpened(); // false
```

Besides `onCaptured`, the method accepts the `text`, `timeout` and `signal` options described
above.

## Closing

To close the scanner, use the `close` method. It throws `NotInitializedError` if the SDK is not
initialized, and `MethodUnsupportedError` if the scanner is unsupported.

```ts
qrScanner.close();
```

## Errors

The promises returned by `capture` and `open` are rejected with:

- `NotInitializedError` if the SDK is not initialized;
- `MethodUnsupportedError` if the scanner is unsupported;
- `ConcurrentCallError` if the scanner is already opened;
- `TimeoutError` if the operation didn't complete in time;
- `signal.reason` if the signal was aborted.

The `safeCapture` and `safeOpen` methods return `TimeoutError` as a result instead of throwing it:

```ts
const result = await qrScanner.safeCapture({ timeout: 30_000 });
if (result.ok) {
  console.log('Captured:', result.data); // string | undefined
} else {
  console.error('Nothing was captured in time');
}
```
