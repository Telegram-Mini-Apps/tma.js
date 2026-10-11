# Viewport

The term **Viewport** refers to the **visible portion** of a Mini App. Since Mini Apps can appear
differently across various platforms, viewport information is used to ensure the Mini App is
displayed correctly.

Viewport data is defined by the following properties:

- **`width`** and **`height`**: Specify the dimensions of the visible area of the Mini App.
- **`stability`**: A boolean flag that is `true` when the Mini App's size is not expected to change
  imminently.
- **`expansion`**: A boolean flag that is `true` when the Mini App has reached its maximum height.
- **`fullscreen`**: A boolean flag indicating whether the application is displayed in fullscreen
  mode.
- **`safe area`**: An information describing the viewport content safe area and insets.

## Expanding

When an application is opened in the mobile version of Telegram (on both Android and iOS), it is
displayed within a native component called **`BottomSheet`**. This is a draggable block that appears
at the bottom of the screen and can be expanded to cover the entire screen. Users can expand it by
dragging it to the top edge of the screen, but developers can also trigger this programmatically.

By default, the application opens in a minimized state with the minimum allowed height. To expand
the application via code, developers can call the [**`web_app_expand`**](methods.md#web-app-expand)
method.

<img  
src="/components/viewport/expansion.png"  
srcset="/components/viewport/expansion.png, /components/viewport/expansion@2x.png 2x"  
class="guides-image"  
/>

While the **`BottomSheet`** is being dragged, the viewport is considered unstable. For developers,
this means avoiding any resizing actions or similar operations, as viewport dimensions may change
momentarily.

On other platforms, Mini Apps open maximized by default within a medium-sized window. In these
cases, calling the [web_app_expand](methods.md#web-app-expand) method will have no effect.

## Fullscreen

![Full screen](/functionality/full-screen.png)

Mini apps can be launched in **fullscreen mode**, which expands the application to cover the entire
device screen, removing both the top and bottom bars of Telegram.

This mode is particularly suitable for games and media-focused applications.

To control fullscreen mode, Telegram Mini Apps provides such methods
as [web_app_request_fullscreen](methods.md#web-app-request-fullscreen)
and [web_app_exit_fullscreen](methods.md#web-app-exit-fullscreen).

[//]: # (TODO: Learn more and write this section)
[//]: # (## Safe Area)

[//]: # ()
[//]: # (In mini apps, the **safe area** refers to the portion of the screen that is free from)

[//]: # (obstructions like notches, status bars, navigation bars, or rounded screen edges. It ensures that)

[//]: # (essential content is displayed properly and not hidden or truncated.)

[//]: # ()
[//]: # (Using the safe area is crucial for delivering a seamless user experience, especially on devices with)

[//]: # (modern screen designs &#40;e.g., iPhones with notches or Android devices with rounded corners&#41;.)

[//]: # (Developers typically use CSS properties or platform-specific guidelines)

[//]: # (&#40;e.g., `env&#40;safe-area-inset-*&#41;` in CSS&#41; to adjust the layout within the safe area boundaries, but)

[//]: # (in Telegram Mini Apps, these values are passed manually from the Telegram application.)

