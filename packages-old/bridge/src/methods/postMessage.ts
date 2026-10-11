import { postMessageImpl } from '@/globals.js';

export type PostMessage = typeof window.parent.postMessage;

/**
 * Posts a message to the parent window. We usually use it to send a message in web versions of
 * Telegram.
 * @param args - `window.parent.postMessage` arguments.
 */
export const postMessage: PostMessage = (...args) => {
  return postMessageImpl()(...args as unknown as Parameters<PostMessage>);
};
