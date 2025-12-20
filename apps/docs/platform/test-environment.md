# Test Environment

Telegram provides the special environment for development with some specific features. For example,
a developer will be allowed to create a new Telegram bot and specify a Mini Apps link with HTTP
protocol or even IP. As opposed to the test environment, in production, a developer is only allowed
to specify links with HTTPS protocol. That's why this step is important during the Mini App
development process.

::: info

You are only allowed to create a new account in the test environment in mobile versions of Telegram.
Nevertheless, in this documentation, you will find out how to link to these accounts in other
versions of Telegram.

:::

### Telegram for iOS

- Fastly tap `Settings` section 10 times.
- Tap `Accounts` button.
- Tap `Login to another account`.
- Tap `Test` button.
- Create a new account.

### Telegram Desktop

- Open side menu.
- Expand the menu item, where current username is specified.
- Hold `Shift` + `Alt` (`option` for macOS) and press **right** mouse button on `Add Account` button.
- Select `Test Server`.
- Link the account created in the test environment.

### Telegram for macOS

- Fastly tap Settings icon 10 times to open the Debug Menu.
- Hold `cmd` and click `Add Account` button.
- Link the account created in the test environment.