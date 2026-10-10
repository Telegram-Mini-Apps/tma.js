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
import { createStore } from '../../store.js';
import type { StatefulComponent } from '../../types.js';

/**
 * Getters return `undefined` until init data is restored.
 */
export interface InitDataComponent extends StatefulComponent<InitData | undefined> {
  /**
   * @returns Init data in the raw format. Pass it to your server to authorize the user.
   */
  raw: () => string | undefined;
  authDate: () => Date | undefined;
  canSendAfter: () => number | undefined;
  /**
   * @returns Date after which a message can be sent via the
   * [answerWebAppQuery](https://core.telegram.org/bots/api#answerwebappquery) method.
   */
  canSendAfterDate: () => Date | undefined;
  chat: () => Chat | undefined;
  chatInstance: () => string | undefined;
  chatType: () => ChatType | undefined;
  hash: () => string | undefined;
  queryId: () => string | undefined;
  receiver: () => User | undefined;
  signature: () => string | undefined;
  startParam: () => string | undefined;
  user: () => User | undefined;
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
  const store = createStore<{ raw?: string; parsed?: InitData }>({});
  const get = <K extends keyof InitData>(key: K) => () => {
    const { parsed } = store.get();
    return parsed && parsed[key];
  };

  const safeRestore = () => {
    const raw = getGlobals().launchParams.tgWebAppData;
    if (!raw) {
      return ok(undefined);
    }
    const parsed = safeParse(raw);
    if (!parsed.ok) {
      return parsed;
    }
    store.set({ raw, parsed: parsed.data });
    return ok(undefined);
  };

  return {
    state: () => store.get().parsed,
    subscribe: store.subscribe,
    raw: () => store.get().raw,
    authDate: get('auth_date'),
    canSendAfter: get('can_send_after'),
    canSendAfterDate() {
      const { parsed } = store.get();
      return parsed && parsed.can_send_after !== undefined
        ? new Date(parsed.auth_date.getTime() + (parsed.can_send_after * 1000))
        : undefined;
    },
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
