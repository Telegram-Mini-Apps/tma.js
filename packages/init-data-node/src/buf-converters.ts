import { either as E } from 'fp-ts';

import { HexStringLengthInvalidError } from './errors.js';

/**
 * Converts a hex string to ArrayBuffer.
 * @param hexString - value to convert.
 */
export function hexToArrayBuffer(hexString: string): E.Either<
  InstanceType<typeof HexStringLengthInvalidError>,
  ArrayBuffer
> {
  if (hexString.length % 2 !== 0) {
    return E.left(new HexStringLengthInvalidError());
  }
  const buffer = new ArrayBuffer(hexString.length / 2);
  const uint8Array = new Uint8Array(buffer);
  for (let i = 0; i < hexString.length; i += 2) {
    uint8Array[i / 2] = parseInt(hexString.substring(i, i + 2), 16);
  }
  return E.right(buffer);
}

/**
 * Converts array buffer to hex.
 * @param arrBuf - buffer to convert
 */
export function arrayBufferToHex(arrBuf: ArrayBuffer): string {
  return new Uint8Array(arrBuf).reduce((acc, byte) => {
    // Convert byte to hex and pad with zero if needed (e.g., "0a" instead of "a")
    return acc + byte.toString(16).padStart(2, '0');
  }, '');
}

export function bufferToArrayBuffer(buf: Buffer) {
  const ab = new ArrayBuffer(buf.length);
  buf.copy(new Uint8Array(ab));
  return ab;
}
