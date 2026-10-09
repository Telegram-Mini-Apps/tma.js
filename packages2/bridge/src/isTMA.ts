import { hasWebviewProxy } from './env.js';
import { TimeoutError, UnknownEnvError } from './errors.js';
import { retrieveRawLaunchParams } from './launch-params.js';
import { request } from './request.js';

/**
 * @returns True if the current environment looks like a Telegram Mini App: the Telegram webview
 * proxy is defined, or launch parameters are available.
 *
 * Use `isTMAAsync` for a stricter check.
 */
export function isTMA(): boolean {
  if (hasWebviewProxy()) {
    return true;
  }
  try {
    retrieveRawLaunchParams();
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if the current environment is a Telegram Mini App by calling a method and waiting for
 * the Telegram client response.
 * @param options - additional options.
 */
export async function isTMAAsync(options: {
  /**
   * Time in milliseconds to wait for the response.
   * @default 100
   */
  timeout?: number;
  /**
   * Signal to abort the check.
   */
  signal?: AbortSignal;
} = {}): Promise<boolean> {
  if (hasWebviewProxy()) {
    return true;
  }
  try {
    await request('web_app_request_theme', 'theme_changed', { timeout: 100, ...options });
    return true;
  } catch (e) {
    if (TimeoutError.is(e) || UnknownEnvError.is(e)) {
      return false;
    }
    throw e;
  }
}
