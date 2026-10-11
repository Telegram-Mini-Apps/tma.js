import { mockPerformanceGetEntriesByType } from './mockPerformanceGetEntriesByType';

export function mockPageReload() {
  return mockPerformanceGetEntriesByType([{ type: 'reload' }] as any);
}