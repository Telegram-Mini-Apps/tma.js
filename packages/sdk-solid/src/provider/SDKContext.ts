import { createContext } from 'solid-js';

import type { SDKContextType } from './types.js';

export const SDKContext = createContext<SDKContextType>({
  loading: () => false,
  error: () => undefined,
  initResult: () => undefined,
}, { name: 'SDKContext' });
