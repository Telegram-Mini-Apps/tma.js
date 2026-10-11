import type { Handler } from 'mitt';

import type { WildcardHandler } from '@/events/createEmitter.js';
import type { EventName, EventPayload, Events } from '@/events/types/index.js';

export type EventListener<E extends EventName> = Handler<EventPayload<E>>;

export type SubscribeListener = WildcardHandler<Events>;
