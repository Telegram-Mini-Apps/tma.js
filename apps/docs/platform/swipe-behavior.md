# Swipe Behavio
r

![Swipe behavior](/functionality/swipe-behavior.png)

Mini Apps sometimes use swipe gestures that may conflict with the gestures for minimizing and closing the app.
For users, this could appear as accidentally swiping down to dock a Mini App while interacting with it.

To prevent this, developers have the option to configure the swipe behavior,
so the application won't hide in the dock when swiping the application itself.

In any case, users will still be able to minimize and close the Mini App by swiping the Mini App's header.

To disable vertical page swipes, Telegram Mini Apps provides a method
called [web_app_setup_swipe_behavior](methods.md#web-app-setup-swipe-behavior).
