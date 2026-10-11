import {
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { createLogger } from './createLogger.js';

const now = new Date('2022-11-04T09:09:43.007Z');

beforeAll(() => {
  vi.setSystemTime(now);
});

afterEach(() => {
  vi.resetAllMocks();
});

describe('log', () => {
  it('should call console.log()', () => {
    const { log } = createLogger('SDK');
    const spy = vi.fn();
    vi.spyOn(console, 'log').mockImplementation(spy);

    log('Test');
    expect(spy).toHaveBeenCalledOnce();
    expect(spy).toHaveBeenCalledWith(
      '%cINFO 09:09:43.007%c %cSDK',
      expect.anything(),
      expect.anything(),
      expect.anything(),
      'Test',
    );
  });

  it('should not log if shouldLog is false', () => {
    const { log } = createLogger('SDK', { shouldLog: false });
    const spy = vi.fn();
    vi.spyOn(console, 'log').mockImplementation(spy);

    log('Test');
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('error', () => {
  it('should call console.error()', () => {
    const { error } = createLogger('SDK');
    const spy = vi.fn();
    vi.spyOn(console, 'error').mockImplementation(spy);

    error('Test');
    expect(spy).toHaveBeenCalledOnce();
    expect(spy).toHaveBeenCalledWith(
      '%cERR 09:09:43.007%c %cSDK',
      expect.anything(),
      expect.anything(),
      expect.anything(),
      'Test',
    );
  });

  it('should not log if shouldLog is false', () => {
    const { error } = createLogger('SDK', { shouldLog: false });
    const spy = vi.fn();
    vi.spyOn(console, 'error').mockImplementation(spy);

    error('Test');
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('warn', () => {
  it('should call console.warn()', () => {
    const { warn } = createLogger('SDK');
    const spy = vi.fn();
    vi.spyOn(console, 'warn').mockImplementation(spy);

    warn('Test');
    expect(spy).toHaveBeenCalledOnce();
    expect(spy).toHaveBeenCalledWith(
      '%cWARN 09:09:43.007%c %cSDK',
      expect.anything(),
      expect.anything(),
      expect.anything(),
      'Test',
    );
  });

  it('should not log if shouldLog is false', () => {
    const { warn } = createLogger('SDK', { shouldLog: false });
    const spy = vi.fn();
    vi.spyOn(console, 'warn').mockImplementation(spy);

    warn('Test');
    expect(spy).not.toHaveBeenCalled();
  });
});
