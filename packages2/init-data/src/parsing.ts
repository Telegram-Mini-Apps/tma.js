import {
  boolean,
  digits,
  type GenericSchema,
  number,
  object,
  optional,
  parseJson,
  pipe,
  safeParse as safeParseSchema,
  string,
  transform,
  ValiError,
} from 'valibot';

import { InvalidInitDataError } from './errors.js';
import { err, ok, type Result, unwrap } from './result.js';
import type { Chat, InitData, User } from './types.js';

function json<T>(schema: GenericSchema<unknown, T>): GenericSchema<unknown, T> {
  return pipe(string(), parseJson(), schema);
}

const user: GenericSchema<unknown, User> = object({
  added_to_attachment_menu: optional(boolean()),
  allows_write_to_pm: optional(boolean()),
  first_name: string(),
  id: number(),
  is_bot: optional(boolean()),
  is_premium: optional(boolean()),
  language_code: optional(string()),
  last_name: optional(string()),
  photo_url: optional(string()),
  username: optional(string()),
});

const chat: GenericSchema<unknown, Chat> = object({
  id: number(),
  photo_url: optional(string()),
  title: string(),
  type: string(),
  username: optional(string()),
});

const initData: GenericSchema<unknown, InitData> = object({
  auth_date: pipe(string(), digits(), transform(value => new Date(Number(value) * 1000))),
  can_send_after: optional(pipe(string(), digits(), transform(Number))),
  chat: optional(json(chat)),
  chat_instance: optional(string()),
  chat_join_request_query_id: optional(string()),
  chat_type: optional(string()),
  hash: string(),
  query_id: optional(string()),
  receiver: optional(json(user)),
  signature: optional(string()),
  start_param: optional(string()),
  user: optional(json(user)),
});

/**
 * Parses init data from its query representation. The function doesn't check the init data
 * signature, use `safeValidate` for that.
 * @param value - init data query.
 * @returns Parsed init data, or `InvalidInitDataError` if the value doesn't represent valid
 * init data.
 */
export function safeParse(value: string | URLSearchParams): Result<InitData, InvalidInitDataError> {
  const query = new URLSearchParams(value);
  const input: Record<string, string> = {};
  query.forEach((item, key) => {
    // Like URLSearchParams.get, take the first value.
    key in input || (input[key] = item);
  });
  const result = safeParseSchema(initData, input);
  return result.success
    ? ok(result.output)
    : err(new InvalidInitDataError(query.toString(), new ValiError(result.issues)));
}

/**
 * Parses init data from its query representation. The function doesn't check the init data
 * signature, use `validate` for that.
 *
 * Throwing version of `safeParse`.
 * @param value - init data query.
 * @throws {InvalidInitDataError} The value doesn't represent valid init data.
 */
export function parse(value: string | URLSearchParams): InitData {
  return unwrap(safeParse(value));
}

/**
 * Converts init data to its query representation.
 * @param value - init data.
 */
export function serialize(value: Partial<InitData>): string {
  const query = new URLSearchParams();
  Object.entries(value).forEach(([key, item]) => {
    if (item === undefined) {
      return;
    }
    query.set(
      key,
      item instanceof Date
        ? String(Math.floor(item.getTime() / 1000))
        : typeof item === 'object' ? JSON.stringify(item) : String(item),
    );
  });
  return query.toString();
}
