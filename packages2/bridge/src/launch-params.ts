import {
  nonEmpty,
  object,
  optional,
  pipe,
  safeParse,
  string,
  transform,
  ValiError,
} from 'valibot';

import { InvalidLaunchParamsError, LaunchParamsRetrieveError } from './errors.js';
import { err, ok, type Result, unwrap } from './result.js';
import { themeParamsJson } from './theme-params.js';
import type { Platform, ThemeParams, Version } from './types/index.js';

const STORAGE_KEY = 'tma.js/launch-params';

/**
 * Launch parameters passed by the Telegram client to the mini app.
 * @see https://docs.telegram-mini-apps.com/platform/launch-parameters
 */
export interface LaunchParams {
  /**
   * True if the mini app was launched in inline mode.
   */
  tgWebAppBotInline?: boolean;
  /**
   * Init data in the raw format. Pass it to your server to authorize the user.
   * @see https://docs.telegram-mini-apps.com/platform/init-data
   */
  tgWebAppData?: string;
  /**
   * Default theme colors.
   */
  tgWebAppDefaultColors?: ThemeParams;
  /**
   * True if the mini app was launched in fullscreen mode.
   */
  tgWebAppFullscreen?: boolean;
  /**
   * Telegram client platform.
   */
  tgWebAppPlatform: Platform;
  /**
   * True if the Settings Button should be displayed.
   */
  tgWebAppShowSettings?: boolean;
  /**
   * Start parameter passed in the mini app link.
   * @see https://docs.telegram-mini-apps.com/platform/start-parameter
   */
  tgWebAppStartParam?: string;
  /**
   * Theme parameters.
   */
  tgWebAppThemeParams: ThemeParams;
  /**
   * Mini Apps version supported by the Telegram client.
   */
  tgWebAppVersion: Version;
}

const optionalBoolean = optional(pipe(string(), transform(value => value === '1')));

const launchParams = object({
  tgWebAppBotInline: optionalBoolean,
  tgWebAppData: optional(string()),
  tgWebAppDefaultColors: optional(themeParamsJson),
  tgWebAppFullscreen: optionalBoolean,
  tgWebAppPlatform: pipe(string(), nonEmpty()),
  tgWebAppShowSettings: optionalBoolean,
  tgWebAppStartParam: optional(string()),
  tgWebAppThemeParams: optional(themeParamsJson, '{}'),
  tgWebAppVersion: pipe(string(), nonEmpty()),
});

/**
 * Parses launch parameters from their query representation.
 * @param value - launch parameters query.
 * @returns Launch parameters, or `InvalidLaunchParamsError` if the value doesn't represent
 * valid launch parameters.
 */
export function safeParseLaunchParams(
  value: string | URLSearchParams,
): Result<LaunchParams, InvalidLaunchParamsError> {
  const query = new URLSearchParams(value);
  const input: Record<string, string> = {};
  query.forEach((item, key) => {
    // Like URLSearchParams.get, take the first value.
    key in input || (input[key] = item);
  });
  const result = safeParse(launchParams, input);
  return result.success
    ? ok(result.output)
    : err(new InvalidLaunchParamsError(query.toString(), new ValiError(result.issues)));
}

/**
 * Parses launch parameters from their query representation.
 *
 * Throwing version of `safeParseLaunchParams`.
 * @param value - launch parameters query.
 * @throws {InvalidLaunchParamsError} The value doesn't represent valid launch parameters.
 */
export function parseLaunchParams(value: string | URLSearchParams): LaunchParams {
  return unwrap(safeParseLaunchParams(value));
}

/**
 * Converts launch parameters to their query representation.
 * @param value - launch parameters.
 */
export function serializeLaunchParams(value: LaunchParams): string {
  const query = new URLSearchParams();
  Object.entries(value).forEach(([key, item]) => {
    if (item === undefined) {
      return;
    }
    query.set(
      key,
      typeof item === 'boolean'
        ? item ? '1' : '0'
        : typeof item === 'object' ? JSON.stringify(item) : String(item),
    );
  });
  return query.toString();
}

/**
 * Converts a URL to a query containing both its search and hash parameters.
 */
function urlToQuery(url: string): string {
  return url
    // Remove everything before the first "?" or "#".
    .replace(/^[^?#]*[?#]/, '')
    // Make the rest look like a single query.
    .replace(/[?#]/g, '&');
}

function readSessionStorage(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Launch parameters sources ordered by priority.
 */
const sources: [name: string, retrieve: () => string | null | undefined][] = [
  // Launch parameters are passed in the URL hash. They can be missing in case the app changed
  // the location and then the page was reloaded.
  ['window.location.href', () => urlToQuery(window.location.href)],
  // The initial page URL.
  ['performance navigation entries', () => {
    const [entry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    return entry && urlToQuery(entry.name);
  }],
  // Value saved by this package previously.
  ['session storage', () => readSessionStorage(STORAGE_KEY)],
  // Value saved by the official SDK.
  ['official SDK session storage', () => {
    const raw = readSessionStorage('__telegram__initParams');
    if (!raw) {
      return;
    }
    const params = JSON.parse(raw) as Record<string, unknown> | null;
    return params
      ? new URLSearchParams(
        Object.entries(params).filter((entry): entry is [string, string] => {
          return typeof entry[1] === 'string';
        }),
      ).toString()
      : undefined;
  }],
];

/**
 * Saves launch parameters to the session storage, so they could be retrieved after the page
 * reload.
 * @param value - launch parameters query.
 */
export function saveLaunchParams(value: string): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Session storage may be unavailable.
  }
}

/**
 * Retrieves launch parameters from any known source and saves them in the session storage.
 */
function retrieve(): Result<{ raw: string; parsed: LaunchParams }, LaunchParamsRetrieveError> {
  const errors: { source: string; error: unknown }[] = [];
  for (const [source, retrieveSource] of sources) {
    let raw: string | null | undefined;
    try {
      raw = retrieveSource();
    } catch (error) {
      errors.push({ source, error });
      continue;
    }
    if (!raw) {
      errors.push({ source, error: new Error('Source is empty') });
      continue;
    }
    const parsed = safeParseLaunchParams(raw);
    if (!parsed.ok) {
      errors.push({ source, error: parsed.error });
      continue;
    }
    saveLaunchParams(raw);
    return ok({ raw, parsed: parsed.data });
  }
  return err(new LaunchParamsRetrieveError(errors));
}

/**
 * Retrieves launch parameters in the raw format from any known source and saves them in
 * the session storage.
 * @returns Launch parameters, or `LaunchParamsRetrieveError` if they were not found.
 */
export function safeRetrieveRawLaunchParams(): Result<string, LaunchParamsRetrieveError> {
  const result = retrieve();
  return result.ok ? ok(result.data.raw) : result;
}

/**
 * Retrieves launch parameters in the raw format from any known source and saves them in
 * the session storage.
 *
 * Throwing version of `safeRetrieveRawLaunchParams`.
 * @throws {LaunchParamsRetrieveError} Launch parameters were not found.
 */
export function retrieveRawLaunchParams(): string {
  return unwrap(safeRetrieveRawLaunchParams());
}

/**
 * Retrieves launch parameters from any known source.
 * @returns Launch parameters, or `LaunchParamsRetrieveError` if they were not found.
 */
export function safeRetrieveLaunchParams(): Result<LaunchParams, LaunchParamsRetrieveError> {
  const result = retrieve();
  return result.ok ? ok(result.data.parsed) : result;
}

/**
 * Retrieves launch parameters from any known source.
 *
 * Throwing version of `safeRetrieveLaunchParams`.
 * @throws {LaunchParamsRetrieveError} Launch parameters were not found.
 */
export function retrieveLaunchParams(): LaunchParams {
  return unwrap(safeRetrieveLaunchParams());
}

/**
 * Retrieves init data in the raw format. Pass it to your server to authorize the user.
 * @returns Init data (`undefined` if it is missing in launch parameters), or
 * `LaunchParamsRetrieveError` if launch parameters were not found.
 */
export function safeRetrieveRawInitData(): Result<string | undefined, LaunchParamsRetrieveError> {
  const result = retrieve();
  return result.ok ? ok(result.data.parsed.tgWebAppData) : result;
}

/**
 * Retrieves init data in the raw format. Pass it to your server to authorize the user.
 *
 * Throwing version of `safeRetrieveRawInitData`.
 * @returns Init data, or `undefined` if it is missing in launch parameters.
 * @throws {LaunchParamsRetrieveError} Launch parameters were not found.
 */
export function retrieveRawInitData(): string | undefined {
  return unwrap(safeRetrieveRawInitData());
}
