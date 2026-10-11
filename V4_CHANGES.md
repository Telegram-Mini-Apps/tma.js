# Что изменилось в новых мажорных версиях пакетов @tma.js

Сравнение старых мажорных версий (`packages-old/*`, на ветке `master` это `packages/*`) с новыми,
которые разрабатываются в ветке `feat/v4` (`packages/*`).

> Версии в `packages/*/package.json` пока не подняты: там стоят старые номера (bridge 2.4.0,
> sdk 3.4.0 и т. д.). Ниже «старая» и «новая» версии означают `packages-old/*` и `packages/*`.

## Содержание

1. [Коротко](#1-коротко)
2. [Сквозные изменения во всех пакетах](#2-сквозные-изменения-во-всех-пакетах)
3. [@tma.js/bridge](#3-tmajsbridge)
4. [@tma.js/sdk](#4-tmajssdk)
5. [@tma.js/init-data-node → @tma.js/init-data](#5-tmajsinit-data-node--tmajsinit-data)
6. [Биндинги: sdk-react, sdk-vue, sdk-solid, sdk-svelte](#6-биндинги-sdk-react-sdk-vue-sdk-solid-sdk-svelte)
7. [Удалённые пакеты](#7-удалённые-пакеты)
8. [Что было в старых версиях и пропало без замены](#8-что-было-в-старых-версиях-и-пропало-без-замены)
9. [Что нужно сделать до релиза](#9-что-нужно-сделать-до-релиза)

---

## 1. Коротко

### Пакеты

| Было | Стало | Статус |
|---|---|---|
| `@tma.js/bridge` | `@tma.js/bridge` | Переписан |
| `@tma.js/sdk` | `@tma.js/sdk` | Переписан |
| `@tma.js/init-data-node` (+ `/web`) | **`@tma.js/init-data`** | Переименован и переписан |
| `@tma.js/sdk-react` / `-vue` / `-solid` / `-svelte` | те же имена | `useSignal` → `useComputed` |
| `@tma.js/signals` | — | **Удалён** |
| `@tma.js/toolkit` | — | **Удалён** |
| `@tma.js/transformers` | — | **Удалён** |
| `@tma.js/types` | — | **Удалён**, типы переехали в bridge и init-data |

### Главное, что почувствует пользователь

1. **Нет fp-ts.** Все `xFp()` с `Either`/`TaskEither` заменены на `safeX()`, которые возвращают
   `Result` вида `{ ok: true, data } | { ok: false, error }`. Обычные `x()` по-прежнему бросают
   исключения.
2. **Нет `BetterPromise`.** Везде обычный `Promise`. Отмена делается через стандартный
   `AbortSignal` (опция `signal` вместо `abortSignal`), а `.cancel()` и `CancelledError` пропали.
3. **Нет `@tma.js/signals`.** Реактивные значения стали `Computed<T>` с одним методом
   `subscribe((next, prev) => …)`, который возвращает функцию отписки. `.sub`, `.unsub`,
   `.unsubAll`, `once` и публичные `signal()`/`computed()`/`batch()` убраны.
4. **Нет `isAvailable()` / `ifAvailable()`.** Есть только `isSupported()` (обычная функция, не
   сигнал) и `supports(feature)`. Вызов неподдерживаемого метода, метода до `init()` или метода
   несмонтированного компонента бросает исключение.
5. **Компоненты SDK — обычные объекты-синглтоны**, а не классы с DI-опциями. `new BackButton(...)`,
   `instanceof` и типы `*Options` больше не существуют.
6. **`init()` обязателен для всего.** В старой версии часть функций работала без `init()`, теперь
   они бросают `NotInitializedError`.
7. **`LaunchParams.tgWebAppData` — сырая строка**, а не распарсенный объект. Для парсинга есть
   `@tma.js/init-data` или компонент `initData` в SDK.
8. **Нет IIFE-сборки.** Bridge и SDK больше не подключить через `<script>` с CDN как глобалы
   `tapps.bridge` / `tmajs.sdk`. Остались только ESM и CJS.
9. **Зависимости.** Удалены `fp-ts`, `better-promises`, `mitt` и внутренние signals, toolkit,
   transformers и types. `error-kid` обновлён с 2 до 3, `valibot` с ^1.1 до ^1.5.

---

## 2. Сквозные изменения во всех пакетах

### 2.1 Обработка ошибок: fp-ts → Result

```ts
// Было
import { requestFp } from '@tma.js/bridge';
import { taskEither as TE, function as fn } from 'fp-ts';

await fn.pipe(
  requestFp('web_app_request_phone', 'phone_requested', { timeout: 5000 }),
  TE.match(err => console.error(err), ({ status }) => console.log(status)),
)();

// Стало
import { safeRequest, matchError } from '@tma.js/bridge';

const r = await safeRequest('web_app_request_phone', 'phone_requested', { timeout: 5000 });
if (r.ok) {
  console.log(r.data.status);
} else {
  matchError(r.error, { TimeoutError: e => console.error(e.data.timeout) });
}
```

- В `Result<E, T>` тип ошибки стоит **первым**.
- Bridge экспортирует хелперы `ok`, `err`, `unwrap` и `throwing`. `throwing(safeX)` превращает
  safe-функцию в бросающую.
- `matchError` из error-kid v3 сопоставляет ошибки по имени и проверяет, что обработаны все варианты.
- **Важно:** в `Result` попадают только *ожидаемые* ошибки, например таймаут, отказ пользователя или
  невалидный ответ. Ошибки окружения и неправильного использования бросаются даже из `safeX`:
  `UnknownEnvError`, `MethodUnsupportedError`, `NotInitializedError`, `NotMountedError`,
  `ConcurrentCallError`, отмена через `signal.reason`.
- Не у каждой функции есть safe-вариант. Если ожидаемых ошибок нет, safe-версии тоже нет, например
  у `hideKeyboard`, `shareStory`, `shareURL` и `decodeStartParam`.

### 2.2 Асинхронность: BetterPromise → Promise + AbortSignal

```ts
// Было
const p = request('web_app_request_phone', 'phone_requested', { timeout: 5000 });
p.cancel(); // CancelledError

// Стало
const ac = new AbortController();
const p = request('web_app_request_phone', 'phone_requested', { signal: ac.signal, timeout: 5000 });
ac.abort(); // промис отклоняется с ac.signal.reason
```

- Опция `abortSignal` переименована в `signal`.
- `TimeoutError` теперь собственный класс bridge на error-kid с полем `.data.timeout`. Это **другой
  класс**, поэтому старые проверки `instanceof` против `TimeoutError` из better-promises не сработают.

### 2.3 Ошибки на error-kid v3

- У всех классов ошибок есть статический метод `.is(value)`. Он проверяет тег, поэтому работает между
  realm'ами и при дублировании пакета в бандле.
- Большинство ошибок получили поле `.data` со структурированными данными, а сообщения стали
  информативнее.

### 2.4 Ключи sessionStorage

| Что | Было | Стало |
|---|---|---|
| Launch params | `tapps/launchParams` (JSON) | `tma.js/launch-params` (query-строка) |
| Состояние компонентов SDK | `tapps/<name>` | `tma.js/sdk/<name>` |

После обновления сохранённое ранее состояние не подхватится. Это важно только при перезагрузке
страницы внутри одной сессии во время выкатки.

### 2.5 Сборка

- Форматы: только `es` + `cjs`, IIFE больше не собирается.
- В `exports` добавлено условие `"@tma.js/source": "./src/index.ts"`. Оно нужно для разработки в
  монорепозитории, а в опубликованном пакете указывает на отсутствующий файл, потому что публикуется
  только `dist`. Пользователей это не затронет, если они сами не включат такое условие.
- `sideEffects: false`, как и раньше.
- `engines` объявлен только у `@tma.js/init-data` (`node >= 20`).

---

## 3. @tma.js/bridge

Наборы методов (63) и событий (62) Mini Apps **не изменились**, таблица версий релизов тоже
идентична. Поменялся API вокруг них.

### 3.1 Переименования

| Было | Стало |
|---|---|
| `on(event, fn, once?)` | `onEvent(event, fn, { once?, signal? })` |
| `off(event, fn, once?)` | `offEvent(event, fn)` |
| `on('*', fn)` / `off('*', fn)` | `onAnyEvent(fn, opts)` / `offAnyEvent(fn)` |
| `request2` / `request2Fp` | `request` / `safeRequest` |
| `requestFp` | `safeRequest` |
| `invokeCustomMethodFp` | `safeInvokeCustomMethod` |
| `isTMA('complete', opts)` | `isTMAAsync({ timeout?, signal? })` |
| `isTMAFp` | — (используйте `isTMA()` / `isTMAAsync()`) |
| `retrieveLaunchParamsFp` и др. `retrieve*Fp` | `safeRetrieveLaunchParams`, `safeRetrieveRawLaunchParams`, `safeRetrieveRawInitData` |
| `createStartParamFp` | `safeCreateStartParam` |
| `debug()` (сигнал) | `isDebug()` |
| `targetOrigin()` (сигнал) | `getTargetOrigin()` |
| `logger()` / `logger.set(x)` | `getLogger()` / `setLogger(x)` |
| `mockTelegramEnv({ onEvent })` | `mockTelegramEnv({ onMethod })` |
| `parseLaunchParamsQuery` (transformers) | `parseLaunchParams` / `safeParseLaunchParams` |
| `serializeLaunchParamsQuery` (transformers) | `serializeLaunchParams` |
| Тип `SubscribeListener` | `AnyEventListener` |
| Типы `EventWithPayload` / `EventWithoutPayload` | `EventNameWithPayload` / `EventNameWithoutPayload` |
| Тип `MethodVersionedParams` | `MethodVersionedParam` |
| Тип `RetrieveLaunchParamsResult` | `LaunchParams` |

### 3.2 Удалено без прямой замены

- `postEventFp`, `decodeBase64UrlFp`, `decodeStartParamFp`. Остались только бросающие версии.
- `resetGlobals()`. Вместо него вызовите `offAll()`, `setDebug(false)`, `setLogger()` и
  `setTargetOrigin('https://web.telegram.org')`.
- `postMessage` и `postMessageImpl`.
- `applyPolyfills()` (полифил `Object.hasOwn`). Если нужна поддержка очень старых WebView,
  подключайте полифил сами.
- Реэкспорты `createLogger`, `deepSnakeToCamelObjKeys`, `CancelledError` и типов `Logger*` /
  `LogLevel` / `DeepConvertSnakeKeysToCamelCase`.

### 3.3 Изменения поведения

**`request`**

- Возвращает `Promise`, а не `BetterPromise`.
- **При массиве событий всегда резолвится в `{ event, payload }`**, как раньше делал `request2`.
  Старый `request` с массивом возвращал только payload.

  ```ts
  // Было
  const payload = await request('web_app_request_fullscreen', ['fullscreen_changed', 'fullscreen_failed']);
  // Стало
  const { event, payload } = await request('web_app_request_fullscreen', ['fullscreen_changed', 'fullscreen_failed']);
  ```

- Исключение, брошенное в `capture`, теперь отклоняет запрос.

**`invokeCustomMethod`**: `requestId` переехал из позиционного аргумента в опции и стал
необязательным. По умолчанию он генерируется через новую функцию `createRequestId()`.

```ts
// Было
await invokeCustomMethod('getStorageKeys', {}, 'req-1', { timeout: 5000 });
// Стало
await invokeCustomMethod('getStorageKeys', {}, { timeout: 5000 });
```

**События**

- Повторная подписка той же функции ничего не делает. В mitt один и тот же обработчик мог
  вызываться несколько раз.
- Исключение в обработчике логируется через `getLogger().error` и не мешает остальным обработчикам.
- У обработчиков событий без payload параметр типизирован как `undefined`, а не `never`.
- `emitEvent` принимает только известные имена событий. Вне iframe он вызывает
  `window.Telegram.WebView.receiveEvent`, если тот есть, поэтому событие получает и официальный SDK.
- Нормализация payload:
  - `viewport_changed` с `null` подставляет `width: window.innerWidth`;
  - `popup_closed` приводится к `{}` или `{ button_id }`.
- В режиме debug события логируются только пока есть хотя бы один подписчик. Раньше `setDebug(true)`
  сам подписывался на все события.

**`postEvent`**

- Сигнатура стала одной generic-функцией `<M>(method: M, ...args: MethodArgs<M>)`.
- Метод без параметров отправляется с `eventData: ""`, как в официальном SDK. Раньше `eventData`
  отсутствовал.

**Launch params**

- **`tgWebAppData` теперь строка**, а не распарсенный `InitData`.
- Схема строже: неизвестные ключи вырезаются (`object` вместо `looseObject`), а `tgWebAppPlatform` и
  `tgWebAppVersion` должны быть непустыми.
- Невалидный `tgWebAppData` больше не ломает получение launch params, потому что bridge его не
  валидирует.
- Добавлен четвёртый источник: `sessionStorage['__telegram__initParams']` официального SDK.

**`mockTelegramEnv`**

- Возвращает функцию восстановления.
- Опция `onEvent` → `onMethod(call, next)`, `resetPostMessage` удалена.
- `launchParams` принимает `string | URLSearchParams | LaunchParams`.

**Прочее**

- `getReleaseVersion` для неизвестного метода возвращает `undefined` вместо `null`.
- `compareVersions` возвращает тип `-1 | 0 | 1`.
- `hasWebviewProxy()` больше не принимает аргумент и проверяет `window`.
- `createStartParam` бросает `StartParamTooLongError` вместо обычного `Error`.
- `decodeBase64Url` на невалидном UTF-8 бросает `TypeError` вместо `URIError`.
- Логгер: `setLogger({ log, warn, error })`. Фабрики `createLogger` и методов `force*` больше нет.
  От debug зависит только `log`, а `warn` и `error` печатаются всегда.

### 3.4 Типы

- `Methods[M]` теперь сам является типом параметров, а не `{ params, versionedParams }`. Код вида
  `Methods[M]['params']` нужно поменять на `MethodParams<M>`.
- Новые типы: `MethodArgs<M>`, `EventListenerPayload`, `AnyEvent`, `OnOptions`, `EmitEventArgs`,
  `RequestFnArgs`, `RequestFnOptions`, `MockedMethodCall`.
- `RGB`, `Version`, `Platform` и `ThemeParams` переехали сюда из `@tma.js/types`.
- `ThemeParams` теперь интерфейс с явными snake_case-ключами. В него добавлен
  `section_separator_color`, а `KnownThemeParamsKey` удалён.
- `Platform` не содержит литерала `'web'`, но остаётся `| string`, так что это не ломающее изменение.

### 3.5 Ошибки

| Было | Стало |
|---|---|
| `UnknownEnvError` (без сообщения) | Появилось сообщение |
| `MethodUnsupportedError`, `MethodParameterUnsupportedError` | Добавлено `.data` |
| `InvalidLaunchParamsError(lp, cause)` | `(value, cause?)`, `.data.value`, новое сообщение |
| `InvokeCustomMethodFailedError` с `name = 'InvokeCustomMethodError'` | **`name` = `'InvokeCustomMethodFailedError'`** |
| `TimeoutError` из better-promises | Собственный класс, `.data.timeout` |
| `CancelledError` | Удалён, отмена отклоняет промис с `signal.reason` |
| — | Новая `StartParamTooLongError` |

---

## 4. @tma.js/sdk

### 4.1 Форма компонентов

```ts
// Было
backButton.mount.ifAvailable();
if (backButton.show.isAvailable()) {
  backButton.show();
}
const off = backButton.isVisible.sub(v => console.log(v));
backButton.onClick(handler, true); // once

// Стало
if (backButton.isSupported()) {
  backButton.mount();
  backButton.show();
}
const off = backButton.isVisible.subscribe((next, prev) => console.log(next));
backButton.onClick(handler, { once: true });
```

- Компоненты — объекты-синглтоны. Экспортируются только их TS-интерфейсы.
- Удалены все `*Fp`, все `isAvailable` и `ifAvailable`, все типы `*Options` для DI (`BackButtonOptions`,
  `MiniAppOptions` и т. п.).
- У каждой кнопки появилось поле `state: Computed<S>`.

### 4.2 Инициализация

```ts
// Было
init({ version: '8.0', isInlineMode: false, themeParams: {...}, postEvent: postEventFp });
initFp(opts); // Either

// Стало
init({
  launchParams: { tgWebAppVersion: '8.0', tgWebAppPlatform: 'tdesktop', tgWebAppThemeParams: {...} },
  postEvent, // PostEventFn, бросающая
  acceptCustomStyles: true,
});
safeInit(opts); // Result<LaunchParamsRetrieveError, VoidFunction>
isInitialized(); // новое
```

- Опции `version`, `isInlineMode` и `themeParams` удалены. Вместо них передайте целиком
  `launchParams`.
- `postEvent` по умолчанию теперь `createPostEvent(version)` в строгом режиме, то есть **с проверкой
  версии**: неподдерживаемый метод бросает `MethodUnsupportedError`. Старый вариант по умолчанию
  версию не проверял.
- Обработка `reload_iframe`, кастомные стили и отправка `iframe_ready` выполняются только внутри
  iframe.
- Повторный `init()` сначала выполняет очистку от предыдущего вызова.

**Ломающее изменение, которое легко пропустить.** В старой версии многие функции проверяли только
`isTMA()` и работали **без `init()`**: `closingBehavior`, `themeParams`, `mainButton`, `miniApp.mount`,
`close`, `ready` и `bindCssVars`, `viewport.mount`, `expand` и `bindCssVars`, `openLink`, `sendData`,
`shareURL`, `initData.restore`. **Теперь все они бросают `NotInitializedError` до вызова `init()`.**

### 4.3 Проверки доступности

| Было | Стало |
|---|---|
| `fn.isAvailable()` — реактивный сигнал (TMA + init + поддержка + смонтирован) | — |
| `fn.ifAvailable(...args)` | — |
| `fn.isSupported()` — сигнал | `fn.isSupported()` — **обычная функция**: init + поддержка клиентом. Смонтированность **не проверяет** |
| `fn.supports(key)` — только у `miniApp.setHeaderColor` | `supports()` есть у `openLink`, `miniApp.close`, `miniApp.setHeaderColor`, `mainButton.setParams`, `secondaryButton.setParams` |
| `FunctionUnavailableError` | `NotInitializedError`, `MethodUnsupportedError`, `MethodParameterUnsupportedError`, `NotMountedError` |

Замена для `ifAvailable` у метода, которому нужен смонтированный компонент:
`if (x.isSupported() && x.isMounted()) x.method()`.

`isSupported()` впервые появился у `mainButton`, `closingBehavior`, `cloudStorage`, `deviceStorage`
и `secureStorage`.

### 4.4 Реактивность

- Тип `Computed<T>` имеет вид `x()` плюс `x.subscribe((next, prev) => void) → unsubscribe`.
- Слушатель вызывается только при изменении значения (`Object.is`) и **не** вызывается при подписке.
- Источники подписываются лениво, только пока у значения есть слушатели.
- Ссылка на значение сохраняется, пока значение не изменилось, поэтому `Computed` совместим с
  `useSyncExternalStore(x.subscribe, x)`.
- Публичных `computed` и `batch` нет. Если пользователь строил свои вычисляемые значения из сигналов
  SDK, ему понадобится сторонняя библиотека.

### 4.5 Монтирование

| | Было | Стало |
|---|---|---|
| Асинхронный mount (viewport, biometry, locationManager) | `BetterPromise` / `TaskEither` | `Promise` + `safeMount()` → `Result<TimeoutError, void>` |
| `isMounting` | не было | **новое** `Computed<boolean>` |
| `unmount` во время асинхронного mount | не отменял mount | отменяет |
| Восстановление из sessionStorage | при каждом mount после перезагрузки | только при первом mount после перезагрузки |
| `miniApp.mount()` | не трогал themeParams | **автоматически монтирует `themeParams`** |

Вызов метода несмонтированного компонента бросает `NotMountedError`.

### 4.6 Изменения по компонентам

**Кнопки (back, settings, main, secondary)**

- `onClick(fn, once?)` → `onClick(fn, { once?, signal? })`, `offClick(fn, once?)` → `offClick(fn)`.
  Обе функции больше никогда не бросают исключений.
- `mainButton` и `secondaryButton` описываются общим типом `BottomButton<S>`.
- `iconCustomEmojiId` теперь `string | undefined` (было `''`). Неустановленные параметры не
  отправляются в Telegram.
- Дефолтный `secondaryButton.bgColor`: было `bottomBarColor || '#000000'`, стало
  `bottomBarColor || themeParams.secondaryBgColor || '#ffffff'`.

**miniApp**

- Новые методы: `safeSetBgColor`, `safeSetBottomBarColor`, `safeSetHeaderColor` и
  `close.supports('returnBack')`.
- Цвета разбираются через `safeToRGB`. Принимаются `#RGB`, `#RGBA`, `#RRGGBBAA`, `rgb()` и `rgba()`.
- `bottom_bar_bg_color` откатывается на `secondary_bg_color`, как в официальном SDK.
- `close(false)` отправляет `{}` вместо `{ return_back: false }`.
- `isActive` изначально `true`.
- `isDark` равен `false`, если цвет неизвестен или невалиден.

**themeParams**

- **`isDark` при отсутствии `bg_color` теперь `false`**, раньше было `true`.
- Событие `theme_changed` **заменяет** состояние целиком. Раньше новые значения сливались со старыми.
- Исправлен баг: при отвязке CSS-переменных они не удалялись.

**viewport**

- Удалены `isStable`, а также `safeAreaInsetTop/Bottom/Left/Right` и
  `contentSafeAreaInsetTop/Bottom/Left/Right`. Используйте `safeAreaInsets()` и
  `contentSafeAreaInsets()`. Соответствующие CSS-переменные по-прежнему выставляются.
- Новые методы: `safeRequestFullscreen`, `safeExitFullscreen`, `isMounting` и `safeMount`.
- `bindCssVars` теперь требует, чтобы компонент был смонтирован.

**initData**

- Данные берутся из строки `tgWebAppData` и парсятся через `@tma.js/init-data`.
- Добавлен `safeRestore()`.

**biometry**

- **`requestAccess()` возвращает `accessGranted`.** Раньше он по ошибке возвращал `accessRequested`.
- Поле `state.token` удалено: токен только возвращается из `authenticate`.
- `NotAvailableError` → `BiometryUnavailableError`.
- Параллельный второй вызов `authenticate`, `requestAccess` или `updateToken` бросает
  `ConcurrentCallError`.
- `updateToken` обновляет `tokenSaved`.

**locationManager**

- Тип `LocationManagerRequestLocationResponse` → `LocationData`.
- Новое: `isMounting`, `safeMount`, `safeRequestLocation`.
- Состояние обновляется по событию `location_checked`.

**popup**

- Типы `ShowOptions` → `PopupShowOptions`, `ShowOptionsButton` → `PopupShowButton`.
- Новые `safeShow` и хелпер `preparePopupParams`.

**invoice**

- Новые `safeOpenSlug` и `safeOpenUrl`.
- Невалидный URL возвращает `InvalidArgumentsError`.

**qrScanner**

- Новые `safeOpen` и `safeCapture`.
- Опция `capture` стала необязательной: по умолчанию сканер берёт первый найденный QR-код.
- Таймаут или отмена закрывают сканер.

**cloudStorage**

- Удалена перегрузка `getItem(keys[])`. Используйте `getItems`.
- Опции методов: `{ signal, timeout }`.

**deviceStorage / secureStorage**

- Появились `isSupported()` и опции `{ signal, timeout }`.
- Ошибки теперь `XMethodError | TimeoutError`.

**serverless**

- `abortSignal` → `signal`.
- Отсутствие init data бросает `InvalidEnvError`, а не возвращает его.

**Во всех компонентах** `ConcurrentCallError` (popup, invoice, qrScanner, biometry) теперь
**бросается**, а не возвращается как ошибка.

### 4.7 Функции

Общее правило: `xFp` → `safeX`. Бросающая `x` остаётся и получает `.isSupported()`.

- Без safe-варианта: `hideKeyboard`, `shareStory`, `switchInlineQuery`, `addToHomeScreen`, `shareURL`.
- `switchInlineQuery` вне inline-режима бросает `InvalidEnvError`, и его `isSupported()` учитывает
  inline-режим.
- `requestContact`:
  - тип `RequestedContactCompleteData` → `RequestedContactComplete`;
  - таймаут покрывает всю операцию;
  - обрабатываются ответы macOS-клиента, где JSON приходит в кавычках.
- `getCurrentTime`: `ValidationError` → `InvalidResponseError`.
- Новые экспорты: `isTelegramHostname`, `preparePopupParams`.
- **Удалены SDK-обёртки над bridge:** `postEvent`, `request`, `request2` и `invokeCustomMethod`,
  которые подставляли `postEvent` из `init()`. Теперь эти имена реэкспортируются напрямую из bridge и
  **не используют** `postEvent`, переданный в `init()`. Если он нужен, передавайте `{ postEvent }`
  явно.

### 4.8 Цвета

| Было | Стало |
|---|---|
| `isColorDark`, `isColorDarkFp` | `isColorDark`, `safeIsColorDark` |
| `toRGB`, `toRGBFp`, `toRGBFull`, `toRGBFullFp`, `isRGB`, `isRGBShort`, `isRGBA`, `isRGBAShort`, `isAnyRGB` | `toRGB`, `safeToRGB`, `isRGB`, ошибка `InvalidColorError` |

`toRGB` отбрасывает альфа-канал. Конвертации в `#RRGGBBAA` больше нет.

### 4.9 Ошибки

| Было | Стало |
|---|---|
| `FunctionUnavailableError` (`name = 'FunctionNotAvailableError'`) | Удалена → `NotInitializedError`, `NotMountedError`, `MethodUnsupportedError`, `MethodParameterUnsupportedError` |
| `NotAvailableError` | `BiometryUnavailableError` |
| `ValidationError` | `InvalidResponseError` (`.data.value`, ValiError в `cause`) |
| `ServerlessError(message, { …, cause })` | `ServerlessError(message, { status, type?, parameters? }, cause?)` |
| `UnknownThemeParamsKeyError` | Добавлено `.data.key` |
| `SetEmojiStatusError`, `ShareMessageError`, `RequestChatError`, `FullscreenFailedError` | Добавлено `.data.error`, сообщения с префиксом |
| — | Новые `NotInitializedError`, `NotMountedError`, `InvalidColorError` |
| Объединения ошибок для каждой функции (`OpenLinkError`, `ShareURLError` и т. д.) | Удалены. Остались `CloudStorageError`, `DeviceStorageError`, `SecureStorageError`, `RequestContactError`, `ServerlessCallError` |

### 4.10 Одинаковое имя, другой смысл

| Имя | Было | Стало |
|---|---|---|
| `InitData` | класс компонента | тип данных (класс → `InitDataComponent`) |
| `ThemeParams` | класс компонента | тип записи (класс → `ThemeParamsComponent`) |
| `TimeoutError` | из better-promises | собственный класс bridge |
| `isSupported` | сигнал | функция |

---

## 5. @tma.js/init-data-node → @tma.js/init-data

### 5.1 Пакет

- Пакет переименован. Подпуть `./web` удалён, осталась одна точка входа.
- Код использует только WebCrypto: нет `node:crypto` и `Buffer`. Работает в Node 20+, Bun, Deno и
  Cloudflare Workers.
- **Всё стало асинхронным.** Синхронного Node API (`validate`, `sign`, `isValid` без промиса)
  больше нет.

### 5.2 API

| Было | Стало |
|---|---|
| `parse` (бросает `ValiError`) | `parse` (бросает `InvalidInitDataError`, ValiError в `cause`) |
| `parseFp` | `safeParse` |
| — | **`serialize(Partial<InitData>)`** |
| `validate(value, token, opts)` → `void` | `validate(value, secret, opts)` → **`Promise<InitData>`**, возвращает распарсенные данные |
| `validateFp` | `safeValidate` |
| `isValid` (синхронный в node) | `isValid` → `Promise<boolean>` |
| `validate3rd` → `void` | `validate3rd` → `Promise<InitData>` |
| `validate3rdFp`, `isValid3rdFp`, `isValidFp`, `signFp`, `signDataFp` | `safeValidate3rd`, остальные удалены |
| `sign(data, token, authDate, options?)` | **`sign(data, secret)`**, `auth_date` передаётся внутри `data` (по умолчанию `new Date()`) |
| `signData(data: string \| ArrayBuffer, …)` | `signData(data: string, secret)` |
| `hashToken(token)` → `Buffer` / `ArrayBuffer` | `hashToken(token)` → `Promise<string>` (hex) |
| Опция `tokenHashed: true` | **`createSecretKey(hash, { hashed: true })`** → `CryptoKey` |
| — | Тип `Secret = string \| CryptoKey`: везде, где был токен, можно передать готовый ключ |
| `deepSnakeToCamelObjKeys` | Удалён без замены |
| Опции `timeout` / `abortSignal` из BetterPromise | Удалены |

```ts
// Было (Node)
import { validate, sign } from '@tma.js/init-data-node';
validate(raw, token);
const signed = sign({ user }, token, new Date());

// Стало
import { validate, sign, createSecretKey } from '@tma.js/init-data';
const key = await createSecretKey(token); // можно один раз и переиспользовать
const initData = await validate(raw, key);
const signed = await sign({ user, auth_date: new Date() }, key);
```

### 5.3 Поведение

- `isValid` проверяет только подпись и срок действия. Поэтому `isValid === true` не гарантирует, что
  `validate` пройдёт: структура данных может оказаться невалидной.
- `isValid3rd` при ошибках WebCrypto (например, когда Ed25519 не поддерживается) теперь отклоняет
  промис, а не возвращает `false`.
- HMAC сравнивается за постоянное время через `crypto.subtle.verify`. Раньше сравнивались строки.
- `sign` добавляет `signature` только если оно передано. Раньше всегда отправлялось `signature=`.
- Схема `InitData`:
  - поле `signature` стало **необязательным**, раньше без него парсинг падал;
  - добавлено поле `chat_join_request_query_id`;
  - **неизвестные ключи вырезаются** (`object` вместо `looseObject`);
  - при повторяющихся ключах в query берётся первое значение;
  - ключи по-прежнему snake_case, `auth_date` по-прежнему `Date`.

### 5.4 Ошибки

| Было | Стало |
|---|---|
| `SignatureMissingError(thirdParty: boolean)` | `SignatureMissingError('hash' \| 'signature')`, `.data.param` |
| `ExpiredError` | В `.data` добавлено `now` |
| `HexStringLengthInvalidError` | Удалена, `createSecretKey` бросает `TypeError` |
| — | Новая `InvalidInitDataError` |

---

## 6. Биндинги: sdk-react, sdk-vue, sdk-solid, sdk-svelte

Все биндинги реэкспортируют `@tma.js/sdk`, поэтому изменения SDK из раздела 4 касаются и их. Хук
`useSignal(signal)` заменён на **`useComputed(computed)`**. Он принимает только `Computed` из нового
SDK, а не любые объекты с `.sub`.

| Пакет | Изменения |
|---|---|
| **React** | `useComputed` работает на `useSyncExternalStore`. У `useLaunchParams()` **убран аргумент `camelCase`**, и хук возвращает новый `LaunchParams`, где `tgWebAppData` — строка. `useRawLaunchParams`, `useRawInitData`, `useAndroidDeviceData` и `useAndroidDeviceDataFrom` не изменились. **Поддержка React 17 прекращена**: peer-зависимость `^18 \|\| ^19`. |
| **Vue** | Возвращает `Readonly<Ref<T>>` на `shallowRef`: объекты не оборачиваются в глубокий proxy и сохраняют идентичность. Хук работает в любом effect scope, не только в компоненте. Peer-зависимость `vue ^3.2`. |
| **Solid** | Работает вне компонентов. Значения-функции больше не принимаются ошибочно за updater. |
| **Svelte** | Возвращает **`Readable`** вместо `Writable`, поэтому `.set` и `.update` пропали. Подписка ленивая, хук можно вызывать где угодно. Peer-зависимость расширена до `svelte ^3 \|\| ^4 \|\| ^5`. |

---

## 7. Удалённые пакеты

### @tma.js/signals

- Удалено: `signal`, `computed`, `batch` и типы `Signal`, `Computed`, `SignalOptions`.
- Замена: только тип `Computed` из `@tma.js/sdk`, без фабрик. Свои сигналы придётся строить на
  сторонней библиотеке.

### @tma.js/toolkit

| Было | Стало |
|---|---|
| Утилиты смены регистра (`snakeToCamel`, `deepSnakeToCamelObjKeys` и др.) и их типы | Удалены без замены |
| `createLogger` | `setLogger` / `getLogger` в bridge, без фабрики |
| `getStorageValue` / `setStorageValue` | Удалены |
| fp-ts-хелперы (`throwifyFpFn` и др.) | Модель `Result` в bridge |
| Утилитарные типы (`If`, `Maybe`, `IsNever` и т. п.), `createCbCollector` | Удалены |

### @tma.js/transformers

| Было | Стало |
|---|---|
| Valibot-схемы (`initData()`, `launchParams()`, `themeParams()` и т. д.) | **Больше не публичные** |
| `parseInitDataQuery` / `serializeInitDataQuery` | `parse` / `serialize` из `@tma.js/init-data` |
| `parseLaunchParamsQuery` / `serializeLaunchParamsQuery` | `parseLaunchParams` / `serializeLaunchParams` из bridge |
| `isLaunchParamsQuery` | `safeParseLaunchParams(...).ok` или `isTMA()` |
| `pipeJsonToSchema`, `transformQueryToSchema` и т. п. | Удалены, используйте `parseJson()` из valibot напрямую |
| RGB-хелперы | См. раздел 4.8 |

### @tma.js/types

| Было | Стало |
|---|---|
| `InitData`, `User`, `Chat`, `ChatType` | `@tma.js/init-data`, реэкспорт в SDK |
| `LaunchParams`, `Platform`, `Version`, `RGB`, `ThemeParams` | `@tma.js/bridge` |
| `KnownThemeParamsKey` | Удалён |

---

## 8. Что было в старых версиях и пропало без замены

Это стоит отдельно проговорить с пользователями:

- IIFE / CDN-сборка bridge и SDK;
- `isAvailable()`, `ifAvailable()` и реактивный `isSupported`;
- возможность использовать часть функций без `init()` (см. 4.2);
- опции `init()`: `version`, `isInlineMode`, `themeParams`;
- `viewport.isStable` и 8 отдельных computed для каждой стороны insets;
- `BiometryState.token`;
- `cloudStorage.getItem(keys[])`;
- `once`, `unsub`, `unsubAll`, публичные `computed` и `batch` у сигналов;
- SDK-обёртки `postEvent` и `request`, которые использовали `postEvent` из `init()`;
- `applyPolyfills`, фабрика логгеров, `force*`-методы логгера;
- утилиты смены регистра (`deepSnakeToCamelObjKeys`) и `useLaunchParams(true)` в React;
- публичные valibot-схемы;
- RGBA-хелперы (`toRGBFull`, `isRGBA`, `isAnyRGB` и др.);
- синхронный Node API для init data;
- `CancelledError` и `.cancel()` у промисов;
- поддержка React 17.

Не было ни в старом, ни в новом SDK, хотя методы есть в bridge: акселерометр, гироскоп, ориентация
устройства, `web_app_toggle_orientation_lock`, `web_app_request_theme`.

---

## 9. Что нужно сделать до релиза

Эти пункты не относятся к изменениям API, но всплыли при сравнении:

- **Поднять версии** в `packages/*/package.json`. Сейчас там старые номера.
- **`@tma.js/init-data`.** Это имя уже занято старым устаревшим фронтенд-пакетом с версией 0.2.22, и
  в `package.json` сейчас стоит именно она. Первый релиз должен быть выше, например 1.0.0.
- `packages/bridge/README.md` утверждает, что у пакета нет runtime-зависимостей, хотя в нём есть
  `error-kid` и `valibot`.
- **Документация** в `apps/docs` целиком описывает старые версии (`isAvailable`, `Fp`, signals,
  `init-data-node`). Её нужно обновить и добавить гайд по миграции. Сейчас на ветке `feat/v4` там
  нет изменений.
- `packages-old/sdk/dist` устарел: в нём нет `serverless` и `requestChat`. Сравнение делалось по
  исходникам, а опубликованный 3.4.0 мог немного отличаться.
