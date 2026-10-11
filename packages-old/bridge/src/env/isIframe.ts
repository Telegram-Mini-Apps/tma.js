/**
 * @see https://stackoverflow.com/a/326076
 * @returns True, if current environment is iframe.
 */
export function isIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}
