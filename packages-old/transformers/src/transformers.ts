import {
  type BaseIssue,
  type BaseSchema,
  check,
  type CheckAction,
  type InferOutput,
  instance,
  type InstanceSchema,
  parse,
  pipe,
  type SchemaWithPipe,
  string,
  type StringSchema,
  transform,
  type TransformAction,
  union,
  type UnionSchema,
} from 'valibot';

type RequiredSchema = BaseSchema<any, any, BaseIssue<any>>;

export type TransformJsonToSchemaAction<Schema extends RequiredSchema> = SchemaWithPipe<readonly [
  StringSchema<any>,
  CheckAction<string, string>,
  TransformAction<string, unknown>,
  Schema,
]>;

export type TransformQueryToSchemaAction<Schema extends RequiredSchema> = SchemaWithPipe<readonly [
  UnionSchema<[
    StringSchema<undefined>,
    InstanceSchema<typeof URLSearchParams, undefined>,
  ], undefined>,
  CheckAction<string | URLSearchParams, string>,
  TransformAction<string | URLSearchParams, InferOutput<Schema>>,
]>;

export function transformQueryToSchema<Schema extends RequiredSchema>(
  schema: Schema,
): TransformQueryToSchemaAction<Schema> {
  const transformer = (input: string | URLSearchParams) => {
    const result: Record<string, string | string[]> = {};

    new URLSearchParams(input).forEach((value, key) => {
      const accValue = result[key];
      if (Array.isArray(accValue)) {
        accValue.push(value);
      } else if (accValue === undefined) {
        result[key] = value;
      } else {
        result[key] = [accValue, value];
      }
    });

    return parse(schema, result);
  };

  return pipe(
    union([string(), instance(URLSearchParams)]),
    check(input => {
      try {
        transformer(input);
        return true;
      } catch {
        return false;
      }
    }, 'The value doesn\'t match required schema'),
    transform(transformer),
  );
}

/**
 * @returns A transformer applying `JSON.parse` to the input.
 */
export function transformJsonToSchema<Schema extends RequiredSchema>(
  schema: Schema,
): TransformJsonToSchemaAction<Schema> {
  return pipe(
    string(),
    check(input => {
      try {
        JSON.parse(input);
        return true;
      } catch {
        return false;
      }
    }, 'Input is not a valid JSON value'),
    transform(JSON.parse),
    schema,
  );
}
