# @tma.js/signals

<p style="display: flex; gap: 8px; min-height: 20px">
  <a href="https://npmjs.com/package/@tma.js/signals">
    <img src="https://img.shields.io/npm/v/@tma.js/signals?logo=npm"/>
  </a>
  <img src="https://img.shields.io/bundlephobia/minzip/@tma.js/signals"/>
  <a href="https://github.com/Telegram-Mini-Apps/telegram-apps/tree/master/tma.js/signals">
    <img src="https://img.shields.io/badge/source-black?logo=github"/>
  </a>
</p>

Our own implementation of signals we are using across the `@tma.js` packages.

## Installation

::: code-group

```bash [pnpm]
pnpm i @tma.js/signals
```

```bash [npm]
npm i @tma.js/signals
```

```bash [yarn]
yarn add @tma.js/signals
```

:::

## Signal

The `signal` function is the simplest signal constructor used by other package functions. To
create a new signal, simply pass the initial value:

```ts
import { signal } from '@tma.js/signals';

const isVisible = signal(false);
```

The returned value represents a function with useful methods. The function itself returns the
current signal value.

```ts
console.log('The element is', isVisible() ? 'visible' : 'invisible');
```

The function also accepts options as the second argument. A developer can specify the
`equals` function, which accepts the current and incoming values and should return true,
if they are considered equal.

```ts
const s = signal(10, {
  equals(current, next) {
    // Will not update the signal if the next value is
    // higher than the current one.
    return next > current;
  }
});
s.set(20); // will not update the signal
s.set(5); // will update the signal
```

### `set`

To set a new value, use the `set` method:

```ts
isVisible.set(true);
```

### `sub`

To track signal changes, use the `sub` method. It returns a function that removes the bound
listener. The listener accepts two arguments: the current and previous values, respectively.

```ts
const removeListener = isVisible.sub((current, prev) => {
  console.log('Value changed from', prev, 'to', current);
});

// Remove the listener whenever needed.
removeListener();
```

To call the listener only once, use the second:

```ts
function listener(current: boolean, prev: boolean) {
  console.log('Value changed from', prev, 'to', current);
}

isVisible.sub(listener, true);
// or
isVisible.sub(listener, { once: true });
```

### `unsub`

Alternatively, to remove a listener, a developer can use the `unsub` method:

```ts
function listener(current: boolean, prev: boolean) {
  console.log('Value changed from', prev, 'to', current);
}

isVisible.sub(listener);

// Remove the listener whenever needed.
isVisible.unsub(listener);
```

### `unsubAll`

To remove all listeners, use the `unsubAll` method:

```ts
isVisible.unsubAll();
```

::: info

This method does not remove listeners added by computed signals.

:::

### `reset`

To revert to the initially specified value, use the `reset` method:

```ts
import { signal } from '@tma.js/signals';

const isVisible = signal(false);
isVisible.set(true); // isVisible becomes true
isVisible.reset(); // isVisible becomes false again
```

### `destroy`

When the signal is no longer needed and is not being listened to by any computed signal, a developer
can use the `destroy` method, which forcibly removes all listeners:

```ts
isVisible.destroy();
```

## Computed

The `computed` function constructs a computed signal, which is automatically recalculated when any
of the called signals change.

Here’s an example:

```ts
import { signal, computed } from '@tma.js/signals';

const a = signal(2);
const b = signal(2);
const sum = computed(() => a() + b()); // 4

a.set(5); // sum becomes 7
b.set(5); // sum becomes 10
```

The returned value represents a signal that lacks the `set` and `reset` methods.

## Batching Changes

The `batch` function creates a scope where signal mutations are batched.

It’s useful when a developer wants to prevent a computed signal from recomputing every time several
dependent signals change consecutively.

```ts
import { signal, computed, batch } from '@tma.js/signals';

const a = signal(1);
const b = signal(2);
const c = signal(3);
const sum = computed(() => a() + b() + c()); // 6

// Without batching, re-computation happens 3 times:
a.set(2); // sum recomputes and becomes 7
b.set(3); // sum recomputes and becomes 8
c.set(4); // sum recomputes and becomes 9

// Reset each signal.
a.reset();
b.reset();
c.reset();
// Note: reset calls the set method, which also causes
// the sum signal to recompute.

// Now, let's optimize using the batch function:
batch(() => {
  a.set(2);
  b.set(3);
  c.set(4);
});
// At this point, sum will recompute only once because
// batch causes the sum signal to wait for the function to complete,
// and then it triggers the recomputation.
console.log(sum()); // 9
```
