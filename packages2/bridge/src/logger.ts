export interface Logger {
  log: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

const PREFIX = [
  '%cBridge',
  'background:#9147ff;color:white;font-weight:bold;padding:0 5px;border-radius:5px',
];

const consoleLogger: Logger = {
  log: (...args) => console.log(...PREFIX, ...args),
  warn: (...args) => console.warn(...PREFIX, ...args),
  error: (...args) => console.error(...PREFIX, ...args),
};

let debug = false;
let logger = consoleLogger;

/**
 * Enables or disables debug mode. In debug mode, the package logs every outgoing method call
 * and every incoming event.
 * @param value - should the debug mode be enabled.
 */
export function setDebug(value: boolean): void {
  debug = value;
}

/**
 * @returns True if the debug mode is enabled.
 */
export function isDebug(): boolean {
  return debug;
}

/**
 * Replaces the package logger. Pass nothing to restore the default one.
 * @param value - logger to use.
 */
export function setLogger(value: Logger = consoleLogger): void {
  logger = value;
}

/**
 * @returns The current package logger.
 */
export function getLogger(): Logger {
  return logger;
}

/**
 * Logs a message only in debug mode.
 * @param args - values to log.
 */
export function debugLog(...args: unknown[]): void {
  debug && logger.log(...args);
}
