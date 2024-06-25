# Navigation

Navigation in mobile applications has a rather complex nature. We use the term 'mobile' here
because, at the moment, Mini Apps are designed to resemble mobile applications, so the navigation
should follow suit.

Since Mini Apps are web applications meant to emulate mobile interfaces, it's essential to compare
browser and mobile navigation mechanisms. It's safe to say that they don't have much in common.

In simple terms, browser navigation operates over a two-linked list of history entries. Developers
can navigate through each node using forward or back navigation methods. It's also possible to
replace the current entry and add new entries, removing all those placed after the current one.

On the contrary, mobile navigation allows developers to use a multi-navigation context, implying the
existence of several navigation contexts across the application.

However, browser navigation comes with rather strict restrictions that make it challenging to
comfortably mimic the behavior seen in mobile applications within Telegram Mini Apps. This is why
`@telegram-apps/sdk` provides functionality related to navigation.
