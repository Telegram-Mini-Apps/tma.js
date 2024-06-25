# `BrowserNavigator`

`BrowserNavigator` is a class that implements navigation using the browser's History API. This
navigator extends the standard one, providing basic navigation functionality and logic specific to
the browser's history.

## Constructor

To create an instance of this class, developers can use the class constructor, which accepts history
items, a cursor (index) pointing to the entry in the history items list, and additional options:

```typescript
import { BrowserNavigator } from '@telegram-apps/sdk';

new BrowserNavigator(['/index'], 0);
new BrowserNavigator([{ pathname: '/a' }, { pathname: '/b' }], 1);
```

::: warning
If an empty history items list or a cursor pointing to a non-existent item is passed, the
constructor will throw an appropriate error.
:::

### `postEvent`

The `postEvent` function allows replacing a function that calls Mini Apps methods on behalf of the
navigator.

```ts
const n = new BrowserNavigator(['/'], 0, {
  postEvent(method, payload) {
    console.log('postEvent:', method, payload);
  },
});
```

### `hashMode`

The `hashMode` property allows a developer to set the navigation mode used by the navigator. Allowed
values are `classic` (`#pathname`), `slash` (`#/pathname`), and `null`. Passing the `null` value
switches the navigator from SPA mode to MPA mode, using the entire `href` instead of the hash part
of the location.

By default, the navigator uses the `classic` mode.

```ts
const n = new BrowserNavigator(['/'], 0, {
  hashMode: 'slash'
});
```

### `base`

The `base` property is responsible for parsing routes and rendering paths assuming that they must
start with the specified `base` value.

```ts
const n = new BrowserNavigator(['/'], 0, {
  hashMode: null,
  base: '/solidjs-template',
});

n.renderPath('/home'); // -> /solidjs-template/home
```

This value is only useful when you are using the MPA mode.

## `createBrowserNavigatorFromLocation`

To simplify the process of creating `BrowserNavigator`, the package provides
the `createBrowserNavigatorFromLocation` method. Depending on the options (which are constructor
options described previously) passed, it parses the current location and creates
a `BrowserNavigator` instance.

```typescript
import { createBrowserNavigatorFromLocation } from '@telegram-apps/sdk';

const navigator = createBrowserNavigatorFromLocation({
  hashMode: 'slash',
});
```

## `initNavigator`

The `initNavigator` function is responsible for creating a `BrowserNavigator` instance
using previously saved navigator state. It also automatically saves it in the session storage
for future state restoration.

This function accepts session storage key name, which will contain navigator's state and an 
optional object, representing navigator constructor options.

```ts
import { initNavigator } from '@telegram-apps/sdk';

const n = initNavigator('app-navigator-state', {
  hashMode: 'slash',
});
```

In case, the function was unable to restore the navigator using the session storage, it will
utilize the `createBrowserNavigatorFromLocation` function.

## Attaching

Creating an instance of `BrowserNavigator` and using its methods doesn't automatically update the
browser history. To achieve this, developers should attach it. Until then, the
navigator will only update its internal state and notify all its subscribers about changes. Manual
attachment is necessary to prevent situations where several navigators of this type are created,
each trying to control the browser history with its internal state.

To allow the navigator to control the browser's history, it is required to attach it via
the `attach` method:

```typescript
import { BrowserNavigator } from '@telegram-apps/sdk';

const navigator = new BrowserNavigator(...);

navigator.attach().then(() => {
  console.log('Attachment completed');
});
```

This method returns a promise that will be resolved when the attachment is completed.

To stop the navigator from modifying the browser's history, use the `detach` method:

```typescript
navigator.detach();
```

## Navigating

The navigator provides a list of methods for developers to manipulate the navigation history.

### `back`

Goes back in history by 1.

```typescript
navigator.back();
```

### `forward`

Goes forward in history by 1.

```typescript
navigator.forward();
```

### `go`

Changes the currently active history item index by the specified delta. This method doesn't change
the index if the updated index points to a non-existing history item. This behavior is preserved
until the `fit` argument is specified. If it is specified, the method adjusts the passed delta to
fit within the bounds `[0, history.length - 1]`.

```typescript
// Goes back in history by 3 entries.
navigator.go(-3);

// Will surely do nothing in real-world applications.
navigator.go(-100000);

// Will go back to the oldest entry.
navigator.go(-100000, true);

// Will go forward to the newest entry.
navigator.go(100000, true);
```

### `goTo`

Goes to the specified index. The method does nothing if the passed index is out of bounds.

If the `fit` option is specified and the index is out of bounds, it will be adjusted to the nearest
bound.

```typescript
// Will do nothing.
navigator.goTo(-1);

// Will go to the oldest entry.
navigator.goTo(0);

// Will surely do nothing in real-world applications.
navigator.goTo(100000);

// Will go back to the oldest entry.
navigator.goTo(-100000, true);

// Will go forward to the newest entry.
navigator.goTo(100000, true);
```

### `push`

Pushes a new history item. The method replaces all entries after the current one with the one being
pushed. Note that the passed item is always relative. If you want to use it as an absolute one, use
the `/` prefix. Example: `/absolute`, `{ pathname: '/absolute' }`.

To create a final path, the navigator uses a method, used in the URL class constructor, resolving a
path based on the current one.

In the upcoming examples, let's assume that the current entry is `/home/blog`.

#### Absolute pathname

Specifying an absolute path will not merge it with the current one; instead, it will be used in its
entirety:

```typescript
navigator.push('/database');
// or
navigator.push({ pathname: '/database' });
// Navigator will add a new entry, and the current one becomes /database
```

#### Relative pathname

Specifying a relative pathname will exhibit the same behavior as in the browser:

```typescript
navigator.push('license');
// or
navigator.push({ pathname: 'license' });
// Navigator will add a new entry, and the current one becomes /home/license
```

#### Search

To add an entry with query parameters, use a question mark (`?`) or the `search` entry property:

```typescript
navigator.push('?id=1');
// or
navigator.push({ search: '?id=1' });
// Navigator will add a new entry, and the current one becomes /home/blog?id=1
```

::: info
Pushing a new pathname with different or missing query parameters will result in the loss of current
query parameters. To prevent this, the developer should pass them again.
:::

#### Hash

Adding the hash part of the entry follows the same logic as [search](#search), but using a
hashtag (`#`) and the `hash` entry property.

```typescript
navigator.push('#introduction');
// or
navigator.push({ hash: '#introduction' });
// Navigator will add a new entry, and the current 
// one becomes /home/blog#introduction
```

### `replace`

The `replace` method functions similarly to the [push](#push) method, but it doesn't create a new
entry. Instead, it replaces the current one.

## Properties

### `index`

Current history cursor.

```typescript
const navigator = new BrowserNavigator(['/'], 0);
navigator.index; // 0
```

### `id`

Current history item identifier. The navigator generates them itself if an id is not specified
explicitly.

```typescript
const navigator = new BrowserNavigator(['/'], 0);
navigator.id; // 'abb721'

const navigator2 = new BrowserNavigator([{ id: 'a', pathname: '/' }], 0);
navigator2.id; // 'a'
```

### `hash`

Current history item hash.

```typescript
const navigator = new BrowserNavigator(['/#jungle'], 0);
navigator.hash; // "#jungle"
```

### `hasPrev`

True if the navigator has items before the current item.

```typescript
const navigator = new BrowserNavigator(['/'], 0);
navigator.hasPrev; // false

const navigator2 = new BrowserNavigator(['/a', '/b'], 1);
navigator2.hasPrev; // true
```

### `hasNext`

True if the navigator has items after the current item.

```typescript
const navigator = new BrowserNavigator(['/'], 0);
navigator.hasNext; // false

const navigator2 = new BrowserNavigator(['/a', '/b'], 0);
navigator2.hasNext; // true
```

### `history`

Safe to modify navigation history.

```typescript
const navigator = new BrowserNavigator(['/a#a-hash', '/b?b-query=1'], 0);
navigator.history;
// [
//   { pathname: '/a', hash: '#a-hash', search: '', id: 'ahJJ123' },
//   { pathname: '/b', hash: '', search: '?b-query=1', id: 'dd82' },
// ]
```

### `path`

Path, including pathname, search, and hash.

```typescript
const navigator = new BrowserNavigator([{
  pathname: '/a',
  hash: '#mama',
  search: '?joe',
}], 0);
navigator.path; // '/a?joe#mama'
```

### `pathname`

Current pathname. Always starts with a slash.

```typescript
const navigator = new BrowserNavigator([{
  pathname: '/a',
  hash: '#mama',
  search: '?joe',
}], 0);
navigator.pathname; // '/a'
```

### `search`

Current query parameters.

```typescript
const navigator = new BrowserNavigator([{
  pathname: '/a',
  hash: '#mama',
  search: '?joe',
}], 0);
navigator.search; // '?joe'
```

### `state`

Current history item state.

```typescript
const navigator = new BrowserNavigator([{ state: 'test' }], 0);


navigator.state; // 'test'
```

## Events

`BrowserNavigator` provides `on` and `off` methods to manage event listeners. Currently, the only
event available for listening is `change`. The `change` event's payload is an object containing the
following properties:

- `navigator: BrowserNavigator`: The related navigator instance.
- `delta: number`: The delta of the currently active item cursor.
- `from: { pathname: string; hash: string; search: string; id: string; state?: State }`: The
  previously active history item.
- `to`: An object with the same structure as `from`, representing the currently active history item.

### Adding an Event Listener

To add an event listener for the `change` event, use the `on` method:

```typescript
const removeEventListener = navigator.on('change', (ev) => {
  console.warn('Navigation state changed', ev);
});
```

### Removing an Event Listener

To remove an event listener, call the function returned by the `on` method:

```typescript
removeEventListener();
```

Alternatively, you could use the navigator's `off` method:

```typescript
function listener(ev) {
  console.warn('Navigation state changed', ev);
}
navigator.on('change', listener);
navigator.off('change', listener);
```

## Other Methods

### `renderPath`

The `renderPath` method combines the navigator's `base` property with the given path data, applying
the navigator's navigation mode. This method returns the fully rendered path as a string.

```typescript
const n = new BrowserNavigator(['/'], 0, {
  hashMode: 'slash',
});
n.renderPath('/test'); // '#/test'

const n2 = new BrowserNavigator(['/'], 0, {
  base: '/my-base',
  hashMode: 'slash',
});
n2.renderPath('/test'); // '#/my-base/test'

const n3 = new BrowserNavigator(['/'], 0, {
  base: '/my-base',
  hashMode: null,
});
n3.renderPath('/test'); // '/my-base/test'
```

### `parsePath`

The `parsePath` method parses the provided path according to the current navigation type and returns
it as an object. This method helps to understand how the navigator interprets the given path.

```typescript
const n = new BrowserNavigator(['/'], 0);
n.parsePath('/test');
// { pathname: '/', search: '', hash: '' }

n.parsePath('/test#abc');
// { pathname: '/abc', search: '', hash: '' }

n.parsePath('/test#abc?query#some-hash');
// { pathname: '/abc', search: '?query', hash: '#some-hash' }

const n2 = new BrowserNavigator(['/'], 0, { hashMode: null });
n2.parsePath('/test');
// { pathname: '/test', search: '', hash: '' }

n2.parsePath('/test#abc');
// { pathname: '/test', search: '', hash: '#abc' }

n2.parsePath('/test?query#abc');
// { pathname: '/test', search: '?query', hash: '#abc' }
```