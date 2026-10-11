export type InvoiceStatus =
  | 'paid'
  | 'failed'
  | 'pending'
  | 'cancelled'
  | string;

export type PhoneRequestedStatus = 'sent' | 'cancelled' | string;

export type EmojiStatusAccessRequestedStatus = 'allowed' | string;

export type EmojiStatusFailedError = 'SUGGESTED_EMOJI_INVALID' | 'USER_DECLINED' | string;

export type WriteAccessRequestedStatus = 'allowed' | string;

export type BiometryType = 'finger' | 'face' | string;

export type BiometryTokenUpdateStatus =
  | 'updated'
  | 'removed'
  | 'failed'
  | string;

export type BiometryAuthRequestStatus = 'failed' | 'authorized' | string;

export type FullScreenErrorStatus =
  | 'ALREADY_FULLSCREEN'
  | 'UNSUPPORTED'
  | string;

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export type HomeScreenStatus = 'unsupported' | 'unknown' | 'added' | 'missed' | string;
