# Globals

By globals, we mean global values used across functions in the package.

## Enabling Debug Mode

Enabling debug mode leads to showing additional useful logs. To enable or disable it, use the
`setDebug` function. To get the current state, use `isDebug`.

```ts
import { isDebug, setDebug } from '@tma.js/bridge';

setDebug(true);
isDebug(); // true
```

In debug mode, the package logs every method call and every received event. Events are received
only while there is at least one [event listener](events.md), so enabling debug mode alone doesn't
make the package start listening to events.

## Changing Logger

By default, the package logs messages to the console with the `Bridge` prefix. To use your own
logger, pass an object with the `log`, `warn` and `error` methods to `setLogger`. Call it without
arguments to restore the default logger. `getLogger` returns the current one.

```ts
import { getLogger, setLogger } from '@tma.js/bridge';

setLogger({
  log: (...args) => console.log('[bridge]', ...args),
  warn: (...args) => console.warn('[bridge]', ...args),
  error: (...args) => console.error('[bridge]', ...args),
});

getLogger().warn('Something happened');

// Restore the default logger.
setLogger();
```

Only `log` depends on the debug mode. Warnings (for example, from `createPostEvent` in the
`'non-strict'` mode) and errors (for example, thrown by event listeners) are always reported.

## Changing Target Origin

In Telegram Web clients, the app is opened in an iframe, and the package calls methods using the
`window.parent.postMessage` function. This function requires specifying the target origin to make
sure messages are only sent to the trusted parent window. By default, the package uses
`https://web.telegram.org`.

```ts
import { getTargetOrigin, setTargetOrigin } from '@tma.js/bridge';

setTargetOrigin('https://i-know-what-i-am.doing');
getTargetOrigin(); // 'https://i-know-what-i-am.doing'
```

> [!DANGER]
> It is strongly recommended not to override this value, as it could lead to security issues.
> Specify this value only when you are certain of its impact.

## Resetting Globals

To return the package to its initial state, for example, between tests, reset every global
separately:

```ts
import { offAll, setDebug, setLogger, setTargetOrigin } from '@tma.js/bridge';

offAll();
setDebug(false);
setLogger();
setTargetOrigin('https://web.telegram.org');
```
