# Launch Parameters

The launch parameters are the list of parameters that is passed by the native Telegram application
to the Mini App. It helps the developer to find out the characteristics of the Telegram application,
the current device, get basic information about the user and much more.

## Transmission Method

In a web environment, one of the simplest and fastest ways to transfer data between locally running 
applications is by specifying it in the address bar. A server can include data in the URL's hash, 
making it accessible to the client application. Similarly, Telegram Mini Apps use this approach, with 
the Telegram client environment sending data to the Mini App through the URL's hash. This enables 
the Mini App to access essential information upon launch.

The native Telegram application transmits a list of these parameters in the dynamic part of the URL 
(in the hash #). To access these parameters, you need to use the `window.location.hash` property in your JavaScript code.

## Extraction

It is important to remember that `hash` is a string property, while Telegram transmits a whole list
of properties, after which the question arises about formatting and processing this list. In fact,
everything is quite simple.

The native Telegram application passes the list of launch parameters as query-parameters and saves
the resulting string in `window.location.hash`. For this reason, in order to extract the launch
parameters, it is enough to perform the following operation:

```typescript title="Example on how to extract launch parameters"
const hash = window.location.hash.slice(1);
console.log(hash); // tgWebAppData=...&tgWebAppVersion=6.2&...

const params = new URLSearchParams(hash);
console.log(params.get('tgWebAppVersion')); // "6.2"
```

::: tip

However, users have the capability to refresh the current application without exiting it. If the
application uses hash routing, it may lose the initial hash after some time. Therefore, it's
advisable to save this data during the initial launch of the application.

:::

## Parameters List

### `tgWebAppVersion`

The current Telegram Mini Apps version used by the native application. This parameter is important
to use, for example, before calling the Telegram Mini
Apps [methods](methods.md) to make sure, they are supported.

### `tgWebAppData`

Contains data describing the current user, data sign, and also some useful values. To learn more,
visit the [Init Data](init-data.md) page.

### `tgWebAppPlatform`

[Telegram application identifier](about.md#supported-applications). It can be used as a
factor
determining the visual style of the application, for example, when, depending on the device, the
developer needs to display components that are different visually.

### `tgWebAppThemeParams`

Parameters of the native Telegram application [theme](theming.md). This parameter
can be used to style the application even at the moment of rendering the loader.

The value of this parameter is a JSON object converted to the string. To get a more user-friendly
value, it is enough to use the `JSON.parse` method.

```typescript
const theme = {
  bg_color: '#212121',
  text_color: '#ffffff',
  hint_color: '#aaaaaa',
  link_color: '#8774e1',
  button_color: '#8774e1',
  button_text_color: '#ffffff',
  secondary_bg_color: '#0f0f0f',
};
```

### `tgWebAppShowSettings`

Parameter used only by Telegram SDK to show the Settings Button on startup. It has
no other meaning to external developers.

### `tgWebAppBotInline`

This parameter is being added in case the current application is launched in inline mode. This
allows calling such Telegram Mini Apps method
as [web_app_switch_inline_query](methods.md#web-app-switch-inline-query).

### `tgWebAppStartParam`

Parameter that contains a custom string value passed in the bot or application
link. [Learn more](start-parameter.md).

### `tgWebAppFullscreen`

Parameter indicating if the application is currently launched in the fullscreen mode.


