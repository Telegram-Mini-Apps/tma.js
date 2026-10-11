export { matchError } from 'error-kid';

export {
  AuthDateInvalidError,
  ExpiredError,
  InvalidInitDataError,
  SignatureInvalidError,
  SignatureMissingError,
} from './errors.js';
export { parse, safeParse, serialize } from './parsing.js';
export type { Result } from './result.js';
export {
  createSecretKey,
  hashToken,
  sign,
  signData,
  type Secret,
  type SignableInitData,
} from './signing.js';
export {
  isValid,
  isValid3rd,
  safeValidate,
  safeValidate3rd,
  validate,
  validate3rd,
  type Validate3rdOptions,
  type ValidateError,
  type ValidateOptions,
} from './validation.js';
export type * from './types.js';
