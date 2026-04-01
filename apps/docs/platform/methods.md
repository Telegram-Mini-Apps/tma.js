---
outline: [ 2, 3 ]
---

# Methods

Telegram Mini Apps methods are events, which execute some predefined action. They are always called
by a Mini App.

## Web

Since the web version of Telegram displays the front-end application in an `<iframe/>` tag, it
uses the default way of communication between 2 iframes - sending messages
through `window.parent.postMessage` function.

As the first parameter, you should pass a JSON object **converted to a string**. The object should
have this interface:

```typescript
interface MessageJSON {
  eventType: string;
  eventData?: any;
}
```

The second parameter is `targetOrigin` - allowed parent iframe origin. We recommend avoiding the
usage of wildcard `*` as long as it is not secure - your application could be inserted not by
Telegram, but by another iframe that will still be able to communicate with your app and receive
some data.

As a default value, you could use `https://web.telegram.org`.

So, as you see, each method has its own name expressed by `eventType` and parameters stored
in `eventData` property. Here is the usage example:

```typescript
const data = JSON.stringify({
  eventType: 'web_app_setup_back_button',
  eventData: {
    is_visible: true,
  },
});

window.parent.postMessage(data, 'https://web.telegram.org');
```

This code will make the Telegram [BackButton](back-button.md) appear.

## Desktop and Mobile

Unlike the web, desktop and mobile applications use a bit more unusual way of calling methods. Both
of these platforms will create a global function `window.TelegramWebviewProxy.postEvent`.

As the first argument, this function accepts the event name. The second one - the parameters object,
converted to a string. Here is how it works:

```typescript
const data = JSON.stringify({ is_visible: true });

window
  .TelegramWebviewProxy
  .postEvent('web_app_setup_back_button', data);
```

## Windows Phone

Telegram Windows Phone app provides such function as `window.external.notify`. It accepts the same
parameter as the web version does:

```typescript
const data = JSON.stringify({
  eventType: 'web_app_setup_back_button',
  eventData: { is_visible: true },
});

window.external.notify(data);
```

## Calling Methods

Handling all possible environments for a developer's application can be challenging. To simplify
this process, the community developed the [@tma.js/sdk](../packages/tma-js-sdk)
package, which greatly eases integration.

Here's how to use it:

```ts
import { postEvent } from '@tma.js/sdk';

postEvent('web_app_set_header_color', { color_key: 'bg_color' });
```

You can learn more about calling methods in the
package's [documentation](../packages/tma-js-bridge/events.md#calling-methods).

## Available Methods

This section contains a list of available methods to call with their names, description, and
parameters. In case, Mini App does not satisfy the minimal method version requirement, nothing will
happen. The native app just doesn't know which method should be called as long as it is not defined
internally.

### `iframe_ready`

Notifies parent iframe about the current frame is ready. This method is only used in the Web version
of Telegram. As a result, Mini App will receive [set_custom_style](events.md#set-custom-style)
event.

| Field            | Type      | Description                                                      |
|------------------|-----------|------------------------------------------------------------------|
| reload_supported | `boolean` | _Optional_. True, if current Mini App supports native reloading. |

### `iframe_will_reload`

Notifies parent iframe about the current iframe is going to reload.

### `web_app_add_to_home_screen`

Available since: **v8.0**

Prompts the user to add the Mini App to the home screen. Note that if the device cannot
determine the installation status, the event may not be received even if the icon has
been added.

### `web_app_biometry_get_info`

Available since: **v7.2**

Requests the current biometry settings.

### `web_app_biometry_open_settings`

Available since: **v7.2**

Opens the biometric access settings for bots. Useful when you need to request biometrics
access to users who haven't granted it yet.

> [!INFO]
> This method can be called only in response to user interaction with the Mini App interface
> (e.g. a click inside the Mini App or on the main button)

### `web_app_biometry_request_access`

Available since: **v7.2**

Requests permission to use biometrics.

| Field  | Type     | Description                                                                                                                      |
|--------|----------|----------------------------------------------------------------------------------------------------------------------------------|
| reason | `string` | _Optional_. The text to be displayed to a user in the popup describing why the bot needs access to biometrics, 0-128 characters. |

### `web_app_biometry_request_auth`

Available since: **v7.2**

Authenticates the user using biometrics.

| Field  | Type     | Description                                                                                                                                                                                       |
|--------|----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| reason | `string` | _Optional_. The text to be displayed to a user in the popup describing why you are asking them to authenticate and what action you will be taking based on that authentication, 0-128 characters. |

### `web_app_biometry_update_token`

Available since: **v7.2**

Updates the biometric token in secure storage on the device. To remove the token, pass an empty
string.

| Field | Type     | Description                                     |
|-------|----------|-------------------------------------------------|
| token | `string` | Token to store. Has max length of 1024 symbols. |

### `web_app_check_home_screen`

Available since: **v8.0**

Sends a request to the native Telegram application to check if the current mini
application is added to the device's home screen.

### `web_app_check_location`

Available since: **v8.0**

Requests location-related functionality availability state.

### `web_app_close`

Closes Mini App.

### `web_app_close_scan_qr_popup`

Available since: **v6.4**

Closes a QR scanner. The Telegram application creates
the [scan_qr_popup_closed](events.md#scan-qr-popup-closed) event.

### `web_app_data_send`

Sends data to the bot. When this method is called, a service message is sent to the bot containing
the data of the length up to 4096 bytes. Then, Mini App will be closed.

To get more information, take a look at `web_app_data` field in the
class [Message](https://core.telegram.org/bots/api#message).

| Field | Type     | Description                                                          |
|-------|----------|----------------------------------------------------------------------|
| data  | `string` | Data to send to a bot. Should not have size of more than 4096 bytes. |

> [!WARNING]
> This method only works when the mini app was opened via [KeyboardButton](https://core.telegram.org/bots/webapps#keyboard-button-mini-apps).

### `web_app_device_storage_clear`

Available since: **v9.0**

Clears all keys previously stored by the bot in the device's local storage.

| Field  | Type     | Description                                                                                         |
|--------|----------|-----------------------------------------------------------------------------------------------------|
| req_id | `string` | Unique request identifier. Should be any unique string to handle the generated event appropriately. |

### `web_app_device_storage_get_key`

Available since: **v9.0**

Receives a value from the device's local storage using the specified key.

| Field  | Type     | Description                                                                                         |
|--------|----------|-----------------------------------------------------------------------------------------------------|
| req_id | `string` | Unique request identifier. Should be any unique string to handle the generated event appropriately. |
| key    | `string` | A key name to retrieve.                                                                             |

### `web_app_device_storage_save_key`

Available since: **v9.0**

Stores a value in the device's local storage using the specified key.

| Field  | Type             | Description                                                                                         |
|--------|------------------|-----------------------------------------------------------------------------------------------------|
| req_id | `string`         | Unique request identifier. Should be any unique string to handle the generated event appropriately. |
| key    | `string`         | A key to use to store the value.                                                                    |
| value  | `string \| null` | A value to store for the specified key. Passing `null` will lead to the key removal.                |

### `web_app_exit_fullscreen`

Available since: **v8.0**

Requests exiting the fullscreen mode for mini app.

### `web_app_expand`

[Expands](viewport.md) the Mini App.

### `web_app_hide_keyboard`

Available since: **v9.1**

Hides the on-screen keyboard, if it is currently visible. Does nothing if the keyboard is not active.

### `web_app_invoke_custom_method`

Available since: **v6.9**

| Field  | Type      | Description                           |
|--------|-----------|---------------------------------------|
| req_id | `string`  | Current invocation unique identifier. |
| method | `string`  | Method name.                          |
| params | `unknown` | Parameters according to `method`.     |

### `web_app_open_invoice`

Available since: **v6.1**

Opens an invoice by its specified slug. More information about invoices in
this [documentation](https://core.telegram.org/bots/payments).

| Field | Type     | Description                |
|-------|----------|----------------------------|
| slug  | `string` | Invoice unique identifier. |

### `web_app_open_link`

Opens link in the default browser. Mini App will not be closed.

| Field            | Type      | Description                                                                                            | Available since |
|------------------|-----------|--------------------------------------------------------------------------------------------------------|-----------------|
| url              | `string`  | URL to be opened by Telegram application. Should be a full path with `https` protocol.                 |                 |
| try_instant_view | `boolean` | _Optional_. Link will be opened in [Instant View](https://instantview.telegram.org/) mode if possible. | `v6.4`          |

### `web_app_open_location_settings`

Available since: **v8.0**

Opens the location access settings for bots. Useful when you need to request location access
from users who haven't granted it yet.

> [!WARNING]
> Note that this method can be called only in response to user interaction with the Mini App
> interface (e.g., a click inside the Mini App or on the main button).

### `web_app_open_popup`

Available since: **v6.2**

Opens a new [popup](popup.md). When user closes the popup, Telegram creates
the [popup_closed](events.md#popup-closed) event.

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
    <td>title</td>
    <td>
      <code>string</code>
    </td>
    <td>The text to be displayed in the popup title, 0-64 characters</td>
  </tr>

  <tr>
    <td>message</td>
    <td>
      <code>string</code>
    </td>
    <td>
      The message to be displayed in the body of the popup, 1-256 characters
    </td>
  </tr>

  <tr>
    <td>buttons</td>
    <td>
      <a href="#popupbutton">
        <code>PopupButton[]</code>
      </a>
    </td>
    <td>List of buttons to be displayed in the popup, 1-3 buttons</td>
  </tr>

  </tbody>
</table>

#### `PopupButton`

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
    <td>id</td>
    <td>
      <code>string</code>
    </td>
    <td>Identifier of the button, 0-64 characters.</td>
  </tr>

  <tr>
    <td>type</td>
    <td>
      <code>string</code>
    </td>
    <td>
      Type of the button. Values:
      <ul>
        <li>
          <code>default</code>, a button with the default style
        </li>
        <li>
          <code>destructive</code>, a button with a style that indicates a destructive action (e.g.
          "Remove", "Delete", etc.)
        </li>
        <li>
          <code>ok</code>, a button with the localized text "OK"
        </li>
        <li>
          <code>close</code>, a button with the localized text "Close"
        </li>
        <li>
          <code>cancel</code>, a button with the localized text "Cancel"
        </li>
      </ul>
    </td>
  </tr>

  <tr>
    <td>text</td>
    <td>
      <code>string</code>
    </td>
    <td>
      The text to be displayed on the button, 0-64
      characters. <i>Ignored</i> when <code>type</code> is <code>ok</code>, <code>close</code> or
      <code>cancel</code>.
    </td>
  </tr>
  </tbody>
</table>

### `web_app_open_scan_qr_popup`

Available since: **v6.4**

Opens a QR scanner. When the scanner was closed, the Telegram application creates
the [scan_qr_popup_closed](events.md#scan-qr-popup-closed) event. When the scanner reads QR,
Telegram creates the [qr_text_received](events.md#qr-text-received) event.

| Field | Type     | Description                                         |
|-------|----------|-----------------------------------------------------|
| text  | `string` | _Optional_. Text to be displayed in the QR scanner. |

### `web_app_open_tg_link`

Available since: **v6.1**

Opens the Telegram link by its pathname and query parameters. The link will be opened in the
Telegram app, Mini App will be closed.

| Field     | Type     | Description                                                                                                                  |
|-----------|----------|------------------------------------------------------------------------------------------------------------------------------|
| path_full | `string` | Should be a value taken from the link of this format: `https://t.me/{path_full}`. Can additionally contain query parameters. |

### `web_app_read_text_from_clipboard`

Available since: **v6.4**

Reads text from the clipboard. The method accepts a request identifier which is used to
appropriately retrieve the method execution result from
the [clipboard_text_received](events.md#clipboard-text-received) event.

| Field  | Type     | Description                                                                                         |
|--------|----------|-----------------------------------------------------------------------------------------------------|
| req_id | `string` | Unique request identifier. Should be any unique string to handle the generated event appropriately. |

### `web_app_ready`

Notifies Telegram about current application is ready to be shown. This method will make Telegram to
remove application loader and display Mini App.

### `web_app_request_content_safe_area`

Available since: **v8.0**

Requests the current content safe area information from Telegram.

As a result, Telegram triggers the
[**`content_safe_area_changed`**](events.md#content-safe-area-changed) event.

### `web_app_request_emoji_status_access`

Available since: **v8.0**

Shows a native popup requesting permission for the bot to manage user's emoji status.

### `web_app_request_file_download`

Available since: **v8.0**

Displays a native popup prompting the user to download a file.

In turn, the Telegram client emits the [file_download_requested](./events.md#file_download_requested) event.

| Field     | Type     | Description                                 |
|-----------|----------|---------------------------------------------|
| url       | `string` | The HTTPS URL of the file to be downloaded. |
| file_name | `string` | The suggested name for the downloaded file. |

### `web_app_request_fullscreen`

Available since: **v8.0**

Requests full screen mode for mini app.

### `web_app_request_location`

Available since: **v8.0**

Requests location data.

### `web_app_request_phone`

Available since: **v6.9**

Requests access to current user's phone.

### `web_app_request_safe_area`

Available since: **v8.0**

Requests the current safe area information from Telegram.

As a result, Telegram triggers the
[**`safe_area_changed`**](events.md#safe-area-changed) event.

### `web_app_request_theme`

Requests the current [theme](theming.md) from Telegram. As a result, Telegram will
create [theme_changed](events.md#theme-changed) event.

### `web_app_request_viewport`

Requests the current [viewport](viewport.md) information from Telegram. As a result,
Telegram will create [viewport_changed](events.md#viewport-changed) event.

### `web_app_request_write_access`

Available since: **v6.9**

Requests write message access to current user.

### `web_app_secure_storage_clear`

Available since: **v9.0**

Clears all keys previously stored by the bot in the device's secure storage.

| Field  | Type     | Description                                                                                         |
|--------|----------|-----------------------------------------------------------------------------------------------------|
| req_id | `string` | Unique request identifier. Should be any unique string to handle the generated event appropriately. |

### `web_app_secure_storage_get_key`

Available since: **v9.0**

Clears all keys previously stored by the bot in the device's secure storage.

| Field  | Type     | Description                                                                                         |
|--------|----------|-----------------------------------------------------------------------------------------------------|
| req_id | `string` | Unique request identifier. Should be any unique string to handle the generated event appropriately. |
| key    | `string` | A key to use to store the value.                                                                    |

### `web_app_secure_storage_restore_key`

Available since: **v9.0**

Attempts to restore a key that previously existed on the current device. When called, the user will be asked for
permission to restore the value.

| Field  | Type     | Description                                                                                         |
|--------|----------|-----------------------------------------------------------------------------------------------------|
| req_id | `string` | Unique request identifier. Should be any unique string to handle the generated event appropriately. |
| key    | `string` | A key to use to restore the value.                                                                  |

### `web_app_secure_storage_save_key`

Available since: **v9.0**

Stores a value in the device's secure storage using the specified key.

| Field  | Type             | Description                                                                                         |
|--------|------------------|-----------------------------------------------------------------------------------------------------|
| req_id | `string`         | Unique request identifier. Should be any unique string to handle the generated event appropriately. |
| key    | `string`         | A key to use to store the value.                                                                    |
| value  | `string \| null` | A value to store for the specified key. Passing `null` will lead to the key removal.                |

### `web_app_send_prepared_message`

Available since: **v8.0**

Opens a dialog allowing the user to share a message provided by the bot.

| Field | Type     | Description                                                                                                                                                                                                                                         |
|-------|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| id    | `string` | Identifier of the message ([PreparedInlineMessage](https://core.telegram.org/bots/api#preparedinlinemessage)) previously obtained via the Bot API method [savePreparedInlineMessage](https://core.telegram.org/bots/api#savepreparedinlinemessage). |

### `web_app_set_background_color`

Available since: **v6.1**

Updates the Mini App [background color](theming.md#background-and-header-colors).

| Field | Type     | Description                                                                                                  |
|-------|----------|--------------------------------------------------------------------------------------------------------------|
| color | `string` | The Mini App background color in `#RRGGBB` format,  or one of the values: `bg_color` or `secondary_bg_color` |

### `web_app_set_bottom_bar_color`

Available since: **v7.10**

Updates the Mini App bottom bar background color.

| Field | Type     | Description                                                                                                                                   |
|-------|----------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| color | `string` | The Mini App bottom bar background color in `#RRGGBB` format, or one of the values: `bg_color`, `secondary_bg_color` or `bottom_bar_bg_color` |

### `web_app_set_emoji_status`

Available since: **v8.0**

Opens a dialog allowing the user to set the specified custom emoji as their status.

| Field           | Type     | Description                                        |
|-----------------|----------|----------------------------------------------------|
| custom_emoji_id | `string` | Custom emoji identifier to set.                    |
| duration        | `number` | _Optional_. The status expiration time in seconds. |

### `web_app_set_header_color`

Available since: **v6.1**

Updates the Mini App [header color](theming.md#background-and-header-colors). This
method should accept `color_key` or `color` property.

| Field     | Type     | Description                                                                        | Available since |
|-----------|----------|------------------------------------------------------------------------------------|-----------------|
| color_key | `string` | The Mini App header color key. Could be either `bg_color` or `secondary_bg_color`. |                 |
| color     | `string` | Color in RGB format.                                                               | `v6.9`          |

### `web_app_setup_back_button`

Available since: **v6.1**

Updates the [Back Button](back-button.md) settings.

| Field      | Type      | Description                        |
|------------|-----------|------------------------------------|
| is_visible | `boolean` | Should the Back Button be visible. |

### `web_app_setup_closing_behavior`

Updates current [closing behavior](closing-behavior.md).

| Field             | Type      | Description                                                          |
|-------------------|-----------|----------------------------------------------------------------------|
| need_confirmation | `boolean` | Will user be prompted in case, an application is going to be closed. |

### `web_app_setup_main_button`

Updates the [Main Button](main-button.md) settings.

| Field               | Type      | Description                                                                                                                                                   | Available since |
|---------------------|-----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------|
| is_visible          | `boolean` | _Optional_. Should the button be displayed.                                                                                                                   |
| is_active           | `boolean` | _Optional_. Should the button be enabled.                                                                                                                     |
| is_progress_visible | `boolean` | _Optional_. Should loader inside the button be displayed. Use this property in case, some operation takes time. This loader will make user notified about it. |
| text                | `string`  | _Optional_. Text inside the button.                                                                                                                           |
| color               | `string`  | _Optional_. The button background color in `#RRGGBB` format.                                                                                                  |
| text_color          | `string`  | _Optional_. The button text color in `#RRGGBB` format.                                                                                                        |
| has_shine_effect    | `boolean` | _Optional_. Should the button have a shining effect.                                                                                                          | `v7.8`          |
| icon_custom_emoji_id    | `string` | _Optional_. The ID of custom emoji icon displayed alongside button text.                                                        | `v9.5`          |

### `web_app_setup_settings_button`

Available since: **v6.10**

Updates current state of [Settings Button](settings-button.md).

| Field      | Type      | Description                              |
|------------|-----------|------------------------------------------|
| is_visible | `boolean` | Should the Settings Button be displayed. |

### `web_app_setup_swipe_behavior`

Available since: **v7.7**

Sets new swipe behavior.

| Field                | Type      | Description                                          |
|----------------------|-----------|------------------------------------------------------|
| allow_vertical_swipe | `boolean` | Allows closing the application using vertical swipe. |

### `web_app_share_to_story`

Available since: **v7.8**

A method that opens the native story editor.

| Field            | Type     | Description                                                                                                                                                                                          |
|------------------|----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| media_url        | `string` | A media URL which will be used as a background for a created story.                                                                                                                                  |
| text             | `string` | _Optional_. The caption to be added to the media. 0-200 characters for regular users and 0-2048 characters for [premium subscribers](https://telegram.org/faq_premium#telegram-premium).             |
| widget_link      | `object` | _Optional_. An object that describes a widget link to be included in the story. Note that only [premium subscribers](https://telegram.org/faq_premium#telegram-premium) can post stories with links. |
| widget_link.url  | `string` | The URL to be included in the story.                                                                                                                                                                 |
| widget_link.name | `string` | _Optional_. The name to be displayed for the widget link, 0-48 characters.                                                                                                                           |

### `web_app_start_accelerometer`

Available since: **v8.0**

Starts tracking accelerometer data.

| Field        | Type     | Description                                                                                                                                                                                                             |
|--------------|----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| refresh_rate | `number` | The refresh rate in milliseconds, with acceptable values ranging from 20 to 1000. Note that `refresh_rate` may not be supported on all platforms, so the actual tracking frequency may differ from the specified value. |

### `web_app_start_device_orientation`

Available since: **v8.0**

Starts tracking device orientation data.

| Field         | Type      | Description                                                                                                                                                                                                                                                                                                                                                                                                                       |
|---------------|-----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| refresh_rate  | `number`  | The refresh rate in milliseconds, with acceptable values ranging from 20 to 1000. Note that `refresh_rate` may not be supported on all platforms, so the actual tracking frequency may differ from the specified value.                                                                                                                                                                                                           |
| need_absolute | `boolean` | _Optional_. Pass true to receive absolute orientation data, allowing you to determine the device's attitude relative to magnetic north. Use this option if implementing features like a compass in your app. If relative data is sufficient, pass false. <br/><br/> Keep in mind that some devices may not support absolute orientation data. In such cases, you will receive relative data even if need_absolute=true is passed. |

### `web_app_start_gyroscope`

Available since: **v8.0**

Starts tracking gyroscope data.

| Field        | Type     | Description                                                                                                                                                                                                             |
|--------------|----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| refresh_rate | `number` | The refresh rate in milliseconds, with acceptable values ranging from 20 to 1000. Note that `refresh_rate` may not be supported on all platforms, so the actual tracking frequency may differ from the specified value. |

### `web_app_stop_accelerometer`

Available since: **v8.0**

Stops tracking accelerometer data.

### `web_app_stop_device_orientation`

Available since: **v8.0**

Stops tracking device orientation data.

### `web_app_stop_gyroscope`

Available since: **v8.0**

Stops tracking gyroscope data.

### `web_app_setup_secondary_button`

Available since: **v7.10**

The method that updates the Secondary Button settings.

<table>
  <thead>

  <tr>
    <th>Field</th>
    <th>Type</th>
    <th>Description</th>
    <th>Available since</th>
  </tr>

  </thead>
  <tbody>

  <tr>
    <td>is_visible</td>
    <td>
      <code>boolean</code>
    </td>
    <td><i>Optional</i>. Should the button be displayed.</td>
    <td><code>v7.10</code></td>
  </tr>

  <tr>
    <td>is_active</td>
    <td>
      <code>boolean</code>
    </td>
    <td><i>Optional</i>. Should the button be enabled.</td>
    <td><code>v7.10</code></td>
  </tr>

  <tr>
    <td>is_progress_visible</td>
    <td>
      <code>boolean</code>
    </td>
    <td>
      <i>Optional</i>. Should loader inside the button be displayed. Use this property in case, 
      some operation takes time. This loader will make user notified about it.
    </td>
    <td><code>v7.10</code></td>
  </tr>

  <tr>
    <td>color</td>
    <td>
      <code>string</code>
    </td>
    <td><i>Optional</i>. The button background color in <code>#RRGGBB</code> format.</td>
    <td><code>v7.10</code></td>
  </tr>

  <tr>
    <td>text_color</td>
    <td>
      <code>string</code>
    </td>
    <td><i>Optional</i>. The button text color in <code>#RRGGBB</code> format.</td>
    <td><code>v7.10</code></td>
  </tr>

  <tr>
    <td>has_shine_effect</td>
    <td>
      <code>boolean</code>
    </td>
    <td><i>Optional</i>. Should the button have a shining effect.</td>
    <td><code>v7.10</code></td>
  </tr>

  <tr>
    <td>position</td>
    <td>
      <code>string</code>
    </td>
    <td>
      <i>Optional</i>. Position of the secondary button. It applies only if both the main and 
      secondary buttons are visible. <br/>Supported values:
      <ul>
        <li>
          <code>left</code>, displayed to the left of the main button, 
        </li>
        <li>
          <code>right</code>, displayed to the right of the main button,
        </li>
        <li>
          <code>top</code>, displayed above the main button,
        </li>
        <li>
          <code>bottom</code>, displayed below the main button.
        </li>
      </ul>
    </td>
    <td><code>v7.10</code></td>
  </tr>

  <tr>
    <td>icon_custom_emoji_id</td>
    <td>
      <code>string</code>
    </td>
    <td><i>Optional</i>. The ID of custom emoji icon displayed alongside button text.</td>
    <td><code>v9.5</code></td>
  </tr>

  </tbody>
</table>

### `web_app_switch_inline_query`

Available since: **v6.7**

Inserts the bot's username and the specified inline query in the current chat's input field.
Query may be empty, in which case only the bot's username will be inserted. The client prompts
the user to choose a specific chat, then opens that chat and inserts the bot's username and
the specified inline query in the input field.

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
    <td>query</td>
    <td>
      <code>string</code>
    </td>
    <td>
      Text which should be inserted in the input after the current bot name. Max length is 
      <b>256</b> symbols.
    </td>
  </tr>

  <tr>
    <td>chat_types</td>
    <td>
      <code>string[]</code>
    </td>
    <td>
      List of chat types which could be chosen to send the message. Could be empty list. Values:
      <ul>
        <li>
          <code>users</code> 
        </li>
        <li>
          <code>bots</code>
        </li>
        <li>
          <code>groups</code>
        </li>
        <li>
          <code>channels</code>
        </li>
      </ul>
    </td>
  </tr>

  </tbody>
</table>

### `web_app_toggle_orientation_lock`

Available since: **v8.0**

Locks the Mini App’s orientation to its current mode (either portrait or landscape). Once locked,
the orientation remains fixed, regardless of device rotation. This is useful if a stable orientation
is needed during specific interactions.

| Field  | Type      | Description                             |
|--------|-----------|-----------------------------------------|
| locked | `boolean` | True if the orientation must be locked. |

### `web_app_trigger_haptic_feedback`

Available since: **v6.1**

Generates the [haptic feedback](haptic-feedback.md) event.

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
    <td>type</td>
    <td>
      <code>string</code>
    </td>
    <td>
      Type of haptic event. Values:
      <ul>
        <li>
          <code>impact</code>, when there's a collision involving UI components.
        </li>
        <li>
          <code>notification</code>, when some action execution has been completed.
        </li>
        <li>
          <code>selection_change</code>, when the user changes their selection.
        </li>
      </ul>
    </td>
  </tr>

  <tr>
    <td>impact_style</td>
    <td>
      <code>string</code>
    </td>
    <td>
      Required when <code>type</code> is <code>impact</code>. Values:
      <ul>
        <li>
          <code>light</code>, indicates a collision between small or lightweight UI objects
        </li>
        <li>
          <code>medium</code>, indicates a collision between medium-sized or medium-weight UI
          objects
        </li>
        <li>
          <code>heavy</code>, indicates a collision between large or heavyweight UI objects
        </li>
        <li>
          <code>rigid</code>, indicates a collision between hard or inflexible UI objects
        </li>
        <li>
          <code>soft</code>, indicates a collision between soft or flexible UI objects
        </li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>notification_type</td>
    <td>
      <code>string</code>
    </td>
    <td>
      Required when <code>type</code> is <code>notification</code>. Values:
      <ul>
        <li>
          <code>error</code>, indicates that a task or action has failed
        </li>
        <li>
          <code>success</code>, indicates that a task or action has completed successfully
        </li>
        <li>
          <code>warning</code>, indicates that a task or action produced a warning
        </li>
      </ul>
    </td>
  </tr>
  </tbody>
</table>
