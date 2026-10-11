import type { CreateHmacFn, Text } from './types.js';

export function hashToken<H extends CreateHmacFn<any>>(token: Text, createHmac: H): ReturnType<H> {
  return createHmac(token, 'WebAppData') as ReturnType<H>;
}
