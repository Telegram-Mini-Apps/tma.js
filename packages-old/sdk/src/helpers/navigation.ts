/**
 * Returns the first navigation entry from window.performance.
 * @returns First navigation entry or null, in case performance functionality is not supported
 * or navigation entry was not found.
 */
function getFirstNavigationEntry(): PerformanceNavigationTiming | undefined {
  return performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
}

/**
 * @returns True, if the current page was reloaded.
 * @see https://stackoverflow.com/a/36444134/11894710
 */
export function isPageReload(): boolean {
  const entry = getFirstNavigationEntry();
  return !!entry && entry.type === 'reload';
}
