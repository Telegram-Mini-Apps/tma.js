# Theme Parameters

This section of SDK covers the topic related
to [theme parameters](../../platform/theming.md).

## Parsing

To parse a value as theme parameters, the package provides the method `parseThemeParams`. This
method accepts a JSON object as a string or a JavaScript object, returning the `ThemeParams`
interface. It throws an error if the provided data is invalid.

::: code-group

```typescript [Usage example]
import { parseThemeParams } from '@telegram-apps/sdk';

parseThemeParams({
  accent_text_color: "#6ab2f2",
  bg_color: "#17212b",
  button_color: "#5288c1",
  button_text_color: "#ffffff",
  destructive_text_color: "#ec3942",
  header_bg_color: "#17212b",
  hint_color: "#708499",
  link_color: "#6ab3f3",
  secondary_bg_color: "#232e3c",
  section_bg_color: "#17212b",
  section_header_text_color: "#6ab3f3",
  subtitle_text_color: "#708499",
  text_color: "#f5f5f5"
});
```

```typescript [Expected result]
const result = {
  accentTextColor: "#6ab2f2",
  bgColor: "#17212b",
  buttonColor: "#5288c1",
  buttonTextColor: "#ffffff",
  destructiveTextColor: "#ec3942",
  headerBgColor: "#17212b",
  hintColor: "#708499",
  linkColor: "#6ab3f3",
  secondaryBgColor: "#232e3c",
  sectionBgColor: "#17212b",
  sectionHeaderTextColor: "#6ab3f3",
  subtitleTextColor: "#708499",
  textColor: "#f5f5f5"
};
```

:::

Assuming each property is written using snake case it converts them to camel case.

## Serializing

To convert the theme parameters object representation to a string, developers should use
the `serializeThemeParams` function:

```typescript
import { serializeThemeParams } from '@telegram-apps/sdk';

serializeThemeParams({
  accentTextColor: "#6ab2f2",
  bgColor: "#17212b",
  buttonColor: "#5288c1",
  buttonTextColor: "#ffffff",
  destructiveTextColor: "#ec3942",
  headerBgColor: "#17212b",
  hintColor: "#708499",
  linkColor: "#6ab3f3",
  secondaryBgColor: "#232e3c",
  sectionBgColor: "#17212b",
  sectionHeaderTextColor: "#6ab3f3",
  subtitleTextColor: "#708499",
  textColor: "#f5f5f5"
});

// Result:
// `{
//   "accent_text_color":"#6ab2f2",
//   "bg_color":"#17212b",
//   "button_color":"#5288c1",
//   "button_text_color":"#ffffff",
//   "destructive_text_color":"#ec3942",
//   "header_bg_color":"#17212b",
//   "hint_color":"#708499",
//   "link_color":"#6ab3f3",
//   "secondary_bg_color":"#232e3c",
//   "section_bg_color":"#17212b",
//   "section_header_text_color":"#6ab3f3",
//   "subtitle_text_color":"#708499",
//   "text_color":"#f5f5f5"
// }`
```
