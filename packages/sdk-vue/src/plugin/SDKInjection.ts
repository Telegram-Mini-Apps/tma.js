import type { InjectionKey } from 'vue';

import type { SDKInjectionType } from './types.js';

export const SDKInjection: InjectionKey<SDKInjectionType> = Symbol('SDKInjection');
