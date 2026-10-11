import {
  parseInitDataQuery,
  parseInitDataQueryFp,
  type ParseInitDataQueryError,
} from '@tma.js/transformers';

/**
 * Parses an incoming value as init data.
 */
export const parse = parseInitDataQuery;

/**
 * Parses an incoming value as init data.
 */
export const parseFp = parseInitDataQueryFp;

export { ParseInitDataQueryError as ParseError };
