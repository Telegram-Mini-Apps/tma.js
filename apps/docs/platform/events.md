---
outline: [2, 3]
---

# Events

Events are signals, sent from Telegram native application in case, when some external action was
done. Like methods, each event has its unique name and parameters.

## Web

As mentioned before, the web version uses a standard way of communication between iframes. It means,
the parent iframe is able to send events through `window.postMessage` function. To handle this type
of message, it is enough to add `message` event listener on the global `window` object:

```typescript
window.addEventListener('message', ...);
```

The native application will send an event with `data: string` which represents a JSON object
converted to string. This object has the same interface as we defined in
the [Methods](methods.md#web) section:

```typescript
interface MessageJSON {
  eventType: string;
  eventData: any;
}
```

Then, lets imagine how we could process an event from Telegram application:

```typescript
window.addEventListener('message', ({ data }) => {
  const { eventType, eventData } = JSON.parse(data);
  console.log(eventType, eventData);
});
```

::: warning

In this code, we assumed, that the `message` event is sent only by the native application which is
not always true in real applications. Additionally, we didn't check if `data` is really of
type `string`. Don't forget to check each type and appropriately process incoming events.

:::

## Desktop, Mobile and Windows Phone

Desktop, mobile, and Windows Phone versions of Telegram don’t use the method, described in the
previous section. They do it in a bit unusual way. The first thing developer should know, is in
case, when Telegram needs to emit an event, it will insert JavaScript code, which calls a globally
defined function.

Here is an example:

```typescript
window.Telegram.WebView.receiveEvent('popup_closed', {
  button_id: 'cancel'
});
```

Path to this function depends on platform:

- `window.TelegramGameProxy.receiveEvent` - Telegram Desktop;
- `window.Telegram.WebView.receiveEvent` - Telegram for iOS and Android;
- `window.TelegramGameProxy_receiveEvent` - Windows Phone

All of these functions have the same signature:

```typescript
type ReceiveEvent = (eventType: string, eventData: unknown) => void;
```

So, the solution is rather simple. To handle incoming events we should create a function of this
type and assign it to all 3 paths.

## Listening to Events

Handling all possible environments for a developer's application can be challenging. To simplify
this process, the community developed the [@telegram-apps/sdk](../packages/telegram-apps-sdk) package, which
greatly eases integration.

Here's how to use it:

```ts
import { on } from '@telegram-apps/sdk';

// Start listening to "viewport_changed" event. Returned value
// is a function, which removes this event listener.
const removeListener = on('viewport_changed', payload => {
  console.log('Viewport changed:', payload);
});

// Remove this event listener.
removeListener();
```

You can learn more about calling methods in the
package's [documentation](../packages/telegram-apps-sdk/methods-and-events#listening-to-events).

## Available Events

This section contains the list of events, sent from Telegram: their names, description, and
parameters. Section title means minimal version, from which events inside the section could be sent.

### `back_button_pressed`

Available since: **v6.1**

User clicked the [Back Button](back-button.md).

### `biometry_auth_requested`

Available since: **v7.2**

Biometry authentication request completed. This event usually occurs in a response to the
[web_app_request_auth](methods.md#web-app-biometry-request-auth) method.

If authentication was successful, the event contains a token from the local secure storage.

| Field  | Type                         | Description                                                                                                |
|--------|------------------------------|------------------------------------------------------------------------------------------------------------|
| status | `'failed'` or `'authorized'` | Authentication status.                                                                                     |
| token  | `string`                     | _Optional_. Token from the local secure storage saved previously. Passed only if `status` is `authorized`. |

### `biometry_info_received`

Available since: **v7.2**

Biometry settings were received.

| Field            | Type                   | Description                                                                   |
|------------------|------------------------|-------------------------------------------------------------------------------|
| available        | `boolean`              | Shows whether biometry is available.                                          |
| access_requested | `boolean`              | Shows whether permission to use biometrics has been requested.                |
| access_granted   | `boolean`              | Shows whether permission to use biometrics has been granted.                  |
| device_id        | `string`               | A unique device identifier that can be used to match the token to the device. |
| token_saved      | `boolean`              | Show whether local secure storage contains previously saved token.            |
| type             | `'face'` or `'finger'` | The type of biometrics currently available on the device.                     |

### `biometry_token_updated`

Available since: **v7.2**

Biometry token was updated.

| Field  | Type                   | Description    |
|--------|------------------------|----------------|
| status | `updated` or `removed` | Update status. |

### `clipboard_text_received`

Available since: **v6.4**

Telegram application attempted to extract text from clipboard.

| Field  | Type               | Description                                                                                                                                              |
|--------|--------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| req_id | `string`           | Passed during the [web_app_read_text_from_clipboard](methods.md#web-app-read-text-from-clipboard) method invocation `req_id` value.                      |
| data   | `string` or `null` | _Optional_. Data extracted from the clipboard. The returned value will have the type `string` only in the case, application has access to the clipboard. |

### `custom_method_invoked`

Available since: **v6.9**

Custom method invocation completed.

| Field  | Type      | Description                                      |
|--------|-----------|--------------------------------------------------|
| req_id | `string`  | Unique identifier of this invocation.            |
| result | `unknown` | _Optional_. Method invocation successful result. |
| error  | `string`  | _Optional_. Method invocation error code.        |

### `invoice_closed`

An invoice was closed.

<table>
  <thead>

  <tr>
    <th>Field</th>
    <th>Type</th>
    <th>Description</th>
  </tr>

  </thead>
  <tbody>

  <tr>
    <td>slug</td>
    <td>
      <code>string</code>
   </td>
    <td>
      Passed during the&nbsp;
      <a href="./methods#web-app-open-invoice">
        <code>web_app_open_invoice</code>
      </a>&nbsp;
      method invocation <code>slug</code> value.
    </td>
  </tr>

  <tr>
    <td>status</td>
    <td>
      <code>string</code>
    </td>
    <td>
      Invoice status. Values:
      <ul>
        <li>
          <code>paid</code>, invoice was paid
        </li>
        <li>
          <code>failed</code>, invoice failed
        </li>
        <li>
          <code>pending</code>, invoice is currently pending
        </li>
        <li>
          <code>cancelled</code>, invoice was cancelled
        </li>
      </ul>
    </td>
  </tr>

  </tbody>
</table>

### `main_button_pressed`

User clicked the [Main Button](main-button.md).

### `phone_requested`

Available since: **v6.9**

Application received phone access request status.

| Field  | Type     | Description                         |
|--------|----------|-------------------------------------|
| status | `string` | Request status. Can only be `sent`. |

### `popup_closed`

[Popup](popup.md) was closed.

| Field     | Type     | Description                                                                                                                             |
|-----------|----------|-----------------------------------------------------------------------------------------------------------------------------------------|
| button_id | `string` | _Optional_. Identifier of the clicked button. In case, the popup was closed without clicking any button, this property will be omitted. |

### `reload_iframe`

Parent iframe requested current iframe reload.

### `qr_text_received`

Available since: **v6.4**

The QR scanner scanned some QR and extracted its content.

| Field | Type     | Description                             |
|-------|----------|-----------------------------------------|
| data  | `string` | _Optional_. Data extracted from the QR. |

### `scan_qr_popup_closed`

Available since: **v6.4**

QR scanner was closed.

### `set_custom_style`

The event which is usually sent by the Telegram web application. Its payload represents `<style/>`
tag html content, a developer could use. The stylesheet described in the payload will help the
developer to stylize the app scrollbar (but he is still able to do it himself).

### `settings_button_pressed`

Available since: **v6.1**

Occurs when the [Settings Button](settings-button.md) was pressed.

### `theme_changed`

Occurs whenever [the theme](theming.md) was changed in the user's Telegram app (
including switching to night mode).

| Field        | Type                     | Description                                                                                            |
|--------------|--------------------------|--------------------------------------------------------------------------------------------------------|
| theme_params | `Record<string, string>` | Map where the key is a theme stylesheet key and value is  the corresponding color in `#RRGGBB` format. |

### `viewport_changed`

Occurs whenever the [viewport](viewport.md) has been changed. For example, when the
user started dragging the application or called the expansion method.

| Field           | Type      | Description                                                                      |
|-----------------|-----------|----------------------------------------------------------------------------------|
| height          | `number`  | The viewport height.                                                             |
| width           | `number`  | _Optional_. The viewport width.                                                  |
| is_expanded     | `boolean` | Is the viewport currently expanded.                                              |
| is_state_stable | `boolean` | Is the viewport current state stable and not going to change in the next moment. |

::: tip
Pay attention to the fact, that send rate of this method is not enough to smoothly resize the
application window. You should probably use a stable height instead of the current one, or handle
this problem in another way.
:::

### `write_access_requested`

Available since: **v6.9**

Application received write access request status.

| Field  | Type     | Description                            |
|--------|----------|----------------------------------------|
| status | `string` | Request status. Can only be `allowed`. |
