import { errorClass, errorClassWithData } from 'error-kid';

export class AuthDateInvalidError extends errorClassWithData<
  { value: string | undefined },
  [value?: string]
>({
  name: 'AuthDateInvalidError',
  data: value => ({ value }),
  super: value => [`"auth_date" is invalid: ${value || 'value is missing'}`],
}) {
}

export class SignatureInvalidError extends errorClass({ name: 'SignatureInvalidError' }) {
}

export class HexStringLengthInvalidError extends errorClass({ name: 'HexStringLengthInvalidError' }) {
}

export class SignatureMissingError extends errorClass<[thirdParty: boolean]>({
  name: 'SignatureMissingError',
  super: thirdParty => [`"${thirdParty ? 'signature' : 'hash'}" parameter is missing`],
}) {
}

export class ExpiredError extends errorClassWithData<
  { issuedAt: Date; expiresAt: Date },
  [issuedAt: Date, expiresAt: Date, now: Date]
>({
  name: 'ExpiredError',
  data: (issuedAt, expiresAt) => ({ issuedAt, expiresAt }),
  super: (issuedAt, expiresAt, now) => [
    `Init data expired. Issued at ${issuedAt.toISOString()}, expires at ${expiresAt.toISOString()}, now is ${now.toISOString()}`,
  ],
}) {
}
