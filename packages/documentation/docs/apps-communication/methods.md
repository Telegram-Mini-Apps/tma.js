---
sidebar_position: 2
---

# Methods

Web Apps methods are events, which execute some action. They are always called
by Web App.

## Web

As long as the web version of Telegram displays the front-end application in
`<iframe/>` tag, it uses the default way of communication between 2 iframes -
sending messages through `window.parent.postMessage` function.

As the first parameter, you should pass a JSON object
**converted to a string**. The object should have this interface:

```typescript
interface MessageJSON {
  eventType: string;
  eventData: any;
}
```

The second parameter is `targetOrigin` - allowed parent iframe origin. We
recommend avoiding the usage of wildcard `*` as long as it is not secure - your
application could be inserted not by Telegram, but by another iframe that will
still be able to communicate with your app and receive some data.

As a default value, you could use `https://web.telegram.org`.

So, as you see, each method has its own name expressed by `eventType` and
parameters stored in `eventData` property. Here is the usage example:

```typescript
window.parent.postMessage(JSON.stringify({
  eventType: 'web_app_setup_back_button',
  eventData: {is_visible: true},
}), 'https://web.telegram.org');
```

This code will make the Telegram back button appear. We will define the back
button and other components in the next sections of the documentation.

## Desktop and mobile

Unlike the web, desktop and mobile applications use a bit more unusual way of
calling methods. Both of these platforms will create a global
function `window.TelegramWebviewProxy.postEvent(eventType: string, eventData: string)`.

As the first argument, this function accepts the event name. The second one -
the parameters object, converted to a string. Here is how it works:

```typescript
window.TelegramWebviewProxy.postEvent('web_app_setup_back_button', JSON.stringify({
  is_visible: true
}));
```

## Windows Phone

Telegram Windows Phone app provides such function
as `window.external.notify(message: string)`. It accepts the same parameter as
the web version does:

```typescript
window.external.notify(JSON.stringify({
  eventType: 'web_app_setup_back_button',
  eventData: {is_visible: true},
}))
```

## Available methods

This section contains a list of available methods to call with their names,
description, and parameters. Section title means minimal Web App version to call
methods inside it. In case, Web App does not satisfy the minimal method version
requirement, nothing will happen. The native app just doesn't know which method
should be called as long as it is not defined.

### v6.0

#### `iframe_ready`

Notifies parent iframe about the current frame is ready. This method is only
used in the Web version of Telegram. As a result, Web App will
receive `[set_custom_style](events#set_custom_style)` event.

#### `web_app_close`

Closes Web App.

#### `web_app_data_send`

Sends data to the bot. When this method is called, a service message is sent to
the bot containing the data of the length up to 4096 bytes. Then, Web App will
be closed.

To get more information, take a look at `web_app_data` field in the
class `[Message](https://core.telegram.org/bots/api#message)`.

```typescript
type Parameters = { data: string };
```

#### `web_app_expand`

[Expands](../features/viewport) Web App.

#### `web_app_open_link`

Opens link in the default browser. Web App will not be closed.

```typescript
type Parameters = { url: string };
```

#### `web_app_ready`

Notifies Telegram about current application is ready to be shown. This method
will make Telegram to remove application loader and display Web App.

#### `web_app_request_theme`

Requests current [theme](../features/theme) from Telegram. As a result, Telegram
will create [`theme_changed`](events#theme_changed) event.

#### `web_app_request_viewport`

Requests current [viewport](../features/viewport) information from Telegram. As
a result, Telegram will create [`viewport_changed`](events#viewport_changed)
event.

#### `web_app_setup_main_button`

Updates [main button](../features/main-button) settings.

```typescript
type Parameters = {
  // Should button be displayed.
  is_visible?: boolean;
  // Should button be enabled.
  is_active?: boolean;
  // Should loader inside button be displayed. Use this property in case,
  // some opertaion takes time. This loader will make user notified about it.
  is_progress_visible?: boolean;
  // Text inside button.
  text?: string;
  // Color in #RRGGBB format.
  color?: string;
  // Text color in #RRGGBB format.
  text_color?: string;
};
```

#### `web_app_setup_closing_behavior`

Changes current [closing behavior](../features/closing-behavior).

```typescript
type Parameters = { need_confirmation: boolean };
```

### v6.1

#### `web_app_open_tg_link`

Opens Telegram link by its pathname and query parameters. Passed `path_full`
should be a value taken from link of this format: `https://t.me/{path_full}`.
Link will be opened in Telegram app, Web App will be closed.

```typescript
type Parameters = { path_full: string };
```

#### `web_app_open_invoice`

Opens invoice by its specified slug. More information about invoices in
this [documentation](https://core.telegram.org/bots/payments).

```typescript
type Parameters = { slug: string };
```

#### `web_app_setup_back_button`

Updates [back button](../features/back-button) settings.

```typescript
type Parameters = { is_visible: boolean };
```

#### `web_app_set_background_color`

Updates Web
App [background color](../features/theme#background-and-header-colors).

```typescript
type Parameters = {
  // Color in #RRGGBB format.
  color: string;
};
```

#### `web_app_set_header_color`

Updates Web App [header color](../features/theme#background-and-header-colors).

```typescript
type Parameters = { color_key: 'bg_color' | 'secondary_bg_color' };
```

#### `web_app_trigger_haptic_feedback`

Generates [haptic feedback](../features/haptic-feedback) event.

```typescript
type Parameters = {
  type: 'impact',
  /**
   * Style of impact occurred haptic event.
   * - `light`, indicates a collision between small or lightweight UI objects,
   * - `medium`, indicates a collision between medium-sized or medium-weight UI objects,
   * - `heavy`, indicates a collision between large or heavyweight UI objects,
   * - `rigid`, indicates a collision between hard or inflexible UI objects,
   * - `soft`, indicates a collision between soft or flexible UI objects.
   */
  impact_style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft',
} | {
  type: 'notification',
  /**
   * Type of notification occurred type event.
   * - `error`, indicates that a task or action has failed,
   * - `success`, indicates that a task or action has completed successfully,
   * - `warning`, indicates that a task or action produced a warning.
   */
  notification_type: 'error' | 'success' | 'warning'
} | {
  type: 'selection_change'
};
```

### v6.2

#### `web_app_open_popup`

Opens new [popup](../features/popup). When user closes popup, Telegram
creates [`popup_closed`](events#popup_closed) event.

```typescript
type PopupButton = {
  /**
   * Identifier of the button, 0-64 characters.
   */
  id: string;
} & (
  {
    /**
     * Type of the button:
     * - `default`, a button with the default style;
     * - `destructive`, a button with a style that indicates a destructive
     * action (e.g. "Remove", "Delete", etc.).
     *
     * @default "default"
     */
    type?: 'default' | 'destructive';

    /**
     * The text to be displayed on the button, 0-64 characters.
     */
    text: string;
  } | {
  /**
   * Type of the button:
   * - `ok`, a button with the localized text "OK";
   * - `close`, a button with the localized text "Close";
   * - `cancel`, a button with the localized text "Cancel".
   */
  type: 'ok' | 'close' | 'cancel';
});

type Parameters = {
  /**
   * The text to be displayed in the popup title, 0-64 characters.
   */
  title: string;
  /**
   * The message to be displayed in the body of the popup, 1-256 characters.
   */
  message: string;
  /**
   * List of buttons to be displayed in the popup, 1-3 buttons.
   */
  buttons: PopupButton[];
};
```

### v6.4

#### `web_app_open_scan_qr_popup`

Opens QR scanner. When scanner was closed, Telegram
creates [`scan_qr_popup_closed`](events#scan_qr_popup_closed) event. When
scanner read QR, Telegram creates [`qr_text_received`](events#qr_text_received)
event.

```typescript
type Parameters = { text?: string };
```

#### `web_app_close_scan_qr_popup`

Closes QR scanner. Telegram
creates [`scan_qr_popup_closed`](events#scan_qr_popup_closed) event.

#### `web_app_read_text_from_clipboard`

Reads text from clipboard. Method accepts request identifier which is
used to appropriately retrieve method execution result from
[`qr_text_received`](events#qr_text_received) event.

```typescript
type Parameters = { req_id: string };
```