import { matchError } from 'error-kid';
import { expectTypeOf } from 'vitest';

import type {
  AuthDateInvalidError,
  ExpiredError,
  InvalidInitDataError,
  SignatureInvalidError,
  SignatureMissingError,
} from './errors.js';
import { safeParse } from './parsing.js';
import type { Result } from './result.js';
import type { InitData } from './types.js';
import { safeValidate, safeValidate3rd, type ValidateError } from './validation.js';

// The function is never called. The file is checked by the TypeScript compiler only.
export async function checkTypes(): Promise<void> {
  expectTypeOf<ValidateError>().toEqualTypeOf<
    | SignatureMissingError
    | AuthDateInvalidError
    | ExpiredError
    | SignatureInvalidError
    | InvalidInitDataError
  >();

  const parsed = safeParse('');
  if (parsed.ok) {
    expectTypeOf(parsed.data).toEqualTypeOf<InitData>();
  } else {
    expectTypeOf(parsed.error).toEqualTypeOf<InvalidInitDataError>();
  }

  const validated = await safeValidate('', '');
  if (validated.ok) {
    expectTypeOf(validated.data).toEqualTypeOf<InitData>();
  } else {
    expectTypeOf(validated.error).toEqualTypeOf<ValidateError>();

    matchError(validated.error, {
      SignatureMissingError: () => null,
      AuthDateInvalidError: () => null,
      ExpiredError: () => null,
      SignatureInvalidError: () => null,
      InvalidInitDataError: () => null,
    });
    // @ts-expect-error Every error must be handled.
    matchError(validated.error, {
      SignatureMissingError: () => null,
      AuthDateInvalidError: () => null,
      ExpiredError: () => null,
      SignatureInvalidError: () => null,
    });
  }

  expectTypeOf(safeValidate3rd).returns
    .toEqualTypeOf<Promise<Result<InitData, ValidateError>>>();
}
