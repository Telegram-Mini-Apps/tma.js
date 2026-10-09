import { errorClass, errorClassWithData } from 'error-kid';

/**
 * Thrown when a value doesn't represent valid init data.
 */
export class InvalidInitDataError extends /* @__PURE__ */ errorClassWithData({
  name: 'InvalidInitDataError',
  message: (value: string) => `Invalid init data: ${value}`,
  cause: (_value: string, cause?: unknown) => cause,
  data: (value: string) => ({ value }),
}) {
}

/**
 * Thrown when init data has no parameter containing its signature.
 */
export class SignatureMissingError extends /* @__PURE__ */ errorClassWithData({
  name: 'SignatureMissingError',
  data: (param: 'hash' | 'signature') => ({ param }),
  message: (param: 'hash' | 'signature') => `"${param}" parameter is missing`,
}) {
}

/**
 * Thrown when init data signature doesn't match its content.
 */
export class SignatureInvalidError extends /* @__PURE__ */ errorClass({
  name: 'SignatureInvalidError',
  message: 'Init data signature is invalid',
}) {
}

/**
 * Thrown when the `auth_date` init data parameter is missing or isn't a Unix time.
 */
export class AuthDateInvalidError extends /* @__PURE__ */ errorClassWithData({
  name: 'AuthDateInvalidError',
  data: (value?: string) => ({ value }),
  message: (value?: string) => `"auth_date" is invalid: ${value ?? 'value is missing'}`,
}) {
}

/**
 * Thrown when init data has expired.
 */
export class ExpiredError extends /* @__PURE__ */ errorClassWithData({
  name: 'ExpiredError',
  data: (issuedAt: Date, expiresAt: Date, now: Date) => ({ issuedAt, expiresAt, now }),
  message: (issuedAt: Date, expiresAt: Date, now: Date) => [
    `Init data expired. Issued at ${issuedAt.toISOString()},`,
    `expires at ${expiresAt.toISOString()}, now is ${now.toISOString()}`,
  ].join(' '),
}) {
}
