import type {
  Chat,
  InitData,
  KnownThemeParamsKey,
  LaunchParams,
  RGB,
  User,
} from '@tma.js/types';
import {
  type BaseSchema,
  boolean,
  check,
  type CheckAction,
  date,
  type InferOutput,
  integer,
  is,
  looseObject,
  number,
  type NumberSchema,
  optional,
  pipe,
  record,
  type RecordSchema,
  type SchemaWithPipe,
  string,
  type StringSchema,
  transform,
  type TransformAction,
  union,
  type UnionSchema,
  unknown,
} from 'valibot';

import { pipeJsonToSchema, pipeQueryToSchema } from './pipes.js';
import { isAnyRGB } from './rgb.js';

export type InitDataGenSchema = ReturnType<typeof initData>;
export type InitDataGenType = InferOutput<InitDataGenSchema>;

export type LaunchParamsGenSchema = ReturnType<typeof launchParams>;
export type LaunchParamsGenType = InferOutput<LaunchParamsGenSchema>;

export type MiniAppsMessageGenSchema = ReturnType<typeof miniAppsMessage>;
export type MiniAppsMessageGenType = InferOutput<MiniAppsMessageGenSchema>;

export function initDataChat() {
  return looseObject({
    id: number(),
    photo_url: optional(string()),
    type: string(),
    title: string(),
    username: optional(string()),
  } satisfies { [K in keyof Chat]-?: BaseSchema<unknown, Chat[K], any> });
}

export function initDataUser() {
  return looseObject({
    added_to_attachment_menu: optional(boolean()),
    allows_write_to_pm: optional(boolean()),
    first_name: string(),
    id: number(),
    is_bot: optional(boolean()),
    is_premium: optional(boolean()),
    last_name: optional(string()),
    language_code: optional(string()),
    photo_url: optional(string()),
    username: optional(string()),
  } satisfies { [K in keyof User]-?: BaseSchema<unknown, User[K], any> });
}

export function initData() {
  return looseObject({
    auth_date: pipe(
      string(),
      transform(input => new Date(Number(input) * 1000)),
      date(),
    ),
    can_send_after: optional(pipe(string(), transform(Number), integer())),
    chat: optional(pipeJsonToSchema(initDataChat())),
    chat_type: optional(string()),
    chat_instance: optional(string()),
    hash: string(),
    query_id: optional(string()),
    receiver: optional(pipeJsonToSchema(initDataUser())),
    start_param: optional(string()),
    signature: string(),
    user: optional(pipeJsonToSchema(initDataUser())),
  } satisfies { [K in keyof InitData]-?: unknown });
}

export function initDataQuery() {
  return pipeQueryToSchema(initData());
}

export function themeParams() {
  return record(
    string(),
    pipe(
      union([string(), number()]),
      transform(value => {
        return typeof value === 'number'
          ? `#${(value & 0x00FFFFFF).toString(16).padStart(6, '0')}`
          : value;
      }),
      check(isAnyRGB),
    ),
  ) as RecordSchema<
    SchemaWithPipe<[
      StringSchema<undefined>,
      TransformAction<string, KnownThemeParamsKey>,
    ]>,
    SchemaWithPipe<[
      UnionSchema<[StringSchema<undefined>, NumberSchema<undefined>], any>,
      TransformAction<string | number, string>,
      CheckAction<RGB, undefined>,
    ]>,
    undefined
  >;
}

export function launchParams() {
  const optBool = optional(pipe(string(), transform(v => v === '1')));

  return looseObject({
    tgWebAppBotInline: optBool,
    tgWebAppData: optional(initDataQuery()),
    tgWebAppDefaultColors: optional(pipeJsonToSchema(themeParams())),
    tgWebAppFullscreen: optBool,
    tgWebAppPlatform: string(),
    tgWebAppShowSettings: optBool,
    tgWebAppStartParam: optional(string()),
    tgWebAppThemeParams: optional(pipeJsonToSchema(themeParams()), '{}'),
    tgWebAppVersion: string(),
  } satisfies { [K in keyof LaunchParams]-?: BaseSchema<any, LaunchParams[K], any> });
}

export function launchParamsQuery() {
  return pipeQueryToSchema(launchParams());
}

/**
 * @returns True if the passed value contains valid launch parameters query.
 */
export function isLaunchParamsQuery(value: string | URLSearchParams): boolean {
  try {
    return is(launchParamsQuery(), value);
  } catch {
    return false;
  }
}

export function miniAppsMessage() {
  return looseObject({
    eventType: string(),
    eventData: optional(unknown()),
  });
}
