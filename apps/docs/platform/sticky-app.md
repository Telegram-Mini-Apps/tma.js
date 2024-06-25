# Sticky App

Developers often seek ways to make their applications "sticky." In this context, "sticky" refers to
preventing the application from being closed accidentally, such as by a swipe-down gesture.

Before implementing measures to prevent accidental closure, it's essential to understand why this
behavior exists in the first place.

Telegram Mini Apps allow developers to manipulate the visibility of the Close button, sometimes
replacing it with a Back button. Because of this, Telegram developers want to ensure users can still
exit an app even if the Close button is not visible. This is why the swipe-down mechanism exists.

Consider a scenario where the application displays the Back button but becomes unresponsive. In such
cases, rather than closing the entire Telegram app, users can simply swipe down to close the mini
application. Therefore, before you disable this mechanism, ensure that your application does not
become unresponsive and trap users.

Finally, check if the [closing confirmation](./closing-behavior.md) suits your needs.

## Making the App Sticky

To make your app sticky, you can use specific CSS styles that prevent the WebView from passing the
swipe event to the Telegram application.

Here is the HTML and CSS you can use:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta
    name="viewport"
    content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"
  >
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>My Mini App</title>
  <style>
    .mobile-body {
      overflow: hidden;
      height: 100vh;
    }

    .mobile-wrap {
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      overflow-x: hidden;
      overflow-y: auto;
      background: red;
    }

    .mobile-content {
      height: calc(100% + 1px);
      background: green;
    }
  </style>
</head>
<body>
  <div id="wrap">
    <div id="content">
      My application goes here.
    </div>
  </div>
  <script src="https://unpkg.com/@telegram-apps/sdk@2.5.0/dist/index.iife.js"></script>
  <script>
    (function() {
      var { retrieveLaunchParams, postEvent } = window.tmajs.sdk;
      var lp = retrieveLaunchParams();

      // Some versions of Telegram don't need the classes above.
      if (['macos', 'tdesktop', 'weba', 'web', 'webk'].includes(lp.platform)) {
        return;
      }

      // Expand the application.
      postEvent('web_app_expand');

      document.body.classList.add('mobile-body');
      document.getElementById('wrap').classList.add('mobile-wrap');
      document.getElementById('content').classList.add('mobile-content');
    })();
  </script>
</body>
</html>
```

Using this HTML and CSS will prevent most accidental swipe-down closures. While this method covers
most scenarios, there are rare cases where it may not be effective, but these are uncommon in
real-world usage.

[Open in Telegram](https://t.me/tmajsbot/sticky_app) ([Source code](https://github.com/Telegram-Mini-Apps/sticky-app/blob/master/dist/index.html))