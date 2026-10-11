import { ok, type Result, throwing } from '@tma.js/bridge';
import {
  type Chat,
  type ChatType,
  type InitData,
  type InvalidInitDataError,
  safeParse,
  type User,
} from '@tma.js/init-data';

import { getGlobals } from '../../globals.js';
import { type Computed, computed, createStore } from '../../store.js';
import type { StatefulComponent } from '../../types.js';

/**
 * Getters return `undefined` until init data is restored.
 */
export interface InitDataComponent extends StatefulComponent<InitData | undefined> {
  /**
   * Init data in the raw format. Pass it to your server to authorize the user.
   */
  raw: Computed<string | undefined>;
  authDate: Computed<Date | undefined>;
  canSendAfter: Computed<number | undefined>;
  /**
   * Date after which a message can be sent via the
   * [answerWebAppQuery](https://core.telegram.org/bots/api#answerwebappquery) method.
   */
  canSendAfterDate: Computed<Date | undefined>;
  chat: Computed<Chat | undefined>;
  chatInstance: Computed<string | undefined>;
  chatType: Computed<ChatType | undefined>;
  hash: Computed<string | undefined>;
  queryId: Computed<string | undefined>;
  receiver: Computed<User | undefined>;
  signature: Computed<string | undefined>;
  startParam: Computed<string | undefined>;
  user: Computed<User | undefined>;
  /**
   * Restores init data from launch parameters. If launch parameters have no init data, getters
   * keep returning `undefined`.
   * @returns `InvalidInitDataError` if init data is invalid.
   * @throws {NotInitializedError} The SDK is not initialized.
   */
  safeRestore: () => Result<InvalidInitDataError, void>;
  /**
   * Throwing version of `safeRestore`.
   * @throws {NotInitializedError} The SDK is not initialized.
   * @throws {InvalidInitDataError} Init data is invalid.
   */
  restore: () => void;
}

/**
 * @internal
 */
export function createInitData(): InitDataComponent {
  const store = createStore<{ raw?: string; parsed?: InitData; canSendAfterDate?: Date }>({});
  const select = <T>(get: (value: ReturnType<typeof store.get>) => T) => {
    return computed(() => get(store.get()), store.subscribe);
  };
  const get = <K extends keyof InitData>(key: K) => select(({ parsed }) => parsed && parsed[key]);

  const safeRestore = () => {
    const raw = getGlobals().launchParams.tgWebAppData;
    if (!raw) {
      return ok(undefined);
    }
    const parsed = safeParse(raw);
    if (!parsed.ok) {
      return parsed;
    }
    const { auth_date, can_send_after } = parsed.data;
    store.set({
      raw,
      parsed: parsed.data,
      // Computed once, so the getter returns the same object until init data changes.
      canSendAfterDate: can_send_after === undefined
        ? undefined
        : new Date(auth_date.getTime() + (can_send_after * 1000)),
    });
    return ok(undefined);
  };

  return {
    state: select(value => value.parsed),
    raw: select(value => value.raw),
    authDate: get('auth_date'),
    canSendAfter: get('can_send_after'),
    canSendAfterDate: select(value => value.canSendAfterDate),
    chat: get('chat'),
    chatInstance: get('chat_instance'),
    chatType: get('chat_type'),
    hash: get('hash'),
    queryId: get('query_id'),
    receiver: get('receiver'),
    signature: get('signature'),
    startParam: get('start_param'),
    user: get('user'),
    safeRestore,
    restore: throwing(safeRestore),
  };
}

/**
 * Init data passed by the Telegram client. Call `restore` to read it from launch parameters.
 * @see https://docs.telegram-mini-apps.com/platform/init-data
 */
export const initData = /* @__PURE__ */ createInitData();
