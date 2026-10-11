import {
  type BaseIssue,
  type BaseSchema,
  instance,
  type InstanceSchema,
  pipe,
  type SchemaWithPipe,
  string,
  type StringSchema,
  union,
  type UnionSchema,
} from 'valibot';

import {
  transformJsonToSchema,
  type TransformJsonToSchemaAction,
  transformQueryToSchema,
  type TransformQueryToSchemaAction,
} from './transformers.js';

type RequiredSchema = BaseSchema<any, any, BaseIssue<any>>;

export type JsonToSchemaPipe<Schema extends RequiredSchema> = SchemaWithPipe<readonly [
  StringSchema<undefined>,
  TransformJsonToSchemaAction<Schema>,
]>;

export type QueryToSchemaPipe<Schema extends RequiredSchema> = SchemaWithPipe<readonly [
  UnionSchema<[
    StringSchema<undefined>,
    InstanceSchema<typeof URLSearchParams, undefined>,
  ], undefined>,
  TransformQueryToSchemaAction<Schema>,
]>;

export function pipeJsonToSchema<Schema extends RequiredSchema>(
  schema: Schema,
): JsonToSchemaPipe<Schema> {
  return pipe(string(), transformJsonToSchema(schema));
}

export function pipeQueryToSchema<Schema extends RequiredSchema>(
  schema: Schema,
): QueryToSchemaPipe<Schema> {
  return pipe(
    union([string(), instance(URLSearchParams)]),
    transformQueryToSchema(schema),
  );
}
